<template>
  <n-card :title="event.topic" hoverable @click="handleClick" style="cursor: pointer">
    <template #header-extra>
      <n-tag :type="event.state === 'OPEN' ? 'success' : 'default'" size="small">
        {{ event.state }}
      </n-tag>
    </template>

    <n-space vertical size="small">
      <div v-if="event.coreSummary" class="summary">
        <n-text depth="3">{{ truncateSummary(event.coreSummary) }}</n-text>
      </div>

      <n-space size="large">
        <n-statistic label="文章數">
          <template #default>
            <n-number-animation :from="0" :to="event.articleCount || 0" />
          </template>
        </n-statistic>

        <n-statistic label="來源數">
          <template #default>
            <n-number-animation :from="0" :to="event.sourceCount || 0" />
          </template>
        </n-statistic>

        <n-statistic v-if="event.hotness" label="熱度">
          <template #default>
            <n-number-animation :from="0" :to="event.hotness" :precision="2" />
          </template>
        </n-statistic>
      </n-space>

      <div v-if="event.updatedAt">
        <n-text depth="3" style="font-size: 12px">
          更新時間: {{ event.updatedAt }}
        </n-text>
      </div>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NTag, NSpace, NStatistic, NNumberAnimation, NText } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { Event } from '@/types'

interface Props {
  event: Event
}

const props = defineProps<Props>()
const router = useRouter()

function handleClick() {
  router.push(`/events/${props.event.eventId}`)
}

function truncateSummary(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.summary {
  margin: 8px 0;
  line-height: 1.6;
}
</style>
