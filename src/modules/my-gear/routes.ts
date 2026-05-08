import type { RouteRecordRaw } from 'vue-router'

export const myGearRoutes: RouteRecordRaw[] = [
    {
        path: '/my-gear',
        name: 'my-gear',
        component: () => import('@/modules/my-gear/components/MyGearPage.vue'),
        meta: { requiresAuth: true }
    }
]
