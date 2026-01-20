import { publicApi } from './client'
import type { ArticleIncitationEvidence } from '@/types'

export interface EventIncitementData {
  eventId: number
  topic: string
  stanceTarget?: string
  outlets: OutletIncitement[]
  statistics?: {
    totalOutlets: number
    totalArticles: number
    averageIncitement: number
    averageStance: number
  }
}

export interface OutletIncitement {
  outlet: string
  incitementScore: number
  stancePolarity?: number | null
  stanceConfidence?: number | null
  confidence?: number | null
  articleCount: number
  evidence?: ArticleIncitationEvidence[] // 如果 includeEvidence=true
}

/**
 * 獲取事件的煽動指數數據
 * @param eventId Event ID
 * @param includeEvidence Whether to include evidence snippets
 */
export async function getEventIncitement(
  eventId: number,
  includeEvidence = false
): Promise<EventIncitementData> {
  const response = await publicApi.get<EventIncitementData>(`/events/${eventId}/incitement`, {
    params: { includeEvidence }
  })
  return response.data
}

export interface IncitementSpectrumPoint {
  outlet: string
  incitementScore: number
  stancePolarity: number | null
  stanceConfidence: number | null
  confidence: number | null
  articleCount: number
}

export interface IncitementSpectrumData {
  eventId?: number
  topic?: string
  outlets: IncitementSpectrumPoint[]
}

/**
 * 獲取煽動指數光譜圖數據
 * @param eventId Optional event ID to filter by
 */
export async function getIncitementSpectrum(eventId?: number): Promise<IncitementSpectrumData> {
  const response = await publicApi.get<IncitementSpectrumData>('/incitement/spectrum', {
    params: eventId ? { eventId } : {}
  })
  return response.data
}

export interface IncitementTrendPoint {
  date: string
  incitementScore: number
  articleCount: number
}

export interface IncitementTrendData {
  outlet: string
  startDate: string
  endDate: string
  dataPoints: IncitementTrendPoint[]
}

/**
 * 獲取煽動指數趨勢數據
 * @param startDate Start date (ISO format)
 * @param endDate End date (ISO format)
 * @param outlet Optional outlet name to filter by
 */
export async function getIncitementTrend(
  startDate?: string,
  endDate?: string,
  outlet?: string
): Promise<IncitementTrendData> {
  const response = await publicApi.get<IncitementTrendData>('/incitement/trend', {
    params: {
      startDate,
      endDate,
      outlet
    }
  })
  return response.data
}
