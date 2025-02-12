// import fs from 'fs/promises'
// import path from 'path'

// import { Agency, Correction, ECFRClient } from '@/types/ecrf-client'
// import {
//   AdvancedTextMetrics,
//   AgencyWordCount,
//   ComplexityMetrics,
//   HistoricalChange,
//   RegulatoryBurden,
// } from '@/types/analytics'

// type AgencyMetrics = {
//   wordCount: AgencyWordCount
//   regulatoryBurden: RegulatoryBurden
// }

// type HistoricalChangeFile = HistoricalChange[]

// type TitleMetrics = {
//   complexity: ComplexityMetrics
//   advanced: AdvancedTextMetrics
// }

// export class ECFRAnalyticsCache {
//   private baseDir: string

//   constructor(baseDir: string) {
//     this.baseDir = baseDir
//   }

//   private static async ensureDirectory(dir: string) {
//     await fs.mkdir(dir, { recursive: true })
//   }

//   private static async readJSON<T>(filePath: string): Promise<T> {
//     const content = await fs.readFile(filePath, 'utf-8')
//     return JSON.parse(content) as T
//   }

//   private static async writeJSON(filePath: string, data: any) {
//     await FileBasedECFRClient.ensureDirectory(path.dirname(filePath))
//     await fs.writeFile(filePath, JSON.stringify(data, null, 2))
//   }

//   async getAgencies(): Promise<Agency[]> {
//     const agenciesDir = path.join(this.baseDir, 'agencies')
//     const files = await fs.readdir(agenciesDir)
//     const agencies: Agency[] = []

//     for await (const file of files) {
//       if (file.endsWith('.json')) {
//         const agency = await FileBasedECFRClient.readJSON<Agency>(path.join(agenciesDir, file))
//         agencies.push(agency)
//       }
//     }

//     return agencies
//   }

//   async getCorrections(params?: {
//     date?: string
//     title?: string
//     error_corrected_date?: string
//   }): Promise<Correction[]> {
//     const correctionsPath = path.join(this.baseDir, 'corrections.json')
//     const corrections = await this.readJSON<Correction[]>(correctionsPath)

//     if (!params) return corrections

//     return corrections.filter((correction) => {
//       if (params.date && correction.last_modified !== params.date) return false
//       if (params.title && correction.title.toString() !== params.title) return false
//       if (params.error_corrected_date && correction.error_corrected !== params.error_corrected_date)
//         return false
//       return true
//     })
//   }

//   async getTitleCorrections(title: string): Promise<Correction[]> {
//     return this.getCorrections({ title })
//   }

//   async search(params: {
//     query: string
//     agency_slugs?: string[]
//     date?: string
//     last_modified_after?: string
//     last_modified_on_or_after?: string
//     last_modified_before?: string
//     last_modified_on_or_before?: string
//     per_page?: number
//     page?: number
//     order?:
//       | 'citations'
//       | 'relevance'
//       | 'hierarchy'
//       | 'newest_first'
//       | 'oldest_first'
//       | 'suggestions'
//     paginate_by?: 'date' | 'results'
//   }): Promise<SearchResult> {
//     const searchIndexPath = path.join(this.baseDir, 'search_index.json')
//     const searchIndex = await this.readJSON<any[]>(searchIndexPath)

//     let results = searchIndex.filter((item) =>
//       item.content.toLowerCase().includes(params.query.toLowerCase())
//     )

//     if (params.agency_slugs) {
//       results = results.filter((item) => params.agency_slugs?.includes(item.agency_slug))
//     }

//     // Apply date filters
//     if (params.date) {
//       results = results.filter((item) => item.date === params.date)
//     }

//     // Apply ordering
//     if (params.order) {
//       switch (params.order) {
//         case 'newest_first':
//           results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//           break
//         case 'oldest_first':
//           results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
//           break
//         // Add other ordering implementations as needed
//       }
//     }

//     // Apply pagination
//     const page = params.page || 1
//     const perPage = params.per_page || 10
//     const start = (page - 1) * perPage
//     const paginatedResults = results.slice(start, start + perPage)

//     return {
//       results: paginatedResults,
//       meta: {
//         description: `Search results for "${params.query}"`,
//         current_page: page,
//         total_count: results.length,
//         total_pages: Math.ceil(results.length / perPage),
//         max_score: 1.0,
//         min_date: results[results.length - 1]?.date,
//         max_date: results[0]?.date,
//       },
//     }
//   }

//   async getSearchCount(params: {
//     query: string
//     agency_slugs?: string[]
//     date?: string
//     last_modified_after?: string
//     last_modified_on_or_after?: string
//     last_modified_before?: string
//     last_modified_on_or_before?: string
//   }): Promise<number> {
//     const searchResults = await this.search({ ...params, per_page: 1 })
//     return searchResults.meta.total_count
//   }

//   async getSearchSummary(params: {
//     query: string
//     agency_slugs?: string[]
//     date?: string
//     last_modified_after?: string
//     last_modified_on_or_after?: string
//     last_modified_before?: string
//     last_modified_on_or_before?: string
//   }): Promise<any> {
//     const count = await this.getSearchCount(params)
//     return {
//       query: params.query,
//       total_results: count,
//       date_range: {
//         earliest: params.last_modified_after || params.last_modified_on_or_after,
//         latest: params.last_modified_before || params.last_modified_on_or_before,
//       },
//     }
//   }

//   async getAncestry(
//     date: string,
//     title: string,
//     params?: {
//       subtitle?: string
//       chapter?: string
//       subchapter?: string
//       part?: string
//       subpart?: string
//       section?: string
//       appendix?: string
//     }
//   ): Promise<any[]> {
//     const titleDir = path.join(this.baseDir, 'titles', title)
//     const ancestryPath = path.join(titleDir, `ancestry_${date}.json`)
//     const ancestry = await this.readJSON<any[]>(ancestryPath)

//     if (!params) return ancestry

//     return ancestry.filter((node) => {
//       if (params.subtitle && node.subtitle !== params.subtitle) return false
//       if (params.chapter && node.chapter !== params.chapter) return false
//       // Add other parameter filters as needed
//       return true
//     })
//   }

//   async getTitleStructure(date: string, title: string): Promise<StructureNode> {
//     const titleDir = path.join(this.baseDir, 'titles', title)
//     const structurePath = path.join(titleDir, `structure_${date}.json`)
//     return this.readJSON<StructureNode>(structurePath)
//   }

//   async getTitleXML(
//     date: string,
//     title: string,
//     params?: {
//       subtitle?: string
//       chapter?: string
//       subchapter?: string
//       part?: string
//       subpart?: string
//       section?: string
//       appendix?: string
//     }
//   ): Promise<string> {
//     const titleDir = path.join(this.baseDir, 'titles', title)
//     const xmlPath = path.join(titleDir, `${date}.xml`)
//     return fs.readFile(xmlPath, 'utf-8')
//   }

//   async getTitlesInfo(): Promise<{
//     titles: TitleInfo[]
//     meta: {
//       date: string
//       import_in_progress: boolean
//     }
//   }> {
//     const titlesInfoPath = path.join(this.baseDir, 'titles_info.json')
//     return this.readJSON(titlesInfoPath)
//   }

//   async getVersions(
//     title: string,
//     params?: {
//       'issue_date[on]'?: string
//       'issue_date[lte]'?: string
//       'issue_date[gte]'?: string
//       subtitle?: string
//       chapter?: string
//       subchapter?: string
//       part?: string
//       subpart?: string
//       section?: string
//       appendix?: string
//     }
//   ): Promise<{
//     content_versions: ContentVersion[]
//     meta: {
//       title: string
//       result_count: string
//       issue_date: {
//         lte?: string
//         gte?: string
//       }
//       latest_amendment_date: string
//       latest_issue_date: string
//     }
//   }> {
//     const titleDir = path.join(this.baseDir, 'titles', title)
//     const versionsPath = path.join(titleDir, 'versions.json')
//     const versions = await this.readJSON<ContentVersion[]>(versionsPath)

//     let filteredVersions = versions
//     if (params) {
//       filteredVersions = versions.filter((version) => {
//         const issueDate = new Date(version.issue_date)

//         if (params['issue_date[on]'] && version.issue_date !== params['issue_date[on]']) {
//           return false
//         }

//         if (params['issue_date[lte]'] && issueDate > new Date(params['issue_date[lte]'])) {
//           return false
//         }

//         if (params['issue_date[gte]'] && issueDate < new Date(params['issue_date[gte]'])) {
//           return false
//         }

//         if (params.chapter && version.part.split('.')[0] !== params.chapter) {
//           return false
//         }

//         return true
//       })
//     }

//     const latestVersion = versions[versions.length - 1]

//     return {
//       content_versions: filteredVersions,
//       meta: {
//         title,
//         result_count: filteredVersions.length.toString(),
//         issue_date: {
//           lte: params?.['issue_date[lte]'],
//           gte: params?.['issue_date[gte]'],
//         },
//         latest_amendment_date: latestVersion.amendment_date,
//         latest_issue_date: latestVersion.issue_date,
//       },
//     }
//   }
// }
