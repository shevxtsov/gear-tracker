import type { RouteRecordRaw } from 'vue-router'

export const gearRoutes: RouteRecordRaw[] = [
    {
        path: '/gear',
        name: 'gear',
        component: () => import('@/modules/gear/components/GearPage.vue'),
        meta: { requiresAuth: true, requiresRole: ['admin', 'moderator'] }
    },
    {
        path: '/gear/:id',
        name: 'gear-detail',
        component: () => import('@/modules/gear/components/GearDetailPage.vue'),
        meta: { requiresAuth: true }
    }
]
