import { MichelsonMap } from '@taquito/taquito'
import { GET_BREAK_GLASS_STORAGE, SET_GLASS_BROKEN } from '../pages/BreakGlass/BreakGlass.actions'

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
export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage | any
  glassBroken: boolean
}

const breakGlassDefaultState: BreakGlassState = {
  breakGlassStorage: {},
  glassBroken: true,
}

export function breakGlass(state = breakGlassDefaultState, action: any): BreakGlassState {
  switch (action.type) {
    case GET_BREAK_GLASS_STORAGE:
      return {
        ...state,
        breakGlassStorage: action.breakGlassStorage,
      }
    case SET_GLASS_BROKEN:
      return {
        ...state,
        glassBroken: action.glassBroken,
      }
    default:
      return state
  }
}
