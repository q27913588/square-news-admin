<template>
  <div class="event-detail-container">
    <n-space vertical size="large">
      <!-- Back Button -->
      <n-button @click="router.back()">← 返回</n-button>

      <!-- Loading -->
      <n-spin :show="loading">
        <div v-if="event && spectrum">
          
          <!-- Blindspot Alert -->
          <n-alert 
            v-if="spectrum.blindspotLabel && spectrum.blindspotLabel !== 'BALANCED'" 
            type="warning" 
            show-icon 
            style="margin-bottom: 16px"
          >
            {{ getBlindspotText(spectrum.blindspotLabel) }}
          </n-alert>

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
              <n-descriptions-item label="地點" v-if="spectrum.locationTag">
                 <n-tag type="info" size="small">{{ spectrum.locationTag }}</n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="更新時間">
                {{ formatDisplay(event.updatedAt) }}
              </n-descriptions-item>
              
              <!-- Key Points -->
              <n-descriptions-item label="重點摘要" :span="2">
                <ul v-if="spectrum.keyPoints && spectrum.keyPoints.length > 0" style="padding-left: 20px; margin: 0;">
                  <li v-for="(point, index) in spectrum.keyPoints" :key="index">{{ point }}</li>
                </ul>
                <span v-else>{{ event.coreSummary || '-' }}</span>
              </n-descriptions-item>

              <n-descriptions-item v-if="event.actors" label="參與者" :span="2">
                <pre>{{ JSON.stringify(event.actors, null, 2) }}</pre>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- Bias Bar -->
          <n-card title="立場光譜">
            <BiasBar
              :left-wing-ratio="spectrum.proChinaRatio ?? spectrum.leftWingRatio"
              :center-ratio="spectrum.centerRatio"
              :right-wing-ratio="spectrum.proUsRatio ?? spectrum.rightWingRatio"
              :total-articles="spectrum.totalArticles"
              :stats-articles="spectrum.statsArticles"
            />
          </n-card>

          <!-- Media Source Cards (Ground News Style) -->
          <n-card v-if="spectrum.sourceDetails && spectrum.sourceDetails.length > 0" title="媒體來源列表">
            <n-grid :x-gap="12" :y-gap="12" cols="1 s:2 m:3 l:4" responsive="screen">
              <n-grid-item v-for="source in spectrum.sourceDetails" :key="source.sourceName">
                <n-card size="small" bordered>
                  <template #header>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span>{{ source.sourceName }}</span>
                      <n-tag :type="getFactualityColor(source.factuality)" size="small" round>
                        {{ getFactualityText(source.factuality) }}
                      </n-tag>
                    </div>
                  </template>
                  <n-space vertical size="small">
                    <div v-if="source.ownershipInfo">
                      <n-text depth="3" size="small">所有權: {{ source.ownershipInfo }}</n-text>
                    </div>
                    <div>
                      <n-text depth="3">文章數: </n-text>
                      <n-text strong>{{ source.articleCount }}</n-text>
                    </div>
                    <div>
                      <n-text depth="3">平均立場: </n-text>
                      <n-text :style="{ color: getScoreColor(source.averageScore) }">
                        {{ source.averageScore.toFixed(2) }}
                      </n-text>
                    </div>
                  </n-space>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-card>

          <!-- Source Distribution Chart -->
          <n-card v-if="spectrum.sourceDetails && spectrum.sourceDetails.length > 0" title="來源分佈圖表">
            <SourceDistribution :source-details="spectrum.sourceDetails" />
          </n-card>

          <!-- News Type Analysis -->
          <n-card v-if="spectrum.sourceDetails && spectrum.sourceDetails.length > 0" title="媒體「廢文」分析 (轉述/評論/風向)">
            <NewsTypeAnalysis :source-details="spectrum.sourceDetails" />
          </n-card>

          <!-- Articles -->
          <n-card title="相關文章">
            <ArticleTable :articles="spectrum.articles || []" :loading="false" />
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
import { getEventById, getEventSpectrum } from '@/api/events'
import type { Event, SpectrumDTO } from '@/types'
import { formatDisplay } from '@/utils/date'
import BiasBar from '@/components/BiasBar.vue'
import SourceDistribution from '@/components/SourceDistribution.vue'
import NewsTypeAnalysis from '@/components/NewsTypeAnalysis.vue'
import ArticleTable from '@/components/ArticleTable.vue'

interface Props {
  eventId: string
}

const props = defineProps<Props>()
const router = useRouter()
const message = useMessage()

const event = ref<Event | null>(null)
const spectrum = ref<SpectrumDTO | null>(null)
const loading = ref(false)

async function loadEventDetail() {
  try {
    loading.value = true
    const eventIdNum = parseInt(props.eventId)

    const [eventData, spectrumData] = await Promise.all([
      getEventById(eventIdNum),
      getEventSpectrum(eventIdNum)
    ])

    event.value = eventData
    spectrum.value = spectrumData
  } catch (error: any) {
    message.error(error.message || '載入事件詳情失敗')
  } finally {
    loading.value = false
  }
}

function getBlindspotText(label?: string): string {
  switch (label) {
    case 'PRO_US_BLINDSPOT': return '⚠️ 親美盲區：親美媒體對此事件報導較少，建議參考親中觀點。'
    case 'PRO_CHINA_BLINDSPOT': return '⚠️ 親中盲區：親中媒體對此事件報導較少，建議參考親美觀點。'
    case 'LEFT_BLINDSPOT': return '⚠️ 左翼盲區：左翼媒體報導較少。'
    case 'RIGHT_BLINDSPOT': return '⚠️ 右翼盲區：右翼媒體報導較少。'
    case 'BALANCED': return '平衡報導'
    default: return label || ''
  }
}

function getFactualityColor(factuality?: string): 'success' | 'warning' | 'error' | 'default' {
  switch (factuality) {
    case 'HIGH': return 'success'
    case 'MIXED': return 'warning'
    case 'LOW': return 'error'
    default: return 'default'
  }
}

function getFactualityText(factuality?: string): string {
  switch (factuality) {
    case 'HIGH': return '高可信度'
    case 'MIXED': return '混合'
    case 'LOW': return '低可信度'
    case 'UNKNOWN': return '未知'
    default: return factuality || '未知'
  }
}

function getScoreColor(score: number): string {
  if (score < -0.3) return '#ef4444' // Red (Pro-China)
  if (score > 0.3) return '#3b82f6' // Blue (Pro-US)
  return '#9ca3af' // Grey
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
