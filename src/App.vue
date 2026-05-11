<template>
    <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
        <NMessageProvider>
            <div v-if="!authStore.isReady" class="app-loading">
                <NSpin size="large" />
            </div>

            <template v-else>
                <AppHeader />
                <main class="app-main">
                    <RouterView />
                </main>
            </template>
        </NMessageProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { NConfigProvider, NMessageProvider, NSpin, darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import AppHeader from '@/shared/components/layout/AppHeader.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useCurrentUser } from '@/modules/auth/composables/use-current-user'
import { HistoryCleanupService } from '@/modules/gear/services/history-cleanup.service'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const { hasAdminAccess } = useCurrentUser()

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) usersStore.fetchAll()
}, { immediate: true })

watch(hasAdminAccess, (isAdmin) => {
    if (isAdmin) HistoryCleanupService.runIfNeeded()
}, { immediate: true })

const themeOverrides: GlobalThemeOverrides = {
    Input: {
        color: 'rgba(255, 255, 255, 0.08)',
        colorFocus: 'rgba(255, 255, 255, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderFocus: '1px solid #63e2b7',
        borderHover: '1px solid rgba(255, 255, 255, 0.3)'
    }
}
</script>

<style lang="scss">
@use '@/styles/main.scss';

.app-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;
}

.app-main {
    padding: 16px;
}
</style>
