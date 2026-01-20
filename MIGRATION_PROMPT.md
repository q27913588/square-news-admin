# 🚨 前端緊急升級：立場分析系統遷移

## ⚡ 快速總結

後端已完成架構升級，**文章的 `stanceScore` 和 `stanceResult` 欄位已移除**。

立場分析現在整合到煽動指數分析系統（`ArticleIncitationAnalysis`）中。

---

## 🎯 你需要做的事

### 1️⃣ 更新類型定義 (`src/types/index.ts`)

```typescript
// ❌ 刪除這些欄位
export interface Article {
  id: number
  // ... 其他欄位
  // stanceScore?: number | null      // ❌ 刪除
  // stanceResult?: any | null        // ❌ 刪除
}

// ✅ 新增這個類型
export interface ArticleIncitationAnalysis {
  id: number
  articleId: number
  eventId?: number | null
  outlet: string
  
  // 煽動指數
  incitementScore: number           // 0-100
  
  // 7 個維度 (0-5)
  dimA: number                      // 陣營化/二分對立
  dimB: number                      // 道德譴責與妖魔化
  dimC: number                      // 威脅放大
  dimD: number                      // 歸因與替罪羊
  dimE: number                      // 行動號召/懲罰正當化
  dimF: number                      // 未證實指控與陰謀化
  dimG: number                      // 武斷確定性
  
  // ✅ 立場分析在這裡
  stanceTarget?: string | null      // 針對的目標
  stancePolarity?: number | null    // -1 到 +1（替代舊的 stanceScore）
  stanceConfidence?: number | null  // 信心度
  
  confidence?: number | null
  computedAt: string
  version: string
}
```

---

### 2️⃣ 新增 API 方法 (`src/api/articles.ts`)

```typescript
import type { ArticleIncitationAnalysis } from '@/types'

// ✅ 新增：獲取文章的煽動指數分析
export async function getArticleIncitationAnalysis(
  articleId: number
): Promise<ArticleIncitationAnalysis | null> {
  try {
    const response = await client.get(`/api/articles/${articleId}/incitation`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null  // 沒有分析數據（低價值新聞或無事件）
    }
    throw error
  }
}
```

---

### 3️⃣ 更新組件

#### ❌ 舊代碼（ArticleDetailView.vue）
```vue
<template>
  <div v-if="article.stanceScore !== null">
    <span :style="{ color: getStanceColor(article.stanceScore) }">
      {{ article.stanceScore.toFixed(2) }}
    </span>
  </div>
</template>
```

#### ✅ 新代碼
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleById } from '@/api/articles'
import { getArticleIncitationAnalysis } from '@/api/articles'

const article = ref<Article | null>(null)
const incitationAnalysis = ref<ArticleIncitationAnalysis | null>(null)

onMounted(async () => {
  const id = Number(route.params.id)
  article.value = await getArticleById(id)
  
  // ✅ 單獨獲取煽動指數分析
  incitationAnalysis.value = await getArticleIncitationAnalysis(id)
})

function getStanceColor(polarity: number): string {
  if (polarity > 0.3) return '#1890ff'   // 藍色（親美）
  if (polarity < -0.3) return '#ff4d4f'  // 紅色（親中）
  return '#52c41a'                       // 綠色（中立）
}
</script>

<template>
  <div>
    <h1>{{ article?.title }}</h1>
    
    <!-- ✅ 顯示煽動指數分析 -->
    <div v-if="incitationAnalysis">
      <!-- 整體分數 -->
      <div class="score">
        煽動指數：{{ incitationAnalysis.incitementScore.toFixed(1) }} / 100
      </div>
      
      <!-- 立場 -->
      <div v-if="incitationAnalysis.stancePolarity !== null" class="stance">
        <span :style="{ color: getStanceColor(incitationAnalysis.stancePolarity) }">
          立場：{{ incitationAnalysis.stancePolarity.toFixed(2) }}
        </span>
        <span v-if="incitationAnalysis.stanceTarget">
          （針對：{{ incitationAnalysis.stanceTarget }}）
        </span>
      </div>
      
      <!-- 7 個維度（可選） -->
      <div class="dimensions">
        <div>A. 陣營化：{{ incitationAnalysis.dimA }}/5</div>
        <div>B. 妖魔化：{{ incitationAnalysis.dimB }}/5</div>
        <div>C. 威脅放大：{{ incitationAnalysis.dimC }}/5</div>
        <div>D. 替罪羊：{{ incitationAnalysis.dimD }}/5</div>
        <div>E. 行動號召：{{ incitationAnalysis.dimE }}/5</div>
        <div>F. 陰謀化：{{ incitationAnalysis.dimF }}/5</div>
        <div>G. 武斷性：{{ incitationAnalysis.dimG }}/5</div>
      </div>
    </div>
    
    <!-- 沒有分析數據的提示 -->
    <div v-else>
      <p>此文章暫無煽動指數分析</p>
      <small>（可能是低價值新聞或尚未分配事件）</small>
    </div>
  </div>
</template>
```

---

### 4️⃣ 更新文章列表組件 (`ArticleTable.vue`)

```typescript
// ❌ 移除 stanceScore 欄位
const columns = [
  { key: 'id', title: 'ID' },
  { key: 'title', title: '標題' },
  { key: 'sourceName', title: '來源' },
  // { key: 'stanceScore', title: '立場評分' },  // ❌ 刪除此欄位
  { key: 'actions', title: '操作' }
]

// ✅ 建議：立場數據只在詳情頁顯示
// 因為需要額外 API 調用，在列表中顯示會影響性能
```

---

## 📋 需要修改的文件清單

### 必須修改
- ✅ `src/types/index.ts` - 更新 Article 類型，新增 ArticleIncitationAnalysis 類型
- ✅ `src/api/articles.ts` - 新增 getArticleIncitationAnalysis 方法
- ✅ `src/views/ArticleDetailView.vue` - 更新立場顯示邏輯
- ✅ `src/components/ArticleTable.vue` - 移除 stanceScore 欄位

### 可選修改（新功能）
- ⭐ `src/api/incitement.ts` (新建) - 煽動指數相關 API
- ⭐ `src/components/IncitementSpectrum.vue` (新建) - 煽動指數×立場光譜圖
- ⭐ `src/views/EventIncitementView.vue` (新建) - 事件煽動指數頁面

---

## ⚠️ 重要注意事項

### 1. 立場數據只對有事件的文章可用
```typescript
// ✅ 正確：處理可能為 null 的情況
const analysis = await getArticleIncitationAnalysis(articleId)
if (analysis) {
  // 顯示立場數據
}

// ❌ 錯誤：假設所有文章都有立場數據
const analysis = await getArticleIncitationAnalysis(articleId)
console.log(analysis.stancePolarity)  // 可能報錯！
```

### 2. Event 的 stanceDiversity 仍然可用
```typescript
// ✅ Event 的 stanceDiversity 欄位沒有變化
interface Event {
  eventId: number
  topic: string
  stanceDiversity?: number | null  // ✅ 仍然可用
  // ... 其他欄位
}
```

### 3. 數據範圍變化
```typescript
// ❌ 舊：stanceScore (通常 -1 到 +1，但不明確)
article.stanceScore  // 可能是 0.5

// ✅ 新：stancePolarity (明確 -1 到 +1)
incitationAnalysis.stancePolarity  // -1 = 親中, +1 = 親美, 0 = 中立
```

---

## 🎨 UI 建議

### 立場顏色
```typescript
function getStanceColor(polarity: number): string {
  if (polarity > 0.3) return '#1890ff'   // 藍色（親美/抗中）
  if (polarity < -0.3) return '#ff4d4f'  // 紅色（親中/疑美）
  return '#52c41a'                       // 綠色（中立）
}

function getStanceLabel(polarity: number): string {
  if (polarity > 0.5) return '親美/抗中'
  if (polarity > 0.2) return '偏向親美'
  if (polarity < -0.5) return '親中/疑美'
  if (polarity < -0.2) return '偏向親中'
  return '中立'
}
```

### 煽動指數顏色
```typescript
function getIncitementColor(score: number): string {
  if (score > 70) return '#ff4d4f'   // 紅色（高煽動）
  if (score > 40) return '#faad14'   // 橙色（中等）
  return '#52c41a'                   // 綠色（低煽動）
}
```

---

## 🚀 部署檢查清單

- [ ] 更新 `src/types/index.ts`
- [ ] 新增 `getArticleIncitationAnalysis` API 方法
- [ ] 更新 `ArticleDetailView.vue`
- [ ] 更新 `ArticleTable.vue`
- [ ] 移除所有 `article.stanceScore` 的引用
- [ ] 測試文章詳情頁
- [ ] 測試事件詳情頁（stanceDiversity）
- [ ] 處理沒有分析數據的情況
- [ ] `npm run build` 無錯誤
- [ ] 部署到測試環境

---

## 🆘 遇到問題？

### 編譯錯誤：Property 'stanceScore' does not exist
✅ **解決**：在所有使用 `article.stanceScore` 的地方改用 `incitationAnalysis.stancePolarity`

### API 返回 404
✅ **正常**：表示該文章沒有煽動指數分析（低價值新聞或未分配事件）

### 顯示空白
✅ **檢查**：確保處理了 `incitationAnalysis === null` 的情況

---

## 📚 完整文檔

詳細遷移指南請參考：`/Users/kevin/Documents/GitHubTanvi/newprism/FRONTEND_MIGRATION_GUIDE.md`

---

**更新日期**: 2026-01-20  
**緊急程度**: 🔴 高（後端已部署，前端必須配合更新）
