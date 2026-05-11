import {
    collection,
    getDocsFromServer,
    addDoc,
    deleteDoc,
    doc
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'

const COLLECTION = 'categories'

export interface CategoryDoc {
    id: string
    name: string
}

export class CategoriesApi {
    static getAll = async (): Promise<CategoryDoc[]> => {
        const snapshot = await getDocsFromServer(collection(firebaseDb, COLLECTION))
        return snapshot.docs.map((d) => ({ id: d.id, name: d.data().name as string }))
    }

    static add = async (name: string): Promise<CategoryDoc> => {
        const ref = await addDoc(collection(firebaseDb, COLLECTION), { name })
        return { id: ref.id, name }
    }

    static delete = async (id: string): Promise<void> => {
        await deleteDoc(doc(firebaseDb, COLLECTION, id))
    }
}
