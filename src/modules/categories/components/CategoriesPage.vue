<template>
    <div class="categories-page">
        <div class="categories-page__header">
            <div class="categories-page__header-left">
                <NButton quaternary circle @click="router.push({ name: 'dashboard' })">
                    <template #icon>
                        <NIcon><ArrowBackOutline /></NIcon>
                    </template>
                </NButton>
                <h1 class="categories-page__title">Категории оборудования</h1>
            </div>

            <NButton type="primary" size="small" @click="drawerOpen = true">
                <template #icon>
                    <NIcon><AddOutline /></NIcon>
                </template>
                Добавить
            </NButton>
        </div>

        <NSpin v-if="categoriesStore.isLoading" class="categories-page__spinner" />

        <NAlert v-else-if="categoriesStore.error" type="error" :title="categoriesStore.error" />

        <template v-else>
            <div v-if="categoriesStore.items.length" class="categories-list">
                <NCard
                    v-for="cat in categoriesStore.items"
                    :key="cat.id"
                    size="small"
                >
                    <div class="category-item">
                        <span class="category-item__name">{{ cat.name }}</span>

                        <NPopconfirm
                            positive-text="Удалить"
                            negative-text="Отмена"
                            @positive-click="categoriesStore.remove(cat.id)"
                        >
                            <template #trigger>
                                <NButton quaternary circle size="small">
                                    <template #icon>
                                        <NIcon color="#e88080"><TrashOutline /></NIcon>
                                    </template>
                                </NButton>
                            </template>
                            Удалить «{{ cat.name }}»?
                        </NPopconfirm>
                    </div>
                </NCard>
            </div>

            <p v-else class="categories-page__empty">Нет категорий</p>
        </template>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="200">
        <NDrawerContent title="Новая категория" :native-scrollbar="false">
            <span class="focus-absorber" tabindex="0" aria-hidden="true" />

            <NForm
                ref="formRef"
                :model="form"
                :rules="rules"
                class="add-category-form"
                @submit.prevent="handleSubmit"
            >
                <NFormItem label="Название" path="name">
                    <NInput
                        v-model:value="form.name"
                        placeholder=""
                        :disabled="isSubmitting"
                    />
                </NFormItem>

                <NButton
                    type="primary"
                    attr-type="submit"
                    :loading="isSubmitting"
                    block
                >
                    Добавить
                </NButton>
            </NForm>
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    NSpin, NAlert, NCard, NButton, NIcon,
    NDrawer, NDrawerContent, NForm, NFormItem, NInput, NPopconfirm
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { ArrowBackOutline, AddOutline, TrashOutline } from '@vicons/ionicons5'
import { useCategoriesStore } from '@/modules/categories/stores/categories.store'

const router = useRouter()
const categoriesStore = useCategoriesStore()

const drawerOpen = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInst | null>(null)
const form = ref({ name: '' })

const rules: FormRules = {
    name: [{ required: true, message: 'Введите название', trigger: 'blur' }]
}

const handleSubmit = async (): Promise<void> => {
    try {
        await formRef.value?.validate()
        isSubmitting.value = true
        await categoriesStore.add(form.value.name.trim())
        form.value.name = ''
        drawerOpen.value = false
    } catch {
        // валидация обрабатывается NForm
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    if (!categoriesStore.items.length) await categoriesStore.fetchAll()
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

.categories-page {
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }

    &__header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__title {
        font-size: 24px;
        font-weight: 600;
    }

    &__spinner {
        display: flex;
        justify-content: center;
        padding: 32px 0;
    }

    &__empty {
        padding: 32px 0;
        text-align: center;
        opacity: 0.4;
    }
}

.categories-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__name {
        font-size: 15px;
    }
}

.add-category-form {
    display: flex;
    flex-direction: column;
}
</style>
