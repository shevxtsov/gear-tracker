<template>
    <div class="users-page">
        <div class="users-page__header">
            <h1 class="users-page__title">Пользователи</h1>

            <NButton type="primary" size="small" @click="drawerOpen = true">
                <template #icon>
                    <NIcon><AddOutline /></NIcon>
                </template>
                Добавить
            </NButton>
        </div>

        <div class="users-page__toolbar">
            <NInput
                v-model:value="searchQuery"
                placeholder="Поиск по имени"
                clearable
                :input-props="{ autocomplete: 'off' }"
            >
                <template #prefix>
                    <NIcon><SearchOutline /></NIcon>
                </template>
            </NInput>

            <NButton
                :type="isSorted ? 'primary' : 'default'"
                @click="isSorted = !isSorted"
            >
                <template #icon>
                    <NIcon><SwapVerticalOutline /></NIcon>
                </template>
                А–Я
            </NButton>
        </div>

        <NSpin v-if="usersStore.isLoading" class="users-page__spinner" />

        <NAlert
            v-else-if="usersStore.error"
            type="error"
            :title="usersStore.error"
        />

        <template v-else>
            <div v-if="visibleUsers.length" class="users-list">
                <NCard
                    v-for="user in visibleUsers"
                    :key="user.id"
                    size="small"
                >
                    <div class="user-card">
                        <NAvatar round size="medium">
                            {{ initials(user.name) }}
                        </NAvatar>

                        <div class="user-card__info">
                            <div class="user-card__name-row">
                                <span class="user-card__name">{{ user.name }}</span>
                                <NTag size="small" :type="roleTagType(user.role)">
                                    {{ UsersService.getRoleLabel(user.role) }}
                                </NTag>
                            </div>
                            <span class="user-card__phone">{{ user.phone }}</span>
                        </div>

                        <div class="user-card__actions">
                            <NButton
                                quaternary
                                circle
                                size="small"
                                @click="openEdit(user)"
                            >
                                <template #icon>
                                    <NIcon><CreateOutline /></NIcon>
                                </template>
                            </NButton>

                            <NPopconfirm positive-text="Подтвердить" negative-text="Отмена" @positive-click="usersStore.deleteUser(user.id)">
                                <template #trigger>
                                    <NButton quaternary circle size="small">
                                        <template #icon>
                                            <NIcon color="#e88080"><TrashOutline /></NIcon>
                                        </template>
                                    </NButton>
                                </template>
                                Удалить «{{ user.name }}»?
                            </NPopconfirm>
                        </div>
                    </div>
                </NCard>
            </div>

            <p v-else class="users-page__empty">Ничего не найдено</p>
        </template>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="320">
        <NDrawerContent title="Новый пользователь" :native-scrollbar="false">
            <AddUserForm @submitted="drawerOpen = false" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="editDrawerOpen" placement="bottom" :height="320">
        <NDrawerContent title="Редактировать" :native-scrollbar="false">
            <EditUserForm
                v-if="editingUser"
                :user="editingUser"
                @submitted="editDrawerOpen = false"
            />
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    NSpin, NAlert, NCard, NAvatar, NButton, NIcon,
    NInput, NDrawer, NDrawerContent, NPopconfirm, NTag
} from 'naive-ui'
import { AddOutline, SearchOutline, SwapVerticalOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { UsersService } from '@/modules/users/services/users.service'
import AddUserForm from '@/modules/users/components/AddUserForm.vue'
import EditUserForm from '@/modules/users/components/EditUserForm.vue'
import type { User, UserRole } from '@/modules/users/types/users.types'

const usersStore = useUsersStore()

const drawerOpen = ref<boolean>(false)
const editDrawerOpen = ref<boolean>(false)
const editingUser = ref<User | null>(null)
const searchQuery = ref<string>('')
const isSorted = ref<boolean>(false)

const visibleUsers = computed<User[]>(() => {
    let result = usersStore.users

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim().toLowerCase()

        result = result.filter((u) => u.name.toLowerCase().includes(query))
    }

    if (isSorted.value) {
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }

    return result
})

const initials = UsersService.getInitials

const roleTagType = (role: UserRole) => {
    if (role === 'admin') return 'error'
    if (role === 'moderator') return 'warning'
    return 'default'
}

const openEdit = (user: User): void => {
    editingUser.value = user
    editDrawerOpen.value = true
}

onMounted(async () => {
    await usersStore.fetchAll()
})
</script>

<style lang="scss" scoped>
.users-page {
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    &__title {
        font-size: 24px;
        font-weight: 600;
    }

    &__toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
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

.users-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.user-card {
    display: flex;
    align-items: center;
    gap: 12px;

    &__info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }

    &__name-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    &__name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__phone {
        font-size: 12px;
        opacity: 0.5;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }
}
</style>
