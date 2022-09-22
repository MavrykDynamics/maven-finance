import { GET_USER_DATA, SET_USER_DATA, UPDATE_USER_DATA } from '../pages/Doorman/Doorman.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { UserData } from '../utils/TypesAndInterfaces/User'

export interface UserState {
  type: typeof GET_USER_DATA | typeof SET_USER_DATA | typeof UPDATE_USER_DATA
  user: UserData
}

const defaultUser: UserData = {
  myAddress: '',
  myMvkTokenBalance: 0,
  mySMvkTokenBalance: 0,
  participationFeesPerShare: 0,
  satelliteMvkIsDelegatedTo: '',
  isSatellite: false,
  myDoormanRewardsData: {
    generalAccumulatedFeesPerShare: 0,
    generalUnclaimedRewards: 0,
    myAvailableDoormanRewards: 0,
    myParticipationFeesPerShare: 0,
  },
  myFarmRewardsData: {},
  mySatelliteRewardsData: {
    myAvailableSatelliteRewards: 0,
    paid: 0,
    participationRewardsPerShare: 0,
    satelliteAccumulatedRewardPerShare: 0,
    unpaid: 0,
  },
}
const userDefaultState: UserState = {
  type: GET_USER_DATA,
  user: defaultUser,
}

export function user(state = userDefaultState, action: Action) {
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
