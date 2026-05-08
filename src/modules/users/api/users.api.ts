import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'
import type { User } from '@/modules/users/types/users.types'

const COLLECTION = 'users'

export class UsersApi {
    static getAll = async (): Promise<User[]> => {
        const snapshot = await getDocs(collection(firebaseDb, COLLECTION))
        console.log('snapshot => ', snapshot)
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
