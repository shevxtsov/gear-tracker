export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    phone: string
    role: import('@/modules/users/types/users.types').UserRole
    password: string
}
