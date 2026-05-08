import type { RouteRecordRaw } from 'vue-router'

export const usersRoutes: RouteRecordRaw[] = [
    {
        path: '/users',
        name: 'users',
        component: () => import('@/modules/users/components/UsersPage.vue'),
        meta: { requiresAuth: true }
    }
]
