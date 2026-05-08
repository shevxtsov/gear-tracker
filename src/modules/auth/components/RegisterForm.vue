<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="register-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Имя" path="name">
            <NInput
                v-model:value="form.name"
                placeholder=""
                :disabled="authStore.isLoading"
                :input-props="{ autocomplete: 'off' }"
            />
        </NFormItem>

        <NFormItem label="Email" path="email">
            <NInput
                v-model:value="form.email"
                placeholder=""
                :disabled="authStore.isLoading"
                :input-props="{ type: 'email', autocomplete: 'off' }"
            />
        </NFormItem>

        <NFormItem label="Номер телефона" path="phone">
            <NInput
                :value="isPhoneFocused ? form.phone : maskedPhone"
                placeholder=""
                :disabled="authStore.isLoading"
                @focus="isPhoneFocused = true"
                @blur="isPhoneFocused = false"
                @update:value="form.phone = $event"
            />
        </NFormItem>

        <NFormItem label="Пароль" path="password">
            <NInput
                v-model:value="form.password"
                type="password"
                placeholder="••••••"
                show-password-on="click"
                :disabled="authStore.isLoading"
                :input-props="{ autocomplete: 'new-password' }"
            />
        </NFormItem>

        <NFormItem label="Подтверждение пароля" path="confirmPassword">
            <NInput
                v-model:value="form.confirmPassword"
                type="password"
                placeholder="••••••"
                show-password-on="click"
                :disabled="authStore.isLoading"
                :input-props="{ autocomplete: 'new-password' }"
            />
        </NFormItem>

        <NText v-if="authStore.error" type="error" class="register-form__error">
            {{ authStore.error }}
        </NText>

        <NButton
            type="primary"
            attr-type="submit"
            :loading="authStore.isLoading"
            block
        >
            Зарегистрироваться
        </NButton>

        <NButton text block class="register-form__back" @click="emit('back')">
            Уже есть аккаунт? Войти
        </NButton>
    </NForm>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NForm, NFormItem, NInput, NButton, NText } from 'naive-ui'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { Utils } from '@/shared/services/utils'

const emit = defineEmits<{ back: [] }>()

const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)
const isPhoneFocused = ref<boolean>(false)

const form = ref({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
})

const maskedPhone = computed<string>(() =>
    form.value.phone ? Utils.maskPhone(form.value.phone) : ''
)

const validateConfirmPassword: FormItemRule['validator'] = (_, value) => {
    if (!value) return new Error('Подтвердите пароль')
    if (value !== form.value.password) return new Error('Пароли не совпадают')
    return true
}

const rules: FormRules = {
    name: [{ required: true, message: 'Введите имя', trigger: 'blur' }],
    email: [
        { required: true, message: 'Введите email', trigger: 'blur' },
        { type: 'email', message: 'Некорректный email', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: 'Введите номер телефона', trigger: 'blur' },
        { min: 4, message: 'Минимум 4 символа', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Введите пароль', trigger: 'blur' },
        { min: 6, message: 'Минимум 6 символов', trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        await authStore.register({
            name: form.value.name,
            email: form.value.email,
            phone: Utils.maskPhone(form.value.phone),
            role: 'user',
            password: form.value.password
        })
    } catch {
        // ошибки валидации обрабатывает NForm
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

.register-form {
    display: flex;
    flex-direction: column;

    &__error {
        display: block;
        margin-bottom: 16px;
    }

    &__back {
        margin-top: 8px;
        opacity: 0.6;
    }
}
</style>
