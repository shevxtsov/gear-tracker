<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="add-user-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Имя" path="name">
            <NInput
                v-model:value="form.name"
                placeholder=""
                :disabled="isSubmitting"
            />
        </NFormItem>

        <NFormItem label="Почта" path="email">
            <NInput
                v-model:value="form.email"
                placeholder=""
                :input-props="{ type: 'email', autocomplete: 'off' }"
                :disabled="isSubmitting"
            />
        </NFormItem>

        <NFormItem label="Номер телефона" path="phone">
            <NInput
                :value="isPhoneFocused ? form.phone : maskedPhone"
                placeholder=""
                :disabled="isSubmitting"
                @focus="isPhoneFocused = true"
                @blur="isPhoneFocused = false"
                @update:value="form.phone = $event"
            />
        </NFormItem>

        <NFormItem label="Роль" path="role">
            <NSelect
                v-model:value="form.role"
                :options="ROLE_OPTIONS"
                :disabled="isSubmitting"
            />
        </NFormItem>

        <NText v-if="authError" type="error" class="add-user-form__error">
            {{ authError }}
        </NText>

        <NButton
            type="primary"
            attr-type="submit"
            :loading="isSubmitting"
            block
        >
            Добавить
        </NButton>
    </NForm>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NForm, NFormItem, NInput, NButton, NSelect, NText } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { AuthApi } from '@/modules/auth/api/auth.api'
import { ROLE_OPTIONS } from '@/modules/users/services/users.service'
import { Utils } from '@/shared/services/utils'
import type { UserRole, UserStatus } from '@/modules/users/types/users.types'

const emit = defineEmits<{ submitted: [] }>()

const usersStore = useUsersStore()

const DEFAULT_PASSWORD = 'Aa123456'

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)
const isPhoneFocused = ref<boolean>(false)
const authError = ref<string | null>(null)

const form = ref({ name: '', email: '', phone: '', role: 'user' as UserRole })

const maskedPhone = computed<string>(() =>
    form.value.phone ? Utils.maskPhone(form.value.phone) : ''
)

const rules: FormRules = {
    name: [{ required: true, message: 'Введите имя', trigger: 'blur' }],
    email: [
        { required: true, message: 'Введите почту', trigger: 'blur' },
        { type: 'email', message: 'Некорректный адрес почты', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: 'Введите номер телефона', trigger: 'blur' },
        { min: 4, message: 'Минимум 4 символа', trigger: 'blur' }
    ],
    role: [{ required: true, message: 'Выберите роль', trigger: 'change' }]
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        isSubmitting.value = true
        authError.value = null

        const uid = await AuthApi.createUserAccount(form.value.email, DEFAULT_PASSWORD)

        await usersStore.addUser(uid, {
            name: form.value.name,
            email: form.value.email,
            phone: Utils.maskPhone(form.value.phone),
            role: form.value.role,
            status: 'approved' as UserStatus
        })

        emit('submitted')
    } catch (e) {
        if (e instanceof Error) authError.value = e.message
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

.add-user-form {
    display: flex;
    flex-direction: column;

    &__error {
        display: block;
        margin-bottom: 16px;
    }
}
</style>
