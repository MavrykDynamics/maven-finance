import { GET_BREAK_GLASS_COUNCIL_MEMBER } from '../pages/BreakGlassActions/BreakGlassActions.actions'
import { BreakGlassCouncilMember } from '../utils/TypesAndInterfaces/BreakGlassActions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface BreakGlassActionsState {
  breakGlassCouncilMember: BreakGlassCouncilMember
}

const breakGlassActionsDefaultState: BreakGlassActionsState = {
  breakGlassCouncilMember: [],
}

export function breakGlassActions(state = breakGlassActionsDefaultState, action: Action) {
  switch (action.type) {
    case GET_BREAK_GLASS_COUNCIL_MEMBER:
      return {
        ...state,
        breakGlassCouncilMember: action.breakGlassCouncilMember,
      }
    default:
      return state
  }
}
