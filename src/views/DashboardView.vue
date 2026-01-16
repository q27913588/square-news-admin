<template>
  <div class="dashboard-container">
    <n-h1>Square News 儀表板</n-h1>

    <n-space vertical size="large">
      <!-- Quick Spectrum Search -->
      <n-card title="快速光譜查詢">
        <n-space vertical>
          <n-input-group>
            <n-input
              v-model:value="searchQuery"
              placeholder="輸入關鍵字查詢光譜分佈"
              @keyup.enter="handleSearch"
            />
            <n-button type="primary" :loading="searchLoading" @click="handleSearch">
              搜尋
            </n-button>
          </n-input-group>

          <div v-if="spectrumData">
            <n-h3>{{ spectrumData.topic }}</n-h3>
            <BiasBar
              :left-wing-ratio="spectrumData.leftWingRatio"
              :center-ratio="spectrumData.centerRatio"
              :right-wing-ratio="spectrumData.rightWingRatio"
              :total-articles="spectrumData.totalArticles"
            />
            <div v-if="spectrumData.sourceDetails && spectrumData.sourceDetails.length > 0">
              <n-divider />
              <SourceDistribution :source-details="spectrumData.sourceDetails" />
            </div>
          </div>
        </n-space>
      </n-card>

      <!-- Trending Events -->
      <n-card title="熱門事件">
        <n-spin :show="eventsLoading">
          <n-empty v-if="!eventsLoading && events.length === 0" description="暫無熱門事件" />
          <n-grid v-else :cols="1" :x-gap="16" :y-gap="16" :md="2" :lg="3">
            <n-grid-item v-for="event in events" :key="event.eventId">
              <EventCard :event="event" />
            </n-grid-item>
          </n-grid>
        </n-spin>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NH1,
  NH3,
  NCard,
  NSpace,
  NInput,
  NInputGroup,
  NButton,
  NGrid,
  NGridItem,
  NSpin,
  NEmpty,
  NDivider,
  useMessage
} from 'naive-ui'
import { getTrendingEvents } from '@/api/events'
import { searchSpectrum } from '@/api/spectrum'
import type { Event, SpectrumDTO } from '@/types'
import EventCard from '@/components/EventCard.vue'
import BiasBar from '@/components/BiasBar.vue'
import SourceDistribution from '@/components/SourceDistribution.vue'

const message = useMessage()

// Trending events
const events = ref<Event[]>([])
const eventsLoading = ref(false)

// Spectrum search
const searchQuery = ref('')
const spectrumData = ref<SpectrumDTO | null>(null)
const searchLoading = ref(false)

async function loadTrendingEvents() {
  try {
    eventsLoading.value = true
    events.value = await getTrendingEvents(10)
  } catch (error: any) {
    message.error(error.message || '載入熱門事件失敗')
  } finally {
    eventsLoading.value = false
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    message.warning('請輸入搜尋關鍵字')
    return
  }

  try {
    searchLoading.value = true
    spectrumData.value = await searchSpectrum(searchQuery.value, 20)
  } catch (error: any) {
    message.error(error.message || '搜尋失敗')
    spectrumData.value = null
  } finally {
    searchLoading.value = false
  }
}

onMounted(() => {
  loadTrendingEvents()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
