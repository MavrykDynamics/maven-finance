import { GET_BREAK_GLASS_STORAGE, SET_GLASS_BROKEN } from '../pages/BreakGlass/BreakGlass.actions'
import { BreakGlassStorage } from '../utils/TypesAndInterfaces/BreakGlass'

export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage | any
  glassBroken: boolean
}

const breakGlassDefaultState: BreakGlassState = {
  breakGlassStorage: {},
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
