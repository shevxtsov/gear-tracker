import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/shared/firebase'
import { AuthApi } from '@/modules/auth/api/auth.api'
import type { LoginCredentials } from '@/modules/auth/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    onAuthStateChanged(firebaseAuth, (user) => {
        isAuthenticated.value = !!user
    })

    const login = async (credentials: LoginCredentials): Promise<void> => {
        isLoading.value = true
        error.value = null

        try {
            await AuthApi.login(credentials)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка авторизации'
        } finally {
            isLoading.value = false
        }
    }

    const logout = async (): Promise<void> => {
        await AuthApi.logout()
        error.value = null
    }

    return { isAuthenticated, isLoading, error, login, logout }
})
