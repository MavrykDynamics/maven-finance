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
  tokenId?: number
  contractAddresses?: MichelsonMap<string, string>
  whitelistContracts?: MichelsonMap<string, string>
  totalSupply: number
  maximumTotalSupply: number
}
export interface MvkTokenState {
  mvkTokenStorage: MvkTokenStorage | any
  myMvkTokenBalance?: string
}
const defaultMvkTokenStorage: MvkTokenStorage = {
  totalSupply: 0,
  maximumTotalSupply: 1000000000,
}
const mvkTokenDefaultState: MvkTokenState = {
  mvkTokenStorage: getItemFromStorage('MvkTokenStorage') ?? defaultMvkTokenStorage,
  myMvkTokenBalance: getItemFromStorage('UserData')?.myMvkBalance ?? undefined,
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
