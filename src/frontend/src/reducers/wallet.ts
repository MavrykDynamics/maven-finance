import { CONNECT, DISCONNECT, SET_WALLET } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { TempleWallet } from '@temple-wallet/dapp'
import { TezosToolkit } from '@taquito/taquito'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { BeaconWallet } from '@taquito/beacon-wallet'

// export interface WalletState {
//   wallet?: TempleWallet
//   tezos?: TezosToolkit
//   accountPkh?: string
//   ready: boolean
// }
const RpcNetwork = 'https://mainnet.smartpy.io'
export interface WalletState {
  wallet?: BeaconWallet
  tezos: TezosToolkit
  accountPkh?: string
  ready: boolean
  error?: any
  connect?: any
  toTezos?: () => number | any
}

// const walletDefaultState: WalletState = {
//   wallet: undefined,
//   tezos: undefined,
//   accountPkh: undefined,
//   ready: false,
// }

export const walletDefaultState: WalletState = {
  wallet: undefined,
  tezos: new TezosToolkit(RpcNetwork),
  accountPkh: undefined,
  ready: false,
}

export function wallet(state = walletDefaultState, action: Action) {
  switch (action.type) {
    case SET_WALLET:
      return {
        ...state,
        wallet: action.wallet,
      }
    case CONNECT:
      return {
        ...state,
        tezos: action.tezos,
        ready: action.ready,
        accountPkh: action.accountPkh,
      }
    case DISCONNECT:
      return {
        ...state,
        ...walletDefaultState,
      }
    default:
      return state
  }
}
