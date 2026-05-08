<template>
    <header class="app-header">
        <span class="app-header__logo">Gear Tracker</span>

        <NButton quaternary circle @click="menuOpen = true">
            <template #icon>
                <NIcon size="22"><MenuOutline /></NIcon>
            </template>
        </NButton>
    </header>

    <NDrawer v-model:show="menuOpen" placement="right" :width="280">
        <NDrawerContent :native-scrollbar="false">
            <div class="nav-menu">
                <nav class="nav-menu__nav">
                    <button
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('dashboard') }"
                        @click="navigate('dashboard')"
                    >
                        Обзор
                    </button>
                    <button
                        v-if="authStore.isAuthenticated"
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('gear') }"
                        @click="navigate('gear')"
                    >
                        Оборудование
                    </button>
                    <button
                        v-if="authStore.isAuthenticated"
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('users') }"
                        @click="navigate('users')"
                    >
                        Пользователи
                    </button>
                </nav>

                <div class="nav-menu__actions">
                    <NButton
                        v-if="authStore.isAuthenticated"
                        type="primary"
                        block
                        @click="openTakeGearDrawer"
                    >
                        Взять оборудование
                    </NButton>

                    <NButton
                        v-if="authStore.isAuthenticated"
                        block
                        @click="navigate('my-gear')"
                    >
                        Моё оборудование
                    </NButton>

                    <NButton
                        v-if="authStore.isAuthenticated"
                        block
                        @click="handleLogout"
                    >
                        <template #icon>
                            <NIcon><LogOutOutline /></NIcon>
                        </template>
                        Выйти
                    </NButton>
                </div>

                <div v-if="!authStore.isAuthenticated" class="nav-menu__bottom">
                    <NButton block @click="openLoginDrawer">
                        <template #icon>
                            <NIcon><LogInOutline /></NIcon>
                        </template>
                        Войти
                    </NButton>
                </div>
            </div>
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="takeGearDrawerOpen" placement="bottom" :height="420">
        <NDrawerContent title="Взять оборудование" :native-scrollbar="false">
            <TakeGearForm @submitted="takeGearDrawerOpen = false" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="loginDrawerOpen" placement="bottom" :height="320">
        <NDrawerContent title="Управление" :native-scrollbar="false">
            <LoginForm />
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NDrawer, NDrawerContent, NIcon } from 'naive-ui'
import { MenuOutline, LogOutOutline, LogInOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import LoginForm from '@/modules/auth/components/LoginForm.vue'
import TakeGearForm from '@/modules/gear/components/TakeGearForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuOpen = ref<boolean>(false)
const loginDrawerOpen = ref<boolean>(false)
const takeGearDrawerOpen = ref<boolean>(false)

const isActive = (name: string): boolean => route.name === name

const navigate = (name: string): void => {
    router.push({ name })
    menuOpen.value = false
}

const openLoginDrawer = (): void => {
    menuOpen.value = false
    loginDrawerOpen.value = true
}

const openTakeGearDrawer = (): void => {
    menuOpen.value = false
    takeGearDrawerOpen.value = true
}

const handleLogout = (): void => {
    authStore.logout()
    menuOpen.value = false
    router.push({ name: 'dashboard' })
}

watch(
    () => authStore.isAuthenticated,
    (isAuthenticated: boolean) => {
        if (isAuthenticated) {
            loginDrawerOpen.value = false
        }
    }
)
</script>

<style lang="scss" scoped>
.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 56px;
    background-color: #18181c;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);

    &__logo {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
    }
}

.nav-menu {
    display: flex;
    flex-direction: column;
    height: 100%;

    &__nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    &__item {
        display: block;
        width: 100%;
        padding: 12px 8px;
        background: none;
        border: none;
        border-radius: 6px;
        color: inherit;
        font-size: 15px;
        text-align: left;
        cursor: pointer;

        &:hover {
            background-color: rgba(255, 255, 255, 0.06);
        }

        &--active {
            color: #63e2b7;
            background-color: rgba(99, 226, 183, 0.08);
        }
    }

    &__actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 24px;
    }

    &__bottom {
        margin-top: auto;
        padding-top: 16px;
    }
}
</style>
