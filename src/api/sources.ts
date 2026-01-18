import { publicApi, adminApi } from './client'
import type { MediaSource } from '@/types'

/**
 * Get all media sources (including virtual sources from articles)
 */
export async function getSources(): Promise<MediaSource[]> {
  const response = await publicApi.get<MediaSource[]>('/sources')
  return response.data
}

/**
 * Create or update media source (admin)
 */
export async function saveMediaSource(payload: MediaSource): Promise<MediaSource> {
  const response = await adminApi.post<MediaSource>('/admin/media-sources', payload)
  return response.data
}
