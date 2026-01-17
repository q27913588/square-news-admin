<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-loading-bar-provider>
            <AppContent />
          </n-loading-bar-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  GlobalThemeOverrides
} from 'naive-ui'
import AppContent from './AppContent.vue'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2563eb', // 現代藍色主題
    primaryColorHover: '#3b82f6',
    primaryColorPressed: '#1d4ed8',
    infoColor: '#06b6d4',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    borderRadius: '8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Microsoft YaHei", sans-serif',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  Card: {
    borderRadius: '12px',
    paddingMedium: '20px',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
  },
  Button: {
    borderRadiusMedium: '8px',
    paddingMedium: '0 20px',
    heightMedium: '40px'
  },
  Input: {
    borderRadius: '8px',
    heightMedium: '40px'
  },
  DataTable: {
    borderRadius: '8px',
    thColor: '#f8fafc',
    thFontWeight: '600'
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
  color: #1e293b;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* 全局滾動條樣式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 卡片懸停效果 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
</style>
