import { GET_MVK_TOKEN_STORAGE } from "pages/Doorman/Doorman.actions"

export interface MvkTokenState {
  mvkTokenStorage: any,
  myMvkTokenBalance ?: string
}

const mvkTokenDefaultState: MvkTokenState = {
  mvkTokenStorage: {},
  myMvkTokenBalance: undefined
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
