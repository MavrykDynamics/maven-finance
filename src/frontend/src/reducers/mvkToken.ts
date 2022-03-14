import { GET_MVK_TOKEN_STORAGE } from 'pages/Doorman/Doorman.actions'
import { MichelsonMap } from '@taquito/taquito'
import { getItemFromStorage } from '../utils/storage'

type account = {
  balance: number
  allowances: Map<string, number>
}
type TokenMetadataInfo = {
  tokenId: number
  tokenInfo: Map<string, string>
}

export interface MvkTokenStorage {
  admin?: string
  contractAddresses?: MichelsonMap<string, string>
  whitelistContracts?: MichelsonMap<string, string>
  totalSupply: number
  maximumTotalSupply: number
}
export interface MvkTokenState {
  mvkTokenStorage: MvkTokenStorage | any
  myMvkTokenBalance?: string
}

const mvkTokenDefaultState: MvkTokenState = {
  mvkTokenStorage: getItemFromStorage('MvkTokenStorage') ?? {},
  myMvkTokenBalance: getItemFromStorage('UserInfo')?.stakeInfo.myMvkBalance ?? undefined,
}

export function mvkToken(state = mvkTokenDefaultState, action: any): MvkTokenState {
  switch (action.type) {
    case GET_MVK_TOKEN_STORAGE:
      return {
        mvkTokenStorage: action.mvkTokenStorage,
        myMvkTokenBalance: action.myMvkTokenBalance,
      }
    default:
      return state
  }
}
