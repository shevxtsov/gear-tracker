import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth'
import { firebaseAuth } from '@/shared/firebase'
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

    static logout = async (): Promise<void> => {
        await signOut(firebaseAuth)
    }
}
