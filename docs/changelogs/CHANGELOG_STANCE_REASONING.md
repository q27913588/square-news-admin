# 立場分析原因展示功能更新

## 📅 更新日期
2026-01-22

## 🎯 更新目標
在前端增加立場分析原因（`notes` 字段）的展示，提高系統的可解釋性和透明度。

---

## ✅ 已完成的變更

### 1. EventIncitementView.vue（事件煽動指數頁面）

**新增功能：**
- ✅ 在證據片段卡片中增加 `notes` 字段展示
- ✅ 使用 `n-alert` 組件以突出顯示分析理由
- ✅ 改進歸屬類型（Attribution Type）的顯示
  - 使用彩色標籤區分類型
  - 中文化顯示：`媒體論述`、`引述來源`、`對手言論`
- ✅ 增加維度分數的簡要展示

**代碼變更：**
```vue
<!-- 新增：分析原因展示 -->
<n-alert v-if="evidence.notes" type="info" style="margin-top: 12px;" :bordered="false">
  <template #header>
    <span style="font-weight: 600;">💡 分析理由</span>
  </template>
  {{ evidence.notes }}
</n-alert>
```

**新增輔助函數：**
- `getAttributionTypeTag()` - 返回標籤類型（顏色）
- `getAttributionTypeText()` - 返回中文標籤文字

---

### 2. ArticleDetailView.vue（文章詳情頁面）

**新增功能：**
- ✅ 增加證據片段的完整展示區域
- ✅ 使用折疊面板（Collapse）組織證據內容
- ✅ 自動載入證據片段（當存在煽動指數分析時）
- ✅ 展示 `notes` 字段（分析理由）
- ✅ 展示歸屬類型、目標對象、維度分數

**代碼變更：**
```typescript
// 新增：證據片段 ref
const evidenceFragments = ref<ArticleIncitationEvidence[]>([])

// 修改：loadArticle 函數增加證據片段載入
if (incitationAnalysis.value) {
  try {
    evidenceFragments.value = await getArticleIncitationEvidence(articleId)
  } catch (error) {
    console.warn('Failed to load evidence fragments:', error)
    evidenceFragments.value = []
  }
}
```

**UI 結構：**
```
煽動指數分析卡片
├── 煽動指數
├── 立場分析
├── 7 維度分析
├── 元數據
└── 🔍 分析證據片段（新增）
    └── 折疊面板
        └── 證據卡片列表
            ├── 證據原文
            ├── 💡 分析理由（notes）
            └── 標籤（歸屬類型、目標、維度）
```

---

## 🎨 UI/UX 改進

### 1. 視覺層次優化
- 使用 `n-alert` 組件突出顯示分析理由
- 添加 💡 表情符號增強可讀性
- 使用折疊面板避免內容過長影響頁面體驗

### 2. 色彩編碼
| 歸屬類型 | 標籤顏色 | 含義 |
|---------|---------|------|
| OUTLET_VOICE | 紅色 (error) | 媒體自身的聲音和論述 |
| QUOTED_SOURCE | 橙色 (warning) | 引述一般消息來源 |
| OPPONENT_QUOTE | 藍色 (info) | 引述對手陣營言論 |

### 3. 信息完整性
每個證據片段現在顯示：
- 📝 證據原文
- 💡 分析理由（為什麼這段文字顯示某種立場）
- 🏷️ 歸屬類型（誰說的）
- 🎯 目標對象（針對誰）
- 📊 維度分數（涉及哪些煽動維度）

---

## 📱 使用示例

### 場景 1：查看事件煽動指數分析

1. 導航到事件詳情頁
2. 點擊「查看煽動指數分析」
3. 展開特定媒體的分析結果
4. 在「證據片段」區域查看：
   - 原文引用
   - **AI 給出的分析理由**（新增）
   - 歸屬類型和目標對象

### 場景 2：查看文章詳細分析

1. 導航到文章詳情頁
2. 滾動到「煽動指數分析」卡片
3. 展開「🔍 分析證據片段」
4. 點擊「查看詳細證據」折疊面板
5. 查看每個證據的：
   - 完整原文
   - **AI 的判斷理由**（新增）
   - 所有相關元數據

---

## 🔧 技術實現

### 導入的新組件
```typescript
// EventIncitementView.vue
import { NAlert } from 'naive-ui'

// ArticleDetailView.vue
import { NAlert, NCollapse, NCollapseItem } from 'naive-ui'
```

### 新增 API 調用
```typescript
// ArticleDetailView.vue
import { getArticleIncitationEvidence } from '@/api/articles'
```

### 數據流
```
後端 article_incitation_evidence 表
  ↓ (notes 欄位)
API: GET /api/articles/{id}/incitation/evidence
  ↓
前端 evidenceFragments ref
  ↓
UI: n-alert 組件展示
```

---

## 📊 改進效果

### 1. 可解釋性提升
- **改進前：** 用戶只能看到立場分數（如 0.65），不知道為何判斷
- **改進後：** 用戶可以看到具體的分析理由，如「文章使用『深化防衛合作』等正面詞彙描述美台關係...」

### 2. 信任度提升
- 展示 AI 的判斷依據
- 透明化分析過程
- 支持用戶自行驗證判斷

### 3. 教育價值
- 幫助用戶理解媒體識讀技巧
- 展示如何識別新聞中的立場暗示
- 提升用戶的媒體素養

---

## 🐛 已知限制

### 1. notes 字段可能為空
- 部分舊數據可能沒有 notes 字段
- 使用 `v-if="evidence.notes"` 條件渲染避免顯示空內容

### 2. 證據片段可能較多
- 使用折疊面板避免初始加載時內容過長
- 建議未來可以增加分頁或「顯示更多」功能

### 3. 移動端適配
- 當前設計在桌面端體驗最佳
- 移動端可能需要進一步優化折疊面板的交互

---

## 🚀 未來改進建議

### 1. 證據高亮
在文章全文中高亮顯示證據片段，點擊證據可定位到原文位置

### 2. 證據篩選
支持按歸屬類型、維度篩選證據片段

### 3. 證據評分
允許用戶對證據的相關性和準確性進行評分反饋

### 4. 證據摘要
當證據過多時，顯示最關鍵的 3-5 條證據

### 5. 批量導出
支持導出所有證據和分析理由為 PDF 或 Excel

---

## 📚 相關文檔

- [立場極性分析指南](../../../newprism/docs/features/STANCE_ANALYSIS_GUIDE.md)
- [煽動指數分析指南](../../../newprism/docs/features/INCITEMENT_ANALYSIS_GUIDE.md)
- [立場分析系統遷移報告](../../../newprism/docs/changelogs/CHANGELOG_STANCE_MIGRATION.md)

---

## 📝 總結

此次更新成功將立場分析的 `notes` 字段（分析理由）展示在前端，大幅提升了系統的可解釋性。用戶現在可以：

✅ 看到 AI 的具體判斷依據  
✅ 理解為什麼某段文字顯示特定立場  
✅ 驗證分析結果的準確性  
✅ 學習媒體識讀技巧  

這是邁向「可解釋 AI」的重要一步，有助於建立用戶對系統的信任。
