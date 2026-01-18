<template>
  <div class="event-list-container">
    <n-h1>事件列表</n-h1>

    <n-card>
      <n-space vertical size="large">
        <!-- Filters -->
        <n-space>
          <n-input
            v-model:value="searchTopic"
            placeholder="搜尋事件主題"
            clearable
            style="width: 300px"
          />
          <n-select
            v-model:value="filterState"
            :options="stateOptions"
            placeholder="狀態篩選"
            clearable
            style="width: 150px"
          />
        </n-space>

        <!-- Events Table -->
        <n-data-table
          remote
          :columns="columns"
          :data="events"
          :loading="loading"
          :pagination="pagination"
          :row-props="rowProps"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NH1, NCard, NSpace, NInput, NSelect, NDataTable, NTag, NText, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getEvents } from '@/api/events'
import type { Event } from '@/types'
import { formatDisplay } from '@/utils/date'

const router = useRouter()
const message = useMessage()

const events = ref<Event[]>([])
const loading = ref(false)
const searchTopic = ref('')
const filterState = ref<string | null>(null)

const stateOptions = [
  { label: '開放', value: 'OPEN' },
  { label: '已關閉', value: 'CLOSED' }
]

const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.value.page = page
    loadEvents()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    loadEvents()
  }
})

const columns: DataTableColumns<Event> = [
  {
    title: '事件主題',
    key: 'topic',
    width: 400,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '狀態',
    key: 'state',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.state === 'OPEN' ? 'success' : 'default', size: 'small' },
        { default: () => row.state }
      )
    }
  },
  {
    title: '文章數',
    key: 'articleCount',
    width: 100,
    render: (row) => {
      return h(NText, null, { default: () => row.articleCount || 0 })
    }
  },
  {
    title: '來源數',
    key: 'sourceCount',
    width: 100,
    render: (row) => {
      return h(NText, null, { default: () => row.sourceCount || 0 })
    }
  },
  {
    title: '熱度',
    key: 'hotness',
    width: 100,
    render: (row) => {
      return h(NText, null, {
        default: () => (row.hotness !== undefined ? row.hotness.toFixed(2) : '-')
      })
    }
  },
  {
    title: '更新時間',
    key: 'updatedAt',
    width: 180,
    defaultSortOrder: 'descend',
    sorter: 'default',
    render: (row) => {
      return h(NText, { depth: 3 }, { default: () => formatDisplay(row.updatedAt) })
    }
  }
]

function rowProps(row: Event) {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      router.push(`/events/${row.eventId}`)
    }
  }
}

watch([searchTopic, filterState], () => {
  pagination.value.page = 1
  loadEvents()
})

async function loadEvents() {
  try {
    loading.value = true
    const data = await getEvents(
      pagination.value.page - 1,
      pagination.value.pageSize,
      searchTopic.value || undefined,
      filterState.value || undefined
    )
    events.value = data.content
    pagination.value.itemCount = data.totalElements
  } catch (error: any) {
    message.error(error.message || '載入事件列表失敗')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.event-list-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
