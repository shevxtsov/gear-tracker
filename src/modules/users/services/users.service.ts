import type { UserRole } from '@/modules/users/types/users.types'

export const ROLE_OPTIONS = [
    { label: 'Пользователь', value: 'user' as UserRole },
    { label: 'Модератор', value: 'moderator' as UserRole }
]

const ROLE_LABELS: Record<UserRole, string> = {
    user: 'Пользователь',
    moderator: 'Модератор',
    admin: 'Администратор'
}

export class UsersService {
    static getInitials = (name: string): string => {
        return name
            .split(' ')
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase()
    }

    static getRoleLabel = (role: UserRole): string => {
        return ROLE_LABELS[role] ?? role
    }
}
