import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/modules/dashboard/components/DashboardPage.vue')
    }
]
