import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    reauthenticateWithCredential,
    updatePassword,
    EmailAuthProvider,
    signOut,
    getAuth
} from 'firebase/auth'
import { initializeApp, deleteApp } from 'firebase/app'
import { firebaseAuth, firebaseConfig } from '@/shared/firebase'
import type { LoginCredentials } from '@/modules/auth/types/auth.types'

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/invalid-email': 'Некорректный email',
    'auth/email-already-in-use': 'Пользователь с таким email уже существует',
    'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже'
}

export class AuthApi {
    static login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            await signInWithEmailAndPassword(firebaseAuth, credentials.email, credentials.password)
        } catch (e: any) {
            const message = FIREBASE_ERROR_MESSAGES[e?.code] ?? 'Ошибка авторизации'
            throw new Error(message)
        }
    }

    static register = async (email: string, password: string): Promise<void> => {
        try {
            await createUserWithEmailAndPassword(firebaseAuth, email, password)
        } catch (e: any) {
            const message = FIREBASE_ERROR_MESSAGES[e?.code] ?? 'Ошибка регистрации'
            throw new Error(message)
        }
    }

    static changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        const user = firebaseAuth.currentUser
        if (!user || !user.email) throw new Error('Пользователь не авторизован')

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword)
            await reauthenticateWithCredential(user, credential)
            await updatePassword(user, newPassword)
        } catch (e: any) {
            const message = FIREBASE_ERROR_MESSAGES[e?.code] ?? 'Ошибка смены пароля'
            throw new Error(message)
        }
    }

    static createUserAccount = async (email: string, password: string): Promise<void> => {
        const secondaryApp = initializeApp(firebaseConfig, `create-user-${Date.now()}`)
        const secondaryAuth = getAuth(secondaryApp)
        try {
            await createUserWithEmailAndPassword(secondaryAuth, email, password)
            await signOut(secondaryAuth)
        } catch (e: any) {
            const message = FIREBASE_ERROR_MESSAGES[e?.code] ?? 'Ошибка создания аккаунта'
            throw new Error(message)
        } finally {
            await deleteApp(secondaryApp)
        }
    }

    static logout = async (): Promise<void> => {
        await signOut(firebaseAuth)
    }
}
