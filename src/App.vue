<template>
    <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
        <NMessageProvider>
            <AppHeader />
            <main class="app-main">
                <RouterView />
            </main>
        </NMessageProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import AppHeader from '@/shared/components/layout/AppHeader.vue'

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

.app-main {
    padding: 16px;
}
</style>
