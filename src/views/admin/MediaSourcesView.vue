<template>
  <div class="media-sources-container">
    <n-space vertical size="large">
      <n-h2>媒體字典管理</n-h2>

      <n-card title="媒體來源列表">
        <template #header-extra>
          <n-button type="primary" @click="openModal()">新增媒體來源</n-button>
        </template>

        <n-data-table
          :columns="columns"
          :data="sources"
          :loading="loading"
          :pagination="{ pageSize: 20 }"
        />
      </n-card>
    </n-space>

    <!-- Edit/Create Modal -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 600px">
      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="120"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="名稱" path="name">
          <n-input v-model:value="formModel.name" placeholder="例如: CNN" />
        </n-form-item>
        <n-form-item label="Code" path="code">
          <n-input v-model:value="formModel.code" placeholder="例如: CNN" />
        </n-form-item>
        <n-form-item label="網址" path="homeUrl">
          <n-input v-model:value="formModel.homeUrl" placeholder="https://..." />
        </n-form-item>
        <n-form-item label="媒體類別" path="category">
          <n-select v-model:value="formModel.category" :options="categoryOptions" />
        </n-form-item>
        <n-form-item label="預設立場分數" path="defaultBiasScore">
          <n-input-number v-model:value="formModel.defaultBiasScore" :step="0.1" :min="-1" :max="1" />
          <n-text depth="3" style="margin-left: 8px">(-1 偏藍 ~ 1 偏綠)</n-text>
        </n-form-item>
        <n-form-item label="權重" path="weight">
          <n-input-number v-model:value="formModel.weight" :min="0" />
        </n-form-item>

        <!-- New Fields -->
        <n-form-item label="可信度評級" path="factuality">
          <n-select v-model:value="formModel.factuality" :options="factualityOptions" />
        </n-form-item>
        <n-form-item label="所有權/資助" path="ownershipInfo">
          <n-input v-model:value="formModel.ownershipInfo" placeholder="例如: Owned by Warner Bros." />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">儲存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import {
  NH2, NSpace, NCard, NButton, NDataTable, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSelect, NText, NPopconfirm, NTag, useMessage
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import type { MediaSource } from '@/types'
import { getSources, saveMediaSource, updateMediaSource, deleteMediaSource } from '@/api/sources'

const message = useMessage()
const loading = ref(false)
const sources = ref<MediaSource[]>([])

const showModal = ref(false)
const submitting = ref(false)
const formRef = ref<FormInst | null>(null)

const formModel = ref<MediaSource>({
  name: '',
  code: '',
  homeUrl: '',
  defaultBiasScore: 0,
  weight: 1,
  factuality: 'UNKNOWN',
  ownershipInfo: '',
  category: 'OTHER'
})

const isEdit = computed(() => !!formModel.value.id)
const modalTitle = computed(() => isEdit.value ? '編輯媒體來源' : '新增媒體來源')

const factualityOptions = [
  { label: '高 (High)', value: 'HIGH' },
  { label: '混合 (Mixed)', value: 'MIXED' },
  { label: '低 (Low)', value: 'LOW' },
  { label: '未知 (Unknown)', value: 'UNKNOWN' }
]

const categoryOptions = [
  { label: '傳統媒體', value: 'TRADITIONAL' },
  { label: '網路媒體', value: 'ONLINE' },
  { label: '獨立媒體', value: 'INDEPENDENT' },
  { label: '其他', value: 'OTHER' }
]

const categoryLabelMap: Record<string, string> = {
  TRADITIONAL: '傳統媒體',
  ONLINE: '網路媒體',
  INDEPENDENT: '獨立媒體',
  OTHER: '其他'
}

const rules = {
  name: { required: true, message: '請輸入名稱', trigger: 'blur' },
  code: { required: true, message: '請輸入 Code', trigger: 'blur' }
}

/**
 * 根據偏向分數取得顏色（藍 → 中立灰 → 綠 漸變）
 * -1 = 偏藍 (藍色), 0 = 中立 (灰色), 1 = 偏綠 (綠色)
 */
function getBiasColor(score: number | undefined): string {
  if (score == null) return '#999'
  const s = Math.max(-1, Math.min(1, score))
  if (s < 0) {
    // 藍色漸變：-1 = 純藍, 0 = 灰
    const t = Math.abs(s)
    const r = Math.round(100 + (1 - t) * 80)
    const g = Math.round(100 + (1 - t) * 80)
    const b = Math.round(220 + (1 - t) * (-40))
    return `rgb(${r}, ${g}, ${b})`
  } else if (s > 0) {
    // 綠色漸變：1 = 純綠, 0 = 灰
    const t = s
    const r = Math.round(100 + (1 - t) * 80)
    const g = Math.round(180 + (1 - t) * 0)
    const b = Math.round(100 + (1 - t) * 80)
    return `rgb(${r}, ${g}, ${b})`
  }
  return '#999'
}

const columns: DataTableColumns<MediaSource> = [
  { title: '名稱', key: 'name', width: 150 },
  { title: 'Code', key: 'code', width: 100 },
  {
    title: '類別',
    key: 'category',
    width: 110,
    render: (row) => {
      const label = categoryLabelMap[row.category || 'OTHER'] || row.category || '其他'
      return h(NTag, { size: 'small', bordered: false }, { default: () => label })
    }
  },
  { title: '可信度', key: 'factuality', width: 100 },
  { title: '所有權', key: 'ownershipInfo', width: 200, ellipsis: { tooltip: true } },
  {
    title: '預設立場',
    key: 'defaultBiasScore',
    width: 130,
    render: (row) => {
      const score = row.defaultBiasScore
      if (score == null) return h('span', { style: { color: '#999' } }, '—')
      const color = getBiasColor(score)
      return h('span', {
        style: {
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '4px',
          backgroundColor: color,
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '13px',
          minWidth: '50px',
          textAlign: 'center'
        }
      }, score.toFixed(2))
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            onClick: () => openModal(row)
          }, { default: () => '編輯' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, { default: () => '刪除' }),
            default: () => `確定要刪除「${row.name}」嗎？`
          })
        ]
      })
    }
  }
]

async function loadSources() {
  try {
    loading.value = true
    sources.value = await getSources()
  } catch (error: any) {
    message.error(error.message || '載入失敗')
  } finally {
    loading.value = false
  }
}

function openModal(row?: MediaSource) {
  if (row) {
    formModel.value = { ...row }
  } else {
    formModel.value = {
      name: '',
      code: '',
      homeUrl: '',
      defaultBiasScore: 0,
      weight: 1,
      factuality: 'UNKNOWN',
      ownershipInfo: '',
      category: 'OTHER'
    }
  }
  showModal.value = true
}

async function handleSubmit() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        submitting.value = true
        if (isEdit.value && formModel.value.id) {
          await updateMediaSource(formModel.value.id, formModel.value)
        } else {
          await saveMediaSource(formModel.value)
        }
        message.success('儲存成功')
        showModal.value = false
        loadSources()
      } catch (error: any) {
        message.error(error.message || '儲存失敗')
      } finally {
        submitting.value = false
      }
    }
  })
}

async function handleDelete(row: MediaSource) {
  if (!row.id) return
  try {
    await deleteMediaSource(row.id)
    message.success(`已刪除「${row.name}」`)
    loadSources()
  } catch (error: any) {
    message.error(error.message || '刪除失敗')
  }
}

onMounted(() => {
  loadSources()
})
</script>

<style scoped>
.media-sources-container {
  max-width: 1400px;
}
</style>
