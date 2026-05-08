import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
    apiKey: 'AIzaSyDD_wjdpG5pSp5IELj8SXE-YyhHp7s3cTw',
    authDomain: 'gears-tracker.firebaseapp.com',
    projectId: 'gears-tracker',
    storageBucket: 'gears-tracker.firebasestorage.app',
    messagingSenderId: '16832901523',
    appId: '1:16832901523:web:3e9e8912e88c563eebf866'
}

const ADMIN_EMAIL = 'admin@gear-tracker.local'
const ADMIN_PASSWORD = 'Admin123456'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
    .then(() => {
        console.log(`✓ Пользователь создан: ${ADMIN_EMAIL}`)
        console.log(`  Пароль: ${ADMIN_PASSWORD}`)
        process.exit(0)
    })
    .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
            console.log(`ℹ Пользователь ${ADMIN_EMAIL} уже существует`)
        } else {
            console.error(`✗ Ошибка: ${error.message}`)
        }
        process.exit(0)
    })
