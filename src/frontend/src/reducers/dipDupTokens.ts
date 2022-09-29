import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { GET_DIP_DUP_TOKENS } from './actions/dipDupActions.actions'

export interface ContractAddressesState {
  [key: string]: { address: string }
}
export type DipDupTokensType = Array<DipDupTokensGraphQl>
const dipDupTokensDefaultState: Array<DipDupTokensGraphQl> = []

export function dipDupTokens(state = dipDupTokensDefaultState, action: any) {
  switch (action.type) {
    case GET_DIP_DUP_TOKENS:
      return {
        ...state,
        ...action.dipDupTokens,
      }
    default:
      return state
  }
}
