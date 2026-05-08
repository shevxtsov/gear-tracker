<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="edit-user-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Имя" path="name">
            <NInput
                v-model:value="form.name"
                placeholder=""
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
                :options="roleOptions"
                :disabled="isSubmitting || props.user.role === 'admin'"
            />
        </NFormItem>

        <NButton
            type="primary"
            attr-type="submit"
            :loading="isSubmitting"
            block
        >
            Сохранить
        </NButton>
    </NForm>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NForm, NFormItem, NInput, NButton, NSelect } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { UsersService, ROLE_OPTIONS } from '@/modules/users/services/users.service'
import { Utils } from '@/shared/services/utils'
import type { User } from '@/modules/users/types/users.types'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ submitted: [] }>()

const usersStore = useUsersStore()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)
const isPhoneFocused = ref<boolean>(false)

const form = ref({ name: props.user.name, phone: props.user.phone, role: props.user.role })

const maskedPhone = computed<string>(() =>
    form.value.phone ? Utils.maskPhone(form.value.phone) : ''
)

const roleOptions = computed(() =>
    props.user.role === 'admin'
        ? [{ label: UsersService.getRoleLabel('admin'), value: 'admin' }]
        : ROLE_OPTIONS
)

const rules: FormRules = {
    name: [{ required: true, message: 'Введите имя', trigger: 'blur' }],
    phone: [
        { required: true, message: 'Введите номер телефона', trigger: 'blur' },
        { min: 4, message: 'Минимум 4 символа', trigger: 'blur' }
    ]
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        isSubmitting.value = true

        await usersStore.updateUser(props.user.id, {
            name: form.value.name,
            phone: Utils.maskPhone(form.value.phone),
            role: form.value.role
        })

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

.edit-user-form {
    display: flex;
    flex-direction: column;
}
</style>
