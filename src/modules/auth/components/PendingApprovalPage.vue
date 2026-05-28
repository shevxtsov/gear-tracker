<template>
    <div class="pending-page">
        <div class="pending-page__content">
            <NIcon size="64" color="#f0a020" class="pending-page__icon">
                <TimeOutline />
            </NIcon>
            <h1 class="pending-page__title">Аккаунт на проверке</h1>
            <p class="pending-page__text">
                Ваш аккаунт ожидает подтверждения администратором.<br />
                Обратитесь к администратору для ускорения процесса.
            </p>
            <NButton type="primary" @click="handleLogout">Выйти</NButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { TimeOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useGearStore } from '@/modules/gear/stores/gear.store'

const router = useRouter()
const authStore = useAuthStore()
const gearStore = useGearStore()

const handleLogout = async (): Promise<void> => {
    await authStore.logout()
    gearStore.reset()
    router.push({ name: 'dashboard' })
}
</script>

<style lang="scss" scoped>
.pending-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100dvh - 56px);

    &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
        max-width: 320px;
        padding: 32px 16px;
    }

    &__icon {
        opacity: 0.9;
    }

    &__title {
        font-size: 22px;
        font-weight: 600;
        margin: 0;
    }

    &__text {
        font-size: 14px;
        opacity: 0.6;
        line-height: 1.6;
        margin: 0;
    }
}
</style>
