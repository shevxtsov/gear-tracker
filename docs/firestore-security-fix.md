# Firestore Security Fix: UID-based Document IDs

## Проблема

Текущие правила Firestore проверяют только факт авторизации:

```
allow read, write: if request.auth != null;
```

Пользователь с валидным Firebase Auth токеном (действует 1 час) может делать прямые запросы к Firestore через REST API или SDK, **полностью минуя логику приложения**. Это означает, что заблокированный, удалённый или ожидающий подтверждения пользователь сохраняет полный доступ к данным.

Клиентский роутер-гард защищает только UI — он не является защитой на уровне данных.

## Почему нельзя проверить статус в текущей схеме

Правила Firestore могут искать документы только по точному пути (`get(/databases/.../documents/users/{id})`). Они не умеют делать запросы по полю — например, найти документ по `email`. Поэтому при текущей схеме, где ID документа генерируется Firestore автоматически, проверить `status` пользователя в правилах невозможно.

## Решение

Использовать **Firebase Auth UID как ID документа** в коллекции `users`. Тогда путь к документу любого авторизованного пользователя всегда известен: `users/{request.auth.uid}`.

### Целевые правила Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }
  }
}
```

## Необходимые изменения в коде

### 1. `src/modules/auth/api/auth.api.ts`

`register` и `createUserAccount` должны возвращать UID созданного пользователя:

```ts
static register = async (email: string, password: string): Promise<string> => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    return credential.user.uid
}

static createUserAccount = async (email: string, password: string): Promise<string> => {
    const secondaryApp = initializeApp(firebaseConfig, `create-user-${Date.now()}`)
    const secondaryAuth = getAuth(secondaryApp)
    try {
        const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
        await signOut(secondaryAuth)
        return credential.user.uid
    } finally {
        await deleteApp(secondaryApp)
    }
}
```

### 2. `src/modules/users/api/users.api.ts`

Заменить `addDoc` на `setDoc` с явным ID:

```ts
import { setDoc } from 'firebase/firestore'

static add = async (id: string, data: Omit<User, 'id'>): Promise<User> => {
    await setDoc(doc(firebaseDb, COLLECTION, id), data)
    return { id, ...data }
}
```

### 3. `src/modules/auth/stores/auth.store.ts`

Передавать UID из `register` в `UsersApi.add`:

```ts
const register = async (data: RegisterData): Promise<void> => {
    const uid = await AuthApi.register(data.email, data.password)
    await UsersApi.add(uid, { name: data.name, email: data.email, phone: data.phone, role: data.role, status: 'pending' })
}
```

### 4. `src/modules/users/components/AddUserForm.vue`

Передавать UID из `createUserAccount` в `addUser`:

```ts
const uid = await AuthApi.createUserAccount(form.value.email, DEFAULT_PASSWORD)
await usersStore.addUser(uid, {
    name: form.value.name,
    email: form.value.email,
    phone: Utils.maskPhone(form.value.phone),
    role: form.value.role,
    status: 'approved'
})
```

### 5. `src/modules/users/stores/users.store.ts`

Обновить сигнатуру `addUser`:

```ts
const addUser = async (id: string, data: Omit<User, 'id'>): Promise<void> => {
    const user = await UsersApi.add(id, data)
    users.value.push(user)
}
```

### 6. Миграция существующих данных

Существующие документы в коллекции `users` имеют автоматически сгенерированные ID — их необходимо пересоздать с UID в качестве ID. Самый простой путь: удалить все документы из коллекции и попросить пользователей зарегистрироваться заново, либо создать их через форму добавления пользователя.

## Статус

Код реализован. Осталось два шага:

### 1. Обновить правила в Firebase Console

Firestore Database → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }
  }
}
```

### 2. Очистить коллекцию `users` в Firestore

Существующие документы имеют автоматически сгенерированные ID — они несовместимы с новой схемой. Удалить все документы из коллекции `users` в Firebase Console, после чего зарегистрировать пользователей заново или создать их через форму добавления.
