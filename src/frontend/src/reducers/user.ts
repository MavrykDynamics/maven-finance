import { GET_USER_DATA, SET_USER_DATA, UPDATE_USER_DATA } from '../pages/Doorman/Doorman.actions'
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
  type: typeof GET_USER_DATA | typeof SET_USER_DATA | typeof UPDATE_USER_DATA
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
  type: GET_USER_DATA,
  user: getItemFromStorage('UserData') ?? defaultUser,
}

export function user(state = userDefaultState, action: any): UserState {
  switch (action.type) {
    case GET_USER_DATA:
      return {
        type: GET_USER_DATA,
        user: action.userData,
      }
    case SET_USER_DATA:
      return {
        type: SET_USER_DATA,
        user: action.userData,
      }
    case UPDATE_USER_DATA:
      const userState = state.user
      // @ts-ignore
      userState[action.userKey] = action.userValue
      return {
        type: UPDATE_USER_DATA,
        user: userState,
      }
    default:
      return state
  }
}
