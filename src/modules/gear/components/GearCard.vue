<template>
    <NCard size="small">
        <div class="gear-card">
            <div class="gear-card__info">
                <span class="gear-card__name">{{ item.name }}</span>
                <span class="gear-card__meta">{{ item.category }} · {{ item.location }}</span>
            </div>

            <div class="gear-card__right">
                <NTag
                    v-if="showStatus"
                    :type="item.available ? 'success' : 'error'"
                    size="small"
                    round
                >
                    {{ item.available ? 'Доступно' : 'Занято' }}
                </NTag>

                <slot name="actions" />
            </div>
        </div>
    </NCard>
</template>

<script setup lang="ts">
import { NCard, NTag } from 'naive-ui'
import type { GearItem } from '@/modules/gear/types/gear.types'

defineProps<{
    item: GearItem
    showStatus?: boolean
}>()
</script>

<style lang="scss" scoped>
.gear-card {
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

    &__right {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }
}
</style>
