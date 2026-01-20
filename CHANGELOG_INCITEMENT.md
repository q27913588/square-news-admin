# 煽動指數分析功能 - 更新日志

## 概述

根据 `frontend_api_guide.md` 的要求，为 Square News Admin 添加了完整的煽動指數分析功能。

## 🎯 更新内容

### 1. 新增 API 客户端 (`src/api/incitement.ts`)

创建了专门处理煽动指数分析的 API 客户端：

- `getEventIncitement(eventId, includeEvidence)` - 获取事件煽动指数排行榜数据
- `getEventIncitementSpectrum(eventId)` - 获取事件煽动指数光谱（2D 图表）
- `getOutletIncitementTrend(outlet, window, from, to)` - 获取媒体煽动指数趋势

### 2. 扩展类型定义 (`src/types/index.ts`)

新增 9 个煽动指数相关的 TypeScript 类型：

- `IncitementEvidence` - 证据摘要
- `OutletIncitement` - 媒体煽动指数数据
- `IncitementStatistics` - 统计信息
- `IncitementDTO` - 事件煽动指数数据
- `SpectrumPoint` - 光谱点
- `IncitementSpectrumDTO` - 煽动指数光谱
- `IncitementTrendDataPoint` - 趋势数据点
- `IncitementBaseline` - 趋势基线
- `IncitementTrendDTO` - 媒体煽动指数趋势

### 3. 新增 Vue 组件

#### `IncitementSpectrum.vue` - 煽動指數光譜圖
- 2D 散点图可视化（X: 立场，Y: 煽动分数）
- 支持悬停查看详情
- 点大小表示文章数量
- 透明度表示信心度
- 颜色区分媒体类别
- 包含象限辅助线

#### `IncitementRanking.vue` - 煽動指數排行榜
- 按煽动分数排序的媒体列表
- 进度条显示煽动分数
- 渐变色标尺显示立场
- 支持查看 Top 3 证据片段
- 统计摘要显示

### 4. 新增视图页面

#### `EventIncitementView.vue` - 事件煽動指數分析視圖
- 整合排行榜和光谱图
- 证据显示开关
- 数据刷新功能
- 使用说明

### 5. 路由更新

在 `src/router/index.ts` 添加新路由：
```
/events/:eventId/incitement
```

### 6. 现有组件增强

#### `EventDetailView.vue`
- 添加"查看煽動指數分析"按钮

#### `src/api/events.ts`
- 添加 `getEventIncitementSpectrum()` 函数
- 将旧的 `getEventSpectrum()` 标记为 deprecated

## 📊 功能亮点

### 煽動指數光譜圖
- **X 轴**: 立场极性（-1 反对 ← 0 中立 → +1 支持）
- **Y 轴**: 煽动分数（0 低煽动 → 50 阈值 → 100 高煽动）
- **视觉编码**:
  - 点的大小 = 文章数量
  - 点的透明度 = 信心度
  - 点的颜色 = 媒体类别

### 煽動指數排行榜
- 自动按煽动分数降序排列
- 前三名特殊徽章显示（🥇🥈🥉）
- 高煽动媒体（≥70 分）红色标记
- 可选显示证据片段（Top 3）
- 统计摘要（平均煽动分数、平均立场）

## 📁 新增文件清单

```
src/api/incitement.ts                      # 煽动指数 API 客户端
src/components/IncitementSpectrum.vue       # 光谱图组件
src/components/IncitementRanking.vue        # 排行榜组件
src/views/EventIncitementView.vue           # 分析视图页面
API_VALIDATION.md                           # API 验证报告
CHANGELOG_INCITEMENT.md                     # 本文档
```

## 📝 修改文件清单

```
src/types/index.ts                         # 添加煽动指数类型定义
src/router/index.ts                        # 添加煽动指数分析路由
src/api/events.ts                          # 添加光谱 API 函数
src/views/EventDetailView.vue              # 添加分析按钮
```

## ✅ API 指南符合性

所有实现均严格遵循 `frontend_api_guide.md` 的规范：

1. ✅ API 端点完全对应
2. ✅ 参数命名一致
3. ✅ 返回结构匹配
4. ✅ 前端实作建议完整实现
5. ✅ 视觉化设计符合指南

详细验证结果请参考 `API_VALIDATION.md`。

## 🚀 使用方法

1. 访问任何事件详情页面
2. 点击"📊 查看煽動指數分析"按钮
3. 查看煽动指数排行榜和光谱图
4. 可选：开启"显示证据"查看 Top 3 证据片段

或直接访问：
```
/events/{eventId}/incitement
```

## 🔄 后续建议

1. 添加媒体煽动指数趋势图（时间序列）组件
2. 支持光谱图点击查看该媒体的文章列表
3. 添加导出功能（CSV/PNG）
4. 添加煽动指数阈值自定义设置
5. 添加多事件对比功能

---
**更新日期**: 2026-01-20  
**版本**: 1.0.0
