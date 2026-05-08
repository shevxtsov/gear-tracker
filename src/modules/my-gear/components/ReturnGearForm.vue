<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="return-gear-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Место возврата" path="returnedTo">
            <NSelect
                v-model:value="form.returnedTo"
                :options="locationOptions"
                placeholder=""
                filterable
                :disabled="isSubmitting"
            />
        </NFormItem>

        <NButton type="primary" attr-type="submit" :loading="isSubmitting" block>
            Вернуть
        </NButton>
    </NForm>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NForm, NFormItem, NSelect, NButton } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useGearSettingsStore } from '@/modules/gear/stores/gear-settings.store'

const props = defineProps<{ gearId: string }>()
const emit = defineEmits<{ submitted: [] }>()

const gearStore = useGearStore()
const settingsStore = useGearSettingsStore()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)
const form = ref({ returnedTo: null as string | null })

const locationOptions = computed<SelectOption[]>(() =>
    settingsStore.locations.map((l) => ({ label: l, value: l }))
)

const rules: FormRules = {
    returnedTo: [{ required: true, message: 'Укажите место возврата', trigger: 'change' }]
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
}
</style>
