import { useMemo } from 'react'
import useSWR from 'swr'

import {
  AdvancedTextMetrics,
  AgencyWordCount,
  ComplexityMetrics,
  RegulatoryBurden,
  validateAgencies,
  validateAgencyAnalytics,
  validateAgencyWordCount,
  validateAnalyticsOverview,
  validateHistoricalChanges,
  validateRegulatoryBurden,
  validateTitleAnalytics,
  validateTitleInfos,
} from '@/types/analytics'

import {
  endpoints,
  fetcherWithValidation as fetcher,
  fetcherWithListValidation as listFetcher,
} from '@/utils/axios'

// Overview
export const useAnalyticsOverview = () => {
  const { data, error, isLoading, isValidating } = useSWR(
    endpoints.analytics.overview(),
    fetcher(validateAnalyticsOverview)
  )

  return useMemo(
    () => ({
      overview: data,
      overviewLoading: isLoading,
      overviewError: error,
      overviewValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  )
}

// Agencies
export const useAgencies = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    endpoints.analytics.agencies.list(),
    listFetcher(validateAgencies)
  )

  return useMemo(
    () => ({
      agencies: data ?? [],
      agenciesLoading: isLoading,
      agenciesError: error,
      agenciesValidating: isValidating,
      refreshAgencies: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  )
}

// Agency Analytics
export const useAgencyAnalytics = (slug: string) => {
  const url = slug ? endpoints.analytics.agencies.get(slug) : null

  if (!url) {
    throw new Error('Agency slug is required')
  }

  const { data, error, isLoading, isValidating } = useSWR(url, fetcher(validateAgencyAnalytics))

  return useMemo(
    () => ({
      wordCounts: data?.wordCounts as AgencyWordCount,
      regulatoryBurden: data?.burden as RegulatoryBurden,
      agencyLoading: isLoading,
      agencyError: error,
      agencyValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  )
}

// Historical Changes
export const useHistoricalChanges = (slug: string, startDate: string, endDate: string) => {
  const { data, error, isLoading, isValidating } = useSWR(
    slug ? endpoints.analytics.agencies.historical(slug, startDate, endDate) : null,
    fetcher(validateHistoricalChanges)
  )

  return useMemo(
    () => ({
      changes: data ?? [],
      changesLoading: isLoading,
      changesError: error,
      changesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  )
}

// Titles
export const useTitles = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    endpoints.analytics.titles.list(),
    fetcher(validateTitleInfos)
  )

  return useMemo(
    () => ({
      titles: data ?? [],
      titlesLoading: isLoading,
      titlesError: error,
      titlesValidating: isValidating,
      refreshTitles: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  )
}

// Title Analytics
export const useTitleAnalytics = (titleNumber: number) => {
  const { data, error, isLoading, isValidating } = useSWR(
    titleNumber ? endpoints.analytics.titles.get(titleNumber) : null,
    fetcher(validateTitleAnalytics)
  )

  return useMemo(
    () => ({
      complexity: data?.complexity as ComplexityMetrics,
      advanced: data?.advanced as AdvancedTextMetrics,
      titleLoading: isLoading,
      titleError: error,
      titleValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  )
}

// Agency Word Counts
export const useAgencyWordCounts = (slug: string) => {
  const { data, error, isLoading, isValidating } = useSWR(
    slug ? endpoints.analytics.agencies.wordCounts(slug) : null,
    fetcher(validateAgencyWordCount)
  )

  return useMemo(
    () => ({
      wordCounts: data,
      wordCountsLoading: isLoading,
      wordCountsError: error,
      wordCountsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  )
}

// Agency Regulatory Burden
export const useAgencyBurden = (slug: string) => {
  const { data, error, isLoading, isValidating } = useSWR(
    slug ? endpoints.analytics.agencies.burden(slug) : null,
    fetcher(validateRegulatoryBurden)
  )

  return useMemo(
    () => ({
      burden: data,
      burdenLoading: isLoading,
      burdenError: error,
      burdenValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  )
}
