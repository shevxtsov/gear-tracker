import type { RouteRecordRaw } from 'vue-router'

export const locationsRoutes: RouteRecordRaw[] = [
    {
        path: '/locations',
        name: 'locations',
        component: () => import('@/modules/locations/components/LocationsPage.vue'),
        meta: { requiresAuth: true, requiresRole: ['admin', 'moderator'] }
    }
]
