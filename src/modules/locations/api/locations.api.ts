import {
    collection,
    getDocsFromServer,
    addDoc,
    deleteDoc,
    doc
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'

const COLLECTION = 'locations'

export interface LocationDoc {
    id: string
    name: string
}

export class LocationsApi {
    static getAll = async (): Promise<LocationDoc[]> => {
        const snapshot = await getDocsFromServer(collection(firebaseDb, COLLECTION))
        return snapshot.docs.map((d) => ({ id: d.id, name: d.data().name as string }))
    }

    static add = async (name: string): Promise<LocationDoc> => {
        const ref = await addDoc(collection(firebaseDb, COLLECTION), { name })
        return { id: ref.id, name }
    }

    static delete = async (id: string): Promise<void> => {
        await deleteDoc(doc(firebaseDb, COLLECTION, id))
    }
}
