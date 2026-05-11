import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/modules/profile/components/ProfilePage.vue'),
        meta: { requiresAuth: true }
    }
]
