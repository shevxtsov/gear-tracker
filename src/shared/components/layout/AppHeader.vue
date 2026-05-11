<template>
    <header class="app-header">
        <span class="app-header__logo" @click="router.push({ name: 'dashboard' })">Gear Tracker</span>

        <NButton quaternary circle @click="menuOpen = true">
            <template #icon>
                <NIcon size="22"><MenuOutline /></NIcon>
            </template>
        </NButton>
    </header>

    <NDrawer v-model:show="menuOpen" placement="right" :width="280">
        <NDrawerContent :native-scrollbar="false">
            <div class="nav-menu">
                <div v-if="authStore.isAuthenticated" class="nav-menu__profile" @click="navigate('profile')">
                    <NAvatar round size="medium" class="nav-menu__profile-avatar">
                        {{ profileLetter }}
                    </NAvatar>
                    <div class="nav-menu__profile-info">
                        <span class="nav-menu__profile-name">{{ profileName }}</span>
                        <span class="nav-menu__profile-email">{{ authStore.currentUserEmail }}</span>
                    </div>
                </div>

                <nav class="nav-menu__nav">
                    <button
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('dashboard') }"
                        @click="navigate('dashboard')"
                    >
                        Главная
                    </button>
                    <button
                        v-if="hasAdminAccess"
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('users') }"
                        @click="navigate('users')"
                    >
                        Пользователи
                    </button>
                    <button
                        v-if="hasAdminAccess"
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('gear') }"
                        @click="navigate('gear')"
                    >
                        Оборудование
                    </button>
                    <button
                        v-if="hasAdminAccess"
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('categories') }"
                        @click="navigate('categories')"
                    >
                        Категории оборудования
                    </button>
                    <button
                        v-if="hasAdminAccess"
                        class="nav-menu__item"
                        :class="{ 'nav-menu__item--active': isActive('locations') }"
                        @click="navigate('locations')"
                    >
                        Места хранения
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
                        {{ hasAdminAccess ? 'Управление оборудованием' : 'Моё оборудование' }}
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

    <NDrawer v-model:show="takeGearDrawerOpen" placement="bottom" :height="520">
        <NDrawerContent title="Взять оборудование" :native-scrollbar="false">
            <TakeGearForm @submitted="takeGearDrawerOpen = false" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="loginDrawerOpen" placement="bottom" :height="320">
        <NDrawerContent title="Вход" :native-scrollbar="false">
            <LoginForm @register="openRegisterDrawer" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="registerDrawerOpen" placement="bottom" :height="560">
        <NDrawerContent title="Регистрация" :native-scrollbar="false">
            <RegisterForm @back="openLoginDrawer" @submitted="registerDrawerOpen = false" />
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NDrawer, NDrawerContent, NIcon, NAvatar } from 'naive-ui'
import { MenuOutline, LogOutOutline, LogInOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAuthDrawer } from '@/modules/auth/composables/use-auth-drawer'
import { useCurrentUser } from '@/modules/auth/composables/use-current-user'
import { useGearStore } from '@/modules/gear/stores/gear.store'
import LoginForm from '@/modules/auth/components/LoginForm.vue'
import RegisterForm from '@/modules/auth/components/RegisterForm.vue'
import TakeGearForm from '@/modules/gear/components/TakeGearForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { loginDrawerOpen, closeLogin } = useAuthDrawer()
const gearStore = useGearStore()
const { currentUser, hasAdminAccess } = useCurrentUser()

const profileLetter = computed(() =>
    (currentUser.value?.name ?? authStore.currentUserEmail ?? '?')[0].toUpperCase()
)

const profileName = computed(() => currentUser.value?.name ?? '')

const menuOpen = ref<boolean>(false)
const registerDrawerOpen = ref<boolean>(false)
const takeGearDrawerOpen = ref<boolean>(false)

const isActive = (name: string): boolean => route.name === name

const navigate = (name: string): void => {
    router.push({ name })
    menuOpen.value = false
}

const openLoginDrawer = (): void => {
    menuOpen.value = false
    registerDrawerOpen.value = false
    loginDrawerOpen.value = true
}

const openRegisterDrawer = (): void => {
    loginDrawerOpen.value = false
    registerDrawerOpen.value = true
}

const openTakeGearDrawer = (): void => {
    menuOpen.value = false
    takeGearDrawerOpen.value = true
}

const handleLogout = (): void => {
    authStore.logout()
    gearStore.reset()
    menuOpen.value = false
    router.push({ name: 'dashboard' })
}

watch(
    () => authStore.isAuthenticated,
    (isAuthenticated: boolean) => {
        if (isAuthenticated) {
            closeLogin()
        }
    }
)
</script>

<style lang="scss" scoped>
.app-header {
    position: relative;
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
        cursor: pointer;
    }
}

.nav-menu {
    display: flex;
    flex-direction: column;
    height: 100%;

    &__profile {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 8px;
        margin-bottom: 8px;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
            background-color: rgba(255, 255, 255, 0.06);
        }
    }

    &__profile-avatar {
        font-size: 15px;
        font-weight: 600;
        flex-shrink: 0;
    }

    &__profile-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    &__profile-name {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__profile-email {
        font-size: 11px;
        opacity: 0.45;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

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
