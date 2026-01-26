# 📚 Square News Admin 前端项目文档索引

> 本目录包含前端管理后台的所有相关文档，已按功能分类整理

---

## 📂 文档结构

```
docs/
├── api/               # API 对接文档
├── changelogs/        # 版本变更记录
├── guides/            # 功能使用指南
└── migration/         # 项目迁移文档
```

---

## 🔌 API 对接 (`api/`)

前后端 API 对接和验证文档

| 文档 | 说明 | 推荐阅读 |
|------|------|---------|
| [API_VALIDATION.md](./api/API_VALIDATION.md) | API 接口验证文档 | ⭐⭐⭐ 接口对接必读 |

---

## 📝 变更记录 (`changelogs/`)

功能更新和版本变更记录

| 文档 | 说明 | 推荐阅读 |
|------|------|---------|
| [CHANGELOG_INCITEMENT.md](./changelogs/CHANGELOG_INCITEMENT.md) | 煽動指數功能变更记录 | ⭐⭐ 了解功能演进 |

---

## 📖 功能使用指南 (`guides/`)

各功能模块的详细使用说明

| 文档 | 说明 | 推荐阅读 |
|------|------|---------|
| [VUE_ADMIN_DASHBOARD_GUIDE.md](./guides/VUE_ADMIN_DASHBOARD_GUIDE.md) | Vue 管理后台开发指南 | ⭐⭐⭐ 开发必读 |
| [INCITEMENT_MANAGEMENT_GUIDE.md](./guides/INCITEMENT_MANAGEMENT_GUIDE.md) | 煽動指數管理功能指南 | ⭐⭐⭐ 功能使用 |

---

## 🔄 项目迁移 (`migration/`)

项目迁移和重构相关文档

| 文档 | 说明 | 推荐阅读 |
|------|------|---------|
| [MIGRATION_COMPLETED.md](./migration/MIGRATION_COMPLETED.md) | 迁移完成总结 | ⭐⭐ 了解迁移历史 |
| [MIGRATION_PROMPT.md](./migration/MIGRATION_PROMPT.md) | 迁移操作指引 | ⭐ 迁移参考 |

---

## 🎯 常见场景快速导航

### 我是新手，想快速上手
1. 📖 [VUE_ADMIN_DASHBOARD_GUIDE.md](./guides/VUE_ADMIN_DASHBOARD_GUIDE.md) - 了解项目架构
2. 📖 [API_VALIDATION.md](./api/API_VALIDATION.md) - 了解 API 对接
3. 📖 主项目 README.md - 了解环境配置

### 我要开发新功能
1. 📖 [VUE_ADMIN_DASHBOARD_GUIDE.md](./guides/VUE_ADMIN_DASHBOARD_GUIDE.md) - 了解项目结构
2. 📖 [API_VALIDATION.md](./api/API_VALIDATION.md) - 了解 API 规范
3. 📁 查看 `src/` 目录下的相关模块代码

### 我要对接后端 API
1. 📖 [API_VALIDATION.md](./api/API_VALIDATION.md)
2. 📁 查看 `src/api/` 目录下的 API 客户端代码
3. 📖 后端项目的 API 文档

### 我要使用煽動指數功能
1. 📖 [INCITEMENT_MANAGEMENT_GUIDE.md](./guides/INCITEMENT_MANAGEMENT_GUIDE.md)
2. 📖 [CHANGELOG_INCITEMENT.md](./changelogs/CHANGELOG_INCITEMENT.md)

### 我要部署到生产环境
1. 📖 主项目 README.md - 构建说明
2. 📁 查看根目录的 `deploy-cloudflare.sh` 脚本
3. 🚀 运行 `npm run build` 构建生产版本

---

## 💻 技术栈

### 核心框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的前端构建工具
- **Vue Router** - 官方路由管理器

### UI 组件库
- **Naive UI** - Vue 3 组件库
- **VIcons** - 图标库

### 状态管理
- **Pinia** - Vue 3 状态管理

### HTTP 客户端
- **Axios** - Promise 基础的 HTTP 客户端

---

## 📁 项目结构

```
src/
├── api/                # API 客户端封装
│   ├── client.ts       # Axios 实例配置
│   ├── articles.ts     # 文章相关 API
│   ├── events.ts       # 事件相关 API
│   ├── incitement.ts   # 煽動指數 API
│   ├── sources.ts      # 媒體源 API
│   └── spectrum.ts     # 光譜分析 API
├── components/         # 可复用组件
│   ├── ArticleTable.vue
│   ├── BiasBar.vue
│   ├── EventCard.vue
│   └── ...
├── views/              # 页面视图
│   ├── admin/          # 管理功能页面
│   ├── ArticleListView.vue
│   ├── EventListView.vue
│   └── ...
├── stores/             # Pinia 状态管理
│   └── auth.ts
├── router/             # 路由配置
│   └── index.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
└── utils/              # 工具函数
    └── date.ts
```

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 部署到 Cloudflare Pages
```bash
./deploy-cloudflare.sh
```

---

## 📝 文档维护指南

### 添加新文档

根据文档类型放入相应目录：

- **API 对接文档** → `api/`
- **变更记录** → `changelogs/`
- **功能指南** → `guides/`
- **迁移文档** → `migration/`

### 更新索引

添加新文档后，请更新本索引文件（`docs/README.md`）

---

## 🔗 相关资源

### 官方文档
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Naive UI 文档](https://www.naiveui.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)

### 项目相关
- [后端 API 文档](../../newprism/docs/api/) - 后端项目 API 文档
- [Postman 集合](../../newprism/docs/api/postman.json) - API 测试集合

---

**最后更新：** 2026-01-21
