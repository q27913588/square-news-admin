<template>
  <n-layout has-sider>
    <n-layout-sider bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="240">
      <n-menu
        v-model:value="activeKey"
        :collapsed-width="64"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>
    <n-layout-content style="padding: 24px">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutContent, NMenu, NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  DatabaseOutline as DatabaseIcon,
  GitMergeOutline as MergeIcon,
  SettingsOutline as SettingsIcon
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const activeKey = ref(route.name as string)

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: '媒體字典管理',
    key: 'AdminMediaSources',
    icon: renderIcon(DatabaseIcon)
  },
  {
    label: '實體別名管理',
    key: 'AdminEntityAliases',
    icon: renderIcon(MergeIcon)
  },
  {
    label: '操作面板',
    key: 'AdminOperations',
    icon: renderIcon(SettingsIcon)
  }
]

function handleMenuSelect(key: string) {
  router.push({ name: key })
}
</script>
