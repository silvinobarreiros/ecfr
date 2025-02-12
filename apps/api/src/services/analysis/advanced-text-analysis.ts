/* eslint-disable no-nested-ternary */
import {
  AMBIGUOUS_TERMS,
  COMPLIANCE_PATTERNS,
  countPatternMatches,
} from '@/services/analysis/analysis-utils'
import { findTechnicalTerms, getSentences } from '@/services/analysis/text-analysis'

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

export type ComplianceCosts = {
  reportingRequirements: number
  recordKeepingRequirements: number
  testingRequirements: number
  certificationRequirements: number
  financialRequirements: number
}

export type RegulatoryFlexibility = {
  smallBusinessProvisions: number
  exemptionProvisions: number
  phaseInProvisions: number
}

export const calculateAmbiguityScore = async (text: string): Promise<AmbiguityScore> => {
  // Clean and normalize the text
  const cleanText = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = cleanText.split(' ').filter((word) => word.length > 0)
  const totalWords = words.length

  // Track each ambiguous term and its contexts
  const ambiguousTermsFound: { [term: string]: { count: number; contexts: string[] } } = {}

  // Context window size (words before/after)
  const CONTEXT_WINDOW = 5

  // Process each ambiguous term correctly
  AMBIGUOUS_TERMS.forEach((term) => {
    words.forEach((word, i) => {
      if (word === term) {
        const contextStart = Math.max(0, i - CONTEXT_WINDOW)
        const contextEnd = Math.min(words.length, i + CONTEXT_WINDOW + 1)
        const context = words.slice(contextStart, contextEnd).join(' ')

        if (!ambiguousTermsFound[term]) {
          ambiguousTermsFound[term] = { count: 0, contexts: [] }
        }

        ambiguousTermsFound[term].count += 1
        ambiguousTermsFound[term].contexts.push(context)
      }
    })
  })

  // Calculate weighted score based on term frequency
  let totalAmbiguityScore = 0

  const termDetails = Object.entries(ambiguousTermsFound).map(([term, data]) => {
    const frequencyScore = (data.count / totalWords) * 100
    totalAmbiguityScore += frequencyScore

    return {
      term,
      count: data.count,
      contexts: data.contexts,
    }
  })

  // Determine severity level
  const getSeverityLevel = (score: number): string => {
    if (score < 1) return 'Very Clear'
    if (score < 2) return 'Generally Clear'
    if (score < 5) return 'Moderately Ambiguous'
    if (score < 10) return 'Ambiguous'
    return 'Highly Ambiguous'
  }

  return {
    score: totalAmbiguityScore,
    details: {
      ambiguousTerms: termDetails,
      totalWords,
      severityLevel: getSeverityLevel(totalAmbiguityScore),
    },
  }
}

// Calculate Shannon entropy for information density
export const calculateEntropy = (text: string): number => {
  if (!text.trim()) return 0 // Handle empty input gracefully

  const frequencies = new Map<string, number>()

  const words = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace

  const totalWords = words.length

  words.forEach((word) => {
    if (word) {
      frequencies.set(word, (frequencies.get(word) || 0) + 1)
    }
  })

  // Compute entropy using Shannon's formula
  return Array.from(frequencies.values()).reduce((entropy, freq) => {
    const probability = freq / totalWords
    return entropy - probability * Math.log2(probability)
  }, 0)
}

export const generateEntropyMessage = (score: number): string => {
  if (score < 1) {
    return 'This document contains highly repetitive or boilerplate text with very little variation.'
  }
  if (score < 3) {
    return 'This document is extremely simple and predictable, likely containing structured or templated content.'
  }
  if (score < 5) {
    return 'This document has a clear and structured format, with minimal variation in vocabulary.'
  }
  if (score < 7) {
    return 'This document is moderately complex, balancing structured text with some variation in language.'
  }
  if (score < 9) {
    return 'This document contains a diverse vocabulary and more nuanced language, making it somewhat complex.'
  }
  return 'This document is highly complex, with significant variation in vocabulary and potentially technical or legal language.'
}

// Analyze legal clarity
export const analyzeLegalClarity = (text: string): number => {
  const sentences = getSentences(text)
  const clarity_factors = sentences.map((sentence) => {
    const wordCount = sentence.split(/\s+/).length
    const hasAmbiguousTerms = Array.from(AMBIGUOUS_TERMS).some((term) =>
      sentence.toLowerCase().includes(term)
    )
    const hasComplexStructure = sentence.includes(';') || (sentence.match(/,/g) || []).length > 2

    // Higher score means clearer language
    return (
      (100 -
        ((wordCount > 50 ? 30 : wordCount > 30 ? 20 : 0) +
          (hasAmbiguousTerms ? 30 : 0) +
          (hasComplexStructure ? 20 : 0))) /
      100
    )
  })

  return clarity_factors.reduce((sum, score) => sum + score, 0) / clarity_factors.length
}

export const generateClarityMessage = (score: number): string => {
  if (score >= 0.9) {
    return 'This document is written in exceptionally clear and concise language, making it easy to understand.'
  }
  if (score >= 0.75) {
    return 'This document is generally clear, with well-structured sentences and minimal legal complexity.'
  }
  if (score >= 0.5) {
    return 'This document has moderate complexity, with some legal or technical terms that may require additional context.'
  }
  if (score >= 0.25) {
    return 'This document is fairly complex, containing long or ambiguous sentences that may be difficult to interpret without legal expertise.'
  }
  return 'This document is highly complex, with convoluted sentence structures and legal jargon that make it challenging to understand.'
}

// Analyze definition coverage
export const analyzeDefinitionCoverage = (text: string): DefinitionCoverage => {
  // Find all definition sections (could be multiple)
  const definitionSections = text.matchAll(/(?:definitions?|terms?):?(.*?)(?=\n\n|\[|$)/gis)

  // Better regex for finding defined terms
  const definedTerms = new Set<string>()
  for (const section of definitionSections) {
    const sectionText = section[1] || ''

    // Different patterns for finding defined terms
    const patterns = [
      /"([^"]+)"/g, // Double quotes
      /'([^']+)'/g, // Single quotes
      /\b(\w+)\s+means\b/gi, // "X means"
      /\b(\w+)\s+refers to\b/gi, // "X refers to"
      /\b(\w+)\s+shall mean\b/gi, // "X shall mean"
    ]

    patterns.forEach((pattern) => {
      const matches = sectionText.matchAll(pattern)
      for (const match of matches) {
        const m = match[1]

        if (m) {
          definedTerms.add(m.toLowerCase())
        }
      }
    })
  }

  // Get technical terms
  const technicalTerms = new Set(
    Object.keys(findTechnicalTerms(text)).map((term) => term.toLowerCase())
  )

  // Handle empty case
  if (technicalTerms.size === 0) {
    return {
      coverage: 1,
      definedTerms: Array.from(definedTerms),
      undefinedTerms: [],
      stats: {
        totalTerms: 0,
        definedCount: 0,
        percentageCovered: 100,
      },
    }
  }

  // Find which terms are defined/undefined
  const defined: string[] = []
  const undefinedTerms: string[] = []

  technicalTerms.forEach((term) => {
    if (definedTerms.has(term)) {
      defined.push(term)
    } else {
      undefinedTerms.push(term)
    }
  })

  const coverage = defined.length / technicalTerms.size

  return {
    coverage,
    definedTerms: defined,
    undefinedTerms,
    stats: {
      totalTerms: technicalTerms.size,
      definedCount: defined.length,
      percentageCovered: coverage * 100,
    },
  }
}

// New method to detect overlapping jurisdictions
export const findOverlappingJurisdictions = (text: string): string[] => {
  const agencyPatterns = [
    /(?:Department|Agency|Administration|Commission|Bureau) of [A-Z][a-zA-Z\s]+/g,
    /[A-Z]{2,5}\s+(?:and|&)\s+[A-Z]{2,5}/g, // Matches patterns like "EPA & FDA"
  ]

  const agencies = new Set<string>()
  agencyPatterns.forEach((pattern) => {
    const matches = text.match(pattern) || []
    matches.forEach((match) => agencies.add(match))
  })

  return Array.from(agencies)
}

// Enhanced compliance cost analysis
export const analyzeComplianceCosts = (text: string): ComplianceCosts => ({
  reportingRequirements: countPatternMatches(text, COMPLIANCE_PATTERNS.reporting),
  recordKeepingRequirements: countPatternMatches(text, COMPLIANCE_PATTERNS.recordKeeping),
  testingRequirements: countPatternMatches(text, COMPLIANCE_PATTERNS.testing),
  certificationRequirements: countPatternMatches(text, COMPLIANCE_PATTERNS.certification),
  financialRequirements: countPatternMatches(text, COMPLIANCE_PATTERNS.financial),
})

// Analyze regulatory flexibility provisions
export const analyzeRegulatoryFlexibility = (text: string): RegulatoryFlexibility => ({
  smallBusinessProvisions: countPatternMatches(text, [
    /small business/i,
    /small entity/i,
    /small organization/i,
  ]),
  exemptionProvisions: countPatternMatches(text, [/exempt(?:ion|ed|s)/i, /waiver/i, /variance/i]),
  phaseInProvisions: countPatternMatches(text, [
    /phase[-\s]in/i,
    /gradually implement/i,
    /compliance date/i,
    /effective date/i,
  ]),
})
