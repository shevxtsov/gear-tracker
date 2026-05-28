<template>
    <div v-if="isLoading" class="gear-detail__loading">
        <NSpin />
    </div>

    <div v-else-if="item" class="gear-detail">
        <div class="gear-detail__header">
            <NButton quaternary circle @click="router.back()">
                <template #icon>
                    <NIcon><ArrowBackOutline /></NIcon>
                </template>
            </NButton>
            <h1 class="gear-detail__title">{{ item.name }}</h1>
        </div>

        <NCard size="small" class="gear-detail__info">
            <div class="gear-detail__info-row">
                <span class="gear-detail__label">Категория</span>
                <span>{{ item.category }}</span>
            </div>
            <div class="gear-detail__info-row">
                <span class="gear-detail__label">Место хранения</span>
                <span>{{ item.location }}</span>
            </div>
            <div class="gear-detail__info-row">
                <span class="gear-detail__label">Статус</span>
                <NTag :type="item.available ? 'success' : 'error'" size="small" round>
                    {{ item.available ? 'Доступно' : 'Занято' }}
                </NTag>
            </div>
        </NCard>

        <NButton
            v-if="item.available && authStore.isAuthenticated"
            type="primary"
            block
            class="gear-detail__action-btn"
            @click="takeDrawerOpen = true"
        >
            Взять оборудование
        </NButton>

        <NButton
            v-if="isMyGear"
            type="warning"
            block
            class="gear-detail__action-btn"
            @click="returnDrawerOpen = true"
        >
            Вернуть оборудование
        </NButton>

        <h2 class="gear-detail__section-title">История использования</h2>

        <p v-if="!history.length" class="gear-detail__empty">
            Нет записей об использовании
        </p>

        <div v-else class="gear-history">
            <div
                v-for="record in history"
                :key="record.id"
                class="gear-history__record"
            >
                <div class="gear-history__row">
                    <NTag type="warning" size="small" round>Взято</NTag>
                    <div class="gear-history__details">
                        <span class="gear-history__date">{{ formatDate(record.takenAt) }}</span>
                        <span class="gear-history__meta">{{ record.takenBy }} · {{ record.takenTo }}</span>
                    </div>
                </div>

                <div class="gear-history__row">
                    <NTag :type="record.returnedAt ? 'success' : 'error'" size="small" round>
                        {{ record.returnedAt ? 'Возврат' : 'В процессе' }}
                    </NTag>
                    <div class="gear-history__details">
                        <template v-if="record.returnedAt">
                            <span class="gear-history__date">{{ formatDate(record.returnedAt) }}</span>
                            <span class="gear-history__meta">{{ record.returnedTo }}</span>
                        </template>
                        <span v-else class="gear-history__date gear-history__date--muted">—</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="gear-detail__not-found">
        Оборудование не найдено
    </div>

    <NDrawer v-model:show="takeDrawerOpen" placement="bottom" :height="520">
        <NDrawerContent title="Взять оборудование" :native-scrollbar="false">
            <TakeGearForm :initial-gear-id="item?.id" @submitted="takeDrawerOpen = false" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="returnDrawerOpen" placement="bottom" :height="300">
        <NDrawerContent title="Вернуть оборудование" :native-scrollbar="false">
            <ReturnGearForm v-if="item" :gear-id="item.id" @submitted="returnDrawerOpen = false" />
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NIcon, NCard, NTag, NSpin, NDrawer, NDrawerContent } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useCurrentUser } from '@/modules/auth/composables/use-current-user'
import TakeGearForm from '@/modules/gear/components/TakeGearForm.vue'
import ReturnGearForm from '@/modules/my-gear/components/ReturnGearForm.vue'
import type { GearUsageRecord } from '@/modules/gear/types/gear.types'

const router = useRouter()
const route = useRoute()
const gearStore = useGearStore()
const authStore = useAuthStore()

const { currentUser } = useCurrentUser()

const takeDrawerOpen = ref<boolean>(false)
const returnDrawerOpen = ref<boolean>(false)
const isLoading = computed(() => !authStore.isReady || gearStore.isLoading)
const isMyGear = computed(() =>
    !!item.value && !item.value.available && item.value.takenBy === currentUser.value?.name
)

const item = computed(() =>
    gearStore.items.find((i) => i.id === route.params.id)
)

const history = computed<GearUsageRecord[]>(() =>
    item.value ? [...item.value.history].reverse() : []
)

const formatDate = (ts: number): string =>
    new Intl.DateTimeFormat('ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(ts))

onMounted(async () => {
    await gearStore.fetchAll()
})
</script>

<style lang="scss" scoped>
.gear-detail {
    &__loading {
        display: flex;
        justify-content: center;
        padding: 32px 0;
    }


    &__header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
    }

    &__title {
        font-size: 20px;
        font-weight: 600;
    }

    &__info {
        margin-bottom: 24px;
    }

    &__info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;

        &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
    }

    &__label {
        opacity: 0.5;
        font-size: 13px;
    }

    &__action-btn {
        margin-bottom: 8px;

        &:last-of-type {
            margin-bottom: 24px;
        }
    }

    &__section-title {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
    }

    &__empty {
        opacity: 0.4;
        text-align: center;
        padding: 24px 0;
    }

    &__not-found {
        padding: 32px 0;
        text-align: center;
        opacity: 0.4;
    }
}

.gear-history {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &__record {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    &__row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    &__details {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__date {
        font-size: 13px;
        font-weight: 500;

        &--muted {
            opacity: 0.35;
        }
    }

    &__meta {
        font-size: 12px;
        opacity: 0.5;
    }
}
</style>
