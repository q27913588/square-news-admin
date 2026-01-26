<template>
  <div class="event-incitement-container">
    <n-space vertical size="large">
      <!-- Header -->
      <n-page-header @back="router.back()">
        <template #title>
          <span>事件煽動指數分析</span>
        </template>
        <template #subtitle>
          <span v-if="eventData">{{ eventData.topic }}</span>
        </template>
      </n-page-header>

      <!-- Loading State -->
      <n-spin :show="loading">
        <div v-if="eventData">
          <!-- Summary Statistics -->
          <n-card title="統計資訊" size="small">
            <n-grid :cols="4" :x-gap="16">
              <n-grid-item>
                <n-statistic label="參與媒體數" :value="eventData.outlets.length" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic
                  label="平均煽動指數"
                  :value="averageIncitement.toFixed(1)"
                  :value-style="{ color: getIncitementColor(averageIncitement) }"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic
                  label="平均立場極性"
                  :value="averageStance.toFixed(2)"
                  :value-style="{ color: getStanceColor(averageStance) }"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="總文章數" :value="totalArticles" />
              </n-grid-item>
            </n-grid>
          </n-card>

          <!-- Incitement Spectrum Chart -->
          <n-card title="煽動指數 × 立場光譜圖">
            <IncitementSpectrum :event-id="eventId" />
          </n-card>

          <!-- Outlet Rankings -->
          <n-card title="媒體煽動指數排名">
            <n-data-table
              :columns="columns"
              :data="sortedOutlets"
              :pagination="false"
              :bordered="false"
            />
          </n-card>

          <!-- Detailed Analysis by Outlet -->
          <n-card title="各媒體詳細分析">
            <n-collapse>
              <n-collapse-item
                v-for="outlet in sortedOutlets"
                :key="outlet.outlet"
                :name="outlet.outlet"
              >
                <template #header>
                  <n-space align="center">
                    <span style="font-weight: 600;">{{ outlet.outlet }}</span>
                    <n-tag
                      :type="
                        outlet.incitementScore > 70
                          ? 'error'
                          : outlet.incitementScore > 40
                          ? 'warning'
                          : 'success'
                      "
                      size="small"
                    >
                      煽動: {{ outlet.incitementScore.toFixed(1) }}
                    </n-tag>
                    <n-tag
                      :type="
                        Math.abs(outlet.stancePolarity || 0) > 0.5 ? 'warning' : 'default'
                      "
                      size="small"
                    >
                      立場: {{ (outlet.stancePolarity || 0).toFixed(2) }}
                    </n-tag>
                  </n-space>
                </template>

                <n-descriptions :column="2" bordered>
                  <n-descriptions-item label="煽動指數">
                    <span
                      :style="{
                        color: getIncitementColor(outlet.incitementScore),
                        fontWeight: '600',
                        fontSize: '16px'
                      }"
                    >
                      {{ outlet.incitementScore.toFixed(1) }}
                    </span>
                  </n-descriptions-item>
                  <n-descriptions-item label="立場極性">
                    <span
                      :style="{
                        color: getStanceColor(outlet.stancePolarity || 0),
                        fontWeight: '600',
                        fontSize: '16px'
                      }"
                    >
                      {{ (outlet.stancePolarity || 0).toFixed(2) }}
                    </span>
                    <span style="margin-left: 8px; color: #666;">
                      ({{ getStanceLabel(outlet.stancePolarity || 0) }})
                    </span>
                  </n-descriptions-item>
                  <n-descriptions-item label="立場信心度">
                    {{
                      outlet.stanceConfidence
                        ? (outlet.stanceConfidence * 100).toFixed(1) + '%'
                        : '-'
                    }}
                  </n-descriptions-item>
                  <n-descriptions-item label="整體信心度">
                    {{
                      outlet.confidence ? (outlet.confidence * 100).toFixed(1) + '%' : '-'
                    }}
                  </n-descriptions-item>
                  <n-descriptions-item label="文章數量" :span="2">
                    {{ outlet.articleCount }}
                  </n-descriptions-item>
                </n-descriptions>

                <!-- Evidence (if available) -->
                <div v-if="outlet.evidence && outlet.evidence.length > 0" style="margin-top: 16px;">
                  <h4>證據片段</h4>
                  <n-space vertical>
                    <n-card
                      v-for="(evidence, index) in outlet.evidence"
                      :key="evidence.id"
                      size="small"
                      :title="`證據 ${index + 1}`"
                    >
                      <p style="white-space: pre-wrap; line-height: 1.6;">{{ evidence.text }}</p>
                      
                      <!-- 分析原因 -->
                      <n-alert v-if="evidence.notes" type="info" style="margin-top: 12px;" :bordered="false">
                        <template #header>
                          <span style="font-weight: 600;">💡 分析理由</span>
                        </template>
                        {{ evidence.notes }}
                      </n-alert>
                      
                      <template #footer>
                        <n-space>
                          <n-tag size="small" :type="getAttributionTypeTag(evidence.attributionType)">
                            {{ getAttributionTypeText(evidence.attributionType) }}
                          </n-tag>
                          <span v-if="evidence.targetsJson.length > 0" style="font-size: 12px; color: #666;">
                            目標: {{ evidence.targetsJson.join(', ') }}
                          </span>
                          <span v-if="evidence.dimsJson && Object.keys(evidence.dimsJson).length > 0" style="font-size: 12px; color: #999;">
                            維度: {{ Object.entries(evidence.dimsJson).map(([k, v]) => `${k}:${v}`).join(', ') }}
                          </span>
                        </n-space>
                      </template>
                    </n-card>
                  </n-space>
                </div>
              </n-collapse-item>
            </n-collapse>
          </n-card>
        </div>

        <n-empty v-else-if="!loading" description="暫無數據" />
      </n-spin>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NPageHeader,
  NSpin,
  NCard,
  NGrid,
  NGridItem,
  NStatistic,
  NDataTable,
  NCollapse,
  NCollapseItem,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NAlert,
  NEmpty,
  NText,
  useMessage,
  type DataTableColumns
} from 'naive-ui'
import { getEventIncitement } from '@/api/incitement'
import type { EventIncitementData, OutletIncitement } from '@/api/incitement'
import IncitementSpectrum from '@/components/IncitementSpectrum.vue'

interface Props {
  eventId: string
}

const props = defineProps<Props>()
const router = useRouter()
const message = useMessage()

const eventId = computed(() => parseInt(props.eventId))
const eventData = ref<EventIncitementData | null>(null)
const loading = ref(false)

// Computed statistics
const averageIncitement = computed(() => {
  if (!eventData.value) return 0
  const sum = eventData.value.outlets.reduce((acc, o) => acc + o.incitementScore, 0)
  return sum / eventData.value.outlets.length
})

const averageStance = computed(() => {
  if (!eventData.value) return 0
  const validStances = eventData.value.outlets.filter((o) => o.stancePolarity !== null)
  if (validStances.length === 0) return 0
  const sum = validStances.reduce((acc, o) => acc + (o.stancePolarity || 0), 0)
  return sum / validStances.length
})

const totalArticles = computed(() => {
  if (!eventData.value) return 0
  return eventData.value.outlets.reduce((acc, o) => acc + o.articleCount, 0)
})

const sortedOutlets = computed(() => {
  if (!eventData.value) return []
  return [...eventData.value.outlets].sort((a, b) => b.incitementScore - a.incitementScore)
})

// Table columns
const columns: DataTableColumns<OutletIncitement> = [
  {
    title: '排名',
    key: 'rank',
    width: 80,
    render: (_, index) => {
      return h(NText, { depth: 3 }, { default: () => `#${index + 1}` })
    }
  },
  {
    title: '媒體',
    key: 'outlet',
    width: 150,
    render: (row) => {
      return h(NText, { strong: true }, { default: () => row.outlet })
    }
  },
  {
    title: '煽動指數',
    key: 'incitementScore',
    width: 120,
    sorter: (a, b) => a.incitementScore - b.incitementScore,
    render: (row) => {
      return h(
        NText,
        {
          style: {
            color: getIncitementColor(row.incitementScore),
            fontWeight: '600'
          }
        },
        { default: () => row.incitementScore.toFixed(1) }
      )
    }
  },
  {
    title: '立場極性',
    key: 'stancePolarity',
    width: 120,
    sorter: (a, b) => (a.stancePolarity || 0) - (b.stancePolarity || 0),
    render: (row) => {
      if (row.stancePolarity === null || row.stancePolarity === undefined) {
        return h(NText, { depth: 3 }, { default: () => '-' })
      }
      return h(
        NText,
        {
          style: {
            color: getStanceColor(row.stancePolarity),
            fontWeight: '600'
          }
        },
        { default: () => (row.stancePolarity ?? 0).toFixed(2) }
      )
    }
  },
  {
    title: '立場傾向',
    key: 'stanceLabel',
    width: 120,
    render: (row) => {
      const label = getStanceLabel(row.stancePolarity || 0)
      return h(NText, null, { default: () => label })
    }
  },
  {
    title: '文章數',
    key: 'articleCount',
    width: 100,
    sorter: (a, b) => a.articleCount - b.articleCount,
    render: (row) => {
      return h(NText, null, { default: () => row.articleCount })
    }
  },
  {
    title: '信心度',
    key: 'confidence',
    width: 100,
    render: (row) => {
      if (!row.confidence) return h(NText, { depth: 3 }, { default: () => '-' })
      return h(
        NText,
        null,
        { default: () => ((row.confidence ?? 0) * 100).toFixed(1) + '%' }
      )
    }
  }
]

// Helper functions
function getIncitementColor(score: number): string {
  if (score > 70) return '#ff4d4f' // 紅色（高煽動）
  if (score > 40) return '#faad14' // 橙色（中等）
  return '#52c41a' // 綠色（低煽動）
}

function getStanceColor(polarity: number): string {
  if (polarity > 0.3) return '#1890ff' // 藍色（親美）
  if (polarity < -0.3) return '#ff4d4f' // 紅色（親中）
  return '#52c41a' // 綠色（中立）
}

function getStanceLabel(polarity: number): string {
  if (polarity > 0.5) return '親美/抗中'
  if (polarity > 0.2) return '偏向親美'
  if (polarity < -0.5) return '親中/疑美'
  if (polarity < -0.2) return '偏向親中'
  return '中立'
}

function getAttributionTypeTag(type: string): 'default' | 'error' | 'warning' | 'success' | 'primary' | 'info' {
  const map: Record<string, 'default' | 'error' | 'warning' | 'success' | 'primary' | 'info'> = {
    OUTLET_VOICE: 'error',      // 紅色 - 媒體自身聲音
    QUOTED_SOURCE: 'warning',   // 橙色 - 引述消息來源
    OPPONENT_QUOTE: 'info'      // 藍色 - 引述對手陣營
  }
  return map[type] || 'default'
}

function getAttributionTypeText(type: string): string {
  const map: Record<string, string> = {
    OUTLET_VOICE: '媒體論述',
    QUOTED_SOURCE: '引述來源',
    OPPONENT_QUOTE: '對手言論'
  }
  return map[type] || type
}

async function loadData() {
  try {
    loading.value = true
    // Load with evidence for detailed view
    eventData.value = await getEventIncitement(eventId.value, true)
  } catch (error: any) {
    message.error(error.message || '載入事件煽動指數數據失敗')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.event-incitement-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
