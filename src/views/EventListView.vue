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
          :columns="columns"
          :data="filteredEvents"
          :loading="loading"
          :pagination="pagination"
          :row-props="rowProps"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NH1, NCard, NSpace, NInput, NSelect, NDataTable, NTag, NText, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getTrendingEvents } from '@/api/events'
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

const pagination = {
  pageSize: 20
}

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
    render: (row) => {
      return h(NText, { depth: 3 }, { default: () => formatDisplay(row.updatedAt) })
    }
  }
]

const filteredEvents = computed(() => {
  let result = events.value

  if (searchTopic.value) {
    const query = searchTopic.value.toLowerCase()
    result = result.filter((event) => event.topic.toLowerCase().includes(query))
  }

  if (filterState.value) {
    result = result.filter((event) => event.state === filterState.value)
  }

  return result
})

function rowProps(row: Event) {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      router.push(`/events/${row.eventId}`)
    }
  }
}

async function loadEvents() {
  try {
    loading.value = true
    events.value = await getTrendingEvents(50)
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
