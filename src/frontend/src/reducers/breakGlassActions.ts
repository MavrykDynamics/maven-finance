import { GET_BREAK_GLASS_COUNCIL_MEMBER, GET_BREAK_GLASS_ACTION } from '../pages/BreakGlassActions/BreakGlassActions.actions'
import { BreakGlassCouncilMember, BreakGlassAction } from '../utils/TypesAndInterfaces/BreakGlassActions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface BreakGlassActionsState {
  breakGlassCouncilMember: BreakGlassCouncilMember
  breakGlassAction: BreakGlassAction
}

const breakGlassActionsDefaultState: BreakGlassActionsState = {
  breakGlassCouncilMember: [],
  breakGlassAction: [],
}

export function breakGlassActions(state = breakGlassActionsDefaultState, action: Action) {
  switch (action.type) {
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
    default:
      return state
  }
}
