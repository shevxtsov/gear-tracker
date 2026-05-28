import {
    collection,
    getDocsFromServer,
    setDoc,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'
import type { User, UserStatus } from '@/modules/users/types/users.types'

const COLLECTION = 'users'

const withTimeout = <T>(promise: Promise<T>, ms = 10000): Promise<T> =>
    Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Firestore timeout after ${ms}ms — проверьте Security Rules и наличие базы данных в Firebase Console`)), ms)
        )
    ])

export class UsersApi {
    static getAll = async (): Promise<User[]> => {
        const snapshot = await withTimeout(getDocsFromServer(collection(firebaseDb, COLLECTION)))
        return snapshot.docs.map((d) => ({ status: 'approved', ...d.data(), id: d.id } as User))
    }

    static add = async (id: string, data: Omit<User, 'id'>): Promise<User> => {
        await setDoc(doc(firebaseDb, COLLECTION, id), data)
        return { id, ...data }
    }

    static update = async (id: string, data: Omit<User, 'id'>): Promise<void> => {
        await updateDoc(doc(firebaseDb, COLLECTION, id), data)
    }

    static delete = async (id: string): Promise<void> => {
        await deleteDoc(doc(firebaseDb, COLLECTION, id))
    }

    static updateStatus = async (id: string, status: UserStatus): Promise<void> => {
        await updateDoc(doc(firebaseDb, COLLECTION, id), { status })
    }
}
