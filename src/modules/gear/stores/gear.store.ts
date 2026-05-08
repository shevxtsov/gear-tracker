import { defineStore } from 'pinia'
import { ref } from 'vue'
import { GearApi } from '@/modules/gear/api/gear.api'
import type { GearItem, GearUsageRecord } from '@/modules/gear/types/gear.types'

export const useGearStore = defineStore('gear', () => {
    const items = ref<GearItem[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const fetchAll = async (): Promise<void> => {
        isLoading.value = true
        error.value = null

        try {
            items.value = await GearApi.getAll()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
        } finally {
            isLoading.value = false
        }
    }

    const addItem = async (item: Omit<GearItem, 'id' | 'available' | 'takenBy' | 'takenTo' | 'takenAt' | 'history'>): Promise<void> => {
        const newItem = await GearApi.add({
            ...item,
            available: true,
            takenBy: null,
            takenTo: null,
            takenAt: null,
            history: []
        })
        items.value.push(newItem)
    }

    const takeItem = async (id: string, data: { takenBy: string; takenTo: string; takenAt: number }): Promise<void> => {
        const index = items.value.findIndex((i) => i.id === id)
        if (index === -1) return

        const record: GearUsageRecord = {
            id: Date.now().toString(),
            ...data,
            returnedAt: null,
            returnedTo: null
        }
        const history = [...items.value[index].history, record].slice(-5)
        const patch = { available: false, ...data, history }

        await GearApi.update(id, patch)
        items.value[index] = { ...items.value[index], ...patch }
    }

    const returnItem = async (id: string, returnedTo: string): Promise<void> => {
        const index = items.value.findIndex((i) => i.id === id)
        if (index === -1) return

        const history = [...items.value[index].history]
        const lastIndex = history.length - 1
        if (lastIndex >= 0) {
            history[lastIndex] = { ...history[lastIndex], returnedAt: Date.now(), returnedTo }
        }

        const patch = { available: true, takenBy: null, takenTo: null, takenAt: null, history }

        await GearApi.update(id, patch)
        items.value[index] = { ...items.value[index], ...patch }
    }

    const updateItem = async (id: string, patch: Pick<GearItem, 'name' | 'category' | 'location'>): Promise<void> => {
        await GearApi.update(id, patch)
        const index = items.value.findIndex((i) => i.id === id)
        if (index !== -1) {
            items.value[index] = { ...items.value[index], ...patch }
        }
    }

    const deleteItem = async (id: string): Promise<void> => {
        await GearApi.delete(id)
        items.value = items.value.filter((i) => i.id !== id)
    }

    return { items, isLoading, error, fetchAll, addItem, takeItem, returnItem, updateItem, deleteItem }
})
