<template>
    <div class="dashboard-page">
        <h1 class="dashboard-page__title">Обзор</h1>

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
import { computed, onMounted } from 'vue'
import { NSpin } from 'naive-ui'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import DashboardGearCard from '@/modules/dashboard/components/DashboardGearCard.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const gearStore = useGearStore()

const sortedItems = computed<GearItem[]>(() =>
    [...gearStore.items].sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0))
)

onMounted(async () => {
    if (!gearStore.items.length) {
        await gearStore.fetchAll()
    }
})
</script>

<style lang="scss" scoped>
.dashboard-page {
    &__title {
        margin-bottom: 16px;
        font-size: 24px;
        font-weight: 600;
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
