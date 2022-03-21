import { MichelsonMap } from '@taquito/taquito'

export interface CouncilStorage {
  admin: string
  config: {
    actionExpiryBlockLevels: number
    actionExpiryDays: number
    threshold: number
  }
  councilMembers: string[]
  whitelistContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  councilActionsLedger: MichelsonMap<number, unknown>
  thresholdSigners: number
  actionCounter: number
  tempString: string
}
