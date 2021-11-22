import { GET_V_MVK_TOKEN_STORAGE } from "pages/Doorman/Doorman.actions"

export interface VMvkTokenState {
  vMvkTokenStorage: any,
  myVMvkTokenBalance ?: string
}

const vMvkTokenDefaultState: VMvkTokenState = {
  vMvkTokenStorage: {},
  myVMvkTokenBalance: undefined
}

export function vMvkToken(state = vMvkTokenDefaultState, action: any): VMvkTokenState {
  switch (action.type) {
    case GET_V_MVK_TOKEN_STORAGE:
      return {
        vMvkTokenStorage: action.vMvkTokenStorage,
        myVMvkTokenBalance: action.myVMvkTokenBalance,
      }
    default:
      return state
  }
}
