import {
  GET_BREAK_GLASS_STORAGE,
  SET_GLASS_BROKEN,
  GET_BREAK_GLASS_STATUS,
} from '../pages/BreakGlass/BreakGlass.actions'
import { BreakGlassStorage, BreakGlassStatusStorage } from '../utils/TypesAndInterfaces/BreakGlass'

export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage
  glassBroken: boolean
  breakGlassStatus: BreakGlassStatusStorage
}

const defaultBreakGlassStorage: BreakGlassStorage = {
  address: '',
  admin: '',
  governanceId: '',
  actionLedger: [],
  config: {
    threshold: 0,
    actionExpiryDays: 0,
    councilMemberNameMaxLength: 400,
    councilMemberWebsiteMaxLength: 400,
    councilMemberImageMaxLength: 400,
  },
  actionCounter: 0,
  glassBroken: false,
}
const breakGlassDefaultState: BreakGlassState = {
  breakGlassStorage: defaultBreakGlassStorage,
  glassBroken: false,
  breakGlassStatus: [],
}

export function breakGlass(state = breakGlassDefaultState, action: any): BreakGlassState {
  switch (action.type) {
    case GET_BREAK_GLASS_STORAGE:
      return {
        ...state,
        breakGlassStorage: action.breakGlassStorage,
      }
    case GET_BREAK_GLASS_STATUS:
      return {
        ...state,
        breakGlassStatus: action.breakGlassStatus,
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
