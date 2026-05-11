import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocationsApi } from '@/modules/locations/api/locations.api'
import type { LocationDoc } from '@/modules/locations/api/locations.api'

export const useLocationsStore = defineStore('locations', () => {
    const items = ref<LocationDoc[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const names = computed<string[]>(() => items.value.map((l) => l.name))

    const fetchAll = async (): Promise<void> => {
        isLoading.value = true
        error.value = null
        try {
            items.value = await LocationsApi.getAll()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
        } finally {
            isLoading.value = false
        }
    }

    const add = async (name: string): Promise<void> => {
        const item = await LocationsApi.add(name)
        items.value.push(item)
    }

    const remove = async (id: string): Promise<void> => {
        await LocationsApi.delete(id)
        items.value = items.value.filter((l) => l.id !== id)
    }

    return { items, names, isLoading, error, fetchAll, add, remove }
})
