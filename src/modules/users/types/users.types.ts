export type UserRole = 'user' | 'moderator' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'blocked'

export interface User {
    id: string
    name: string
    email: string
    phone: string
    role: UserRole
    status: UserStatus
}
