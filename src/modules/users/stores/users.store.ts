import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UsersApi } from '@/modules/users/api/users.api'
import type { User } from '@/modules/users/types/users.types'

export const useUsersStore = defineStore('users', () => {
    const users = ref<User[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

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
        await UsersApi.update(id, patch)
        const index = users.value.findIndex((u) => u.id === id)
        if (index !== -1) {
            users.value[index] = { ...users.value[index], ...patch }
        }
    }

    const deleteUser = async (id: string): Promise<void> => {
        await UsersApi.delete(id)
        users.value = users.value.filter((u) => u.id !== id)
    }

    return {
        users,
        isLoading,
        error,
        fetchAll,
        addUser,
        updateUser,
        deleteUser
    }
})
