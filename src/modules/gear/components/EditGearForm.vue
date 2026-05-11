<template>
    <span class="focus-absorber" tabindex="0" aria-hidden="true" />

    <NForm
        ref="formRef"
        :model="form"
        :rules="rules"
        class="edit-gear-form"
        @submit.prevent="handleSubmit"
    >
        <NFormItem label="Название" path="name">
            <NInput
                v-model:value="form.name"
                placeholder=""
                :disabled="isSubmitting"
            />
        </NFormItem>

        <NFormItem label="Категория" path="category">
            <div class="field-row">
                <NSelect
                    v-model:value="form.category"
                    :options="categoryOptions"
                    :loading="categoriesStore.isLoading"
                    placeholder=""
                    filterable
                    :disabled="isSubmitting"
                />
                <NButton quaternary circle @click="showCategoryModal = true">
                    <template #icon>
                        <NIcon><AddOutline /></NIcon>
                    </template>
                </NButton>
            </div>
        </NFormItem>

        <NFormItem label="Место хранения" path="location">
            <div class="field-row">
                <NSelect
                    v-model:value="form.location"
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

        <NButton
            type="primary"
            attr-type="submit"
            :loading="isSubmitting"
            block
        >
            Сохранить
        </NButton>
    </NForm>

    <AddOptionModal
        v-model:show="showCategoryModal"
        title="Новая категория"
        @confirm="onConfirmCategory"
    />

    <AddOptionModal
        v-model:show="showLocationModal"
        title="Новое место хранения"
        @confirm="onConfirmLocation"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NButton, NIcon } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { useLocationsStore } from '@/modules/locations/stores/locations.store'
import AddOptionModal from '@/shared/components/AddOptionModal.vue'
import type { GearItem } from '@/modules/gear/types/gear.types'

const props = defineProps<{ item: GearItem }>()
const emit = defineEmits<{ submitted: [] }>()

const gearStore = useGearStore()
const categoriesStore = useCategoriesStore()
const locationsStore = useLocationsStore()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)
const showCategoryModal = ref<boolean>(false)
const showLocationModal = ref<boolean>(false)

const form = ref({
    name: props.item.name,
    category: props.item.category,
    location: props.item.location
})

const categoryOptions = computed<SelectOption[]>(() =>
    categoriesStore.names.map((c) => ({ label: c, value: c }))
)

const locationOptions = computed<SelectOption[]>(() =>
    locationsStore.names.map((l) => ({ label: l, value: l }))
)

const rules: FormRules = {
    name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
    category: [{ required: true, message: 'Выберите категорию', trigger: 'change' }],
    location: [{ required: true, message: 'Выберите место хранения', trigger: 'change' }]
}

const onConfirmCategory = async (value: string): Promise<void> => {
    await categoriesStore.add(value)
    form.value.category = value
}

const onConfirmLocation = async (value: string): Promise<void> => {
    await locationsStore.add(value)
    form.value.location = value
}

onMounted(() => {
    if (!categoriesStore.items.length) categoriesStore.fetchAll()
    if (!locationsStore.items.length) locationsStore.fetchAll()
})

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()

        isSubmitting.value = true

        await gearStore.updateItem(props.item.id, {
            name: form.value.name,
            category: form.value.category,
            location: form.value.location
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

.edit-gear-form {
    display: flex;
    flex-direction: column;
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
