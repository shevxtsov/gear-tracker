import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useUsersStore } from '@/modules/users/stores/users.store'

export const useCurrentUser = () => {
    const authStore = useAuthStore()
    const usersStore = useUsersStore()

    const currentUser = computed(() =>
        usersStore.users.find((u) => u.email === authStore.currentUserEmail) ?? null
    )

    // пока users не загружены — доступ скрыт; не найден после загрузки → суперадмин
    const hasAdminAccess = computed(() => {
        if (!authStore.isAuthenticated) return false
        if (!usersStore.users.length) return false
        if (!currentUser.value) return true
        return currentUser.value.role === 'admin' || currentUser.value.role === 'moderator'
    })

    return { currentUser, hasAdminAccess }
}
