<template>
    <NModal :show="show" @update:show="emit('update:show', $event)">
        <NCard class="add-user-modal" title="Новый пользователь" role="dialog" size="small">
            <span class="focus-absorber" tabindex="0" aria-hidden="true" />

            <NForm ref="formRef" :model="form" :rules="rules" class="add-user-modal__form">
                <NFormItem label="Имя" path="name">
                    <NInput v-model:value="form.name" placeholder="" />
                </NFormItem>

                <NFormItem label="Номер телефона" path="phone">
                    <NInput
                        :value="isPhoneFocused ? form.phone : maskedPhone"
                        placeholder=""
                        @focus="isPhoneFocused = true"
                        @blur="isPhoneFocused = false"
                        @update:value="form.phone = $event"
                    />
                </NFormItem>
            </NForm>

            <div class="add-user-modal__actions">
                <NButton @click="emit('update:show', false)">Отмена</NButton>
                <NButton type="primary" @click="handleConfirm">Добавить</NButton>
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { Utils } from '@/shared/services/utils'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
    'update:show': [value: boolean]
    confirmed: [name: string]
}>()

const usersStore = useUsersStore()
const formRef = ref<FormInst | null>(null)
const isPhoneFocused = ref<boolean>(false)

const form = ref({ name: '', phone: '' })

const maskedPhone = computed<string>(() =>
    form.value.phone ? Utils.maskPhone(form.value.phone) : ''
)

const rules: FormRules = {
    name: [{ required: true, message: 'Введите имя', trigger: 'blur' }],
    phone: [
        { required: true, message: 'Введите номер телефона', trigger: 'blur' },
        { min: 4, message: 'Минимум 4 символа', trigger: 'blur' }
    ]
}

watch(
    () => props.show,
    (val) => {
        if (val) form.value = { name: '', phone: '' }
    }
)

const handleConfirm = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        usersStore.addUser({
            name: form.value.name,
            phone: Utils.maskPhone(form.value.phone)
        })

        emit('confirmed', form.value.name)
        emit('update:show', false)
    } catch {
        // ошибки валидации обрабатывает NForm
    }
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

.add-user-modal {
    width: calc(100vw - 32px);
    max-width: 360px;

    &__form {
        margin-bottom: 8px;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
}
</style>
