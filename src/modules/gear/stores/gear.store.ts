import { defineStore } from 'pinia'
import { ref } from 'vue'
import { GearService } from '@/modules/gear/services/gear.service'
import type { GearItem, GearUsageRecord } from '@/modules/gear/types/gear.types'

export const useGearStore = defineStore('gear', () => {
    const items = ref<GearItem[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const fetchAll = async (): Promise<void> => {
        isLoading.value = true
        error.value = null

        try {
            items.value = await GearService.getAll()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
        } finally {
            isLoading.value = false
        }
    }

    const addItem = (item: Omit<GearItem, 'id' | 'available' | 'takenBy' | 'takenTo' | 'takenAt' | 'history'>): void => {
        items.value.push({
            ...item,
            id: Date.now().toString(),
            available: true,
            takenBy: null,
            takenTo: null,
            takenAt: null,
            history: []
        })
    }

    const takeItem = (id: string, data: { takenBy: string; takenTo: string; takenAt: number }): void => {
        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
            const record: GearUsageRecord = {
                id: Date.now().toString(),
                ...data,
                returnedAt: null,
                returnedTo: null
            }
            const history = [...items.value[index].history, record].slice(-5)

            items.value[index] = { ...items.value[index], available: false, ...data, history }
            items.value[index].history = history
        }
    }

    const returnItem = (id: string, returnedTo: string): void => {
        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
            const history = [...items.value[index].history]
            const lastIndex = history.length - 1

            if (lastIndex >= 0) {
                history[lastIndex] = {
                    ...history[lastIndex],
                    returnedAt: Date.now(),
                    returnedTo
                }
            }

            items.value[index] = {
                ...items.value[index],
                available: true,
                takenBy: null,
                takenTo: null,
                takenAt: null,
                history
            }
        }
    }

    const updateItem = (id: string, patch: Pick<GearItem, 'name' | 'category' | 'location'>): void => {
        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
            items.value[index] = { ...items.value[index], ...patch }
        }
    }

    const deleteItem = (id: string): void => {
        items.value = items.value.filter((i) => i.id !== id)
    }

    return { items, isLoading, error, fetchAll, addItem, takeItem, returnItem, updateItem, deleteItem }
})
