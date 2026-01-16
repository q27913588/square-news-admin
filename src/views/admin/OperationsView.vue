<template>
  <div class="operations-container">
    <n-space vertical size="large">
      <n-h2>操作面板</n-h2>

      <n-alert type="info" title="開發中">
        此功能正在開發中，即將推出。
      </n-alert>

      <!-- Batch Operations -->
      <n-card title="批次操作">
        <n-space vertical>
          <n-text>觸發批次處理 pending/error 文章</n-text>
          <n-button type="primary" disabled>執行批次處理</n-button>
        </n-space>
      </n-card>

      <!-- Article Operations -->
      <n-card title="文章操作">
        <n-space vertical>
          <n-space>
            <n-input-number v-model:value="articleId" placeholder="文章 ID" disabled style="width: 200px" />
            <n-button disabled>重跑分析</n-button>
            <n-button disabled>重新聚合</n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Event Operations -->
      <n-card title="事件操作">
        <n-space vertical>
          <n-space>
            <n-input-number v-model:value="eventId" placeholder="事件 ID" disabled style="width: 200px" />
            <n-button type="error" disabled>關閉事件</n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Normalize Test -->
      <n-card title="實體標準化測試">
        <n-space vertical>
          <n-input
            v-model:value="normalizeText"
            type="textarea"
            placeholder="輸入文字進行實體標準化測試"
            disabled
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
          <n-button disabled>測試標準化</n-button>
        </n-space>
      </n-card>

      <n-empty description="即將推出操作面板功能" style="margin: 40px 0" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NH2, NSpace, NAlert, NCard, NText, NButton, NInputNumber, NInput, NEmpty } from 'naive-ui'

const articleId = ref<number | null>(null)
const eventId = ref<number | null>(null)
const normalizeText = ref('')
</script>

<style scoped>
.operations-container {
  max-width: 1400px;
}
</style>
