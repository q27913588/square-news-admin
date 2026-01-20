<template>
  <div class="event-detail-container">
    <n-space vertical size="large">
      <!-- Navigation Buttons -->
      <n-space>
        <n-button @click="router.back()">← 返回</n-button>
        <n-button 
          type="primary" 
          @click="router.push(`/events/${eventId}/incitement`)"
        >
          📊 查看煽動指數分析
        </n-button>
      </n-space>

      <!-- Loading -->
      <n-spin :show="loading">
        <div v-if="event">
          <!-- Event Info -->
          <n-card :title="event.topic">
            <template #header-extra>
              <n-tag :type="event.state === 'OPEN' ? 'success' : 'default'">
                {{ event.state }}
              </n-tag>
            </template>

            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="事件 ID">
                {{ event.eventId }}
              </n-descriptions-item>
              <n-descriptions-item label="文章數">
                {{ event.articleCount || 0 }}
              </n-descriptions-item>
              <n-descriptions-item label="來源數">
                {{ event.sourceCount || 0 }}
              </n-descriptions-item>
              <n-descriptions-item label="熱度">
                {{ event.hotness?.toFixed(2) || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="更新時間" :span="2">
                {{ formatDisplay(event.updatedAt) }}
              </n-descriptions-item>
              
              <!-- Key Points -->
              <n-descriptions-item label="重點摘要" :span="2">
                <ul v-if="event.keyPoints && event.keyPoints.length > 0" style="padding-left: 20px; margin: 0;">
                  <li v-for="(point, index) in event.keyPoints" :key="index">{{ point }}</li>
                </ul>
                <span v-else>{{ event.coreSummary || '-' }}</span>
              </n-descriptions-item>

              <n-descriptions-item v-if="event.actors" label="參與者" :span="2">
                <pre>{{ JSON.stringify(event.actors, null, 2) }}</pre>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- Incitement Analysis (if available) -->
          <n-card v-if="incitementData" title="煽動指數分析">
            <n-space vertical>
              <n-text v-if="incitementData.stanceTarget">
                立場目標：{{ incitementData.stanceTarget }}
              </n-text>
              <n-text v-if="incitementData.statistics">
                平均煽動指數：{{ incitementData.statistics.averageIncitement?.toFixed(1) || '-' }}
              </n-text>
              <n-button type="primary" @click="router.push(`/events/${event.eventId}/incitement`)">
                查看詳細煽動指數分析
              </n-button>
            </n-space>
          </n-card>

          <!-- No Incitement Data Alert -->
          <n-alert v-else type="info" title="煽動指數數據">
            此事件尚未進行煽動指數分析。
            <template #footer>
              <n-text depth="3">
                您可以點擊「查看煽動指數分析」按鈕手動觸發分析。
              </n-text>
            </template>
          </n-alert>

          <!-- Articles -->
          <n-card title="相關文章">
            <ArticleTable :articles="articles" :loading="false" />
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
  NTag,
  NDescriptions,
  NDescriptionsItem,
  NAlert,
  NGrid,
  NGridItem,
  NText,
  useMessage
} from 'naive-ui'
import { getEventById, getEventArticles } from '@/api/events'
import { getEventIncitement } from '@/api/incitement'
import type { Event, Article } from '@/types'
import type { EventIncitementData } from '@/api/incitement'
import { formatDisplay } from '@/utils/date'
import ArticleTable from '@/components/ArticleTable.vue'

interface Props {
  eventId: string
}

const props = defineProps<Props>()
const router = useRouter()
const message = useMessage()

const event = ref<Event | null>(null)
const incitementData = ref<EventIncitementData | null>(null)
const articles = ref<Article[]>([])
const loading = ref(false)

async function loadEventDetail() {
  try {
    loading.value = true
    const eventIdNum = parseInt(props.eventId)

    const [eventData, articlesData] = await Promise.all([
      getEventById(eventIdNum),
      getEventArticles(eventIdNum)
    ])

    event.value = eventData
    articles.value = articlesData

    // 尝试加载煽动指数数据（可能不存在）
    try {
      incitementData.value = await getEventIncitement(eventIdNum, false)
    } catch (err) {
      console.warn('No incitement data available for this event')
      incitementData.value = null
    }
  } catch (error: any) {
    message.error(error.message || '載入事件詳情失敗')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEventDetail()
})
</script>

<style scoped>
.event-detail-container {
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
