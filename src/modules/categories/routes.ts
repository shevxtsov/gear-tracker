import type { RouteRecordRaw } from 'vue-router'

export const categoriesRoutes: RouteRecordRaw[] = [
    {
        path: '/categories',
        name: 'categories',
        component: () => import('@/modules/categories/components/CategoriesPage.vue'),
        meta: { requiresAuth: true, requiresRole: ['admin', 'moderator'] }
    }
]
