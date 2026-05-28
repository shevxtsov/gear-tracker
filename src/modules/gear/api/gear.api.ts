import {
    collection,
    getDocsFromServer,
    addDoc,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'
import type { GearItem } from '@/modules/gear/types/gear.types'

const COLLECTION = 'gear'

const withTimeout = <T>(promise: Promise<T>, ms = 10000): Promise<T> =>
    Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(
                () => reject(new Error(`Firestore timeout after ${ms}ms — проверьте Security Rules и наличие базы данных в Firebase Console`)),
                ms
            )
        )
    ])

export class GearApi {
    static getAll = async (): Promise<GearItem[]> => {
        const snapshot = await withTimeout(getDocsFromServer(collection(firebaseDb, COLLECTION)))
        return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as GearItem))
    }

    static add = async (data: Omit<GearItem, 'id'>): Promise<GearItem> => {
        const ref = await addDoc(collection(firebaseDb, COLLECTION), data)
        return { id: ref.id, ...data }
    }

    static update = async (id: string, patch: Partial<Omit<GearItem, 'id'>>): Promise<void> => {
        await updateDoc(doc(firebaseDb, COLLECTION, id), patch as Record<string, unknown>)
    }

    static delete = async (id: string): Promise<void> => {
        await deleteDoc(doc(firebaseDb, COLLECTION, id))
    }
}
