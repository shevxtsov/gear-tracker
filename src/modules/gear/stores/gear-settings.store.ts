import { defineStore } from 'pinia'
import { ref } from 'vue'
import { GEAR_CATEGORIES, GEAR_LOCATIONS } from '@/modules/gear/types/gear.types'

export const useGearSettingsStore = defineStore(
    'gear-settings',
    () => {
        const categories = ref<string[]>([...GEAR_CATEGORIES])
        const locations = ref<string[]>([...GEAR_LOCATIONS])

        const addCategory = (category: string): void => {
            const trimmed = category.trim()

            if (trimmed && !categories.value.includes(trimmed)) {
                categories.value.push(trimmed)
            }
        }

        const addLocation = (location: string): void => {
            const trimmed = location.trim()

            if (trimmed && !locations.value.includes(trimmed)) {
                locations.value.push(trimmed)
            }
        }

        return { categories, locations, addCategory, addLocation }
    },
    {
        persist: {
            pick: ['categories', 'locations'],
            afterHydrate: (ctx) => {
                for (const cat of GEAR_CATEGORIES) {
                    if (!ctx.store.categories.includes(cat)) {
                        ctx.store.categories.push(cat)
                    }
                }

                for (const loc of GEAR_LOCATIONS) {
                    if (!ctx.store.locations.includes(loc)) {
                        ctx.store.locations.push(loc)
                    }
                }
            }
        }
    }
)
