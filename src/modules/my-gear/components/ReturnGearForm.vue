<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="return-gear-form"
        @submit.prevent="handleSubmit"
    >
        <div v-if="gearLocation" class="return-gear-form__hint">
            <span class="return-gear-form__hint-label">Рекомендуемое место</span>
            <span class="return-gear-form__hint-value">{{ gearLocation }}</span>
        </div>

        <NFormItem label="Место возврата" path="returnedTo">
            <div class="field-row">
                <NSelect
                    v-model:value="form.returnedTo"
                    :options="locationOptions"
                    :loading="locationsStore.isLoading"
                    placeholder=""
                    filterable
                    :disabled="isSubmitting"
                />
                <NButton quaternary circle @click="showLocationModal = true">
                    <template #icon>
                        <NIcon><AddOutline /></NIcon>
                    </template>
                </NButton>
            </div>
        </NFormItem>

        <NButton type="primary" attr-type="submit" :loading="isSubmitting" block>
            Вернуть
        </NButton>
    </NForm>

    <AddOptionModal
        v-model:show="showLocationModal"
        title="Новое место хранения"
        @confirm="onConfirmLocation"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NForm, NFormItem, NSelect, NButton, NIcon } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useLocationsStore } from '@/modules/locations/stores/locations.store'
import AddOptionModal from '@/shared/components/AddOptionModal.vue'

const props = defineProps<{ gearId: string }>()
const emit = defineEmits<{ submitted: [] }>()

const gearStore = useGearStore()
const locationsStore = useLocationsStore()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)
const showLocationModal = ref<boolean>(false)
const form = ref({ returnedTo: null as string | null })

onMounted(() => {
    if (!locationsStore.items.length) locationsStore.fetchAll()
})

const gearLocation = computed(() =>
    gearStore.items.find((i) => i.id === props.gearId)?.location ?? null
)

const locationOptions = computed<SelectOption[]>(() =>
    locationsStore.names.map((l) => ({ label: l, value: l }))
)

const rules: FormRules = {
    returnedTo: [{ required: true, message: 'Укажите место возврата', trigger: 'change' }]
}

const onConfirmLocation = async (value: string): Promise<void> => {
    await locationsStore.add(value)
    form.value.returnedTo = value
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        isSubmitting.value = true

        await gearStore.returnItem(props.gearId, form.value.returnedTo!)

        emit('submitted')
    } catch {
        // ошибки валидации обрабатывает NForm
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style lang="scss" scoped>
.focus-absorber {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
}

.return-gear-form {
    display: flex;
    flex-direction: column;

    &__hint {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        margin-bottom: 16px;
        border-radius: 6px;
        background-color: rgba(99, 226, 183, 0.08);
        border: 1px solid rgba(99, 226, 183, 0.2);
    }

    &__hint-label {
        font-size: 12px;
        opacity: 0.6;
    }

    &__hint-value {
        font-size: 13px;
        font-weight: 500;
        color: #63e2b7;
    }
}

.field-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .n-select {
        flex: 1;
    }
}
</style>
