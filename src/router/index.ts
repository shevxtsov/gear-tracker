import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { dashboardRoutes } from '@/modules/dashboard/routes'
import { gearRoutes } from '@/modules/gear/routes'
import { usersRoutes } from '@/modules/users/routes'
import { myGearRoutes } from '@/modules/my-gear/routes'
import { profileRoutes } from '@/modules/profile/routes'
import { locationsRoutes } from '@/modules/locations/routes'
import { categoriesRoutes } from '@/modules/categories/routes'

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
        requiresRole?: string[]
    }
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [...dashboardRoutes, ...gearRoutes, ...usersRoutes, ...myGearRoutes, ...profileRoutes, ...locationsRoutes, ...categoriesRoutes]
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    await authStore.ready

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'dashboard', query: { redirect: to.fullPath } }
    }

    if (to.meta.requiresRole && authStore.isAuthenticated) {
        const usersStore = useUsersStore()
        if (!usersStore.users.length) await usersStore.fetchAll()

        const currentUser = usersStore.users.find((u) => u.email === authStore.currentUserEmail)
        // пользователь не найден в коллекции → суперадмин → полный доступ
        if (currentUser && !to.meta.requiresRole.includes(currentUser.role)) {
            return { name: 'dashboard' }
        }
    }
})

export default router
