import { Governance_Financial_Whitelist_Token_Contract } from 'utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { GET_DIP_DUP_TOKENS, GET_TOKENS_PRICES, GET_WHITELIST_TOKENS } from './actions/dipDupActions.actions'

export type TokensType = {
  dipDupTokens: Array<DipDupTokensGraphQl>
  tokensPrices: Record<string, { usd: number; eur: number }>
  whitelistTokens: Array<Governance_Financial_Whitelist_Token_Contract>
}
const defaultTokensInfoState: TokensType = {
  dipDupTokens: [],
  whitelistTokens: [],
  tokensPrices: {},
}

export function tokens(state = defaultTokensInfoState, action: Action) {
  switch (action.type) {
    case GET_DIP_DUP_TOKENS:
      return { ...state, dipDupTokens: action.dipDupTokens }
    case GET_WHITELIST_TOKENS:
      return { ...state, whitelistTokens: action.whitelistTokens }
    case GET_TOKENS_PRICES:
      return {
        ...state,
        tokensPrices: action.tokensPrices,
      }
    default:
      return state
  }
}
