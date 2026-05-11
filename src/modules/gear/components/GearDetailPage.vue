<template>
    <div v-if="item" class="gear-detail">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NIcon, NCard, NTag } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import type { GearUsageRecord } from '@/modules/gear/types/gear.types'

const router = useRouter()
const route = useRoute()
const gearStore = useGearStore()

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
</script>

<style lang="scss" scoped>
.gear-detail {
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
