import { GET_BREAK_GLASS_STORAGE, SET_GLASS_BROKEN } from '../pages/BreakGlass/BreakGlass.actions'
import { BreakGlassStorage } from '../utils/TypesAndInterfaces/BreakGlass'
import { getItemFromStorage } from '../utils/storage'

export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage | any
  glassBroken: boolean
}

const defaultBreakGlassStorage: BreakGlassStorage = {
  actionLedger: [],
  address: '',
  config: {
    threshold: 0,
    actionExpiryDuration: 0,
  },
  councilMembers: [],
  currentActionId: 0,
  glassBroken: false,
}
const breakGlassDefaultState: BreakGlassState = {
  breakGlassStorage: getItemFromStorage('BreakGlassStorage') || defaultBreakGlassStorage,
  glassBroken: false,
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
