<template>
    <div class="profile-page">
        <h1 class="profile-page__title">Профиль</h1>

        <NSpin v-if="isLoading" class="profile-page__spinner" />

        <template v-else>
            <div class="profile-card">
                <NAvatar round size="large" class="profile-card__avatar">
                    {{ initials }}
                </NAvatar>

                <div class="profile-card__name">{{ displayName }}</div>

                <NTag :type="roleTagType" size="small" round class="profile-card__role">
                    {{ roleLabel }}
                </NTag>
            </div>

            <NCard size="small" class="profile-info">
                <div v-if="currentUser" class="profile-info__row">
                    <span class="profile-info__label">Имя</span>
                    <span>{{ currentUser.name }}</span>
                </div>
                <div class="profile-info__row">
                    <span class="profile-info__label">Email</span>
                    <span>{{ authStore.currentUserEmail }}</span>
                </div>
                <div v-if="currentUser" class="profile-info__row">
                    <span class="profile-info__label">Телефон</span>
                    <span>{{ currentUser.phone }}</span>
                </div>
                <div class="profile-info__row">
                    <span class="profile-info__label">Роль</span>
                    <span>{{ roleLabel }}</span>
                </div>
            </NCard>

            <NButton block class="profile-page__change-password" @click="drawerOpen = true">
                Изменить пароль
            </NButton>
        </template>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="380">
        <NDrawerContent title="Изменить пароль" :native-scrollbar="false">
            <span class="focus-absorber" tabindex="0" aria-hidden="true" />

            <NForm
                ref="formRef"
                :model="form"
                :rules="rules"
                class="change-password-form"
                @submit.prevent="handleSubmit"
            >
                <NFormItem label="Текущий пароль" path="currentPassword">
                    <NInput
                        v-model:value="form.currentPassword"
                        type="password"
                        placeholder="••••••"
                        show-password-on="click"
                        :disabled="isSubmitting"
                        :input-props="{ autocomplete: 'current-password' }"
                    />
                </NFormItem>

                <NFormItem label="Новый пароль" path="newPassword">
                    <NInput
                        v-model:value="form.newPassword"
                        type="password"
                        placeholder="••••••"
                        show-password-on="click"
                        :disabled="isSubmitting"
                        :input-props="{ autocomplete: 'new-password' }"
                    />
                </NFormItem>

                <NFormItem label="Подтверждение пароля" path="confirmPassword">
                    <NInput
                        v-model:value="form.confirmPassword"
                        type="password"
                        placeholder="••••••"
                        show-password-on="click"
                        :disabled="isSubmitting"
                        :input-props="{ autocomplete: 'new-password' }"
                    />
                </NFormItem>

                <NText v-if="error" type="error" class="change-password-form__error">
                    {{ error }}
                </NText>

                <NButton
                    type="primary"
                    attr-type="submit"
                    :loading="isSubmitting"
                    block
                >
                    Сохранить
                </NButton>
            </NForm>
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NAvatar, NCard, NTag, NSpin, NButton, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NText } from 'naive-ui'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { AuthApi } from '@/modules/auth/api/auth.api'
import { UsersService } from '@/modules/users/services/users.service'

const usersStore = useUsersStore()
const authStore = useAuthStore()

const drawerOpen = ref(false)
const formRef = ref<FormInst | null>(null)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

const isLoading = computed(() => usersStore.isLoading)

const currentUser = computed(() =>
    usersStore.users.find((u) => u.email === authStore.currentUserEmail) ?? null
)

const displayName = computed(() =>
    currentUser.value?.name ?? authStore.currentUserEmail ?? '?'
)

const initials = computed(() =>
    currentUser.value
        ? UsersService.getInitials(currentUser.value.name)
        : (authStore.currentUserEmail?.[0] ?? '?').toUpperCase()
)

const roleLabel = computed(() =>
    currentUser.value ? UsersService.getRoleLabel(currentUser.value.role) : 'Администратор'
)

const roleTagType = computed(() => {
    const role = currentUser.value?.role
    if (!role || role === 'admin') return 'error'
    if (role === 'moderator') return 'warning'
    return 'default'
})

const validateConfirmPassword: FormItemRule['validator'] = (_, value) => {
    if (!value) return new Error('Подтвердите пароль')
    if (value !== form.value.newPassword) return new Error('Пароли не совпадают')
    return true
}

const rules: FormRules = {
    currentPassword: [{ required: true, message: 'Введите текущий пароль', trigger: 'blur' }],
    newPassword: [
        { required: true, message: 'Введите новый пароль', trigger: 'blur' },
        { min: 6, message: 'Минимум 6 символов', trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        isSubmitting.value = true
        error.value = null

        await AuthApi.changePassword(form.value.currentPassword, form.value.newPassword)

        drawerOpen.value = false
        form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    } catch (e) {
        if (e instanceof Error) error.value = e.message
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    if (!usersStore.users.length) {
        await usersStore.fetchAll()
    }
})
</script>

<style lang="scss" scoped>
.focus-absorber {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
}

.profile-page {
    &__title {
        margin-bottom: 24px;
        font-size: 24px;
        font-weight: 600;
    }

    &__spinner {
        display: flex;
        justify-content: center;
        padding: 32px 0;
    }

    &__change-password {
        margin-top: 16px;
    }
}

.profile-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;

    &__avatar {
        font-size: 22px;
        font-weight: 600;
    }

    &__name {
        font-size: 20px;
        font-weight: 600;
    }
}

.profile-info {
    &__row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;

        &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
    }

    &__label {
        font-size: 13px;
        opacity: 0.5;
    }
}

.change-password-form {
    display: flex;
    flex-direction: column;

    &__error {
        display: block;
        margin-bottom: 16px;
    }
}
</style>
