import { MichelsonMap } from '@taquito/taquito'

export interface FarmFactoryStorage {
  admin: string
  generalContracts: MichelsonMap<string, unknown>
  whitelistContracts: MichelsonMap<string, unknown>
  breakGlassConfig: {
    createFarmIsPaused: boolean
    untrackFarmIsPaused: boolean
  }
  trackedFarms: any[]
}
