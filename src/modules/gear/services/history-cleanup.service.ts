import {
    doc,
    getDoc,
    collection,
    getDocs,
    writeBatch
} from 'firebase/firestore'
import { firebaseDb } from '@/shared/firebase'

const METADATA_DOC = doc(firebaseDb, 'metadata', 'history-cleanup')
const GEAR_COLLECTION = 'gear'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export class HistoryCleanupService {
    static runIfNeeded = async (): Promise<void> => {
        const meta = await getDoc(METADATA_DOC)
        const lastCleanedAt: number = meta.data()?.lastCleanedAt ?? 0

        if (Date.now() - lastCleanedAt < THIRTY_DAYS_MS) return

        const snapshot = await getDocs(collection(firebaseDb, GEAR_COLLECTION))
        const batch = writeBatch(firebaseDb)

        snapshot.docs.forEach((d) => {
            batch.update(d.ref, { history: [] })
        })

        batch.set(METADATA_DOC, { lastCleanedAt: Date.now() })

        await batch.commit()
    }
}
