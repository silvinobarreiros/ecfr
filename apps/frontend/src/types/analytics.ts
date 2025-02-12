import { z } from 'zod'
import { validateSchema, validateSchemas } from './utils'

export interface Agency {
  name: string
  shortName: string | null
  displayName: string
  sortableName: string
  slug: string
  children?: Agency[]
  cfrReferences: CFRReference[]
}

export interface CFRReference {
  title: number
  chapter?: string
  subtitle?: string
}

export interface TitleInfo {
  number: number
  name: string
  latestAmendedOn: string | null
  latestIssueDate: string | null
  upToDateAsOf: string | null
  reserved: boolean
  processingInProgress?: boolean
}

export type AmbiguityScore = {
  score: number
  details: {
    ambiguousTerms: { term: string; count: number; contexts: string[] }[]
    totalWords: number
    severityLevel: string
  }
}

export type DefinitionCoverage = {
  coverage: number
  definedTerms: string[]
  undefinedTerms: string[]
  stats: {
    totalTerms: number
    definedCount: number
    percentageCovered: number
  }
}

export type ScoreMessage = { score: number; message: string }

export interface AdvancedTextMetrics {
  entropy: ScoreMessage
  legaClarityScore: ScoreMessage
  ambiguityScore: AmbiguityScore // Measure of potential ambiguous language
  definitionCoverage: DefinitionCoverage
}

export interface AgencyWordCount {
  agencyName: string
  totalWords: number
  sectionsCount: number
  averageWordsPerSection: number
  titles: {
    titleNumber: number
    wordCount: number
    sectionsCount: number
  }[]
}

export interface HistoricalChange {
  date: string
  agencySlug: string
  changeType: 'addition' | 'modification' | 'removal'
  sectionsAffected: number
  wordsAdded: number
  wordsRemoved: number
  summary: string
  title: string
  chapter?: string
  section: string
  significantChange: boolean
}

export interface ComplexityMetrics {
  averageSentenceLength: number
  averageWordLength: number
  fleschKincaidScore: ScoreMessage
  technicalTermFrequency: { [name: string]: number }
}

export interface RegulatoryBurden {
  agencyName: string
  restrictionWords: number
  exceptionWords: number
  formRequirements: number
  deadlineMentions: number

  complianceCostIndicators: {
    reportingRequirements: number
    recordKeepingRequirements: number
    testingRequirements: number
    certificationRequirements: number
    financialRequirements: number
  }
  enforcementMetrics: {
    penaltyProvisions: number
    inspectionRequirements: number
    auditRequirements: number
  }
  regulatoryFlexibility: {
    smallBusinessProvisions: number
    exemptionProvisions: number
    phaseInProvisions: number
  }
  interagencyComplexity: {
    agencyReferences: string[]
    overlappingJurisdictions: number
  }
}

export interface AnalyticsOverview {
  totalTitles: number
  totalAgencies: number
  lastUpdated: string
}

export interface TitleAnalytics {
  complexity: ComplexityMetrics
  advanced: AdvancedTextMetrics
}

// Zod Schemas
const CFRReferenceSchema = z.object({
  title: z.number(),
  chapter: z.string().optional(),
  subtitle: z.string().optional(),
})

const AgencySchema: z.ZodType<Agency> = z.lazy(() =>
  z.object({
    name: z.string(),
    shortName: z.string().nullable(),
    displayName: z.string(),
    sortableName: z.string(),
    slug: z.string(),
    children: z.array(AgencySchema).optional(),
    cfrReferences: z.array(CFRReferenceSchema),
  })
)

const TitleInfoSchema = z.object({
  number: z.number(),
  name: z.string(),
  latestAmendedOn: z.string().nullable(),
  latestIssueDate: z.string().nullable(),
  upToDateAsOf: z.string().nullable(),
  reserved: z.boolean(),
  processingInProgress: z.boolean().optional(),
})

const AgencyWordCountSchema = z.object({
  agencyName: z.string(),
  totalWords: z.number(),
  sectionsCount: z.number(),
  averageWordsPerSection: z.number(),
  titles: z.array(
    z.object({
      titleNumber: z.number(),
      wordCount: z.number(),
      sectionsCount: z.number(),
    })
  ),
})

const HistoricalChangeSchema = z.object({
  date: z.string(),
  agencySlug: z.string(),
  title: z.string(),
  chapter: z.string().optional(),
  section: z.string(),
  changeType: z.enum(['addition', 'modification', 'removal']),
  sectionsAffected: z.number(),
  wordsAdded: z.number(),
  wordsRemoved: z.number(),
  summary: z.string(),
  significantChange: z.boolean(),
})

const ComplexityMetricsSchema = z.object({
  averageSentenceLength: z.number(),
  averageWordLength: z.number(),
  fleschKincaidScore: z.object({
    score: z.number(),
    message: z.string(),
  }),
  technicalTermFrequency: z.record(z.string(), z.number()),
})

const RegulatoryBurdenSchema = z.object({
  agencyName: z.string(),
  restrictionWords: z.number(),
  exceptionWords: z.number(),
  formRequirements: z.number(),
  deadlineMentions: z.number(),
  complianceCostIndicators: z.object({
    reportingRequirements: z.number(),
    recordKeepingRequirements: z.number(),
    testingRequirements: z.number(),
    certificationRequirements: z.number(),
    financialRequirements: z.number(),
  }),
  enforcementMetrics: z.object({
    penaltyProvisions: z.number(),
    inspectionRequirements: z.number(),
    auditRequirements: z.number(),
  }),
  regulatoryFlexibility: z.object({
    smallBusinessProvisions: z.number(),
    exemptionProvisions: z.number(),
    phaseInProvisions: z.number(),
  }),
  interagencyComplexity: z.object({
    agencyReferences: z.array(z.string()),
    overlappingJurisdictions: z.number(),
  }),
})

const AmbiguityScoreSchema = z.object({
  score: z.number(),
  details: z.object({
    ambiguousTerms: z.array(
      z.object({
        term: z.string(),
        count: z.number(),
        contexts: z.array(z.string()),
      })
    ),
    totalWords: z.number(),
    severityLevel: z.string(),
  }),
})

const DefinitionCoverageSchema = z.object({
  coverage: z.number(),
  definedTerms: z.array(z.string()),
  undefinedTerms: z.array(z.string()),
  stats: z.object({
    totalTerms: z.number(),
    definedCount: z.number(),
    percentageCovered: z.number(),
  }),
})

const AdvancedTextMetricsSchema = z.object({
  entropy: z.object({
    score: z.number(),
    message: z.string(),
  }),
  legaClarityScore: z.object({
    score: z.number(),
    message: z.string(),
  }),
  ambiguityScore: AmbiguityScoreSchema,
  definitionCoverage: DefinitionCoverageSchema,
})

// Validators
export const validateAgency = validateSchema<Agency>(AgencySchema)
export const validateAgencies = validateSchemas<Agency>(z.array(AgencySchema))

export const validateTitleInfo = validateSchema<TitleInfo>(TitleInfoSchema)
export const validateTitleInfos = validateSchemas<TitleInfo>(z.array(TitleInfoSchema))

export const validateAgencyWordCount = validateSchema<AgencyWordCount>(AgencyWordCountSchema)
export const validateHistoricalChange = validateSchema<HistoricalChange>(HistoricalChangeSchema)
export const validateHistoricalChanges = validateSchemas<HistoricalChange>(
  z.array(HistoricalChangeSchema)
)

export const validateComplexityMetrics = validateSchema<ComplexityMetrics>(ComplexityMetricsSchema)
export const validateRegulatoryBurden = validateSchema<RegulatoryBurden>(RegulatoryBurdenSchema)
export const validateAdvancedTextMetrics =
  validateSchema<AdvancedTextMetrics>(AdvancedTextMetricsSchema)

// Analytics Response Types
export const validateAnalyticsOverview = validateSchema<AnalyticsOverview>(
  z.object({
    totalTitles: z.number(),
    totalAgencies: z.number(),
    lastUpdated: z.string().datetime(),
  })
)

export type AgencyAnalytics = {
  wordCounts: AgencyWordCount
  burden: RegulatoryBurden
}

export const validateAgencyAnalytics = validateSchema<AgencyAnalytics>(
  z.object({
    wordCounts: AgencyWordCountSchema,
    burden: RegulatoryBurdenSchema,
  })
)

export const validateTitleAnalytics = validateSchema<TitleAnalytics>(
  z.object({
    complexity: ComplexityMetricsSchema,
    advanced: AdvancedTextMetricsSchema,
  })
)
