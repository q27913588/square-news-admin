<template>
  <div class="bias-bar-container">
    <div v-if="totalArticles === 0" class="empty-state">
      <n-text depth="3">數據不足 / 計算中</n-text>
    </div>
    <div v-else class="bias-bar">
      <div
        class="bar-segment left-wing"
        :style="{ width: `${(leftWingRatio || 0) * 100}%` }"
        @mouseenter="showTooltip('left')"
        @mouseleave="hideTooltip"
      >
        <span v-if="(leftWingRatio || 0) > 0.1" class="segment-label">
          左翼 {{ ((leftWingRatio || 0) * 100).toFixed(1) }}%
        </span>
      </div>
      <div
        class="bar-segment center"
        :style="{ width: `${(centerRatio || 0) * 100}%` }"
        @mouseenter="showTooltip('center')"
        @mouseleave="hideTooltip"
      >
        <span v-if="(centerRatio || 0) > 0.1" class="segment-label">
          中立 {{ ((centerRatio || 0) * 100).toFixed(1) }}%
        </span>
      </div>
      <div
        class="bar-segment right-wing"
        :style="{ width: `${(rightWingRatio || 0) * 100}%` }"
        @mouseenter="showTooltip('right')"
        @mouseleave="hideTooltip"
      >
        <span v-if="(rightWingRatio || 0) > 0.1" class="segment-label">
          右翼 {{ ((rightWingRatio || 0) * 100).toFixed(1) }}%
        </span>
      </div>
    </div>
    <div v-if="totalArticles > 0" class="bar-info">
      <n-text depth="3">總文章數: {{ totalArticles }}</n-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NText } from 'naive-ui'

interface Props {
  leftWingRatio?: number | null
  centerRatio?: number | null
  rightWingRatio?: number | null
  totalArticles: number
}

withDefaults(defineProps<Props>(), {
  leftWingRatio: 0,
  centerRatio: 0,
  rightWingRatio: 0,
  totalArticles: 0
})

function showTooltip(segment: string) {
  // Future: Could show detailed tooltip with source information
  console.log('Hovering over:', segment)
}

function hideTooltip() {
  // Future: Hide tooltip
}
</script>

<style scoped>
.bias-bar-container {
  width: 100%;
}

.empty-state {
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.bias-bar {
  display: flex;
  width: 100%;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
  cursor: pointer;
}

.bar-segment:hover {
  opacity: 0.8;
}

.left-wing {
  background-color: #ff4d4f;
}

.center {
  background-color: #8c8c8c;
}

.right-wing {
  background-color: #1890ff;
}

.segment-label {
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.bar-info {
  margin-top: 8px;
  text-align: center;
}
</style>
