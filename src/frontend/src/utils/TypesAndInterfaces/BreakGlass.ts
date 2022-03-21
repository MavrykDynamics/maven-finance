import { MichelsonMap } from '@taquito/taquito'

type BreakGlassConfig = {
  threshold: number
  actionExpiryDuration: number
  developerAddress: string
  emergencyGovernanceAddress: string
}
export interface BreakGlassStorage {
  admin: string
  config: BreakGlassConfig
  generalContracts: MichelsonMap<string, unknown>
  glassBroken: boolean
  councilMembers: string[]
  currentActionId: number
  nextActionId: number
  actionLedger: MichelsonMap<string, unknown>
  flushLedger: MichelsonMap<string, unknown>
}
