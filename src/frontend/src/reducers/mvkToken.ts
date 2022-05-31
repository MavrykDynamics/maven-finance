import { GET_MVK_TOKEN_STORAGE } from 'pages/Doorman/Doorman.actions'
import { getItemFromStorage } from '../utils/storage'
import { MvkTokenStorage } from '../utils/TypesAndInterfaces/MvkToken'

export interface MvkTokenState {
  mvkTokenStorage: MvkTokenStorage | any
  myMvkTokenBalance?: string
  exchangeRate?: number
}

const defaultMvkTokenStorage: MvkTokenStorage = {
  totalSupply: 0,
  maximumTotalSupply: 1000000000,
}
const mvkTokenDefaultState: MvkTokenState = {
  mvkTokenStorage: getItemFromStorage('MvkTokenStorage') ?? defaultMvkTokenStorage,
  myMvkTokenBalance: getItemFromStorage('UserData')?.myMvkBalance ?? 0,
  exchangeRate: 0.25,
}

export function mvkToken(state = mvkTokenDefaultState, action: any): MvkTokenState {
  switch (action.type) {
    case GET_MVK_TOKEN_STORAGE:
      return {
        ...state,
        mvkTokenStorage: action.mvkTokenStorage,
        myMvkTokenBalance: action.myMvkTokenBalance,
      }

    default:
      return state
  }
}
