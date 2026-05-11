import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CategoriesApi } from '@/modules/categories/api/categories.api'
import type { CategoryDoc } from '@/modules/categories/api/categories.api'

export const useCategoriesStore = defineStore('categories', () => {
    const items = ref<CategoryDoc[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const names = computed<string[]>(() => items.value.map((c) => c.name))

    const fetchAll = async (): Promise<void> => {
        isLoading.value = true
        error.value = null
        try {
            items.value = await CategoriesApi.getAll()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
        } finally {
            isLoading.value = false
        }
    }

    const add = async (name: string): Promise<void> => {
        const item = await CategoriesApi.add(name)
        items.value.push(item)
    }

    const remove = async (id: string): Promise<void> => {
        await CategoriesApi.delete(id)
        items.value = items.value.filter((c) => c.id !== id)
    }

    return { items, names, isLoading, error, fetchAll, add, remove }
})
