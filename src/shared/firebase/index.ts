import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyDD_wjdpG5pSp5IELj8SXE-YyhHp7s3cTw',
    authDomain: 'gears-tracker.firebaseapp.com',
    projectId: 'gears-tracker',
    storageBucket: 'gears-tracker.firebasestorage.app',
    messagingSenderId: '16832901523',
    appId: '1:16832901523:web:3e9e8912e88c563eebf866'
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const firebaseDb = getFirestore(firebaseApp)
