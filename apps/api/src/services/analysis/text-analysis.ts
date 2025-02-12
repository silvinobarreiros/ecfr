import {
  EXCEPTION_WORDS,
  RESTRICTION_WORDS,
  TECHNICAL_TERMS,
} from '@/services/analysis/analysis-utils'

export const countWords = (text: string): number =>
  text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

export const calculateFleschKincaid = (text: string): number => {
  // Pre-process text to handle edge cases
  const cleanText = text.replace(/\s+/g, ' ').trim()

  if (!cleanText) return 0

  const sentences = getSentences(cleanText)
  const words = cleanText.split(/\s+/).filter(
    (word) => word.length > 0 && /[a-zA-Z]/.test(word) // Only count words with letters
  )

  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  const sentenceCount = sentences.length
  const wordCount = words.length

  if (sentenceCount === 0 || wordCount === 0) return 0

  // Calculate Flesch Reading Ease score
  const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount)

  // Clamp score between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10))
}

export const interpretFleschScore = (score: number): string => {
  if (score >= 90) return 'Very easy to read (5th grade)'
  if (score >= 80) return 'Easy to read (6th grade)'
  if (score >= 70) return 'Fairly easy to read (7th grade)'
  if (score >= 60) return 'Plain English (8th-9th grade)'
  if (score >= 50) return 'Fairly difficult (10th-12th grade)'
  if (score >= 30) return 'Difficult (College)'
  return 'Very difficult (College graduate)'
}

export const countRestrictiveWords = (text: string): number => {
  const words = text.toLowerCase().split(/\s+/)
  return words.filter((word) => RESTRICTION_WORDS.has(word)).length
}

export const countExceptionWords = (text: string): number => {
  const words = text.toLowerCase().split(/\s+/)
  return words.filter((word) => EXCEPTION_WORDS.has(word)).length
}

export const findTechnicalTerms = (text: string): { [name: string]: number } => {
  const terms: { [name: string]: number } = {}

  // Clean and normalize the text
  const cleanText = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()

  // Split into words and word groups (for phrases)
  const words = cleanText.split(' ')

  // Process individual words
  words.forEach((word) => {
    // Check exact matches
    if (TECHNICAL_TERMS.has(word)) {
      terms[word] = (terms[word] || 0) + 1
    }

    // Check word stems and variations
    TECHNICAL_TERMS.forEach((term) => {
      // Check if word contains the term as part or has common variations
      if (
        word.includes(term) ||
        word === `${term}s` || // Plural
        word === `${term}ed` || // Past tense
        word === `${term}ing` || // Present participle
        word === `${term}ly` || // Adverb form
        word === `${term}al` || // Adjective form
        word === `${term}able` || // Adjective form
        word === `${term}ment` || // Noun form
        word === `${term}tion` || // Noun form
        word === `${term}ive`
      ) {
        // Adjective form
        terms[term] = (terms[term] || 0) + 1
      }
    })
  })

  return terms
}

export const findFormRequirements = (text: string): number => {
  const formPatterns = [
    /form\s+[A-Z]?-?\d+/gi, // Form numbers
    /submit.*form/gi, // Form submissions
    /application\s+form/gi, // Application forms
    /report.*form/gi, // Reporting forms
    /form.*required/gi, // Required forms
    /form.*must/gi, // Mandatory forms
    /complete.*form/gi, // Form completion
    /standard\s+form/gi, // Standard forms
    /official\s+form/gi, // Official forms
    /prescribed\s+form/gi, // Prescribed forms
  ]

  return formPatterns.reduce((count, pattern) => count + (text.match(pattern)?.length || 0), 0)
}

export const findDeadlines = (text: string): number => {
  const deadlinePatterns = [
    /within\s+\d+\s+(?:day|week|month|year)s?/gi,
    /(?:no|not)\s+later\s+than/gi,
    /by\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/gi,
    /deadline/gi,
    /due\s+(?:date|by)/gi,
    /not\s+to\s+exceed\s+\d+\s+(?:day|week|month|year)s?/gi,
    /shall\s+(?:submit|complete|file|report)\s+(?:within|by|before)/gi,
    /must\s+be\s+(?:submitted|completed|filed|reported)\s+(?:within|by|before)/gi,
    /time\s+limit/gi,
    /expiration\s+(?:date|period)/gi,
  ]

  return deadlinePatterns.reduce((count, pattern) => count + (text.match(pattern)?.length || 0), 0)
}

export type ReadabilityMetrics = {
  fleschKincaid: number
  automatedReadability: number
  colemanLiau: number
}

export const calculateReadabilityMetrics = (text: string): ReadabilityMetrics => {
  const sentences = getSentences(text)
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  const characters = words.join('').length
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  const sentenceCount = sentences.length
  const wordCount = words.length

  // Flesch-Kincaid Grade Level
  const fleschKincaid = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59

  // Automated Readability Index
  const automatedReadability =
    4.71 * (characters / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43

  // Coleman-Liau Index
  const L = (characters / wordCount) * 100 // Letters per 100 words
  const S = (sentenceCount / wordCount) * 100 // Sentences per 100 words
  const colemanLiau = 0.0588 * L - 0.296 * S - 15.8

  return {
    fleschKincaid: Math.max(0, Math.round(fleschKincaid * 10) / 10),
    automatedReadability: Math.max(0, Math.round(automatedReadability * 10) / 10),
    colemanLiau: Math.max(0, Math.round(colemanLiau * 10) / 10),
  }
}

export type TextComplexityMetrics = {
  avgSentenceLength: number
  avgWordLength: number
  longSentenceCount: number
  complexWordPercentage: number
}

export const analyzeTextComplexity = (text: string): TextComplexityMetrics => {
  const sentences = getSentences(text)
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)

  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter((w) => w.length > 0).length)

  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentences.length
  const avgWordLength = words.join('').length / words.length
  const longSentenceCount = sentenceLengths.filter((len) => len > 30).length
  const complexWords = words.filter((word) => countSyllables(word) > 2).length

  return {
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    longSentenceCount,
    complexWordPercentage: Math.round((complexWords / words.length) * 1000) / 10,
  }
}

export const extractCitations = (text: string): string[] => {
  const citationPatterns = [
    /\d+\s+CFR\s+\d+\.\d+/g, // CFR citations
    /\d+\s+U\.?S\.?C\.?\s+\d+/g, // USC citations
    /§+\s*\d+\.\d+/g, // Section symbols
    /part\s+\d+/gi, // Part references
    /subpart\s+[A-Z]/gi, // Subpart references
    /chapter\s+[IVX]+/gi, // Chapter references
    /title\s+\d+/gi, // Title references
  ]

  return citationPatterns.flatMap((pattern) => text.match(pattern) || [])
}

export const getSentences = (text: string): string[] => {
  // More robust sentence splitting that handles common legal abbreviations
  const cleanText = text
    .replace(/([A-Z]\.)(?=[A-Z])/g, '$1\u0000') // Preserve abbreviations like U.S.
    .replace(/(\s[A-Z]\.)(?=\s)/g, '$1\u0000') // Preserve single letter abbreviations
    .replace(/([.!?])\s+/g, '$1\n') // Split on sentence endings
    // eslint-disable-next-line no-control-regex
    .replace(/\u0000/g, '.') // Restore abbreviation periods

  return cleanText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// --- Utility functions ---

const countSyllables = (word: string): number => {
  word = word
    .toLowerCase()
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')

  const syllableMatches = word.match(/[aeiouy]{1,2}/g)
  return syllableMatches ? syllableMatches.length : 1
}
