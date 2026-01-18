import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Create public API client (no authentication)
export const publicApi: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Create admin API client (with API key authentication)
export const adminApi: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to adminApi to include API key
adminApi.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.apiKey) {
      // 去除前後空格，避免複製貼上時產生的問題
      const cleanKey = authStore.apiKey.trim()
      
      // 檢查是否包含非 ISO-8859-1 字元 (XMLHttpRequest 限制)
      // 如果包含中文，瀏覽器會直接拋出錯誤導致程式崩潰
      // 這裡我們預先檢查並處理，確保 key 是 ASCII
      if (!/^[\x00-\x7F]*$/.test(cleanKey)) {
        console.error('API Key 包含非法字元 (非 ASCII)', cleanKey)
        // 雖然拋出錯誤，但這樣能避免瀏覽器底層報錯，並能被後續的 catch 捕獲
        throw new Error('API Key 包含非法字元（例如中文），請檢查登入資訊')
      }
      
      config.headers['X-API-KEY'] = cleanKey
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Error response handler
function handleError(error: AxiosError): never {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data as any

    switch (status) {
      case 401:
        throw new Error('API Key 無效或缺失')
      case 404:
        throw new Error('查無資料')
      case 400:
        throw new Error(data?.message || '請求參數錯誤')
      case 500:
        throw new Error('伺服器錯誤，請稍後再試')
      default:
        throw new Error(data?.message || `請求失敗 (${status})`)
    }
  } else if (error.request) {
    throw new Error('連線失敗，請檢查網路連線')
  } else {
    throw new Error(error.message || '未知錯誤')
  }
}

// Add response interceptor for error handling
publicApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => handleError(error)
)

adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => handleError(error)
)
