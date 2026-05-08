<template>
    <div class="gear-page">
        <div class="gear-page__header">
            <h1 class="gear-page__title">Оборудование</h1>

            <NButton type="primary" size="small" @click="drawerOpen = true">
                <template #icon>
                    <NIcon><AddOutline /></NIcon>
                </template>
                Добавить
            </NButton>
        </div>

        <div class="gear-page__toolbar">
            <NInput
                v-model:value="searchQuery"
                placeholder="Поиск по названию"
                clearable
                :input-props="{ autocomplete: 'off' }"
            >
                <template #prefix>
                    <NIcon><SearchOutline /></NIcon>
                </template>
            </NInput>

            <NButton
                :type="isSorted ? 'primary' : 'default'"
                @click="isSorted = !isSorted"
            >
                <template #icon>
                    <NIcon><SwapVerticalOutline /></NIcon>
                </template>
                А–Я
            </NButton>
        </div>

        <NSpin v-if="gearStore.isLoading" class="gear-page__spinner" />

        <NAlert
            v-else-if="gearStore.error"
            type="error"
            :title="gearStore.error"
        />

        <template v-else>
            <div v-if="visibleItems.length" class="gear-list">
                <GearCard
                    v-for="item in visibleItems"
                    :key="item.id"
                    :item="item"
                >
                    <template #actions>
                        <NButton
                            quaternary
                            circle
                            size="small"
                            @click="openEdit(item)"
                        >
                            <template #icon>
                                <NIcon><CreateOutline /></NIcon>
                            </template>
                        </NButton>

                        <NPopconfirm positive-text="Подтвердить" negative-text="Отмена" @positive-click="gearStore.deleteItem(item.id)">
                            <template #trigger>
                                <NButton quaternary circle size="small">
                                    <template #icon>
                                        <NIcon color="#e88080"><TrashOutline /></NIcon>
                                    </template>
                                </NButton>
                            </template>
                            Удалить «{{ item.name }}»?
                        </NPopconfirm>
                    </template>
                </GearCard>
            </div>

            <p v-else class="gear-page__empty">Ничего не найдено</p>
        </template>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="380">
        <NDrawerContent title="Новое оборудование" :native-scrollbar="false">
            <AddGearForm @submitted="drawerOpen = false" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="editDrawerOpen" placement="bottom" :height="380">
        <NDrawerContent title="Редактировать" :native-scrollbar="false">
            <EditGearForm
                v-if="editingItem"
                :item="editingItem"
                @submitted="editDrawerOpen = false"
            />
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    NSpin, NAlert, NButton, NIcon,
    NInput, NDrawer, NDrawerContent, NPopconfirm
} from 'naive-ui'
import { AddOutline, SearchOutline, SwapVerticalOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import AddGearForm from '@/modules/gear/components/AddGearForm.vue'
import EditGearForm from '@/modules/gear/components/EditGearForm.vue'
import GearCard from '@/modules/gear/components/GearCard.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const gearStore = useGearStore()

const drawerOpen = ref<boolean>(false)
const editDrawerOpen = ref<boolean>(false)
const editingItem = ref<GearItem | null>(null)
const searchQuery = ref<string>('')
const isSorted = ref<boolean>(false)

const visibleItems = computed<GearItem[]>(() => {
    let result = gearStore.items

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim().toLowerCase()

        result = result.filter((i) => i.name.toLowerCase().includes(query))
    }

    if (isSorted.value) {
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }

    return result
})

const openEdit = (item: GearItem): void => {
    editingItem.value = item
    editDrawerOpen.value = true
}

onMounted(async () => {
    await gearStore.fetchAll()
})
</script>

<style lang="scss" scoped>
.gear-page {
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    &__title {
        font-size: 24px;
        font-weight: 600;
    }

    &__toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    &__spinner {
        display: flex;
        justify-content: center;
        padding: 32px 0;
    }

    &__empty {
        padding: 32px 0;
        text-align: center;
        opacity: 0.4;
    }
}

.gear-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
