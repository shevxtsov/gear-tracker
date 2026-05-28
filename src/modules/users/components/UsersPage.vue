<template>
    <div class="users-page">
        <div class="users-page__header">
            <div class="users-page__header-left">
                <NButton quaternary circle @click="router.push({ name: 'dashboard' })">
                    <template #icon>
                        <NIcon><ArrowBackOutline /></NIcon>
                    </template>
                </NButton>
                <h1 class="users-page__title">Пользователи</h1>
            </div>

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

        <div class="users-page__status-filter">
            <NButton
                size="small"
                :type="statusFilter === null ? 'primary' : 'default'"
                @click="statusFilter = null"
            >
                Все
            </NButton>
            <NButton
                size="small"
                :type="statusFilter === 'pending' ? 'warning' : 'default'"
                @click="statusFilter = 'pending'"
            >
                Ожидают
                <NTag
                    v-if="pendingCount > 0"
                    size="tiny"
                    type="warning"
                    round
                    style="margin-left: 6px;"
                >
                    {{ pendingCount }}
                </NTag>
            </NButton>
            <NButton
                size="small"
                :type="statusFilter === 'approved' ? 'success' : 'default'"
                @click="statusFilter = 'approved'"
            >
                Одобренные
            </NButton>
            <NButton
                size="small"
                :type="statusFilter === 'blocked' ? 'error' : 'default'"
                @click="statusFilter = 'blocked'"
            >
                Заблокированные
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
                                <NTag v-if="user.status !== 'approved'" size="small" :type="statusTagType(user.status)">
                                    {{ UsersService.getStatusLabel(user.status) }}
                                </NTag>
                            </div>
                            <span class="user-card__meta">{{ user.email }}</span>
                            <span class="user-card__meta">{{ user.phone }}</span>
                        </div>

                        <div class="user-card__actions">
                            <NDropdown
                                trigger="click"
                                :options="menuOptions(user)"
                                :disabled="usersStore.loadingIds.has(user.id)"
                                @select="(key) => handleMenuSelect(key, user)"
                            >
                                <NButton
                                    quaternary
                                    circle
                                    size="small"
                                    :loading="usersStore.loadingIds.has(user.id)"
                                    :disabled="usersStore.loadingIds.has(user.id)"
                                >
                                    <template #icon>
                                        <NIcon><EllipsisVertical /></NIcon>
                                    </template>
                                </NButton>
                            </NDropdown>
                        </div>
                    </div>
                </NCard>

                <NModal
                    v-model:show="deleteConfirmOpen"
                    preset="dialog"
                    type="error"
                    title="Удалить пользователя?"
                    :content="deletingUser ? `«${deletingUser.name}» будет удалён безвозвратно` : ''"
                    positive-text="Удалить"
                    negative-text="Отмена"
                    @positive-click="confirmDelete"
                />
            </div>

            <p v-else class="users-page__empty">Ничего не найдено</p>
        </template>
    </div>

    <NDrawer v-model:show="drawerOpen" placement="bottom" :height="460">
        <NDrawerContent title="Новый пользователь" :native-scrollbar="false">
            <AddUserForm @submitted="drawerOpen = false" />
        </NDrawerContent>
    </NDrawer>

    <NDrawer v-model:show="editDrawerOpen" placement="bottom" :height="460">
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
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
    NSpin, NAlert, NCard, NAvatar, NButton, NIcon,
    NInput, NDrawer, NDrawerContent, NDropdown, NModal, NTag
} from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import {
    AddOutline, SearchOutline, SwapVerticalOutline, ArrowBackOutline,
    EllipsisVertical, CreateOutline, TrashOutline, CheckmarkCircleOutline, BanOutline
} from '@vicons/ionicons5'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useCurrentUser } from '@/modules/auth/composables/use-current-user'
import { UsersService } from '@/modules/users/services/users.service'
import AddUserForm from '@/modules/users/components/AddUserForm.vue'
import EditUserForm from '@/modules/users/components/EditUserForm.vue'
import type { User, UserRole, UserStatus } from '@/modules/users/types/users.types'

const router = useRouter()
const usersStore = useUsersStore()
const { hasAdminAccess } = useCurrentUser()

const drawerOpen = ref<boolean>(false)
const editDrawerOpen = ref<boolean>(false)
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)
const deleteConfirmOpen = ref<boolean>(false)
const searchQuery = ref<string>('')
const isSorted = ref<boolean>(false)
const statusFilter = ref<UserStatus | null>(null)

const pendingCount = computed(() => usersStore.users.filter((u) => u.status === 'pending').length)

const visibleUsers = computed<User[]>(() => {
    let result = usersStore.users

    if (statusFilter.value) {
        result = result.filter((u) => u.status === statusFilter.value)
    }

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

const statusTagType = (status: UserStatus) => {
    if (status === 'pending') return 'warning'
    if (status === 'blocked') return 'error'
    return 'success'
}

const menuOptions = (user: User): DropdownOption[] => {
    const options: DropdownOption[] = []

    if (hasAdminAccess.value) {
        if (user.status !== 'approved') {
            options.push({
                label: 'Одобрить',
                key: 'approve',
                icon: () => h(NIcon, { color: '#63e2b7' }, { default: () => h(CheckmarkCircleOutline) })
            })
        }
        if (user.status !== 'blocked') {
            options.push({
                label: 'Заблокировать',
                key: 'block',
                icon: () => h(NIcon, { color: '#e88080' }, { default: () => h(BanOutline) })
            })
        }
        if (options.length > 0) {
            options.push({ type: 'divider', key: 'divider-status' })
        }
    }

    options.push({
        label: 'Редактировать',
        key: 'edit',
        icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
    })

    options.push({ type: 'divider', key: 'divider-delete' })

    options.push({
        label: 'Удалить',
        key: 'delete',
        icon: () => h(NIcon, { color: '#e88080' }, { default: () => h(TrashOutline) })
    })

    return options
}

const handleMenuSelect = (key: string, user: User): void => {
    if (key === 'approve') {
        usersStore.updateStatus(user.id, 'approved')
    } else if (key === 'block') {
        usersStore.updateStatus(user.id, 'blocked')
    } else if (key === 'edit') {
        editingUser.value = user
        editDrawerOpen.value = true
    } else if (key === 'delete') {
        deletingUser.value = user
        deleteConfirmOpen.value = true
    }
}

const confirmDelete = async (): Promise<void> => {
    if (deletingUser.value) {
        await usersStore.deleteUser(deletingUser.value.id)
        deletingUser.value = null
    }
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

    &__header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__title {
        font-size: 24px;
        font-weight: 600;
    }

    &__toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
    }

    &__status-filter {
        display: flex;
        gap: 6px;
        margin-bottom: 16px;
        flex-wrap: wrap;
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
        flex-wrap: wrap;
    }

    &__name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__meta {
        font-size: 12px;
        opacity: 0.5;
    }

    &__actions {
        flex-shrink: 0;
    }
}
</style>
