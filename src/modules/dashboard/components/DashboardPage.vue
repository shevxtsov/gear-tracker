<template>
    <div class="dashboard-page">
        <h1 class="dashboard-page__title">Обзор</h1>

        <NAlert
            v-if="!authStore.isAuthenticated"
            type="info"
            class="dashboard-page__auth-notice"
        >
            <div class="dashboard-page__auth-notice-content">
                <span
                    >Чтобы пользоваться приложением и брать оборудование нужно
                    авторизоваться</span
                >
                <NButton size="small" type="primary" @click="openLogin"
                    >Войти</NButton
                >
            </div>
        </NAlert>

        <NSpin v-if="gearStore.isLoading" class="dashboard-page__spinner" />

        <div v-else class="gear-list">
            <DashboardGearCard
                v-for="item in sortedItems"
                :key="item.id"
                :item="item"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { NSpin, NAlert, NButton } from 'naive-ui'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAuthDrawer } from '@/modules/auth/composables/use-auth-drawer'
import DashboardGearCard from '@/modules/dashboard/components/DashboardGearCard.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const gearStore = useGearStore()
const authStore = useAuthStore()
const { openLogin } = useAuthDrawer()

const sortedItems = computed<GearItem[]>(() =>
    [...gearStore.items].sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0))
)

onMounted(() => {
    getData()
})

const getData = (): void => {
    if (!authStore.isAuthenticated) {
        return
    }

    if (!gearStore.items.length) {
        gearStore.fetchAll()
    }
}

watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
        if (isAuthenticated) {
            await gearStore.fetchAll()
        }
    }
)
</script>

<style lang="scss" scoped>
.dashboard-page {
    &__title {
        margin-bottom: 16px;
        font-size: 24px;
        font-weight: 600;
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
</style>
