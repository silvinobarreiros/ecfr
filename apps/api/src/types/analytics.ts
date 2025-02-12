import { AmbiguityScore, DefinitionCoverage } from '@/services/analysis/advanced-text-analysis'

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
  chapter: string
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
