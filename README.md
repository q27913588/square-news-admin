# Square News Admin Dashboard

Square News 後台管理系統 - 基於 Vue 3 + TypeScript + Naive UI 開發的前端應用。

## 功能特點

- 📊 **儀表板**: 查看熱門事件和快速光譜查詢
- 📰 **事件管理**: 瀏覽事件列表、查看事件詳情和立場光譜分析
- 📄 **文章管理**: 分頁瀏覽文章、篩選、語意搜尋
- 🔐 **後台管理**: 受保護的管理功能（媒體字典、實體別名、操作面板）
- 📈 **數據視覺化**: 使用 ECharts 展示立場分佈和來源統計

## 技術棧

- **核心框架**: Vue 3 + TypeScript
- **建置工具**: Vite
- **UI 框架**: Naive UI
- **狀態管理**: Pinia
- **路由**: Vue Router
- **圖表**: ECharts
- **HTTP 客戶端**: Axios
- **日期處理**: dayjs

## 專案結構

```
square-news-admin/
├── src/
│   ├── api/              # API 服務層
│   │   ├── client.ts     # Axios 實例 (publicApi, adminApi)
│   │   ├── events.ts     # 事件 API
│   │   ├── articles.ts   # 文章 API
│   │   ├── spectrum.ts   # 光譜 API
│   │   └── sources.ts    # 媒體來源 API
│   ├── components/       # 可複用組件
│   │   ├── BiasBar.vue   # 立場光譜條
│   │   ├── EventCard.vue # 事件卡片
│   │   ├── ArticleTable.vue # 文章表格
│   │   └── SourceDistribution.vue # 來源分佈圖表
│   ├── views/            # 頁面組件
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── EventListView.vue
│   │   ├── EventDetailView.vue
│   │   ├── ArticleListView.vue
│   │   ├── ArticleDetailView.vue
│   │   └── admin/        # 後台管理頁面
│   ├── stores/           # Pinia 狀態管理
│   │   └── auth.ts       # 認證狀態
│   ├── router/           # Vue Router
│   │   └── index.ts      # 路由配置
│   ├── types/            # TypeScript 類型定義
│   │   └── index.ts
│   ├── utils/            # 工具函數
│   │   └── date.ts       # 日期處理
│   ├── App.vue           # 根組件
│   ├── AppContent.vue    # 主要佈局
│   └── main.ts           # 應用入口
├── .env.development      # 開發環境變數
├── .env.production       # 生產環境變數
├── index.html            # HTML 入口
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 依賴和腳本

```

## 環境要求

- Node.js >= 16.x
- npm >= 8.x

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變數

開發環境配置已在 `.env.development` 中設定：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=Square News Admin
```

生產環境請修改 `.env.production`：

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Square News Admin
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

應用將在 `http://localhost:5173` 啟動。

### 4. 建置生產版本

```bash
npm run build
```

建置完成的檔案將輸出到 `dist/` 目錄。

### 5. 預覽生產建置

```bash
npm run preview
```

npx wrangler pages deploy dist --project-name square-news-admin

## API 連接

### 後端要求

本專案需要連接 Square News 後端 API。確保後端服務已啟動並可訪問。

### API Key 認證

後台管理功能需要 API Key 認證：

1. 訪問 `/login` 頁面
2. 輸入有效的 API Key
3. API Key 將儲存在瀏覽器的 localStorage 中
4. 所有 `/admin/**` 請求會自動帶上 `X-API-KEY` header

### CORS 配置

確保後端 CORS 配置允許以下來源：

- 開發環境: `http://localhost:5173`
- 生產環境: 根據部署域名配置

## 主要功能

### 公開功能（無需認證）

1. **儀表板** (`/dashboard`)
   - 查看熱門事件
   - 快速光譜查詢

2. **事件列表** (`/events`)
   - 瀏覽所有事件
   - 按主題搜尋
   - 狀態篩選（OPEN/CLOSED）

3. **事件詳情** (`/events/:eventId`)
   - 事件資訊
   - 立場光譜分析
   - 來源分佈圖表
   - 相關文章列表

4. **文章列表** (`/articles`)
   - 分頁瀏覽文章
   - 來源篩選
   - 日期範圍篩選
   - 語意搜尋

5. **文章詳情** (`/articles/:id`)
   - 完整文章資訊
   - 分析結果
   - 立場分數

### 管理功能（需要認證）

1. **媒體字典管理** (`/admin/media-sources`) - 開發中
2. **實體別名管理** (`/admin/entity-aliases`) - 開發中
3. **操作面板** (`/admin/operations`) - 開發中

## 路由守衛

- 所有 `/admin/**` 路由需要認證
- 未認證用戶會被重定向到 `/login`
- 登入後會返回原始請求頁面

## 日期格式說明

### 後端回傳格式
```
yyyy-MM-dd HH:mm:ss (例: 2026-01-16 12:34:56)
時區: Asia/Taipei
```

### 查詢參數格式
```
yyyy-MM-ddTHH:mm:ss (例: 2026-01-16T12:34:56)
ISO 8601 格式
```

## 開發指南

### 添加新的 API 端點

1. 在 `src/api/` 下創建或修改對應的服務文件
2. 使用 `publicApi` 或 `adminApi` 進行請求
3. 添加適當的類型定義到 `src/types/index.ts`

### 添加新頁面

1. 在 `src/views/` 下創建 Vue 組件
2. 在 `src/router/index.ts` 中添加路由
3. 如需認證，設置 `meta: { requiresAuth: true }`

### 使用 Naive UI 組件

查看 [Naive UI 文檔](https://www.naiveui.com/) 了解可用組件。

## 故障排除

### 1. API 連接失敗

- 檢查後端服務是否啟動
- 確認 `VITE_API_BASE_URL` 配置正確
- 檢查瀏覽器控制台的 CORS 錯誤

### 2. API Key 無效

- 確認輸入的 API Key 正確
- 檢查後端 API Key 配置
- 清除 localStorage 重新登入

### 3. 頁面顯示異常

- 清除瀏覽器快取
- 重新建置專案：`npm run build`
- 檢查控制台錯誤訊息

## 瀏覽器支援

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 授權

本專案為內部使用項目。

## 聯絡方式

如有問題或建議，請聯絡開發團隊。
