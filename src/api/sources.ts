import { publicApi } from './client'
import type { MediaSource } from '@/types'

/**
 * Get all media sources (including virtual sources from articles)
 */
export async function getSources(): Promise<MediaSource[]> {
  const response = await publicApi.get<MediaSource[]>('/sources')
  return response.data
}
