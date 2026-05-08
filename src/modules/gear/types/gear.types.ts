export interface GearUsageRecord {
    id: string
    takenBy: string
    takenTo: string
    takenAt: number
    returnedAt: number | null
    returnedTo: string | null
}

export interface GearItem {
    id: string
    name: string
    category: string
    location: string
    available: boolean
    takenBy: string | null
    takenTo: string | null
    takenAt: number | null
    history: GearUsageRecord[]
}

export const GEAR_LOCATIONS: string[] = [
    'Большой зал - сцена',
    'ГДБ',
    'Гримерка'
]

export const GEAR_CATEGORIES: string[] = [
    'Гитара',
    'Бас-гитара',
    'Ударные',
    'Клавишные',
    'Микрофон',
    'Усилитель',
    'Акустика',
    'Кабели и коммутация',
    'Прочее'
]
