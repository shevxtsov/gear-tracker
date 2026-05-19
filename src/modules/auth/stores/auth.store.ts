import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/shared/firebase'
import { AuthApi } from '@/modules/auth/api/auth.api'
import { UsersApi } from '@/modules/users/api/users.api'
import type { LoginCredentials, RegisterData } from '@/modules/auth/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref<boolean>(false)
    const currentUserEmail = ref<string | null>(null)
    const isReady = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const ready = new Promise<void>((resolve) => {
        onAuthStateChanged(firebaseAuth, (user) => {
            isAuthenticated.value = !!user
            currentUserEmail.value = user?.email ?? null
            isReady.value = true
            resolve()
        })
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

    const register = async (data: RegisterData): Promise<void> => {
        isLoading.value = true
        error.value = null

        try {
            await AuthApi.register(data.email, data.password)
            await UsersApi.add({ name: data.name, email: data.email, phone: data.phone, role: data.role, status: 'pending' })
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка регистрации'
        } finally {
            isLoading.value = false
        }
    }

    const logout = async (): Promise<void> => {
        await AuthApi.logout()
        error.value = null
    }

    const forceLogout = async (): Promise<void> => {
        await AuthApi.logout()
        isAuthenticated.value = false
        currentUserEmail.value = null
        error.value = 'Ваш аккаунт заблокирован'
    }

    return { isAuthenticated, currentUserEmail, isReady, isLoading, error, ready, login, register, logout, forceLogout }
})
