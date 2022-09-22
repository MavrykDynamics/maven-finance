import {
  GET_BREAK_GLASS_STORAGE,
  SET_GLASS_BROKEN,
  GET_BREAK_GLASS_STATUS,
  GET_WHITELIST_DEV,
} from '../pages/BreakGlass/BreakGlass.actions'
import { GET_BREAK_GLASS_ACTION } from '../pages/BreakGlassActions/BreakGlassActions.actions'
import { GET_PAST_BREAK_GLASS_COUNCIL_ACTION, GET_BREAK_GLASS_COUNCIL_MEMBER } from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'
import { BreakGlassStorage, BreakGlassStatusStorage, WhitelistDevStorage, BreakGlassCouncilMember, BreakGlassAction } from '../utils/TypesAndInterfaces/BreakGlass'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage
  glassBroken: boolean
  breakGlassStatus: BreakGlassStatusStorage
  whitelistDev: WhitelistDevStorage
  breakGlassCouncilMember: BreakGlassCouncilMember
  breakGlassAction: BreakGlassAction
  pastBreakGlassCouncilAction: BreakGlassAction
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
  whitelistDev: '',
  breakGlassCouncilMember: [],
  pastBreakGlassCouncilAction: [],
  breakGlassAction: [],
}

export function breakGlass(state = breakGlassDefaultState, action: Action) {
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
    case GET_WHITELIST_DEV:
      return {
        ...state,
        whitelistDev: action.whitelistDev,
      }
    case GET_BREAK_GLASS_COUNCIL_MEMBER:
      return {
        ...state,
        breakGlassCouncilMember: action.breakGlassCouncilMember,
      }
    case GET_BREAK_GLASS_ACTION:
      return {
        ...state,
        breakGlassAction: action.breakGlassAction,
      }
    case GET_PAST_BREAK_GLASS_COUNCIL_ACTION:
      return {
        ...state,
        pastBreakGlassCouncilAction: action.pastBreakGlassCouncilAction,
      }
    default:
      return state
  }
}
