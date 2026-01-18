import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue')
  },
  {
    path: '/events',
    name: 'EventList',
    component: () => import('@/views/EventListView.vue')
  },
  {
    path: '/events/:eventId',
    name: 'EventDetail',
    component: () => import('@/views/EventDetailView.vue'),
    props: true
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('@/views/ArticleListView.vue')
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetailView.vue'),
    props: true
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/admin/media-sources',
    children: [
      {
        path: 'media-sources',
        name: 'AdminMediaSources',
        component: () => import('@/views/admin/MediaSourcesView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'entity-aliases',
        name: 'AdminEntityAliases',
        component: () => import('@/views/admin/EntityAliasesView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'operations',
        name: 'AdminOperations',
        component: () => import('@/views/admin/OperationsView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
