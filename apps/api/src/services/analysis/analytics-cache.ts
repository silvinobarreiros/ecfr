import fs from 'fs/promises'
import path from 'path'

import {
  AdvancedTextMetrics,
  AgencyWordCount,
  ComplexityMetrics,
  HistoricalChange,
  RegulatoryBurden,
} from '@/types/analytics'

export interface AnalyticsCache {
  getAgencyWordCounts(agencySlug: string): Promise<AgencyWordCount>
  getHistoricalChanges(agencySlug: string, startDate: string): Promise<HistoricalChange[]>
  getComplexityMetrics(titleNumber: number, section?: string): Promise<ComplexityMetrics>
  getRegulatoryBurden(agencySlug: string): Promise<RegulatoryBurden>
  getAdvancedTextMetrics(titleNumber: number, section?: string): Promise<AdvancedTextMetrics>
}

type AgencyFile = {
  wordCounts: AgencyWordCount
  burden: RegulatoryBurden
}

type TitleFile = {
  complexity: ComplexityMetrics
  advanced: AdvancedTextMetrics
}

export class FileAnalyticsCache implements AnalyticsCache {
  constructor(private readonly cachePath: string) {
    this.cachePath = cachePath
  }

  async getAgencyWordCounts(agencySlug: string): Promise<AgencyWordCount> {
    const file = await this.readCache<AgencyFile>(`agencies/${agencySlug}.json`)
    return file.wordCounts
  }

  async getRegulatoryBurden(agencySlug: string): Promise<RegulatoryBurden> {
    const file = await this.readCache<AgencyFile>(`agencies/${agencySlug}.json`)
    return file.burden
  }

  async getHistoricalChanges(agencySlug: string, startDate: string): Promise<HistoricalChange[]> {
    return this.readCache<HistoricalChange[]>(`historical-changes/${agencySlug}.json`)
  }

  async getComplexityMetrics(titleNumber: number, section?: string): Promise<ComplexityMetrics> {
    const file = await this.readCache<TitleFile>(`titles/title-${titleNumber}.json`)
    return file.complexity
  }

  async getAdvancedTextMetrics(
    titleNumber: number,
    section?: string
  ): Promise<AdvancedTextMetrics> {
    const file = await this.readCache<TitleFile>(`titles/title-${titleNumber}.json`)
    return file.advanced
  }

  private async readCache<T>(filePath: string): Promise<T> {
    const cachePath = path.join(this.cachePath, filePath)
    const data = await fs.readFile(cachePath, 'utf-8')

    return JSON.parse(data) as T
  }
}
