import { MichelsonMap } from '@taquito/taquito'

type VestingConfig = {
  defaultCliffPeriod: number
  defaultCooldownPeriod: number
  newBlockTimeLevel: number
  newBlocksPerMinute: number
  blocksPerMinute: number
  blocksPerMonth: number
}
export interface VestingStorage {
  admin: string
  config: VestingConfig
  whitelistContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  claimLedger: MichelsonMap<string, unknown>
  vesteeLedger: MichelsonMap<string, unknown>
  totalVestedAmount: number
  tempBlockLevel: number
}
