import { publicApi } from './client'
import type { Event, SpectrumDTO } from '@/types'

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  const response = await publicApi.get<Event[]>('/events')
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
 * Get event by ID
 * @param eventId Event ID
 */
export async function getEventById(eventId: number): Promise<Event> {
  const response = await publicApi.get<Event>(`/events/${eventId}`)
  return response.data
}

/**
 * Get event spectrum (bias bar data)
 * @param eventId Event ID
 */
export async function getEventSpectrum(eventId: number): Promise<SpectrumDTO> {
  const response = await publicApi.get<SpectrumDTO>(`/events/${eventId}/spectrum`)
  return response.data
}
