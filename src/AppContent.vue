<template>
  <n-layout>
    <n-layout-header style="height: 64px; padding: 0 24px" bordered>
      <div style="display: flex; align-items: center; height: 100%">
        <h2 style="margin: 0; flex: 1">Square News Admin</h2>
        <n-space>
          <n-button text tag="a" @click="router.push('/dashboard')">儀表板</n-button>
          <n-button text tag="a" @click="router.push('/events')">事件</n-button>
          <n-button text tag="a" @click="router.push('/articles')">文章</n-button>
          <n-button v-if="authStore.isAuthenticated" text tag="a" @click="router.push('/admin')">
            後台管理
          </n-button>
          <n-button v-if="!authStore.isAuthenticated" @click="router.push('/login')">
            登入
          </n-button>
          <n-button v-else @click="handleLogout">登出</n-button>
        </n-space>
      </div>
    </n-layout-header>
    <n-layout-content style="padding: 24px">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NSpace, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
