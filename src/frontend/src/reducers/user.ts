import { UserDoormanRewardsData, UserFarmRewardsData, UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { CLEAN_USER_DATA, GET_USER_DATA } from '../pages/Doorman/Doorman.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type UserState = {
  myMvkTokenBalance?: number
  mySMvkTokenBalance?: number
  myXTZTokenBalance?: number
  mytzBTCTokenBalance?: number
  participationFeesPerShare?: number
  satelliteMvkIsDelegatedTo?: string
  isSatellite?: boolean
  myDoormanRewardsData?: UserDoormanRewardsData
  myFarmRewardsData?: Record<string, UserFarmRewardsData>
  mySatelliteRewardsData?: UserSatelliteRewardsData
}

const defaultUser: UserState = {
  myMvkTokenBalance: undefined,
  mySMvkTokenBalance: undefined,
  myXTZTokenBalance: undefined,
  mytzBTCTokenBalance: undefined,
  participationFeesPerShare: undefined,
  satelliteMvkIsDelegatedTo: undefined,
  isSatellite: undefined,
  myDoormanRewardsData: undefined,
  myFarmRewardsData: undefined,
  mySatelliteRewardsData: undefined,
}

export function user(state = defaultUser, action: Action) {
  switch (action.type) {
    case GET_USER_DATA:
      return { ...state, ...action.userData }
    case CLEAN_USER_DATA:
      return { ...state, ...defaultUser }
    default:
      return state
  }
}
