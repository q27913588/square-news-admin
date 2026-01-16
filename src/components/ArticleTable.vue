<template>
  <n-data-table
    :columns="columns"
    :data="articles"
    :loading="loading"
    :pagination="false"
    :row-props="rowProps"
    :scroll-x="1200"
  />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NTag, NText } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { DataTableColumns } from 'naive-ui'
import type { Article } from '@/types'
import { formatDisplay } from '@/utils/date'

interface Props {
  articles: Article[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const router = useRouter()

const columns: DataTableColumns<Article> = [
  {
    title: '標題',
    key: 'title',
    width: 400,
    ellipsis: {
      tooltip: true
    },
    render: (row) => {
      return h(NText, null, { default: () => row.title || '(無標題)' })
    }
  },
  {
    title: '來源',
    key: 'sourceName',
    width: 150,
    render: (row) => {
      return h(NText, null, { default: () => row.sourceName || '-' })
    }
  },
  {
    title: '發布時間',
    key: 'publishedAt',
    width: 180,
    render: (row) => {
      return h(NText, { depth: 3 }, { default: () => formatDisplay(row.publishedAt) })
    }
  },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, any> = {
        DONE: { type: 'success', text: '完成' },
        PENDING: { type: 'warning', text: '待處理' },
        PROCESSING: { type: 'info', text: '處理中' },
        ERROR: { type: 'error', text: '錯誤' }
      }
      const status = statusMap[row.status || 'PENDING'] || { type: 'default', text: row.status }
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.text })
    }
  },
  {
    title: '立場分數',
    key: 'stanceScore',
    width: 120,
    render: (row) => {
      if (row.stanceScore === null || row.stanceScore === undefined) {
        return h(NText, { depth: 3 }, { default: () => '-' })
      }
      const score = row.stanceScore
      const color = score < -0.3 ? '#ff4d4f' : score > 0.3 ? '#1890ff' : '#8c8c8c'
      return h(
        NText,
        { style: { color, fontWeight: '500' } },
        { default: () => score.toFixed(2) }
      )
    }
  }
]

function rowProps(row: Article) {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      router.push(`/articles/${row.id}`)
    }
  }
}
</script>
