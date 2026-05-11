import { ref } from 'vue'

const loginDrawerOpen = ref(false)

export const useAuthDrawer = () => {
    const openLogin = (): void => { loginDrawerOpen.value = true }
    const closeLogin = (): void => { loginDrawerOpen.value = false }

    return { loginDrawerOpen, openLogin, closeLogin }
}
