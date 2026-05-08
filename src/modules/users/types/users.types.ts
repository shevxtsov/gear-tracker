export type UserRole = 'user' | 'moderator' | 'admin'

export interface User {
    id: string
    name: string
    phone: string
    role: UserRole
}
