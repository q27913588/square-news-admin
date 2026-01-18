<template>
  <div class="login-container">
    <n-card title="登入後台管理" style="max-width: 400px">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item label="API Key" path="apiKey">
          <n-input
            v-model:value="formData.apiKey"
            type="password"
            placeholder="請輸入 API Key"
            @keyup.enter="handleLogin"
          />
        </n-form-item>
        <n-space justify="end">
          <n-button type="primary" :loading="loading" @click="handleLogin">登入</n-button>
        </n-space>
      </n-form>
      <n-divider />
      <n-text depth="3" style="font-size: 12px">
        提示：API Key 將儲存在瀏覽器本地儲存中，用於存取後台管理功能。
      </n-text>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, NCard, NForm, NFormItem, NInput, NButton, NSpace, NDivider, NText } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref()
const loading = ref(false)

const formData = reactive({
  apiKey: ''
})

const rules = {
  apiKey: {
    required: true,
    message: '請輸入 API Key',
    trigger: 'blur'
  }
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 自動去除前後空格，避免使用者不小心複製到空格
    const cleanKey = formData.apiKey.trim()
    
    if (!cleanKey) {
      message.error('請輸入有效的 API Key')
      return
    }

    authStore.login(cleanKey)
    message.success('登入成功')

    const redirect = route.query.redirect as string
    router.push(redirect || '/admin')
  } catch (error: any) {
    if (error.message) {
      message.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 112px);
  padding: 24px;
}
</style>
