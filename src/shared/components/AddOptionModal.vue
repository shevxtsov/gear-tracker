<template>
    <NModal :show="show" @update:show="emit('update:show', $event)">
        <NCard
            class="add-option-modal"
            :title="title"
            role="dialog"
            size="small"
        >
            <span class="focus-absorber" tabindex="0" aria-hidden="true" />

            <NInput
                v-model:value="inputValue"
                placeholder=""
                class="add-option-modal__input"
                @keydown.enter.prevent="handleConfirm"
            />

            <div class="add-option-modal__actions">
                <NButton @click="emit('update:show', false)">Отмена</NButton>
                <NButton type="primary" @click="handleConfirm">Добавить</NButton>
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NCard, NInput, NButton } from 'naive-ui'

const props = defineProps<{ show: boolean; title: string }>()
const emit = defineEmits<{
    'update:show': [value: boolean]
    confirm: [value: string]
}>()

const inputValue = ref<string>('')

watch(
    () => props.show,
    (val) => {
        if (val) inputValue.value = ''
    }
)

const handleConfirm = (): void => {
    const trimmed = inputValue.value.trim()

    if (!trimmed) return

    emit('confirm', trimmed)
    emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.focus-absorber {
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
}

.add-option-modal {
    width: calc(100vw - 32px);
    max-width: 360px;

    &__input {
        margin-bottom: 16px;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
}
</style>
