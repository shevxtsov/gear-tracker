<template>
    <div class="dashboard-gear-card" :class="{ 'dashboard-gear-card--pressed': pressed }" @click="navigate">
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

            <NTag
                :type="item.available ? 'success' : 'error'"
                size="medium"
                round
                class="dashboard-gear-card__tag"
            >
                {{ item.available ? 'Доступно' : 'Занято' }}
            </NTag>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NTag } from 'naive-ui'
import type { GearItem } from '@/modules/gear/types/gear.types'

const props = defineProps<{ item: GearItem }>()

const router = useRouter()
const pressed = ref(false)

const navigate = (): void => {
    pressed.value = true
    setTimeout(() => {
        pressed.value = false
        router.push({ name: 'gear-detail', params: { id: props.item.id } })
    }, 150)
}

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
    padding: 12px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: transform 0.15s ease, background-color 0.15s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &--pressed {
        transform: scale(0.97);
        background-color: rgba(255, 255, 255, 0.09);
    }

    &__info {
        display: flex;
        flex-direction: column;
        gap: 3px;
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

    &__tag {
        align-self: flex-start;
        margin-top: 8px;
    }
}
</style>
