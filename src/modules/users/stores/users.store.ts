import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UsersApi } from '@/modules/users/api/users.api'
import type { User, UserStatus } from '@/modules/users/types/users.types'

export const useUsersStore = defineStore('users', () => {
    const users = ref<User[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const loadingIds = ref(new Set<string>())

    const fetchAll = async (): Promise<void> => {
        isLoading.value = true
        error.value = null

        try {
            users.value = await UsersApi.getAll()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
        } finally {
            isLoading.value = false
        }
    }

    const addUser = async (data: Omit<User, 'id'>): Promise<void> => {
        const user = await UsersApi.add(data)
        users.value.push(user)
    }

    const updateUser = async (
        id: string,
        patch: Omit<User, 'id'>
    ): Promise<void> => {
        loadingIds.value.add(id)
        try {
            await UsersApi.update(id, patch)
            const index = users.value.findIndex((u) => u.id === id)
            if (index !== -1) {
                users.value[index] = { ...users.value[index], ...patch }
            }
        } finally {
            loadingIds.value.delete(id)
        }
    }

    const deleteUser = async (id: string): Promise<void> => {
        loadingIds.value.add(id)
        try {
            await UsersApi.delete(id)
            users.value = users.value.filter((u) => u.id !== id)
        } finally {
            loadingIds.value.delete(id)
        }
    }

    const updateStatus = async (id: string, status: UserStatus): Promise<void> => {
        loadingIds.value.add(id)
        try {
            await UsersApi.updateStatus(id, status)
            const index = users.value.findIndex((u) => u.id === id)
            if (index !== -1) {
                users.value[index] = { ...users.value[index], status }
            }
        } finally {
            loadingIds.value.delete(id)
        }
    }

    return {
        users,
        isLoading,
        loadingIds,
        error,
        fetchAll,
        addUser,
        updateUser,
        deleteUser,
        updateStatus
    }
})
