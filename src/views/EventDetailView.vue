<template>
  <div class="event-detail-container">
    <n-space vertical size="large">
      <!-- Back Button -->
      <n-button @click="router.back()">← 返回</n-button>

      <!-- Loading -->
      <n-spin :show="loading">
        <div v-if="event && spectrum">
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
              <n-descriptions-item label="開始時間" :span="2">
                {{ formatDisplay(event.startTime) }}
              </n-descriptions-item>
              <n-descriptions-item label="結束時間" :span="2">
                {{ formatDisplay(event.endTime) }}
              </n-descriptions-item>
              <n-descriptions-item label="更新時間" :span="2">
                {{ formatDisplay(event.updatedAt) }}
              </n-descriptions-item>
              <n-descriptions-item v-if="event.coreSummary" label="核心摘要" :span="2">
                {{ event.coreSummary }}
              </n-descriptions-item>
              <n-descriptions-item v-if="event.actors" label="參與者" :span="2">
                <pre>{{ JSON.stringify(event.actors, null, 2) }}</pre>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- Bias Bar -->
          <n-card title="立場光譜">
            <BiasBar
              :left-wing-ratio="spectrum.leftWingRatio"
              :center-ratio="spectrum.centerRatio"
              :right-wing-ratio="spectrum.rightWingRatio"
              :total-articles="spectrum.totalArticles"
            />
          </n-card>

          <!-- Source Distribution -->
          <n-card v-if="spectrum.sourceDetails && spectrum.sourceDetails.length > 0" title="來源分佈">
            <SourceDistribution :source-details="spectrum.sourceDetails" />
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
  useMessage
} from 'naive-ui'
import { getEventById, getEventSpectrum } from '@/api/events'
import type { Event, SpectrumDTO } from '@/types'
import { formatDisplay } from '@/utils/date'
import BiasBar from '@/components/BiasBar.vue'
import SourceDistribution from '@/components/SourceDistribution.vue'
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
