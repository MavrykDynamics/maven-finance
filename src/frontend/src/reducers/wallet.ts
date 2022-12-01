import { CONNECT, DISCONNECT, SET_WALLET } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { TempleWallet } from '@temple-wallet/dapp'
import { TezosToolkit } from '@taquito/taquito'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { preferencesDefaultState } from './preferences'
import { UserDoormanRewardsData, UserFarmRewardsData, UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { UPDATE_USER_DATA } from 'pages/Doorman/Doorman.actions'

// Temple wallet types
// export interface WalletState {
//   wallet?: TempleWallet
//   tezos?: TezosToolkit
//   accountPkh?: string
//   ready: boolean
// }

// const walletDefaultState: WalletState = {
//   wallet: undefined,
//   tezos: undefined,
//   accountPkh: undefined,
//   ready: false,
// }

export interface UserState {
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  myXTZTokenBalance: number
  mytzBTCTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  isSatellite: boolean
  myDoormanRewardsData: UserDoormanRewardsData
  myFarmRewardsData: Record<string, UserFarmRewardsData>
  mySatelliteRewardsData: UserSatelliteRewardsData
}

const RpcNetwork = preferencesDefaultState.REACT_APP_RPC_PROVIDER

export interface WalletState {
  wallet?: BeaconWallet
  tezos: TezosToolkit
  accountPkh?: string
  user: UserState
}

export const DEFAULT_USER: UserState = {
  myMvkTokenBalance: 0,
  mySMvkTokenBalance: 0,
  myXTZTokenBalance: 0,
  mytzBTCTokenBalance: 0,
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

export const walletDefaultState: WalletState = {
  wallet: undefined,
  tezos: new TezosToolkit(RpcNetwork),
  accountPkh: undefined,
  user: DEFAULT_USER,
}

export function wallet(state = walletDefaultState, action: Action) {
  switch (action.type) {
    case SET_WALLET:
      return {
        ...state,
        wallet: action.wallet,
        isDefaultWallet: false,
      }
    case CONNECT:
      return {
        ...state,
        tezos: action.tezos,
        accountPkh: action.accountPkh,
        user: action.userData,
        isDefaultWallet: false,
      }
    case UPDATE_USER_DATA:
      return {
        ...state,
        user: action.userData,
      }
    case DISCONNECT:
      return {
        ...walletDefaultState,
      }
    default:
      return state
  }
}
