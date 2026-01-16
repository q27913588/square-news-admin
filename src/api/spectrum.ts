import { publicApi } from './client'
import type { SpectrumDTO } from '@/types'

/**
 * Search spectrum by keyword
 * @param q Search query (required)
 * @param limit Number of results (default: 20)
 */
export async function searchSpectrum(q: string, limit: number = 20): Promise<SpectrumDTO> {
  if (!q || q.trim() === '') {
    throw new Error('搜尋關鍵字不可為空')
  }

  const response = await publicApi.get<SpectrumDTO>('/spectrum/search', {
    params: { q: q.trim(), limit }
  })
  return response.data
}
