// Event Types
export type EventState = 'OPEN' | 'CLOSED' | string

export interface Event {
  eventId: number
  topic: string
  coreSummary?: string
  actors?: Record<string, unknown>
  startTime?: string // "yyyy-MM-dd HH:mm:ss"
  endTime?: string
  state: EventState
  articleCount?: number
  sourceCount?: number
  hotness?: number
  stanceDiversity?: number
  updatedAt?: string
  createdAt?: string
}

// Article Types
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR' | string

export interface MediaSource {
  id?: number // /sources may return virtual source, id may not exist
  name: string
  code: string
  homeUrl?: string
  defaultBiasScore?: number
  weight?: number
  createdAt?: string
  updatedAt?: string
}

export interface Article {
  id: number
  mediaSource?: MediaSource | null // ManyToOne lazy
  sourceName?: string | null
  author?: string | null
  url: string
  publishedAt?: string
  title?: string | null
  cleanText?: string | null
  topic?: string | null
  actors?: Record<string, unknown> | null
  eventSummary?: string | null
  newsType?: string | null
  stanceResult?: Record<string, unknown> | null
  stanceScore?: number | null
  eventId?: number | null
  status?: ProcessingStatus
  createdAt?: string
  updatedAt?: string
}

// Spectrum Types
export interface SpectrumSourceStance {
  sourceName: string
  averageScore: number
  articleCount: number
  newsTypeCounts?: Record<string, number>
}

export interface SpectrumDTO {
  eventId?: number | null
  topic: string
  averageScore?: number | null
  totalArticles: number
  statsArticles?: number | null
  totalSources?: number | null
  leftWingRatio?: number | null
  centerRatio?: number | null
  rightWingRatio?: number | null
  sourceDetails?: SpectrumSourceStance[]
  newsTypeStats?: Record<string, number>
  articles?: Article[]
}

// Pagination Type
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number // 0-based
  // Other fields can be ignored
}

// Entity Alias Types
export type EntityType = 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | string

export interface EntityAlias {
  id?: number
  alias: string
  canonicalName: string
  entityType: EntityType
  active?: boolean
  source?: string | null
  createdAt?: string
  updatedAt?: string
}

// API Request Types
export interface GetArticlesParams {
  sourceName?: string
  startDate?: string // ISO format: YYYY-MM-DDTHH:mm:ss
  endDate?: string // ISO format: YYYY-MM-DDTHH:mm:ss
  page?: number // 0-based
  size?: number
}
