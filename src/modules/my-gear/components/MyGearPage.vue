<template>
    <div class="my-gear-page">
        <h1 class="my-gear-page__title">Моё оборудование</h1>

        <template v-if="myGearStore.currentUserName">
            <p class="my-gear-page__user">{{ myGearStore.currentUserName }}</p>

            <template v-if="myItems.length">
                <NCard
                    v-for="item in myItems"
                    :key="item.id"
                    size="small"
                    class="my-gear-page__card"
                >
                    <div class="my-gear-card">
                        <div class="my-gear-card__info">
                            <span class="my-gear-card__name">{{ item.name }}</span>
                            <span class="my-gear-card__meta">{{ item.category }} · {{ item.takenTo }}</span>
                            <span class="my-gear-card__date">{{ formatDate(item.takenAt!) }}</span>
                        </div>

                        <NButton
                            type="warning"
                            size="small"
                            @click="openReturn(item.id)"
                        >
                            Вернуть
                        </NButton>
                    </div>
                </NCard>
            </template>

            <p v-else class="my-gear-page__empty">
                У вас нет взятого оборудования
            </p>
        </template>

        <p v-else class="my-gear-page__empty">
            Вы ещё не брали оборудование
        </p>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="240">
        <NDrawerContent title="Вернуть оборудование" :native-scrollbar="false">
            <ReturnGearForm
                v-if="returningId"
                :gear-id="returningId"
                @submitted="drawerOpen = false"
            />
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NCard, NButton, NDrawer, NDrawerContent } from 'naive-ui'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useMyGearStore } from '@/modules/my-gear/stores/my-gear.store'
import ReturnGearForm from '@/modules/my-gear/components/ReturnGearForm.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const gearStore = useGearStore()
const myGearStore = useMyGearStore()

const drawerOpen = ref<boolean>(false)
const returningId = ref<string | null>(null)

const myItems = computed<GearItem[]>(() =>
    gearStore.items.filter(
        (i) => !i.available && i.takenBy === myGearStore.currentUserName
    )
)

const openReturn = (id: string): void => {
    returningId.value = id
    drawerOpen.value = true
}

const formatDate = (ts: number): string =>
    new Intl.DateTimeFormat('ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(ts))

onMounted(async () => {
    if (!gearStore.items.length) {
        await gearStore.fetchAll()
    }
})
</script>

<style lang="scss" scoped>
.my-gear-page {
    &__title {
        margin-bottom: 4px;
        font-size: 24px;
        font-weight: 600;
    }

    &__user {
        margin-bottom: 16px;
        font-size: 13px;
        opacity: 0.5;
    }

    &__card {
        margin-bottom: 8px;
    }

    &__empty {
        padding: 32px 0;
        text-align: center;
        opacity: 0.4;
    }
}

.my-gear-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    &__info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__meta {
        font-size: 12px;
        opacity: 0.5;
    }

    &__date {
        font-size: 12px;
        opacity: 0.4;
    }
}
</style>
