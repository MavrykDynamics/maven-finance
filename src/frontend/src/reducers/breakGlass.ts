import { MichelsonMap } from '@taquito/taquito'
import { GET_BREAK_GLASS_STORAGE } from '../pages/Governance/Governance.actions'

type BreakGlassConfig = {
  threshold: number
  actionExpiryDuration: number
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
export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage | any
}

const breakGlassDefaultState: BreakGlassState = {
  breakGlassStorage: {},
}

export function breakGlass(state = breakGlassDefaultState, action: any): BreakGlassState {
  switch (action.type) {
    case GET_BREAK_GLASS_STORAGE:
      return {
        breakGlassStorage: action.breakGlassStorage,
      }
    default:
      return state
  }
}
