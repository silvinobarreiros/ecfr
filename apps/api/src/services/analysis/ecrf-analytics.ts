/* eslint-disable no-continue */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { parseString } from 'xml2js'

import { ContentProcessor } from '@/services/analysis/content-processor'
import {
  calculateFleschKincaid,
  countExceptionWords,
  countRestrictiveWords,
  countWords,
  findDeadlines,
  findFormRequirements,
  findTechnicalTerms,
  getSentences,
  interpretFleschScore,
} from './text-analysis'

import {
  analyzeComplianceCosts,
  analyzeDefinitionCoverage,
  analyzeLegalClarity,
  analyzeRegulatoryFlexibility,
  calculateAmbiguityScore,
  calculateEntropy,
  findOverlappingJurisdictions,
  generateClarityMessage,
  generateEntropyMessage,
} from './advanced-text-analysis'
import { countPatternMatches, ENFORCEMENT_PATTERNS } from '@/services/analysis/analysis-utils'
import {
  AdvancedTextMetrics,
  AgencyWordCount,
  ComplexityMetrics,
  HistoricalChange,
  RegulatoryBurden,
} from '@/types/analytics'
import { Agency, ECFRClient, StructureNode, TitleInfo } from '@/types/ecrf-client'
import logger from '@/logger'
import { AnalyticsCache } from './analytics-cache'

export class ECFRAnalytics {
  private titles: {
    [name: string]: TitleInfo
  } = {}

  private agencies: { [name: string]: Agency } = {}

  // ----------------------------------------------

  constructor(
    private readonly client: ECFRClient,
    private readonly cache: AnalyticsCache
  ) {}

  public async initialize(): Promise<void> {
    // cache titles on start
    const titles = await this.client.getTitlesInfo()

    // create hash map of titles with title number as key
    titles.titles.forEach((title) => {
      this.titles[title.number] = title
    })

    // cache agencies on start
    const agencies = await this.client.getAgencies()
    const fullList = flattenAgencies(agencies)

    logger.info(`Loaded ${fullList.length} agencies`)

    this.agencies = fullList.reduce(
      (acc, curr) => {
        acc[curr.slug] = curr
        return acc
      },
      {} as { [name: string]: Agency }
    )

    logger.info(`Loaded ${Object.keys(this.agencies).length} agencies`)
  }

  // ----------------------------------------------

  public getTitleInfo(number: number): TitleInfo | undefined {
    return this.titles[number]
  }

  public getAllTitlesInfo(): TitleInfo[] {
    return Object.values(this.titles)
  }

  public getAgencies(): Agency[] {
    return Object.values(this.agencies)
  }

  private getLatestDateForTitle(titleNumber: number): string {
    const title = this.getTitleInfo(titleNumber)

    if (!title) {
      throw new Error(`Title ${titleNumber} not found`)
    }

    return title.up_to_date_as_of
  }

  // ----------------------------------------------

  async getAgencyWordCounts(agencySlug: string): Promise<AgencyWordCount> {
    const agency = this.agencies[agencySlug]

    if (!agency) {
      throw new Error(`Agency not found: ${agencySlug}`)
    }

    // check cache
    const cached = await this.cache.getAgencyWordCounts(agency.slug)
    if (cached) {
      logger.info(`Cache hit -->`)
      return cached
    }

    const titleMetrics = []

    for await (const ref of agency.cfr_references) {
      const date = this.getLatestDateForTitle(ref.title)

      const xml = await this.client.getTitleXML(date, ref.title.toString(), {
        chapter: ref.chapter,
      })

      const text = await this.extractTextFromXML(xml)
      const wordCount = countWords(text)
      const structure = await this.client.getTitleStructure(date, ref.title.toString())

      const sectionsCount = await this.processTitleSections(structure)

      titleMetrics.push({
        titleNumber: ref.title,
        wordCount,
        sectionsCount,
      })
    }

    const results = titleMetrics.reduce(
      (acc, curr) => {
        acc.total_words += curr.wordCount
        acc.sections_count += curr.sectionsCount
        return acc
      },
      { total_words: 0, sections_count: 0 }
    )

    const averageWordsPerSection = results.total_words / results.sections_count

    return {
      agencyName: agency.name,
      totalWords: results.total_words,
      sectionsCount: results.sections_count,
      averageWordsPerSection,
      titles: titleMetrics,
    }
  }

  async getHistoricalChanges(agencySlug: string, startDate: string): Promise<HistoricalChange[]> {
    const agency = this.agencies[agencySlug]
    if (!agency) {
      throw new Error(`Agency not found: ${agencySlug}`)
    }

    // check cache
    const cached = await this.cache.getHistoricalChanges(agency.slug, startDate)
    if (cached) {
      logger.info(`Cache hit -->`)
      return cached
    }

    const historicalChanges: HistoricalChange[] = []

    for await (const ref of agency.cfr_references) {
      try {
        // Get all versions for this title within the date range
        const versions = await this.client.getVersions(ref.title.toString(), {
          'issue_date[gte]': startDate,
          chapter: ref.chapter,
        })

        // Group versions by section
        const sectionChanges = new Map<string, any[]>()
        const MAX_VERSIONS = 10

        const limited = versions.content_versions.slice(0, MAX_VERSIONS)

        for (const version of limited) {
          if (
            version.identifier.includes('Appendix') ||
            version.identifier.includes('Supplement')
          ) {
            continue
          }

          if (!sectionChanges.has(version.identifier)) {
            sectionChanges.set(version.identifier, [])
          }
          sectionChanges.get(version.identifier)?.push(version)
        }

        // Process each section's history
        for await (const [sectionId, changes] of sectionChanges) {
          // Sort changes chronologically
          changes.sort(
            (a, b) => new Date(a.amendment_date).getTime() - new Date(b.amendment_date).getTime()
          )

          let i = 0

          // Process each change
          for await (const version of changes) {
            try {
              let changeType: 'addition' | 'modification' | 'removal'
              let beforeContent = ''
              let afterContent = ''

              if (version.removed) {
                changeType = 'removal'
                // Get content from just before removal
                if (i > 0) {
                  beforeContent = await this.getContentAtDate(
                    ref.title.toString(),
                    changes[i - 1].date,
                    sectionId
                  )
                }
              } else if (i === 0) {
                changeType = 'addition'
                afterContent = await this.getContentAtDate(
                  ref.title.toString(),
                  version.date,
                  sectionId
                )
              } else {
                changeType = 'modification'
                beforeContent = await this.getContentAtDate(
                  ref.title.toString(),
                  changes[i - 1].date,
                  sectionId
                )
                afterContent = await this.getContentAtDate(
                  ref.title.toString(),
                  version.date,
                  sectionId
                )
              }

              const changeMetrics =
                changeType === 'removal'
                  ? { added: 0, removed: beforeContent.split(/\s+/).length, changes: [] }
                  : changeType === 'addition'
                    ? { added: afterContent.split(/\s+/).length, removed: 0, changes: [] }
                    : ContentProcessor.diffTexts(beforeContent, afterContent)

              historicalChanges.push({
                date: version.amendment_date,
                agencySlug: agency.slug,
                title: ref.title.toString(),
                chapter: ref.chapter,
                section: sectionId,
                changeType,
                sectionsAffected: 1,
                wordsAdded: changeMetrics.added,
                wordsRemoved: changeMetrics.removed,
                summary:
                  changeType === 'addition'
                    ? `Section ${sectionId} added`
                    : changeType === 'removal'
                      ? `Section ${sectionId} removed`
                      : this.generateChangeSummary(changeMetrics),
                significantChange:
                  changeType === 'addition' ||
                  changeType === 'removal' ||
                  this.isSignificantChange(changeMetrics),
              })
            } catch (error) {
              console.error(
                `Error processing change for section ${sectionId} on ${version.date}:`,
                error
              )
            } finally {
              i += 1
            }
          }
        }
      } catch (error) {
        console.error(`Error processing title ${ref.title}:`, error)
        // eslint-disable-next-line no-continue
        continue
      }
    }

    return historicalChanges
  }

  // Helper method to determine if a change is significant
  // eslint-disable-next-line class-methods-use-this
  private isSignificantChange(changeMetrics: {
    added: number
    removed: number
    changes: string[]
  }): boolean {
    // Consider a change significant if:
    // - More than 100 words added or removed
    // - Or more than 20% of content changed
    const totalWords = changeMetrics.added + changeMetrics.removed
    return totalWords > 100 || changeMetrics.changes.length > 20
  }

  async getComplexityMetrics(titleNumber: number, section?: string): Promise<ComplexityMetrics> {
    // check cache
    const cached = await this.cache.getComplexityMetrics(titleNumber, section)
    if (cached) {
      logger.info(`Cache hit -->`)
      return cached
    }

    const content = await this.getTitleContent(titleNumber, section)

    return this.calculateComplexityMetrics(content)
  }

  async getRegulatoryBurden(agencySlug: string): Promise<RegulatoryBurden> {
    const agency = this.agencies[agencySlug]

    if (!agency) {
      throw new Error(`Agency not found: ${agencySlug}`)
    }

    // check cache
    const cached = await this.cache.getRegulatoryBurden(agency.slug)
    if (cached) {
      logger.info(`Cache hit -->`)
      return cached
    }

    return this.calculateRegulatoryBurden(agency)
  }

  // Helper methods
  // eslint-disable-next-line class-methods-use-this
  private async processTitleSections(structure: StructureNode): Promise<number> {
    return ContentProcessor.processTitleContent(structure)
  }

  private async getTitleContent(titleNumber: number, section?: string): Promise<string> {
    const date = this.getLatestDateForTitle(titleNumber)

    if (!date) {
      return ''
    }

    // If section is specified, get just that section
    if (section) {
      const xml = await this.client.getTitleXML(date, titleNumber.toString(), { section })
      return this.extractTextFromXML(xml)
    }

    // Otherwise get the full title structure and content
    const xml = await this.client.getTitleXML(date, titleNumber.toString())
    return this.extractTextFromXML(xml)
  }

  private async getAgencyContent(agency: Agency): Promise<string> {
    const content = await agency.cfr_references.reduce(async (acc, ref) => {
      const content = await acc
      const date = this.getLatestDateForTitle(ref.title)

      const titleStructure = await this.client.getTitleStructure(date, ref.title.toString())
      const xml = await this.client.getTitleXML(date, titleStructure.identifier, {
        chapter: ref.chapter,
      })

      const chapterContent = await this.extractTextFromXML(xml)
      const newContent = `${content} ${chapterContent}`

      return newContent
    }, Promise.resolve(''))

    return content.trim()
  }

  // eslint-disable-next-line class-methods-use-this
  // private async extractTextFromXML(xml: string): Promise<string> {
  //   try {
  //     // Convert the XML string into a JavaScript object
  //     const parsed = await new Promise((resolve, reject) => {
  //       parseString(
  //         xml,
  //         {
  //           trim: true, // Trim whitespace
  //           explicitArray: false, // Don't put single values in arrays
  //           mergeAttrs: true, // Merge attributes into the object
  //           normalizeTags: true, // Normalize tag names to lowercase
  //         },
  //         (err: any, result: any) => {
  //           if (err) reject(err)
  //           else resolve(result)
  //         }
  //       )
  //     })

  //     // Extract text recursively from the parsed object
  //     const extractTextFromObject = (obj: any): string[] => {
  //       const texts: string[] = []

  //       // If this is a string, return it
  //       if (typeof obj === 'string') {
  //         return [obj]
  //       }

  //       // If this is an array, process each element
  //       if (Array.isArray(obj)) {
  //         obj.forEach((item) => {
  //           texts.push(...extractTextFromObject(item))
  //         })
  //         return texts
  //       }

  //       // If this is an object, process each property
  //       if (obj !== null && typeof obj === 'object') {
  //         Object.values(obj).forEach((value) => {
  //           texts.push(...extractTextFromObject(value))
  //         })
  //       }

  //       return texts
  //     }

  //     // Extract all text and join with spaces
  //     const texts = extractTextFromObject(parsed)
  //       .filter((text) => typeof text === 'string' && text.trim() !== '')
  //       .map((text) => text.trim())

  //     // Join and clean up the text
  //     return texts
  //       .join(' ')
  //       .replace(/\s+/g, ' ') // Replace multiple spaces with single space
  //       .replace(/\s+\./g, '.') // Fix spacing before periods
  //       .replace(/\s+,/g, ',') // Fix spacing before commas
  //       .replace(/\s+;/g, ';') // Fix spacing before semicolons
  //       .replace(/\s+:/g, ':') // Fix spacing before colons
  //       .replace(/\s+\)/g, ')') // Fix spacing before closing parentheses
  //       .replace(/\(\s+/g, '(') // Fix spacing after opening parentheses
  //       .trim()
  //   } catch (error: any) {
  //     console.error('Error parsing XML:', error)
  //     throw new Error(`Failed to parse XML: ${error.message}`)
  //   }
  // }

  // eslint-disable-next-line class-methods-use-this
  private async extractTextFromXML(xml: string): Promise<string> {
    try {
      const parsed = await new Promise((resolve, reject) => {
        parseString(
          xml,
          {
            trim: true,
            explicitArray: false,
            mergeAttrs: true,
            normalizeTags: true,
          },
          (err: any, result: any) => {
            if (err) reject(err)
            else resolve(result)
          }
        )
      })

      const texts: string[] = []
      const stack: any[] = [parsed]

      while (stack.length > 0) {
        const current = stack.pop()

        if (current == null) continue

        if (typeof current === 'string') {
          texts.push(current)
          continue
        }

        if (Array.isArray(current)) {
          stack.push(...current)
          continue
        }

        if (typeof current === 'object') {
          stack.push(...Object.values(current))
        }
      }

      return texts
        .filter((text) => typeof text === 'string' && text.trim() !== '')
        .map((text) => text.trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .replace(/\s+\./g, '.')
        .replace(/\s+,/g, ',')
        .replace(/\s+;/g, ';')
        .replace(/\s+:/g, ':')
        .replace(/\s+\)/g, ')')
        .replace(/\(\s+/g, '(')
        .trim()
    } catch (error: any) {
      console.error('Error parsing XML:', error)
      throw new Error(`Failed to parse XML: ${error.message}`)
    }
  }

  private async getContentAtDate(title: string, date: string, section?: string): Promise<string> {
    if (!date) {
      return ''
    }

    const response = await this.client.getTitleXML(date, title, {
      section,
    })
    const content = await this.extractTextFromXML(response)

    return content
  }

  // eslint-disable-next-line class-methods-use-this
  private generateChangeSummary(change: {
    added: number
    removed: number
    changes: string[]
  }): string {
    const summaryParts: string[] = []

    if (change.added > 0) {
      summaryParts.push(`Added ${change.added} words`)
    }
    if (change.removed > 0) {
      summaryParts.push(`Removed ${change.removed} words`)
    }

    if (change.changes.length > 0) {
      const sampleChanges = change.changes.slice(0, 3)
      summaryParts.push(`Sample changes: ${sampleChanges.join(', ')}`)
    }

    return summaryParts.join('. ')
  }

  // eslint-disable-next-line class-methods-use-this
  private calculateComplexityMetrics(content: string): ComplexityMetrics {
    const sentences = getSentences(content)
    const words = content.split(/\s+/)

    const fkScore = calculateFleschKincaid(content)
    const message = interpretFleschScore(fkScore)

    return {
      averageSentenceLength: parseFloat((words.length / sentences.length).toFixed(2)),
      averageWordLength: parseFloat((words.join('').length / words.length).toFixed(2)),
      fleschKincaidScore: { score: fkScore, message },
      technicalTermFrequency: findTechnicalTerms(content),
    }
  }

  async getAdvancedTextMetrics(
    titleNumber: number,
    section?: string
  ): Promise<AdvancedTextMetrics> {
    // check cache
    const cached = await this.cache.getAdvancedTextMetrics(titleNumber, section)
    if (cached) {
      logger.info(`Cache hit -->`)
      return cached
    }

    const date = this.getLatestDateForTitle(titleNumber)
    const content = await this.getContentAtDate(titleNumber.toString(), date, section)

    const ambiguity = await calculateAmbiguityScore(content)
    const entropy = calculateEntropy(content)
    const legalClarity = analyzeLegalClarity(content)

    return {
      entropy: { score: entropy, message: generateEntropyMessage(entropy) },
      legaClarityScore: {
        score: legalClarity,
        message: generateClarityMessage(legalClarity),
      },
      ambiguityScore: ambiguity,
      definitionCoverage: analyzeDefinitionCoverage(content),
    }
  }

  private async calculateRegulatoryBurden(agency: any): Promise<RegulatoryBurden> {
    const totalContent = await this.getAgencyContent(agency)
    const complianceCosts = analyzeComplianceCosts(totalContent)
    const flexibility = analyzeRegulatoryFlexibility(totalContent)
    const overlappingAgencies = findOverlappingJurisdictions(totalContent)

    return {
      agencyName: agency.name,
      restrictionWords: countRestrictiveWords(totalContent),
      exceptionWords: countExceptionWords(totalContent),
      formRequirements: findFormRequirements(totalContent),
      deadlineMentions: findDeadlines(totalContent),

      // New metrics
      complianceCostIndicators: complianceCosts,
      enforcementMetrics: {
        penaltyProvisions: countPatternMatches(totalContent, ENFORCEMENT_PATTERNS.penalties),
        inspectionRequirements: countPatternMatches(totalContent, ENFORCEMENT_PATTERNS.inspections),
        auditRequirements: countPatternMatches(totalContent, ENFORCEMENT_PATTERNS.audits),
      },
      regulatoryFlexibility: flexibility,
      interagencyComplexity: {
        agencyReferences: overlappingAgencies,
        overlappingJurisdictions: overlappingAgencies.length,
      },
    }
  }
}

function flattenAgencies(agencies: Agency[]): Agency[] {
  const flattened: Agency[] = []
  const seen = new Set<string>()

  function processAgency(agency: Agency) {
    if (!seen.has(agency.slug)) {
      seen.add(agency.slug)
      flattened.push(agency)

      if (agency.children && agency.children.length > 0) {
        agency.children.forEach((child) => processAgency(child))
      }
    }
  }

  agencies.forEach((agency) => processAgency(agency))

  return flattened
}
