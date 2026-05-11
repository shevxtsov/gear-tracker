<template>
    <div class="locations-page">
        <div class="locations-page__header">
            <div class="locations-page__header-left">
                <NButton quaternary circle @click="router.push({ name: 'dashboard' })">
                    <template #icon>
                        <NIcon><ArrowBackOutline /></NIcon>
                    </template>
                </NButton>
                <h1 class="locations-page__title">Места хранения</h1>
            </div>

            <NButton type="primary" size="small" @click="drawerOpen = true">
                <template #icon>
                    <NIcon><AddOutline /></NIcon>
                </template>
                Добавить
            </NButton>
        </div>

        <NSpin v-if="locationsStore.isLoading" class="locations-page__spinner" />

        <NAlert v-else-if="locationsStore.error" type="error" :title="locationsStore.error" />

        <template v-else>
            <div v-if="locationsStore.items.length" class="locations-list">
                <NCard
                    v-for="loc in locationsStore.items"
                    :key="loc.id"
                    size="small"
                >
                    <div class="location-item">
                        <span class="location-item__name">{{ loc.name }}</span>

                        <NPopconfirm
                            positive-text="Удалить"
                            negative-text="Отмена"
                            @positive-click="locationsStore.remove(loc.id)"
                        >
                            <template #trigger>
                                <NButton quaternary circle size="small">
                                    <template #icon>
                                        <NIcon color="#e88080"><TrashOutline /></NIcon>
                                    </template>
                                </NButton>
                            </template>
                            Удалить «{{ loc.name }}»?
                        </NPopconfirm>
                    </div>
                </NCard>
            </div>

            <p v-else class="locations-page__empty">Нет мест хранения</p>
        </template>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="200">
        <NDrawerContent title="Новое место хранения" :native-scrollbar="false">
            <span class="focus-absorber" tabindex="0" aria-hidden="true" />

            <NForm
                ref="formRef"
                :model="form"
                :rules="rules"
                class="add-location-form"
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
import { useLocationsStore } from '@/modules/locations/stores/locations.store'

const router = useRouter()
const locationsStore = useLocationsStore()

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
        await locationsStore.add(form.value.name.trim())
        form.value.name = ''
        drawerOpen.value = false
    } catch {
        // валидация обрабатывается NForm
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    if (!locationsStore.items.length) await locationsStore.fetchAll()
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

.locations-page {
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

.locations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.location-item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__name {
        font-size: 15px;
    }
}

.add-location-form {
    display: flex;
    flex-direction: column;
}
</style>
