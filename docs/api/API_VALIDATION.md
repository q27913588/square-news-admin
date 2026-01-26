# Square News Admin - API 验证报告

根据 `/Users/kevin/Documents/GitHubTanvi/newprism/frontend_api_guide.md` 的要求，本文档验证所有 API 调用的实现情况。

## ✅ 已实现的 API 端点

### 1. 核心议题瀏覽 (Trending Events)

| API 端点 | 函数 | 文件 | 状态 |
|---------|------|------|------|
| `GET /events/trending` | `getTrendingEvents(limit)` | `src/api/events.ts` | ✅ 已实现 |
| `GET /events/recent` | `getRecentEvents(limit)` | `src/api/events.ts` | ✅ 已实现 |

### 2. 煽動指數分析 (Incitement Analysis) - **新增**

| API 端点 | 函数 | 文件 | 状态 |
|---------|------|------|------|
| `GET /events/{eventId}/incitement` | `getEventIncitement(eventId, includeEvidence)` | `src/api/incitement.ts` | ✅ 新增 |
| `GET /events/{eventId}/spectrum` | `getEventIncitementSpectrum(eventId)` | `src/api/incitement.ts` | ✅ 新增 |
| `GET /outlets/{outlet}/incitement/trend` | `getOutletIncitementTrend(outlet, window, from, to)` | `src/api/incitement.ts` | ✅ 新增 |

**注意**: 同时在 `src/api/events.ts` 中也添加了 `getEventIncitementSpectrum()` 的别名函数，并将旧的 `getEventSpectrum()` 标记为 deprecated。

### 3. 文章清單查詢 (Articles)

| API 端点 | 函数 | 文件 | 状态 |
|---------|------|------|------|
| `GET /articles` | `getArticles(params)` | `src/api/articles.ts` | ✅ 已实现 |
| `GET /articles/search` | `searchArticles(q, limit)` | `src/api/articles.ts` | ✅ 已实现 |

### 4. 媒體來源字典 (Media Sources)

| API 端点 | 函数 | 文件 | 状态 |
|---------|------|------|------|
| `GET /sources` | `getSources()` | `src/api/sources.ts` | ✅ 已实现 |

## ✅ 新增的 TypeScript 类型定义

在 `src/types/index.ts` 中新增以下类型：

### 煽動指數分析相關類型

1. **`IncitementEvidence`** - 证据摘要
   - `articleId: number`
   - `title: string`
   - `snippet: string`
   - `score: number`

2. **`OutletIncitement`** - 媒体煽动指数数据
   - `outlet: string`
   - `incitementScore: number` (0-100)
   - `stancePolarity: number` (-1 到 +1)
   - `stanceConfidence: number` (0-1)
   - `confidence: number` (0-1)
   - `articleCount: number`
   - `topEvidence?: IncitementEvidence[]`

3. **`IncitementStatistics`** - 煽动指数统计信息
   - `totalOutlets: number`
   - `totalArticles: number`
   - `averageIncitement: number`
   - `averageStance: number`

4. **`IncitementDTO`** - 事件煽动指数数据
   - `eventId: number`
   - `topic: string`
   - `stanceTarget: string`
   - `outlets: OutletIncitement[]`
   - `statistics: IncitementStatistics`

5. **`SpectrumPoint`** - 光谱点（2D 图表用）
   - `outlet: string`
   - `stancePolarity: number` (-1 到 +1)
   - `incitementScore: number` (0-100)
   - `confidence: number` (0-1)
   - `articleCount: number`
   - `category: string`

6. **`IncitementSpectrumDTO`** - 煽动指数光谱（2D 图表）
   - `eventId: number`
   - `topic: string`
   - `stanceTarget: string`
   - `points: SpectrumPoint[]`

7. **`IncitementTrendDataPoint`** - 媒体煽动指数趋势数据点
   - `timestamp: string`
   - `rawScore: number`
   - `zScore?: number`
   - `articleCount: number`
   - `eventCount?: number`

8. **`IncitementBaseline`** - 媒体煽动指数趋势基线
   - `mean: number`
   - `stdDev: number`
   - `sampleSize: number`

9. **`IncitementTrendDTO`** - 媒体煽动指数趋势（时间序列）
   - `outlet: string`
   - `window: 'day' | 'week' | 'month'`
   - `dataPoints: IncitementTrendDataPoint[]`
   - `baseline?: IncitementBaseline`

## ✅ 新增的 Vue 组件

### 1. `IncitementSpectrum.vue` - 煽動指數光譜圖（2D Scatter Plot）

**位置**: `src/components/IncitementSpectrum.vue`

**功能**:
- 2D 散点图可视化
- X 轴：立场极性（-1 到 +1）
- Y 轴：煽动分数（0-100）
- 点的大小根据文章数量调整
- 点的透明度根据信心度调整
- 根据媒体类别使用不同颜色
- 悬停显示详细信息
- 包含象限辅助线（中立线 x=0，煽动阈值线 y=50）

### 2. `IncitementRanking.vue` - 煽動指數排行榜

**位置**: `src/components/IncitementRanking.vue`

**功能**:
- 按煽动分数降序排列的媒体列表
- 显示煽动分数（色阶进度条）
- 显示立场极性（渐变色标尺）
- 显示文章数量和信心度
- 支持查看 Top 3 证据片段（可选）
- 统计摘要（平均煽动分数、平均立场极性）
- 高煽动媒体（≥70）特殊标记

### 3. `EventIncitementView.vue` - 事件煽動指數分析視圖

**位置**: `src/views/EventIncitementView.vue`

**功能**:
- 整合煽动指数排行榜和光谱图
- 事件基本信息显示
- 证据显示开关
- 数据刷新功能
- 使用说明

## ✅ 路由更新

在 `src/router/index.ts` 中新增路由：

```typescript
{
  path: '/events/:eventId/incitement',
  name: 'EventIncitement',
  component: () => import('@/views/EventIncitementView.vue'),
  props: true
}
```

## ✅ 现有组件更新

### `EventDetailView.vue`

在事件详情页面添加了"查看煽動指數分析"按钮，链接到新的煽动指数分析视图。

## 📋 API 指南符合性检查清单

### 核心议题瀏覽
- ✅ `/events/trending` 支持 `limit` 参数
- ✅ 按 `hotness` 降序排序，null 值排在最后
- ✅ 同热度时按 `updatedAt` 排序
- ✅ `/events/recent` 按 `updatedAt` 降序排序

### 煽動指數分析
- ✅ `/events/{eventId}/incitement` 支持 `includeEvidence` 参数
- ✅ 返回结构符合 `IncitementDTO`
- ✅ `/events/{eventId}/spectrum` 返回 2D 光谱数据
- ✅ 返回结构符合 `IncitementSpectrumDTO`
- ✅ `/outlets/{outlet}/incitement/trend` 支持 `window`, `from`, `to` 参数

### 文章清單查詢
- ✅ `/articles` 支持 `sourceName`, `startDate`, `endDate`, `page`, `size` 参数
- ✅ `/articles/search` 支持 `q` 和 `limit` 参数

### 媒體來源字典
- ✅ `/sources` 返回媒体列表

## 🎨 前端实作建议符合性

### 煽動指數光譜圖（2D Scatter Plot）
- ✅ **座标系统**: X 轴立场极性（-1 到 +1），Y 轴煽动分数（0-100）
- ✅ **视觉化元素**:
  - ✅ 点的大小根据 `articleCount` 调整
  - ✅ 点的透明度根据 `confidence` 调整
  - ✅ 根据 `category` 使用不同颜色
- ✅ **互动功能**:
  - ✅ 悬停显示媒体名称、分数详情
  - ✅ 添加象限辅助线
- ✅ **无数据处理**: 显示"尚無煽動指數分析數據"

### 煽動指數排行榜
- ✅ **列表展示**: 使用 `outlets` 陣列
- ✅ **排序**: 按 `incitementScore` 降序
- ✅ **显示欄位**:
  - ✅ 媒体名称
  - ✅ 煽动分数（色阶进度条）
  - ✅ 立场（渐变色标尺）
  - ✅ 文章数量
- ✅ **证据展开**: 支持 `includeEvidence=true` 查看 Top 3 证据

## 📝 总结

所有 API 端点已根据指南完整实现，包括：
- ✅ 8 个公开 API 端点
- ✅ 9 个新的 TypeScript 类型定义
- ✅ 3 个新的 Vue 组件
- ✅ 1 个新的视图页面
- ✅ 路由配置更新
- ✅ 现有组件增强

所有实现均符合 API 指南的规范和前端实作建议。

---
**文档维护**: 前端开发团队  
**最后更新**: 2026-01-20
