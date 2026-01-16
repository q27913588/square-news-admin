import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'apiKey'

export const useAuthStore = defineStore('auth', () => {
  // State
  const apiKey = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!apiKey.value)

  // Actions
  function login(key: string) {
    apiKey.value = key
    localStorage.setItem(STORAGE_KEY, key)
  }

  function logout() {
    apiKey.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      apiKey.value = stored
    }
  }

  // Initialize from localStorage
  loadFromStorage()

  return {
    apiKey,
    isAuthenticated,
    login,
    logout,
    loadFromStorage
  }
})
