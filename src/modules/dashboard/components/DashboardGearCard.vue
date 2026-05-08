<template>
    <NCard size="small">
        <div class="dashboard-gear-card">
            <div class="dashboard-gear-card__info">
                <span class="dashboard-gear-card__name">{{ item.name }}</span>
                <span class="dashboard-gear-card__meta">{{ item.category }} · {{ item.location }}</span>

                <template v-if="!item.available">
                    <span class="dashboard-gear-card__taken-row">Взял: {{ item.takenBy ?? '—' }}</span>
                    <span class="dashboard-gear-card__taken-row">Куда: {{ item.takenTo ?? '—' }}</span>
                    <span class="dashboard-gear-card__taken-row">Когда: {{ formattedDate }}</span>
                </template>

                <span v-if="item.available && lastReturnedTo" class="dashboard-gear-card__returned-row">
                    Последний возврат: {{ lastReturnedTo }}
                </span>
            </div>

            <div class="dashboard-gear-card__right">
                <NTag
                    :type="item.available ? 'success' : 'error'"
                    size="small"
                    round
                >
                    {{ item.available ? 'Доступно' : 'Занято' }}
                </NTag>

                <NButton
                    quaternary
                    circle
                    size="small"
                    @click="router.push({ name: 'gear-detail', params: { id: item.id } })"
                >
                    <template #icon>
                        <NIcon size="22"><InformationCircleOutline /></NIcon>
                    </template>
                </NButton>
            </div>
        </div>
    </NCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NTag, NButton, NIcon } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'
import type { GearItem } from '@/modules/gear/types/gear.types'

const props = defineProps<{ item: GearItem }>()

const router = useRouter()

const lastReturnedTo = computed<string | null>(() => {
    const last = [...props.item.history].reverse().find((r) => r.returnedAt !== null)
    return last?.returnedTo ?? null
})

const formattedDate = computed<string>(() => {
    if (!props.item.takenAt) return '—'

    return new Intl.DateTimeFormat('ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(props.item.takenAt))
})
</script>

<style lang="scss" scoped>
.dashboard-gear-card {
    display: flex;
    align-items: flex-start;
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

    &__taken-row {
        font-size: 12px;
        color: #e88080;
    }

    &__returned-row {
        font-size: 12px;
        opacity: 0.5;
    }

    &__right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        flex-shrink: 0;
    }
}
</style>
