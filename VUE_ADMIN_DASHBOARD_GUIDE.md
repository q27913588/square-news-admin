# Square News Vue 儀表板＋後台（Admin）前端開發文件

本文檔面向「前端 AI 開發」：提供可直接落地的技術選型、目錄結構、頁面規格、API 對接、型別定義、互動與錯誤處理規範。

> 後端：Spring Boot（本 repo）  
> 前端：Vue 3（建議 Vite + TypeScript）  
> 管理端權限：以 `X-API-KEY` header 保護（見 `ApiKeyFilter`）

---

## 1. 目標與範圍

### 1.1 目標
- 提供「儀表板」：快速查看事件/文章/光譜等核心指標與趨勢（以現有 API 能取得的資訊為主）。
- 提供「後台」：管理媒體字典、實體別名、以及觸發後端批次/重跑操作。

### 1.2 以「現有後端 API」能完成的功能
- 公開查詢：
  - 事件列表 / 熱門事件 / 事件詳情
  - 事件光譜（Bias Bar / Source 分佈）
  - 文章分頁列表、文章詳情、語意搜尋
  - 媒體來源清單（字典 + 文章來源補全）
- 後台管理（需 `X-API-KEY`）：
  - 媒體字典 CRUD（media sources）
  - 實體別名 CRUD / 批量新增 / 初始化台灣政治人物 / 測試 normalize
  - 文章重跑分析 / 重新聚合
  - 關閉事件
  - 批次處理 pending/error 文章（觸發背景分析）

### 1.3 超出現有 API 的「進階分析」(先規劃，後端需補 API 才能做)
- KPI：每日新增文章數、pending/error 數量、每事件文章數趨勢、各新聞類型比例、stance 分數分佈直方圖等。
- 若你想做這些，建議後端新增 `/admin/metrics/**` 或 `/admin/stats/**`（本文不先實作後端，只在前端保留擴充位置）。

---

## 2. 後端安全與環境設定（務必遵守）

### 2.1 CORS 已允許的前端 Origin
後端在 `WebConfig` 允許以下 origin（開發時請用 `5173`）：
- `http://localhost:5173`
- `https://square-news-632027619686.asia-east1.run.app`
- `https://news-ddm.pages.dev`

### 2.2 API Key（後台必帶）
後端以 `X-API-KEY` header 驗證：
- Header 名稱：`X-API-KEY`
- 值：`app.api-key`（預設由環境變數 `APP_API_KEY` 注入）
- 開關：`APP_API_KEY_ENABLED`（預設 `true`）

**重要：以下路徑被視為公開，不需要 API Key**
- `GET/POST/PUT/DELETE`：`/sources/**`、`/articles/**`、`/spectrum/**`、`/events/**`
（包含 `/events/trending`、`/articles/search`、`/spectrum/search` 等）

**重要：除上述公開路徑外，其它路徑一律需要 API Key**  
因此你在前端呼叫所有 `/admin/**` 時，務必帶上 `X-API-KEY`。

---

## 3. 技術棧建議（Vue）

### 3.1 基礎
- Vue 3 + TypeScript
- Vite
- Vue Router（分 public/admin 區）
- Pinia（狀態管理）

### 3.2 UI / 圖表
- UI：Element Plus（表格/表單/對話框很省工）
- 圖表：ECharts（事件熱度/立場分佈/來源占比）

### 3.3 HTTP
- Axios（或 fetch 也可；本文以 Axios 規格描述）
- 封裝兩個 client：
  - `publicApi`：不帶 API key
  - `adminApi`：自動帶 `X-API-KEY`

---

## 4. 專案腳手架與環境變數

### 4.1 建議建立專案
建議以 Vite template：
- `vue-ts`

### 4.2 `.env`（示例）
- `VITE_API_BASE_URL=http://localhost:8080`
- `VITE_ADMIN_API_KEY=temporary-api-key-123`

> 若你部署前端到不同域名，請確保後端 CORS 白名單包含該域名。

---

## 5. API 對接總覽（以目前程式為準）

### 5.1 Public API（不需 API Key）

#### 事件
- `GET /events`：所有事件
- `GET /events/trending?limit=10`：熱門/最新事件
- `GET /events/{eventId}`：事件詳情
- `GET /events/{eventId}/spectrum`：事件光譜（回 `SpectrumDTO`）

#### 文章
- `GET /articles`：分頁文章列表
  - query：
    - `sourceName?`：來源名稱（空字串會被後端當作 null）
    - `startDate?`、`endDate?`：**必須是 ISO DATE_TIME**（例：`2026-01-16T00:00:00`）
    - `page`（0-based）、`size`
  - sort：後端預設 `publishedAt desc`
- `GET /articles/{id}`：文章詳情
- `GET /articles/search?q=...&limit=10`：語意搜尋（回文章陣列）

#### 媒體來源（給下拉選單/過濾器）
- `GET /sources`：回 `MediaSource[]`
  - 注意：後端會把「文章中出現但不在字典」的來源補成 **virtual source**（`id` 可能為空）

#### 關鍵字光譜（動態）
- `GET /spectrum/search?q=...&limit=20`：回 `SpectrumDTO`
  - 若 `q` 空，後端回 400

### 5.2 Admin API（需要 `X-API-KEY`）

#### 媒體字典管理
- `GET /admin/media-sources`
- `POST /admin/media-sources`（body：`MediaSource`）
- `DELETE /admin/media-sources/{id}`

#### 文章/事件操作
- `POST /admin/reprocess/articles/{id}`：重跑文章分析
- `POST /admin/reaggregate/articles/{id}`：重跑文章聚合
- `POST /admin/events/{eventId}/close`：關閉事件
- `POST /admin/articles/batch-process`：觸發批次處理（回字串訊息）

#### 實體別名管理（Entity Alias）
- `GET /admin/entity-aliases`
- `GET /admin/entity-aliases/active`
- `POST /admin/entity-aliases`（body：`EntityAlias`）
- `POST /admin/entity-aliases/batch`（body：`EntityAlias[]`，回字串訊息）
- `PUT /admin/entity-aliases/{id}`（body：`EntityAlias`）
- `DELETE /admin/entity-aliases/{id}`（回字串訊息）
- `POST /admin/entity-aliases/test-normalize`（body：`{ text: string }`，回 `{ original, normalized }`）
- `POST /admin/entity-aliases/init-taiwan-politicians`（回字串訊息）

---

## 6. 時間格式與分頁（最容易踩坑）

### 6.1 回傳時間格式
後端 Jackson 設定：
- time zone：`Asia/Taipei`
- date format：`yyyy-MM-dd HH:mm:ss`

因此前端接到 `publishedAt/startTime/endTime/updatedAt/...` 多半是字串 `"2026-01-16 12:34:56"`（不是 ISO）。

建議前端處理：
- **顯示**：直接當字串顯示，或用 dayjs 自訂 parse format。
- **排序/比較**：轉成 Date 物件或 timestamp（需用 format parse）。

### 6.2 `/articles` 查詢時間格式
`startDate/endDate` 的 query param 需要 ISO DATE_TIME：
- ✅ `2026-01-16T00:00:00`
- ❌ `2026-01-16 00:00:00`

### 6.3 Spring Page JSON（/articles）
`GET /articles` 回 `Page<Article>`，前端要用：
- `content`：資料列
- `totalElements` / `totalPages`
- `number`：目前 page（0-based）
- `size`：每頁數量

---

## 7. 前端型別（TypeScript 參考）

> 以下型別以後端 `domain/model` 與 `SpectrumDTO` 為準；可以直接複製使用。

```ts
export type EventState = 'OPEN' | 'CLOSED' | string;

export interface Event {
  eventId: number;
  topic: string;
  coreSummary?: string;
  actors?: Record<string, unknown>;
  startTime?: string; // "yyyy-MM-dd HH:mm:ss"
  endTime?: string;
  state: EventState;
  articleCount?: number;
  sourceCount?: number;
  hotness?: number;
  stanceDiversity?: number;
  updatedAt?: string;
  createdAt?: string;
}

export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR' | string;

export interface MediaSource {
  id?: number; // /sources 可能回 virtual source，id 可能不存在
  name: string;
  code: string;
  homeUrl?: string;
  defaultBiasScore?: number;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: number;
  mediaSource?: MediaSource | null; // ManyToOne lazy
  sourceName?: string | null;
  author?: string | null;
  url: string;
  publishedAt?: string;
  title?: string | null;
  cleanText?: string | null;
  topic?: string | null;
  actors?: Record<string, unknown> | null;
  eventSummary?: string | null;
  newsType?: string | null;
  stanceResult?: Record<string, unknown> | null;
  stanceScore?: number | null;
  eventId?: number | null;
  status?: ProcessingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpectrumSourceStance {
  sourceName: string;
  averageScore: number;
  articleCount: number;
}

export interface SpectrumDTO {
  eventId?: number | null;
  topic: string;
  averageScore?: number | null;
  totalArticles: number;
  totalSources?: number | null;
  leftWingRatio?: number | null;
  centerRatio?: number | null;
  rightWingRatio?: number | null;
  sourceDetails?: SpectrumSourceStance[];
  articles?: Article[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-based
  // 其它欄位可忽略
}

export type EntityType = 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | string;

export interface EntityAlias {
  id?: number;
  alias: string;
  canonicalName: string;
  entityType: EntityType;
  active?: boolean;
  source?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 8. 頁面設計（路由、功能、API）

### 8.1 路由規劃
- `/`：導到 `/dashboard`
- `/dashboard`：儀表板總覽
- `/events`：事件列表
- `/events/:eventId`：事件詳情（含 spectrum、文章列表捷徑）
- `/articles`：文章列表（分頁 + 篩選 + 語意搜尋入口）
- `/articles/:id`：文章詳情
- `/admin`：後台入口（可做簡易「輸入 API key」或從 env 讀取）
- `/admin/media-sources`：媒體字典管理
- `/admin/entity-aliases`：實體別名管理
- `/admin/ops`：操作面板（batch process / reprocess / reaggregate / close event / normalize test）

### 8.2 儀表板 `/dashboard`
目標：用最少的 API 組出「可用的分析」。

- **資料來源**
  - `GET /events/trending?limit=10`：顯示 Top 10 熱門議題卡片
  - （可選）`GET /events`：計算 OPEN/CLOSED 數量（若事件很多可能偏重；可先不做）
- **視覺元件**
  - 熱門事件列表（topic、updatedAt、articleCount、sourceCount、hotness）
  - 快速查詢光譜（輸入 q 呼叫 `/spectrum/search`，顯示 Bias Bar）

### 8.3 事件列表 `/events`
- API：`GET /events/trending?limit=50`（先用 trending 當列表來源；若需要完整列表再用 `/events`）
- 功能：
  - 搜尋（前端對 topic 做 filter）
  - 狀態篩選（OPEN/CLOSED）
  - 點擊進入事件詳情

### 8.4 事件詳情 `/events/:eventId`
- API：
  - `GET /events/{eventId}`
  - `GET /events/{eventId}/spectrum`
  - （文章清單）`GET /articles?startDate&endDate&sourceName` 無法直接以 eventId 查；建議先顯示 spectrum 回傳的 `articles` 作為「事件文章」列表（後端 `SpectrumDTO.articles` 有帶文章陣列）
- UI：
  - 事件資訊（topic/coreSummary/actors/state）
  - **Bias Bar**：用 `leftWingRatio/centerRatio/rightWingRatio`
  - 來源分佈表（sourceDetails：sourceName、avgScore、articleCount）
  - 文章表（用 spectrum DTO 的 `articles`，點進文章詳情）

### 8.5 文章列表 `/articles`
- API：`GET /articles`
- 篩選：
  - 來源：`GET /sources` → 下拉選擇 → 傳 `sourceName`
  - 時間：輸入 start/end → 轉 ISO DATE_TIME 放 query
- 操作：
  - 點擊列 → `/articles/:id`
  - 語意搜尋：`GET /articles/search?q=...&limit=10`（建議獨立區塊顯示結果）

### 8.6 後台入口 `/admin`（最小可用）
由於目前後端是 API Key，前端可用兩種策略：
- **策略 A（推薦）**：只用 env：`VITE_ADMIN_API_KEY`，不做登入頁（部署時由環境控管）
- **策略 B**：提供簡單輸入框，使用者輸入後存到 `localStorage`，之後 `adminApi` 讀取該 key

### 8.7 媒體字典管理 `/admin/media-sources`
- API：
  - `GET /admin/media-sources`
  - `POST /admin/media-sources`
  - `DELETE /admin/media-sources/{id}`
- 表格欄位：
  - name, code, homeUrl, defaultBiasScore, weight, updatedAt
- 表單驗證（前端）：
  - name/code 必填
  - defaultBiasScore 建議限制 [-1, 1]
  - weight 建議 > 0

### 8.8 實體別名管理 `/admin/entity-aliases`
- API：
  - `GET /admin/entity-aliases`（全量）
  - `GET /admin/entity-aliases/active`（僅 active）
  - `POST/PUT/DELETE`、`/batch`
  - `POST /init-taiwan-politicians`
- UI 建議：
  - 表格：alias、canonicalName、entityType、active、source、updatedAt
  - 批量新增：貼 JSON array 或 CSV（AI 可選其一）
  - 快捷按鈕：初始化台灣政治人物（呼叫 init）

### 8.9 操作面板 `/admin/ops`
集中放「會影響後端狀態」的按鈕，避免散落各頁。
- 觸發批次：`POST /admin/articles/batch-process`（顯示回傳字串）
- 文章重跑：
  - 輸入 articleId → `POST /admin/reprocess/articles/{id}`
  - 輸入 articleId → `POST /admin/reaggregate/articles/{id}`
- 關閉事件：
  - 輸入 eventId → `POST /admin/events/{eventId}/close`
- Normalize 測試：
  - 輸入 text → `POST /admin/entity-aliases/test-normalize`

---

## 9. API Client 規範（Axios 封裝）

### 9.1 建議的封裝行為
- `publicApi`：
  - baseURL = `VITE_API_BASE_URL`
  - 不帶 `X-API-KEY`
- `adminApi`：
  - baseURL = `VITE_API_BASE_URL`
  - request interceptor 自動加 header：
    - `X-API-KEY: VITE_ADMIN_API_KEY`（或 localStorage 的 key）
- 統一錯誤處理：
  - 401：顯示「API Key 無效或缺失」
  - 404：顯示「查無資料」
  - 400：顯示後端訊息（例如 `/spectrum/search` 空 query）

---

## 10. UI/UX 規範（讓後台好用）

- 表格支援：
  - loading 狀態
  - 空狀態（No data）
  - 複製 URL、複製 topic、複製 alias 等快捷
- 危險操作二次確認：
  - delete media source / delete alias / close event / batch process
- 長文（coreSummary/cleanText）：
  - 預設折疊 + 展開
- Bias Bar：
  - 若 `totalArticles = 0`：顯示「數據不足/計算中」
  - hover 顯示 sourceDetails（可用 tooltip 或 drawer）

---

## 11. 交付清單（前端 AI 最終產出）

- 可跑的 Vue 專案（Vite）
- 完整路由與頁面：
  - dashboard / events / event detail / articles / article detail
  - admin media sources / admin entity aliases / admin ops
- 可用的 API client（public/admin 兩套）
- 基礎型別定義（TS）
- 基本錯誤處理與 loading/empty state

---

## 12. 後續建議（若你要做真正的「分析儀表板」）

若你希望儀表板有更像 BI 的分析圖表，建議後端補以下 API（前端可先留 stub）：
- `/admin/metrics/articles?from&to`：每日文章數、status 分佈
- `/admin/metrics/events?from&to`：每日事件數、open/close、hotness 排名
- `/admin/metrics/spectrum?eventId`：stanceScore 分佈直方圖（或分位數）

