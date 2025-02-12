export interface Agency {
  name: string
  short_name: string
  display_name: string
  sortable_name: string
  slug: string
  children: Agency[]
  cfr_references: CFRReference[]
}

export interface CFRReference {
  title: number
  chapter: string
}

export interface Correction {
  id: number
  cfr_references: {
    cfr_reference: string
    hierarchy: {
      title: string
      subtitle?: string
      part?: string
      subpart?: string
      section?: string
    }
  }[]
  corrective_action: string
  error_corrected: string
  error_occurred: string
  fr_citation: string
  position: number
  display_in_toc: boolean
  title: number
  year: number
  last_modified: string
}

export interface SearchResult {
  results: any[]
  meta: {
    description: string
    current_page: number
    total_count: number
    total_pages: number
    max_score: number
    min_date?: string
    max_date?: string
  }
}

export interface TitleInfo {
  number: number
  name: string
  latest_amended_on: string
  latest_issue_date: string
  up_to_date_as_of: string
  reserved: boolean
  processing_in_progress?: boolean
}

export interface ContentVersion {
  date: string
  amendment_date: string
  issue_date: string
  identifier: string
  name: string
  part: string
  substantive: boolean
  removed: boolean
  subpart: string | null
  title: string
  type: string
}

export interface StructureNode {
  type: 'title' | 'chapter' | 'part' | 'section' | 'subpart' | 'subtitle'
  label: string
  label_level: string
  label_description: string
  identifier: string
  reserved?: boolean
  section_range?: string
  children?: StructureNode[]
}

export interface ECFRClient {
  getAgencies(): Promise<Agency[]>

  getCorrections(params?: {
    date?: string
    title?: string
    error_corrected_date?: string
  }): Promise<Correction[]>

  getTitleCorrections(title: string): Promise<Correction[]>

  search(params: {
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
  }): Promise<SearchResult>

  getSearchCount(params: {
    query: string
    agency_slugs?: string[]
    date?: string
    last_modified_after?: string
    last_modified_on_or_after?: string
    last_modified_before?: string
    last_modified_on_or_before?: string
  }): Promise<number>

  getSearchSummary(params: {
    query: string
    agency_slugs?: string[]
    date?: string
    last_modified_after?: string
    last_modified_on_or_after?: string
    last_modified_before?: string
    last_modified_on_or_before?: string
  }): Promise<any>

  getAncestry(
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
  ): Promise<any[]>

  getTitleStructure(date: string, title: string): Promise<StructureNode>

  getTitleXML(
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
  ): Promise<string>

  getTitlesInfo(): Promise<{
    titles: TitleInfo[]
    meta: {
      date: string
      import_in_progress: boolean
    }
  }>

  getVersions(
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
  }>
}
