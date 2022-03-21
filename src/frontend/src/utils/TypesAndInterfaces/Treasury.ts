import { MichelsonMap } from '@taquito/taquito'

export interface TreasuryStorage {
  admin: string
  config: {
    minXtzAmount: number
    maxXtzAmount: number
  }
  whitelistContracts: MichelsonMap<string, unknown>
  whitelistTokenContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  breakGlassConfig: {
    transferIsPaused: boolean
    mintAndTransferIsPaused: boolean
    updateOperatorsIsPaused: boolean
  }
}
