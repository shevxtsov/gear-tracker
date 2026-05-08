import type { GearItem } from '@/modules/gear/types/gear.types'

const now = Date.now()
const h = (n: number): number => now - n * 3600000

const MOCK_GEAR: GearItem[] = [
    {
        id: '1', name: 'Fender Stratocaster', category: 'Гитара', location: 'Большой зал - сцена',
        available: true, takenBy: null, takenTo: null, takenAt: null,
        history: [
            { id: 'h1', takenBy: 'Иван Петров', takenTo: 'ГДБ', takenAt: h(48), returnedAt: h(24), returnedTo: 'Большой зал - сцена' },
            { id: 'h2', takenBy: 'Мария Сидорова', takenTo: 'Гримерка', takenAt: h(96), returnedAt: h(80), returnedTo: 'Большой зал - сцена' },
            { id: 'h3', takenBy: 'Алексей Козлов', takenTo: 'Большой зал - сцена', takenAt: h(200), returnedAt: h(190), returnedTo: 'Большой зал - сцена' }
        ]
    },
    {
        id: '2', name: 'Gibson Les Paul', category: 'Гитара', location: 'Большой зал - сцена',
        available: false, takenBy: 'Иван Петров', takenTo: 'ГДБ', takenAt: h(1),
        history: [
            { id: 'h4', takenBy: 'Иван Петров', takenTo: 'ГДБ', takenAt: h(1), returnedAt: null, returnedTo: null },
            { id: 'h5', takenBy: 'Елена Новикова', takenTo: 'Гримерка', takenAt: h(72), returnedAt: h(60), returnedTo: 'Большой зал - сцена' },
            { id: 'h6', takenBy: 'Мария Сидорова', takenTo: 'ГДБ', takenAt: h(150), returnedAt: h(140), returnedTo: 'Большой зал - сцена' },
            { id: 'h7', takenBy: 'Алексей Козлов', takenTo: 'Большой зал - сцена', takenAt: h(300), returnedAt: h(290), returnedTo: 'Большой зал - сцена' }
        ]
    },
    {
        id: '3', name: 'Fender Jazz Bass', category: 'Бас-гитара', location: 'ГДБ',
        available: true, takenBy: null, takenTo: null, takenAt: null,
        history: []
    },
    {
        id: '4', name: 'Pearl Export', category: 'Ударные', location: 'Большой зал - сцена',
        available: true, takenBy: null, takenTo: null, takenAt: null,
        history: [
            { id: 'h8', takenBy: 'Иван Петров', takenTo: 'Гримерка', takenAt: h(120), returnedAt: h(100), returnedTo: 'Большой зал - сцена' }
        ]
    },
    {
        id: '5', name: 'Roland FP-30', category: 'Клавишные', location: 'Гримерка',
        available: false, takenBy: 'Мария Сидорова', takenTo: 'Гримерка', takenAt: h(2),
        history: [
            { id: 'h9', takenBy: 'Мария Сидорова', takenTo: 'Гримерка', takenAt: h(2), returnedAt: null, returnedTo: null },
            { id: 'h10', takenBy: 'Алексей Козлов', takenTo: 'ГДБ', takenAt: h(60), returnedAt: h(50), returnedTo: 'Гримерка' }
        ]
    },
    {
        id: '6', name: 'Shure SM58', category: 'Микрофон', location: 'ГДБ',
        available: true, takenBy: null, takenTo: null, takenAt: null,
        history: []
    }
]

export class GearApi {
    static getAll = async (): Promise<GearItem[]> => {
        await new Promise<void>((resolve) => setTimeout(resolve, 400))

        return MOCK_GEAR
    }
}
