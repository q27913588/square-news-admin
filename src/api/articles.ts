import { publicApi, adminApi } from './client'
import type { Article, Page, GetArticlesParams, ArticleIncitationAnalysis, ArticleIncitationEvidence } from '@/types'

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
 * Search articles by keyword (searches title and summary)
 * @param q Search keyword
 * @param page Page number (0-based)
 * @param size Page size
 */
export async function searchArticles(q: string, page: number = 0, size: number = 20): Promise<Page<Article>> {
  const response = await publicApi.get<Page<Article>>('/articles/search', {
    params: { q, page, size }
  })
  return response.data
}

/**
 * Get article incitation analysis
 * @param articleId Article ID
 * @returns ArticleIncitationAnalysis or null if not available
 */
export async function getArticleIncitationAnalysis(
  articleId: number
): Promise<ArticleIncitationAnalysis | null> {
  try {
    const response = await publicApi.get<ArticleIncitationAnalysis>(`/articles/${articleId}/incitation`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      // 文章沒有煽動指數分析（可能是低價值新聞或未分配事件）
      return null
    }
    throw error
  }
}

/**
 * Get article incitation evidence
 * @param articleId Article ID
 * @returns Array of evidence snippets
 */
export async function getArticleIncitationEvidence(
  articleId: number
): Promise<ArticleIncitationEvidence[]> {
  const response = await publicApi.get<ArticleIncitationEvidence[]>(`/articles/${articleId}/incitation/evidence`)
  return response.data
}

/**
 * Batch reaggregate articles (admin)
 * @param articleIds Array of article IDs to reaggregate
 * @returns Number of processed articles
 */
export async function batchReaggregateArticles(
  articleIds: number[]
): Promise<{ processed: number; message: string }> {
  const response = await adminApi.post<{ processed: number; message: string }>('/admin/articles/batch-reaggregate', { articleIds })
  return response.data
}
