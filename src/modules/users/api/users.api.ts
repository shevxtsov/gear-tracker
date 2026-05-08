import {
    collection,
    getDocsFromServer,
    addDoc,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'
import type { User } from '@/modules/users/types/users.types'

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
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User))
    }

    static add = async (data: Omit<User, 'id'>): Promise<User> => {
        const ref = await addDoc(collection(firebaseDb, COLLECTION), data)
        return { id: ref.id, ...data }
    }

    static update = async (id: string, data: Omit<User, 'id'>): Promise<void> => {
        await updateDoc(doc(firebaseDb, COLLECTION, id), data)
    }

    static delete = async (id: string): Promise<void> => {
        await deleteDoc(doc(firebaseDb, COLLECTION, id))
    }
}
