import {
  GET_BREAK_GLASS_STORAGE,
  SET_GLASS_BROKEN,
  GET_BREAK_GLASS_STATUS,
  GET_WHITELIST_DEV,
} from '../pages/BreakGlass/BreakGlass.actions'
import {
  GET_BREAK_GLASS_COUNCIL_MEMBER,
  GET_BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE,
  GET_PAST_BREAK_GLASS_COUNCIL_ACTION,
  GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION,
} from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'
import {
  BreakGlassStorage,
  BreakGlassStatusStorage,
  WhitelistDevStorage,
  BreakGlassCouncilMember,
  BreakGlassAction,
} from '../utils/TypesAndInterfaces/BreakGlass'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface BreakGlassState {
  breakGlassStorage: BreakGlassStorage
  glassBroken: boolean
  breakGlassStatus: BreakGlassStatusStorage
  whitelistDev: WhitelistDevStorage
  breakGlassCouncilMember: BreakGlassCouncilMember
  pastBreakGlassCouncilAction: BreakGlassAction
  myPastBreakGlassCouncilAction: BreakGlassAction
  breakGlassActionPendingMySignature: BreakGlassAction
  breakGlassActionPendingSignature: BreakGlassAction
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
  myPastBreakGlassCouncilAction: [],
  breakGlassActionPendingMySignature: [],
  breakGlassActionPendingSignature: [],
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
    case GET_BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE:
      return {
        ...state,
        breakGlassActionPendingMySignature: action.breakGlassActionPendingMySignature,
        breakGlassActionPendingSignature: action.breakGlassActionPendingSignature,
      }
    case GET_PAST_BREAK_GLASS_COUNCIL_ACTION:
      return {
        ...state,
        pastBreakGlassCouncilAction: action.pastBreakGlassCouncilAction,
      }
    case GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION:
      return {
        ...state,
        myPastBreakGlassCouncilAction: action.myPastBreakGlassCouncilAction,
      }
    default:
      return state
  }
}
