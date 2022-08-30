// types
import type { MvkTokenStorage } from '../utils/TypesAndInterfaces/MvkToken'
import { GET_MVK_TOKEN_STORAGE } from 'pages/Doorman/Doorman.actions'
import { normalizeMvkToken } from 'pages/Doorman/Doorman.converter'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface MvkTokenState {
  mvkTokenStorage: MvkTokenStorage
  myMvkTokenBalance: string
  exchangeRate: number
}

const mvkTokenDefaultState: MvkTokenState = {
  mvkTokenStorage: normalizeMvkToken(null),
  myMvkTokenBalance: '',
  exchangeRate: 0.25,
}

export function mvkToken(state = mvkTokenDefaultState, action: Action) {
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
