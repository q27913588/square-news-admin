<template>
  <div class="article-detail-container">
    <n-space vertical size="large">
      <!-- Back Button -->
      <n-button @click="router.back()">← 返回</n-button>

      <!-- Loading -->
      <n-spin :show="loading">
        <div v-if="article">
          <!-- Basic Info -->
          <n-card title="文章資訊">
            <n-descriptions :column="1" bordered>
              <n-descriptions-item label="標題">
                {{ article.title || '(無標題)' }}
              </n-descriptions-item>
              <n-descriptions-item label="作者">
                {{ article.author || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="來源">
                {{ article.sourceName || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="網址">
                <n-a :href="article.url" target="_blank">{{ article.url }}</n-a>
              </n-descriptions-item>
              <n-descriptions-item label="發布時間">
                {{ formatDisplay(article.publishedAt) }}
              </n-descriptions-item>
              <n-descriptions-item label="狀態">
                <n-tag :type="getStatusType(article.status || 'PENDING')" size="small">
                  {{ article.status }}
                </n-tag>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- Content -->
          <n-card title="文章內容">
            <div v-if="article.cleanText">
              <n-collapse-transition :show="showFullText">
                <div style="white-space: pre-wrap; line-height: 1.8">
                  {{ showFullText ? article.cleanText : truncateText(article.cleanText) }}
                </div>
              </n-collapse-transition>
              <n-button v-if="article.cleanText.length > 500" text @click="showFullText = !showFullText">
                {{ showFullText ? '收起' : '展開全文' }}
              </n-button>
            </div>
            <n-empty v-else description="無文章內容" />
          </n-card>

          <!-- Analysis -->
          <n-card title="分析結果">
            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="主題">
                {{ article.topic || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="新聞類型">
                <n-tag v-if="article.newsType" :type="getNewsTypeTag(article.newsType)" size="small">
                  {{ getNewsTypeText(article.newsType) }}
                </n-tag>
                <span v-else>-</span>
              </n-descriptions-item>
              <n-descriptions-item label="立場分數" :span="2">
                <span v-if="article.stanceScore !== null && article.stanceScore !== undefined"
                      :style="{ color: getStanceColor(article.stanceScore), fontWeight: '600', fontSize: '16px' }">
                  {{ article.stanceScore.toFixed(2) }}
                </span>
                <span v-else>-</span>
              </n-descriptions-item>
              <n-descriptions-item label="事件 ID" :span="2">
                <n-button
                  v-if="article.eventId"
                  text
                  type="primary"
                  @click="router.push(`/events/${article.eventId}`)"
                >
                  {{ article.eventId }}（查看事件）
                </n-button>
                <span v-else>-</span>
              </n-descriptions-item>
              <n-descriptions-item label="事件摘要" :span="2">
                {{ article.eventSummary || '-' }}
              </n-descriptions-item>
              <n-descriptions-item v-if="article.actors" label="參與者" :span="2">
                <pre>{{ JSON.stringify(article.actors, null, 2) }}</pre>
              </n-descriptions-item>
              <n-descriptions-item v-if="article.stanceResult" label="立場詳情" :span="2">
                <pre>{{ JSON.stringify(article.stanceResult, null, 2) }}</pre>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- Metadata -->
          <n-card title="元數據">
            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="文章 ID">
                {{ article.id }}
              </n-descriptions-item>
              <n-descriptions-item label="建立時間">
                {{ formatDisplay(article.createdAt) }}
              </n-descriptions-item>
              <n-descriptions-item label="更新時間" :span="2">
                {{ formatDisplay(article.updatedAt) }}
              </n-descriptions-item>
            </n-descriptions>
          </n-card>
        </div>
      </n-spin>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NButton,
  NSpin,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NA,
  NEmpty,
  NCollapseTransition,
  useMessage
} from 'naive-ui'
import { getArticleById } from '@/api/articles'
import type { Article } from '@/types'
import { formatDisplay } from '@/utils/date'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const message = useMessage()

const article = ref<Article | null>(null)
const loading = ref(false)
const showFullText = ref(false)

function getStatusType(status: string): any {
  const map: Record<string, string> = {
    DONE: 'success',
    PENDING: 'warning',
    PROCESSING: 'info',
    ERROR: 'error'
  }
  return map[status] || 'default'
}

function getNewsTypeTag(type: string): any {
  const map: Record<string, string> = {
    FACTUAL: 'success',
    REPOST: 'warning',
    COMMENTARY: 'info',
    NARRATIVE: 'error'
  }
  return map[type] || 'default'
}

function getNewsTypeText(type: string): string {
  const map: Record<string, string> = {
    FACTUAL: '事實報導',
    REPOST: '轉述引述',
    COMMENTARY: '網紅評論',
    NARRATIVE: '帶風向',
    UNKNOWN: '未知'
  }
  return map[type] || type
}

function getStanceColor(score: number): string {
  if (score < -0.3) return '#ff4d4f'
  if (score > 0.3) return '#1890ff'
  return '#8c8c8c'
}

function truncateText(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

async function loadArticle() {
  try {
    loading.value = true
    const articleId = parseInt(props.id)
    article.value = await getArticleById(articleId)
  } catch (error: any) {
    message.error(error.message || '載入文章詳情失敗')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.article-detail-container {
  max-width: 1400px;
  margin: 0 auto;
}

pre {
  margin: 0;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
