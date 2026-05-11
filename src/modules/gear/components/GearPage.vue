<template>
    <div class="gear-page">
        <div class="gear-page__header">
            <div class="gear-page__header-left">
                <NButton quaternary circle @click="router.push({ name: 'dashboard' })">
                    <template #icon>
                        <NIcon><ArrowBackOutline /></NIcon>
                    </template>
                </NButton>
                <h1 class="gear-page__title">Оборудование</h1>
            </div>

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
                        <NDropdown
                            trigger="click"
                            :options="menuOptions(item)"
                            @select="(key) => handleMenuSelect(key, item)"
                        >
                            <NButton quaternary circle size="small">
                                <template #icon>
                                    <NIcon><EllipsisVertical /></NIcon>
                                </template>
                            </NButton>
                        </NDropdown>
                    </template>
                </GearCard>

                <NModal
                    v-model:show="deleteConfirmOpen"
                    preset="dialog"
                    type="error"
                    title="Удалить оборудование?"
                    :content="deletingItem ? `«${deletingItem.name}» будет удалено безвозвратно` : ''"
                    positive-text="Удалить"
                    negative-text="Отмена"
                    @positive-click="confirmDelete"
                />
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
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
    NSpin, NAlert, NButton, NIcon,
    NInput, NDrawer, NDrawerContent, NDropdown, NModal, useMessage
} from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import { AddOutline, SearchOutline, SwapVerticalOutline, ArrowBackOutline, EllipsisVertical, CreateOutline, TrashOutline, LinkOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import AddGearForm from '@/modules/gear/components/AddGearForm.vue'
import EditGearForm from '@/modules/gear/components/EditGearForm.vue'
import GearCard from '@/modules/gear/components/GearCard.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const router = useRouter()
const message = useMessage()
const gearStore = useGearStore()

const drawerOpen = ref<boolean>(false)
const editDrawerOpen = ref<boolean>(false)
const editingItem = ref<GearItem | null>(null)
const deletingItem = ref<GearItem | null>(null)
const deleteConfirmOpen = ref<boolean>(false)
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

const menuOptions = (item: GearItem): DropdownOption[] => [
    {
        label: 'Редактировать',
        key: 'edit',
        icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
    },
    {
        label: 'Получить ссылку',
        key: 'link',
        icon: () => h(NIcon, null, { default: () => h(LinkOutline) })
    },
    { type: 'divider', key: 'divider' },
    {
        label: 'Удалить',
        key: 'delete',
        icon: () => h(NIcon, { color: '#e88080' }, { default: () => h(TrashOutline) })
    }
]

const handleMenuSelect = (key: string, item: GearItem): void => {
    if (key === 'edit') {
        editingItem.value = item
        editDrawerOpen.value = true
    } else if (key === 'link') {
        const url = `${window.location.origin}/gear/gear-detail/${item.id}`
        navigator.clipboard.writeText(url)
        message.success('Ссылка скопирована')
    } else if (key === 'delete') {
        deletingItem.value = item
        deleteConfirmOpen.value = true
    }
}

const confirmDelete = async (): Promise<void> => {
    if (deletingItem.value) {
        await gearStore.deleteItem(deletingItem.value.id)
        deletingItem.value = null
    }
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

    &__header-left {
        display: flex;
        align-items: center;
        gap: 8px;
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
