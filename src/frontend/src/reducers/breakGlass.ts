import { GET_BREAK_GLASS_STORAGE, SET_GLASS_BROKEN } from '../pages/BreakGlass/BreakGlass.actions'
import { BreakGlassStorage } from '../utils/TypesAndInterfaces/BreakGlass'
import { getItemFromStorage } from '../utils/storage'

export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage | any
  glassBroken: boolean
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
