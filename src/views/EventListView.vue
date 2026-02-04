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
            style="width: 120px"
          />
          <n-select
            v-model:value="filterPublished"
            :options="publishedOptions"
            placeholder="發布篩選"
            clearable
            style="width: 120px"
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
import { ref, onMounted, h, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NH1, NCard, NSpace, NInput, NSelect, NDataTable, NTag, NText, NButton, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getEvents, publishEvent, setEventHeadline } from '@/api/events'
import { useAuthStore } from '@/stores/auth'
import type { Event } from '@/types'
import { formatDisplay } from '@/utils/date'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const events = ref<Event[]>([])
const loading = ref(false)
const searchTopic = ref('')
const filterState = ref<string | null>(null)
const filterPublished = ref<string | null>(null)

const stateOptions = [
  { label: '開放', value: 'OPEN' },
  { label: '已關閉', value: 'CLOSED' }
]

const publishedOptions = [
  { label: '已發布', value: 'true' },
  { label: '未發布', value: 'false' }
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

// 處理發布/下架
async function handlePublish(event: Event, publish: boolean, e: MouseEvent) {
  e.stopPropagation()
  try {
    await publishEvent(event.eventId, publish)
    message.success(publish ? '已發布' : '已下架')
    loadEvents()
  } catch (error: any) {
    message.error(error.message || '操作失敗')
  }
}

// 處理設置/取消頭條
async function handleHeadline(event: Event, headline: boolean, e: MouseEvent) {
  e.stopPropagation()
  try {
    await setEventHeadline(event.eventId, headline)
    message.success(headline ? '已設為頭條' : '已取消頭條')
    loadEvents()
  } catch (error: any) {
    message.error(error.message || '操作失敗')
  }
}

const columns = computed<DataTableColumns<Event>>(() => [
  {
    title: '事件主題',
    key: 'topic',
    width: 350,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '發布狀態',
    key: 'published',
    width: 120,
    render: (row) => {
      const tags = []
      if (row.published) {
        tags.push(h(NTag, { type: 'success', size: 'small' }, { default: () => '已發布' }))
      } else {
        tags.push(h(NTag, { type: 'default', size: 'small' }, { default: () => '未發布' }))
      }
      if (row.headline) {
        tags.push(h(NTag, { type: 'warning', size: 'small', style: 'margin-left: 4px' }, { default: () => '頭條' }))
      }
      return h('div', { style: 'display: flex; align-items: center;' }, tags)
    }
  },
  {
    title: '狀態',
    key: 'state',
    width: 80,
    render: (row) => {
      return h(
        NTag,
        { type: row.state === 'OPEN' ? 'info' : 'default', size: 'small' },
        { default: () => row.state }
      )
    }
  },
  {
    title: '文章數',
    key: 'articleCount',
    width: 80,
    render: (row) => {
      return h(NText, null, { default: () => row.articleCount || 0 })
    }
  },
  {
    title: '熱度',
    key: 'hotness',
    width: 80,
    render: (row) => {
      return h(NText, null, {
        default: () => (row.hotness !== undefined ? row.hotness.toFixed(1) : '-')
      })
    }
  },
  {
    title: '更新時間',
    key: 'updatedAt',
    width: 150,
    defaultSortOrder: 'descend',
    sorter: 'default',
    render: (row) => {
      return h(NText, { depth: 3 }, { default: () => formatDisplay(row.updatedAt) })
    }
  },
  ...(isAuthenticated.value ? [{
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: Event) => {
      const buttons = []

      // 發布/下架按鈕
      if (row.published) {
        buttons.push(
          h(NPopconfirm, {
            onPositiveClick: (e: MouseEvent) => handlePublish(row, false, e)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'warning',
              onClick: (e: MouseEvent) => e.stopPropagation()
            }, { default: () => '下架' }),
            default: () => '確定要下架此事件嗎？'
          })
        )
      } else {
        buttons.push(
          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: (e: MouseEvent) => handlePublish(row, true, e)
          }, { default: () => '發布' })
        )
      }

      // 頭條按鈕（僅已發布的事件可設為頭條）
      if (row.published) {
        if (row.headline) {
          buttons.push(
            h(NButton, {
              size: 'small',
              type: 'default',
              style: 'margin-left: 8px',
              onClick: (e: MouseEvent) => handleHeadline(row, false, e)
            }, { default: () => '取消頭條' })
          )
        } else {
          buttons.push(
            h(NButton, {
              size: 'small',
              type: 'warning',
              style: 'margin-left: 8px',
              onClick: (e: MouseEvent) => handleHeadline(row, true, e)
            }, { default: () => '設頭條' })
          )
        }
      }

      return h('div', {
        style: 'display: flex; align-items: center;',
        onClick: (e: MouseEvent) => e.stopPropagation()
      }, buttons)
    }
  }] : [])
])

function rowProps(row: Event) {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      router.push(`/events/${row.eventId}`)
    }
  }
}

watch([searchTopic, filterState, filterPublished], () => {
  pagination.value.page = 1
  loadEvents()
})

async function loadEvents() {
  try {
    loading.value = true
    const publishedFilter = filterPublished.value === 'true' ? true : filterPublished.value === 'false' ? false : undefined
    const data = await getEvents(
      pagination.value.page - 1,
      pagination.value.pageSize,
      searchTopic.value || undefined,
      filterState.value || undefined,
      publishedFilter
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
