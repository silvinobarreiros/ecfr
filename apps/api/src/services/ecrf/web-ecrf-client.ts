import axios, { AxiosInstance } from 'axios'
import rateLimit from 'axios-rate-limit'
import {
  Agency,
  ContentVersion,
  Correction,
  SearchResult,
  StructureNode,
  TitleInfo,
} from '../../types/ecrf-client'

export class WebECFRClient {
  private client: AxiosInstance

  private readonly BASE_URL = 'https://www.ecfr.gov/api'

  constructor() {
    const axiosClient = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        Accept: 'application/json',
      },
    })

    this.client = rateLimit(axiosClient, { maxRequests: 10, perMilliseconds: 500 })
  }

  // Admin Service
  async getAgencies(): Promise<Agency[]> {
    const response = await this.client.get('/admin/v1/agencies.json')
    return response.data.agencies
  }

  async getCorrections(params?: {
    date?: string
    title?: string
    error_corrected_date?: string
  }): Promise<Correction[]> {
    const response = await this.client.get('/admin/v1/corrections.json', { params })
    return response.data.ecfr_corrections
  }

  async getTitleCorrections(title: string): Promise<Correction[]> {
    const response = await this.client.get(`/admin/v1/corrections/title/${title}.json`)
    return response.data.ecfr_corrections
  }

  // Search Service
  async search(params: {
    query: string
    agency_slugs?: string[]
    date?: string
    last_modified_after?: string
    last_modified_on_or_after?: string
    last_modified_before?: string
    last_modified_on_or_before?: string
    per_page?: number
    page?: number
    order?:
      | 'citations'
      | 'relevance'
      | 'hierarchy'
      | 'newest_first'
      | 'oldest_first'
      | 'suggestions'
    paginate_by?: 'date' | 'results'
  }): Promise<SearchResult> {
    const response = await this.client.get('/search/v1/results', { params })
    return response.data
  }

  async getSearchCount(params: {
    query: string
    agency_slugs?: string[]
    date?: string
    last_modified_after?: string
    last_modified_on_or_after?: string
    last_modified_before?: string
    last_modified_on_or_before?: string
  }): Promise<number> {
    const response = await this.client.get('/search/v1/count', { params })
    return response.data.count
  }

  async getSearchSummary(params: {
    query: string
    agency_slugs?: string[]
    date?: string
    last_modified_after?: string
    last_modified_on_or_after?: string
    last_modified_before?: string
    last_modified_on_or_before?: string
  }): Promise<any> {
    const response = await this.client.get('/search/v1/summary', { params })
    return response.data
  }

  // Versioner Service
  async getAncestry(
    date: string,
    title: string,
    params?: {
      subtitle?: string
      chapter?: string
      subchapter?: string
      part?: string
      subpart?: string
      section?: string
      appendix?: string
    }
  ): Promise<any[]> {
    const response = await this.client.get(`/versioner/v1/ancestry/${date}/title-${title}.json`, {
      params,
    })
    return response.data
  }

  async getTitleStructure(date: string, title: string): Promise<StructureNode> {
    const response = await this.client.get(`/versioner/v1/structure/${date}/title-${title}.json`)
    return response.data
  }

  async getTitleXML(
    date: string,
    title: string,
    params?: {
      subtitle?: string
      chapter?: string
      subchapter?: string
      part?: string
      subpart?: string
      section?: string
      appendix?: string
    }
  ): Promise<string> {
    const response = await this.client.get(`/versioner/v1/full/${date}/title-${title}.xml`, {
      params,
      headers: { Accept: 'application/xml' },
    })
    return response.data
  }

  async getTitlesInfo(): Promise<{
    titles: TitleInfo[]
    meta: {
      date: string
      import_in_progress: boolean
    }
  }> {
    const response = await this.client.get('/versioner/v1/titles.json')
    return response.data
  }

  async getVersions(
    title: string,
    params?: {
      'issue_date[on]'?: string
      'issue_date[lte]'?: string
      'issue_date[gte]'?: string
      subtitle?: string
      chapter?: string
      subchapter?: string
      part?: string
      subpart?: string
      section?: string
      appendix?: string
    }
  ): Promise<{
    content_versions: ContentVersion[]
    meta: {
      title: string
      result_count: string
      issue_date: {
        lte?: string
        gte?: string
      }
      latest_amendment_date: string
      latest_issue_date: string
    }
  }> {
    const response = await this.client.get(`/versioner/v1/versions/title-${title}.json`, { params })
    return response.data
  }
}
