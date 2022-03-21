import { MichelsonMap } from '@taquito/taquito'

export interface SatelliteRecord {
  address: string
  name: string
  image: string
  description: string
  satelliteFee: string | number
  active: boolean
  mvkBalance: string
  totalDelegatedAmount: string
  registeredDateTime: Date
  unregisteredDateTime: Date | null
}
export type DelegationConfig = {
  maxSatellites: string
  delegationRatio: string
  minimumStakedMvkBalance: number
}
export interface DelegationBreakGlassConfigType {
  delegateToSatelliteIsPaused: boolean
  undelegateFromSatelliteIsPaused: boolean
  registerAsSatelliteIsPaused: boolean
  unregisterAsSatelliteIsPaused: boolean
  updateSatelliteRecordIsPaused: boolean
}
export interface DelegateRecord {
  satelliteAddress: string
  delegatedDateTime: Date | null
}
export type DelegationLedger = MichelsonMap<string, DelegateRecord>
export interface DelegationStorage {
  admin?: string
  contractAddresses?: MichelsonMap<string, string>
  whitelistContracts?: MichelsonMap<string, string>
  satelliteLedger: SatelliteRecord[]
  config: DelegationConfig
  delegateLedger: DelegationLedger
  breakGlassConfig: DelegationBreakGlassConfigType
}
