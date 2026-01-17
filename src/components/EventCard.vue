<template>
  <div class="event-card" @click="handleClick">
    <div class="card-header">
      <h3 class="card-title">{{ event.topic }}</h3>
      <n-tag
        :type="event.state === 'OPEN' ? 'success' : 'default'"
        size="small"
        :bordered="false"
      >
        {{ event.state }}
      </n-tag>
    </div>

    <div class="card-body">
      <p v-if="event.coreSummary" class="summary">
        {{ truncateSummary(event.coreSummary) }}
      </p>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ event.articleCount || 0 }}</div>
            <div class="stat-label">文章數</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">📰</div>
          <div class="stat-content">
            <div class="stat-value">{{ event.sourceCount || 0 }}</div>
            <div class="stat-label">來源數</div>
          </div>
        </div>

        <div v-if="event.hotness" class="stat-item">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ event.hotness.toFixed(1) }}</div>
            <div class="stat-label">熱度</div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <n-text depth="3" class="update-time">
          <n-icon size="14" style="vertical-align: -2px; margin-right: 4px">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </n-icon>
          {{ event.updatedAt }}
        </n-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTag, NText, NIcon } from 'naive-ui'
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

function truncateSummary(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -4px rgb(0 0 0 / 0.12), 0 8px 16px -8px rgb(0 0 0 / 0.08);
  border-color: #cbd5e1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  color: #1e293b;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
}

.update-time {
  font-size: 13px;
  display: flex;
  align-items: center;
}
</style>
