<template>
  <div class="entity-aliases-container">
    <n-space vertical size="large">
      <n-h2>實體別名管理</n-h2>

      <n-alert type="info" title="開發中">
        此功能正在開發中，即將推出。
      </n-alert>

      <n-card title="實體別名列表">
        <template #header-extra>
          <n-space>
            <n-button disabled>批量新增</n-button>
            <n-button type="primary" disabled>新增別名</n-button>
          </n-space>
        </template>

        <n-data-table
          :columns="columns"
          :data="[]"
          :loading="false"
          :pagination="false"
        />
        <n-empty description="即將推出實體別名管理功能" style="margin: 40px 0" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NH2, NSpace, NAlert, NCard, NButton, NDataTable, NEmpty, NTag, NText } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { EntityAlias } from '@/types'

const columns: DataTableColumns<EntityAlias> = [
  {
    title: '別名',
    key: 'alias',
    width: 200
  },
  {
    title: '標準名稱',
    key: 'canonicalName',
    width: 200
  },
  {
    title: '實體類型',
    key: 'entityType',
    width: 150,
    render: (row) => {
      return h(NTag, { size: 'small' }, { default: () => row.entityType })
    }
  },
  {
    title: '狀態',
    key: 'active',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.active ? 'success' : 'default', size: 'small' },
        { default: () => (row.active ? '啟用' : '停用') }
      )
    }
  },
  {
    title: '來源',
    key: 'source',
    width: 150
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
.entity-aliases-container {
  max-width: 1400px;
}
</style>
