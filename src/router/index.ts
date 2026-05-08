import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { dashboardRoutes } from '@/modules/dashboard/routes'
import { gearRoutes } from '@/modules/gear/routes'
import { usersRoutes } from '@/modules/users/routes'
import { myGearRoutes } from '@/modules/my-gear/routes'

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
    }
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [...dashboardRoutes, ...gearRoutes, ...usersRoutes, ...myGearRoutes]
})

router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'dashboard' }
    }
})

export default router
