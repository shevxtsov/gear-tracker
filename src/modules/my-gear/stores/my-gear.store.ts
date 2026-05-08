import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyGearStore = defineStore(
    'my-gear',
    () => {
        const currentUserName = ref<string | null>(null)

        const setCurrentUser = (name: string): void => {
            currentUserName.value = name
        }

        const clearCurrentUser = (): void => {
            currentUserName.value = null
        }

        return { currentUserName, setCurrentUser, clearCurrentUser }
    },
    { persist: { pick: ['currentUserName'] } }
)
