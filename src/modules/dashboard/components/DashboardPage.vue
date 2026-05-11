<template>
    <div class="dashboard-page">
        <div class="dashboard-page__toolbar">
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

            <NButton :type="selectedCategory ? 'primary' : 'default'" @click="filterDrawerOpen = true">
                <template #icon>
                    <NIcon><FunnelOutline /></NIcon>
                </template>
            </NButton>
        </div>

        <NAlert
            v-if="!authStore.isAuthenticated"
            type="info"
            class="dashboard-page__auth-notice"
        >
            <div class="dashboard-page__auth-notice-content">
                <span>Чтобы пользоваться приложением и брать оборудование нужно авторизоваться</span>
                <NButton size="small" type="primary" @click="openLogin">Войти</NButton>
            </div>
        </NAlert>

        <NSpin v-if="gearStore.isLoading" class="dashboard-page__spinner" />

        <template v-else>
            <div v-if="visibleItems.length" class="gear-list">
                <DashboardGearCard
                    v-for="item in visibleItems"
                    :key="item.id"
                    :item="item"
                />
            </div>
            <p v-else class="dashboard-page__empty">Ничего не найдено</p>
        </template>
    </div>

    <NDrawer v-model:show="filterDrawerOpen" placement="bottom" :height="filterDrawerHeight">
        <NDrawerContent title="Категория" :native-scrollbar="false">
            <div class="category-filter">
                <div class="category-filter__list">
                    <div
                        v-for="cat in categories"
                        :key="cat"
                        class="category-filter__item"
                        :class="{ 'category-filter__item--active': selectedCategory === cat }"
                        @click="selectCategory(cat)"
                    >
                        {{ cat }}
                    </div>
                </div>

                <NButton
                    block
                    :disabled="!selectedCategory"
                    class="category-filter__reset"
                    @click="resetCategory"
                >
                    Сбросить
                </NButton>
            </div>
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { NSpin, NAlert, NButton, NInput, NIcon, NDrawer, NDrawerContent } from 'naive-ui'
import { SearchOutline, FunnelOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAuthDrawer } from '@/modules/auth/composables/use-auth-drawer'
import DashboardGearCard from '@/modules/dashboard/components/DashboardGearCard.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const gearStore = useGearStore()
const authStore = useAuthStore()
const { openLogin } = useAuthDrawer()

const searchQuery = ref<string>('')
const selectedCategory = ref<string | null>(null)
const filterDrawerOpen = ref<boolean>(false)

const categories = computed<string[]>(() =>
    [...new Set(gearStore.items.map((i) => i.category))].sort((a, b) => a.localeCompare(b, 'ru'))
)

const filterDrawerHeight = computed(() => Math.min(80 + categories.value.length * 52 + 72, 520))

const visibleItems = computed<GearItem[]>(() => {
    let result = [...gearStore.items].sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0))

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim().toLowerCase()
        result = result.filter((i) => i.name.toLowerCase().includes(query))
    }

    if (selectedCategory.value) {
        result = result.filter((i) => i.category === selectedCategory.value)
    }

    return result
})

const selectCategory = (cat: string): void => {
    selectedCategory.value = cat
    filterDrawerOpen.value = false
}

const resetCategory = (): void => {
    selectedCategory.value = null
    filterDrawerOpen.value = false
}

onMounted(() => {
    if (authStore.isAuthenticated && !gearStore.items.length) {
        gearStore.fetchAll()
    }
})

watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
        if (isAuthenticated) await gearStore.fetchAll()
    }
)
</script>

<style lang="scss" scoped>
.dashboard-page {
    &__toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    &__empty {
        padding: 32px 0;
        text-align: center;
        opacity: 0.4;
    }

    &__auth-notice {
        margin-bottom: 16px;
    }

    &__auth-notice-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    &__spinner {
        display: flex;
        justify-content: center;
        padding: 32px 0;
    }
}

.gear-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-filter {
    display: flex;
    flex-direction: column;
    height: 100%;

    &__list {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    &__item {
        padding: 13px 12px;
        font-size: 15px;
        cursor: pointer;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);

        &:last-child {
            border-bottom: none;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.04);
        }

        &--active {
            color: #63e2b7;
        }
    }

    &__reset {
        margin-top: 16px;
    }
}
</style>
