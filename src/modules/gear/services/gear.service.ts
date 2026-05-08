import { GearApi } from '@/modules/gear/api/gear.api'
import type { GearItem } from '@/modules/gear/types/gear.types'

export class GearService {
    static getAll = async (): Promise<GearItem[]> => {
        return GearApi.getAll()
    }
}
