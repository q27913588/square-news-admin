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
        <n-form-item label="預設立場分數" path="defaultBiasScore">
          <n-input-number v-model:value="formModel.defaultBiasScore" :step="0.1" :min="-1" :max="1" />
          <n-text depth="3" style="margin-left: 8px">(-1 親中 ~ 1 親美)</n-text>
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
  NInput, NInputNumber, NSelect, NText, useMessage 
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import type { MediaSource } from '@/types'
import { getSources, saveMediaSource } from '@/api/sources'

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
  ownershipInfo: ''
})

const isEdit = computed(() => !!formModel.value.id)
const modalTitle = computed(() => isEdit.value ? '編輯媒體來源' : '新增媒體來源')

const factualityOptions = [
  { label: '高 (High)', value: 'HIGH' },
  { label: '混合 (Mixed)', value: 'MIXED' },
  { label: '低 (Low)', value: 'LOW' },
  { label: '未知 (Unknown)', value: 'UNKNOWN' }
]

const rules = {
  name: { required: true, message: '請輸入名稱', trigger: 'blur' },
  code: { required: true, message: '請輸入 Code', trigger: 'blur' }
}

const columns: DataTableColumns<MediaSource> = [
  { title: '名稱', key: 'name', width: 150 },
  { title: 'Code', key: 'code', width: 100 },
  { title: '可信度', key: 'factuality', width: 100 },
  { title: '所有權', key: 'ownershipInfo', width: 200, ellipsis: { tooltip: true } },
  { title: '預設立場', key: 'defaultBiasScore', width: 100 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h(NButton, {
        size: 'small',
        onClick: () => openModal(row)
      }, { default: () => '編輯' })
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
      ownershipInfo: ''
    }
  }
  showModal.value = true
}

async function handleSubmit() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        submitting.value = true
        await saveMediaSource(formModel.value)
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

onMounted(() => {
  loadSources()
})
</script>

<style scoped>
.media-sources-container {
  max-width: 1400px;
}
</style>
