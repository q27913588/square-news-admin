<template>
  <div class="article-list-container">
    <n-h1>文章列表</n-h1>

    <n-space vertical size="large">
      <!-- Filters -->
      <n-card title="篩選條件">
        <n-space vertical>
          <n-space>
            <n-select
              v-model:value="filters.sourceName"
              :options="sourceOptions"
              placeholder="選擇來源"
              clearable
              filterable
              style="width: 200px"
            />
            <n-date-picker
              v-model:value="filters.startDate"
              type="datetime"
              placeholder="開始日期"
              clearable
              style="width: 200px"
            />
            <n-date-picker
              v-model:value="filters.endDate"
              type="datetime"
              placeholder="結束日期"
              clearable
              style="width: 200px"
            />
            <n-button @click="clearFilters">清除篩選</n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Keyword Search -->
      <n-card title="關鍵字搜尋">
        <n-space vertical>
          <n-input-group>
            <n-input
              v-model:value="searchQuery"
              placeholder="輸入關鍵字搜尋標題或摘要"
              @keyup.enter="handleSearch"
            />
            <n-button type="primary" :loading="searchLoading" @click="handleSearch">
              搜尋
            </n-button>
          </n-input-group>

          <div v-if="searchResults.length > 0">
            <n-divider />
            <n-h3>搜尋結果 (共 {{ searchTotalElements }} 篇)</n-h3>
            <ArticleTable :articles="searchResults" :loading="false" />
            <n-pagination
              v-model:page="searchCurrentPage"
              v-model:page-size="searchPageSize"
              :page-count="searchTotalPages"
              :item-count="searchTotalElements"
              show-size-picker
              :page-sizes="[10, 20, 50, 100]"
              style="margin-top: 16px; justify-content: flex-end"
              @update:page="handleSearchPageChange"
              @update:page-size="handleSearchPageSizeChange"
            />
          </div>
        </n-space>
      </n-card>

      <!-- Articles Table -->
      <n-card title="所有文章">
        <ArticleTable :articles="articles" :loading="loading" />
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :page-count="totalPages"
          :item-count="totalElements"
          show-size-picker
          :page-sizes="[10, 20, 50, 100]"
          style="margin-top: 16px; justify-content: flex-end"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  NH1,
  NH3,
  NCard,
  NSpace,
  NSelect,
  NDatePicker,
  NButton,
  NInput,
  NInputGroup,
  NDivider,
  NPagination,
  useMessage
} from 'naive-ui'
import { getArticles, searchArticles } from '@/api/articles'
import { getSources } from '@/api/sources'
import type { Article, MediaSource, Page } from '@/types'
import { toISODateTime } from '@/utils/date'
import ArticleTable from '@/components/ArticleTable.vue'

const message = useMessage()

// Sources for filter
const sources = ref<MediaSource[]>([])
const sourceOptions = computed(() =>
  sources.value.map((s) => ({ label: s.name, value: s.name }))
)

// Filters
const filters = ref({
  sourceName: null as string | null,
  startDate: null as number | null,
  endDate: null as number | null
})

// Pagination
const articles = ref<Article[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

// Semantic search
const searchQuery = ref('')
const searchResults = ref<Article[]>([])
const searchLoading = ref(false)
const searchCurrentPage = ref(1)
const searchPageSize = ref(20)
const searchTotalPages = ref(0)
const searchTotalElements = ref(0)
const lastSearchQuery = ref('')

async function loadSources() {
  try {
    sources.value = await getSources()
  } catch (error: any) {
    message.error(error.message || '載入來源列表失敗')
  }
}

async function loadArticles() {
  try {
    loading.value = true

    const params: any = {
      page: currentPage.value - 1, // Convert to 0-based
      size: pageSize.value
    }

    if (filters.value.sourceName) {
      params.sourceName = filters.value.sourceName
    }
    if (filters.value.startDate) {
      params.startDate = toISODateTime(filters.value.startDate)
    }
    if (filters.value.endDate) {
      params.endDate = toISODateTime(filters.value.endDate)
    }

    const response: Page<Article> = await getArticles(params)
    articles.value = response.content
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
  } catch (error: any) {
    message.error(error.message || '載入文章列表失敗')
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    message.warning('請輸入搜尋關鍵字')
    return
  }

  try {
    searchLoading.value = true
    lastSearchQuery.value = searchQuery.value
    searchCurrentPage.value = 1
    const response = await searchArticles(searchQuery.value, 0, searchPageSize.value)
    searchResults.value = response.content
    searchTotalPages.value = response.totalPages
    searchTotalElements.value = response.totalElements
  } catch (error: any) {
    message.error(error.message || '搜尋失敗')
    searchResults.value = []
    searchTotalPages.value = 0
    searchTotalElements.value = 0
  } finally {
    searchLoading.value = false
  }
}

async function handleSearchPageChange(page: number) {
  if (!lastSearchQuery.value) return

  try {
    searchLoading.value = true
    searchCurrentPage.value = page
    const response = await searchArticles(lastSearchQuery.value, page - 1, searchPageSize.value)
    searchResults.value = response.content
    searchTotalPages.value = response.totalPages
    searchTotalElements.value = response.totalElements
  } catch (error: any) {
    message.error(error.message || '搜尋失敗')
  } finally {
    searchLoading.value = false
  }
}

async function handleSearchPageSizeChange(size: number) {
  searchPageSize.value = size
  searchCurrentPage.value = 1
  if (lastSearchQuery.value) {
    try {
      searchLoading.value = true
      const response = await searchArticles(lastSearchQuery.value, 0, size)
      searchResults.value = response.content
      searchTotalPages.value = response.totalPages
      searchTotalElements.value = response.totalElements
    } catch (error: any) {
      message.error(error.message || '搜尋失敗')
    } finally {
      searchLoading.value = false
    }
  }
}

function clearFilters() {
  filters.value = {
    sourceName: null,
    startDate: null,
    endDate: null
  }
  currentPage.value = 1
  loadArticles()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadArticles()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadArticles()
}

watch(
  () => [filters.value.sourceName, filters.value.startDate, filters.value.endDate],
  () => {
    currentPage.value = 1
    loadArticles()
  }
)

onMounted(() => {
  loadSources()
  loadArticles()
})
</script>

<style scoped>
.article-list-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
