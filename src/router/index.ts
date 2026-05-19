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
import PendingApprovalPage from '@/modules/auth/components/PendingApprovalPage.vue'

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
        requiresRole?: string[]
    }
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/pending-approval', name: 'pending-approval', component: PendingApprovalPage, meta: { requiresAuth: true } },
        ...dashboardRoutes,
        ...gearRoutes,
        ...usersRoutes,
        ...myGearRoutes,
        ...profileRoutes,
        ...locationsRoutes,
        ...categoriesRoutes
    ]
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    await authStore.ready

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'dashboard', query: { redirect: to.fullPath } }
    }

    if (authStore.isAuthenticated) {
        const usersStore = useUsersStore()
        if (!usersStore.users.length) await usersStore.fetchAll()

        const currentUser = usersStore.users.find((u) => u.email === authStore.currentUserEmail)

        // пользователь удалён из коллекции, но Auth-аккаунт остался → выкидываем
        if (!currentUser && usersStore.users.length > 0) {
            await authStore.forceLogout()
            return { name: 'dashboard' }
        }

        const status = currentUser?.status ?? 'approved'

        if (status === 'blocked') {
            await authStore.forceLogout()
            return { name: 'dashboard' }
        }

        if (status === 'pending' && to.name !== 'pending-approval') {
            return { name: 'pending-approval' }
        }

        if (status !== 'pending' && to.name === 'pending-approval') {
            return { name: 'dashboard' }
        }

        // пользователь не найден и записей нет вовсе → суперадмин → полный доступ
        if (to.meta.requiresRole && currentUser && !to.meta.requiresRole.includes(currentUser.role)) {
            return { name: 'dashboard' }
        }
    }
})

export default router
