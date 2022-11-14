import { UserDoormanRewardsData, UserFarmRewardsData, UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { CLEAN_USER_DATA, GET_USER_DATA, UPDATE_USER_DATA } from '../pages/Doorman/Doorman.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface UserState {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  myXTZTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  isSatellite: boolean
  myDoormanRewardsData: UserDoormanRewardsData
  myFarmRewardsData: Record<string, UserFarmRewardsData>
  mySatelliteRewardsData: UserSatelliteRewardsData
}

const defaultUser: UserState = {
  myAddress: '',
  myMvkTokenBalance: 0,
  mySMvkTokenBalance: 0,
  myXTZTokenBalance: 0,
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

export function user(state = defaultUser, action: Action) {
  switch (action.type) {
    case GET_USER_DATA:
      return { ...state, ...action.userData }
    case UPDATE_USER_DATA:
      return {
        ...state,
        ...action.updatedUserValues,
      }
    case CLEAN_USER_DATA:
      return { ...state, ...defaultUser }
    default:
      return state
  }
}
