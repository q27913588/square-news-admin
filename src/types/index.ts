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
  keyPoints?: string[]
  blindspotLabel?: string
  locationTag?: string
}

export interface EventCreateRequest {
  topic: string
  coreSummary?: string | null
  actors?: Record<string, unknown> | null
  startTime?: string | null // ISO format: YYYY-MM-DDTHH:mm:ss
  endTime?: string | null
  state?: EventState | null
  articleIds?: number[] | null
  keyPoints?: string[] | null
  blindspotLabel?: string | null
  locationTag?: string | null
}

export interface EventSuggestRequest {
  articleIds: number[]
}

export interface EventSuggestResponse {
  topic: string
  coreSummary: string
  actors: string[]
  keyPoints?: string[]
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
  factuality?: 'HIGH' | 'MIXED' | 'LOW' | 'UNKNOWN' | string
  ownershipInfo?: string
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
  factuality?: 'HIGH' | 'MIXED' | 'LOW' | 'UNKNOWN' | string
  ownershipInfo?: string
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
  proChinaRatio?: number | null
  proUsRatio?: number | null
  sourceDetails?: SpectrumSourceStance[]
  newsTypeStats?: Record<string, number>
  articles?: Article[]
  blindspotLabel?: string
  keyPoints?: string[]
  locationTag?: string
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
