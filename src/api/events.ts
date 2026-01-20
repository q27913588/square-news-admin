import { publicApi, adminApi } from './client'
import type { Event, Article, SpectrumDTO, IncitementSpectrumDTO, EventCreateRequest, EventSuggestRequest, EventSuggestResponse, Page } from '@/types'

/**
 * Get all events
 */
export async function getEvents(
  page: number = 0,
  size: number = 20,
  topic?: string,
  state?: string
): Promise<Page<Event>> {
  const params: any = { page, size, sort: 'updatedAt,desc' }
  if (topic) params.topic = topic
  if (state) params.state = state

  const response = await publicApi.get<Page<Event>>('/events', { params })
  return response.data
}

/**
 * Get trending events
 * @param limit Number of events to fetch (default: 10)
 */
export async function getTrendingEvents(limit: number = 10): Promise<Event[]> {
  const response = await publicApi.get<Event[]>('/events/trending', {
    params: { limit }
  })
  return response.data
}

/**
 * Get recent events (sorted by updatedAt)
 * @param limit Number of events to fetch (default: 10)
 */
export async function getRecentEvents(limit: number = 10): Promise<Event[]> {
  const response = await publicApi.get<Event[]>('/events/recent', {
    params: { limit }
  })
  return response.data
}

/**
 * Get event by ID
 * @param eventId Event ID
 */
export async function getEventById(eventId: number): Promise<Event> {
  const response = await publicApi.get<Event>(`/events/${eventId}`)
  return response.data
}

/**
 * Get articles for a specific event
 * @param eventId Event ID
 */
export async function getEventArticles(eventId: number): Promise<Article[]> {
  const response = await publicApi.get<Article[]>(`/events/${eventId}/articles`)
  return response.data
}

/**
 * Get event spectrum (bias bar data) - DEPRECATED
 * @deprecated Use getEventIncitementSpectrum from incitement.ts for new incitement-based spectrum
 * @param eventId Event ID
 */
export async function getEventSpectrum(eventId: number): Promise<SpectrumDTO> {
  const response = await publicApi.get<SpectrumDTO>(`/events/${eventId}/spectrum`)
  return response.data
}

/**
 * Get event incitement spectrum (2D scatter plot data)
 * 获取事件煽动指数光谱（2D 图表数据）
 * @param eventId Event ID
 */
export async function getEventIncitementSpectrum(eventId: number): Promise<IncitementSpectrumDTO> {
  const response = await publicApi.get<IncitementSpectrumDTO>(`/events/${eventId}/spectrum`)
  return response.data
}

/**
 * Create event (admin)
 */
export async function createEvent(payload: EventCreateRequest): Promise<Event> {
  const response = await adminApi.post<Event>('/admin/events', payload)
  return response.data
}

/**
 * Suggest event draft (admin)
 */
export async function suggestEventDraft(payload: EventSuggestRequest): Promise<EventSuggestResponse> {
  const response = await adminApi.post<EventSuggestResponse>('/admin/events/suggest', payload)
  return response.data
}
