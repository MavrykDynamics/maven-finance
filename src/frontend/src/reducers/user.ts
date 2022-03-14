import { GET_USER_INFO, SET_USER_INFO, UPDATE_USER_INFO } from '../pages/Doorman/Doorman.actions'
import { getItemFromStorage } from '../utils/storage'

export interface UserData {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  myDelegationHistory?: any[]
}
export interface UserState {
  type: typeof GET_USER_INFO | typeof SET_USER_INFO | typeof UPDATE_USER_INFO
  user: UserData
}

const defaultUser: UserData = {
  myAddress: '',
  myDelegationHistory: [],
  myMvkTokenBalance: 0,
  mySMvkTokenBalance: 0,
  participationFeesPerShare: 0,
  satelliteMvkIsDelegatedTo: '',
}
const userDefaultState: UserState = {
  type: GET_USER_INFO,
  user: getItemFromStorage('UserData') ?? defaultUser,
}

export function user(state = userDefaultState, action: any): UserState {
  switch (action.type) {
    case GET_USER_INFO:
      return {
        type: GET_USER_INFO,
        user: action.userData,
      }
    case SET_USER_INFO:
      return {
        type: SET_USER_INFO,
        user: action.userData,
      }
    case UPDATE_USER_INFO:
      const userState = state.user
      // @ts-ignore
      userState[action.userKey] = action.userValue
      return {
        type: UPDATE_USER_INFO,
        user: userState,
      }
    default:
      return state
  }
}
