<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="credentials"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Email" path="email">
            <NInput
                v-model:value="credentials.email"
                placeholder=""
                :disabled="authStore.isLoading"
                :input-props="{ autocomplete: 'off' }"
            />
        </NFormItem>

        <NFormItem label="Пароль" path="password">
            <NInput
                v-model:value="credentials.password"
                type="password"
                placeholder="••••••"
                show-password-on="click"
                :disabled="authStore.isLoading"
                :input-props="{ autocomplete: 'new-password' }"
            />
        </NFormItem>

        <NText v-if="authStore.error" type="error" class="login-form__error">
            {{ authStore.error }}
        </NText>

        <NButton
            type="primary"
            attr-type="submit"
            :loading="authStore.isLoading"
            block
        >
            Войти
        </NButton>
    </NForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NForm, NFormItem, NInput, NButton, NText } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import type { LoginCredentials } from '@/modules/auth/types/auth.types'

const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)

const credentials = ref<LoginCredentials>({
    email: '',
    password: ''
})

const rules: FormRules = {
    email: [
        { required: true, message: 'Введите email', trigger: 'blur' },
        { type: 'email', message: 'Некорректный email', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Введите пароль', trigger: 'blur' },
        { min: 4, message: 'Минимум 4 символа', trigger: 'blur' }
    ]
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        await authStore.login(credentials.value)
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

.login-form {
    &__error {
        display: block;
        margin-bottom: 16px;
    }
}
</style>
