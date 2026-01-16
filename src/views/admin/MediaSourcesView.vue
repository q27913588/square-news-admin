<template>
  <div class="media-sources-container">
    <n-space vertical size="large">
      <n-h2>媒體字典管理</n-h2>

      <n-alert type="info" title="開發中">
        此功能正在開發中，即將推出。
      </n-alert>

      <n-card title="媒體來源列表">
        <template #header-extra>
          <n-button type="primary" disabled>新增媒體來源</n-button>
        </template>

        <n-data-table
          :columns="columns"
          :data="[]"
          :loading="false"
          :pagination="false"
        />
        <n-empty description="即將推出媒體字典管理功能" style="margin: 40px 0" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NH2, NSpace, NAlert, NCard, NButton, NDataTable, NEmpty, NText } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { MediaSource } from '@/types'

const columns: DataTableColumns<MediaSource> = [
  {
    title: '名稱',
    key: 'name',
    width: 200
  },
  {
    title: 'Code',
    key: 'code',
    width: 150
  },
  {
    title: '網址',
    key: 'homeUrl',
    width: 300,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '預設立場分數',
    key: 'defaultBiasScore',
    width: 150
  },
  {
    title: '權重',
    key: 'weight',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: () => {
      return h(NText, { depth: 3 }, { default: () => '-' })
    }
  }
]
</script>

<style scoped>
.media-sources-container {
  max-width: 1400px;
}
</style>
