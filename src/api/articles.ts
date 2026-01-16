import { publicApi } from './client'
import type { Article, Page, GetArticlesParams } from '@/types'

/**
 * Get articles with pagination and filters
 * @param params Query parameters
 */
export async function getArticles(params: GetArticlesParams = {}): Promise<Page<Article>> {
  const response = await publicApi.get<Page<Article>>('/articles', {
    params: {
      sourceName: params.sourceName || undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      page: params.page !== undefined ? params.page : 0,
      size: params.size || 20
    }
  })
  return response.data
}

/**
 * Get article by ID
 * @param id Article ID
 */
export async function getArticleById(id: number): Promise<Article> {
  const response = await publicApi.get<Article>(`/articles/${id}`)
  return response.data
}

/**
 * Search articles by semantic query
 * @param q Search query
 * @param limit Number of results (default: 10)
 */
export async function searchArticles(q: string, limit: number = 10): Promise<Article[]> {
  const response = await publicApi.get<Article[]>('/articles/search', {
    params: { q, limit }
  })
  return response.data
}
