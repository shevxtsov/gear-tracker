<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="take-gear-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Оборудование" path="gearId">
            <NSelect
                v-model:value="form.gearId"
                :options="availableGearOptions"
                placeholder=""
                filterable
                :disabled="!!props.initialGearId"
            />
        </NFormItem>

        <NFormItem label="Куда берется" path="takenTo">
            <div class="field-row">
                <NSelect
                    v-model:value="form.takenTo"
                    :options="locationOptions"
                    :loading="locationsStore.isLoading"
                    placeholder=""
                    filterable
                />
                <NButton quaternary circle @click="showLocationModal = true">
                    <template #icon>
                        <NIcon><AddOutline /></NIcon>
                    </template>
                </NButton>
            </div>
        </NFormItem>

        <NFormItem label="Дата и время" path="takenAt">
            <NDatePicker
                v-model:value="form.takenAt"
                type="datetime"
                class="take-gear-form__datepicker"
            />
        </NFormItem>

        <NFormItem label="Кто берет" path="takenBy">
            <NSelect
                v-model:value="form.takenBy"
                :options="userOptions"
                placeholder=""
                filterable
                :disabled="!hasAdminAccess && !!currentUser"
            />
        </NFormItem>

        <NButton
            type="primary"
            attr-type="submit"
            :loading="isSubmitting"
            block
        >
            Взять
        </NButton>
    </NForm>

    <AddOptionModal
        v-model:show="showLocationModal"
        title="Новое место"
        @confirm="onConfirmLocation"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { NForm, NFormItem, NSelect, NButton, NDatePicker, NIcon } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useLocationsStore } from '@/modules/locations/stores/locations.store'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useCurrentUser } from '@/modules/auth/composables/use-current-user'
import AddOptionModal from '@/shared/components/AddOptionModal.vue'

const props = defineProps<{ initialGearId?: string }>()
const emit = defineEmits<{ submitted: [] }>()

const gearStore = useGearStore()
const locationsStore = useLocationsStore()
const usersStore = useUsersStore()
const { currentUser, hasAdminAccess } = useCurrentUser()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)
const showLocationModal = ref<boolean>(false)

const form = ref({
    gearId: props.initialGearId ?? null as string | null,
    takenTo: null as string | null,
    takenAt: Date.now() as number | null,
    takenBy: currentUser.value?.name ?? null as string | null
})

watch(currentUser, (user) => {
    if (user && !hasAdminAccess.value) form.value.takenBy = user.name
})

onMounted(() => {
    usersStore.fetchAll()
    if (!locationsStore.items.length) locationsStore.fetchAll()
})

const availableGearOptions = computed<SelectOption[]>(() =>
    gearStore.items
        .filter((i) => i.available)
        .map((i) => ({ label: i.name, value: i.id }))
)

const locationOptions = computed<SelectOption[]>(() =>
    locationsStore.names.map((l) => ({ label: l, value: l }))
)

const userOptions = computed<SelectOption[]>(() =>
    usersStore.users.map((u) => ({ label: u.name, value: u.name }))
)

const rules: FormRules = {
    gearId: [{ required: true, message: 'Выберите оборудование', trigger: 'change' }],
    takenTo: [{ required: true, message: 'Укажите место', trigger: 'change' }],
    takenAt: [{ required: true, type: 'number', message: 'Укажите дату и время', trigger: 'change' }],
    takenBy: [{ required: true, message: 'Укажите кто берет', trigger: 'change' }]
}

const onConfirmLocation = async (value: string): Promise<void> => {
    await locationsStore.add(value)
    form.value.takenTo = value
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        isSubmitting.value = true

        await gearStore.takeItem(form.value.gearId!, {
            takenBy: form.value.takenBy!,
            takenTo: form.value.takenTo!,
            takenAt: form.value.takenAt!
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

.take-gear-form {
    display: flex;
    flex-direction: column;

    &__datepicker {
        width: 100%;
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
