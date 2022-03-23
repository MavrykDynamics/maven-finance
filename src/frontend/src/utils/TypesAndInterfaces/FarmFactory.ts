import { FarmStorage } from './Farm'

export interface FarmFactoryStorage {
  address: string
  breakGlassConfig: {
    createFarmIsPaused: boolean
    trackFarmIsPaused: boolean
    untrackFarmIsPaused: boolean
  }
  trackedFarms: FarmStorage[]
}
