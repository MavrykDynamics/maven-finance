import { CONNECT, SET_WALLET } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { TempleWallet } from '@temple-wallet/dapp'
import { TezosToolkit } from '@taquito/taquito'

export interface WalletState {
  wallet?: TempleWallet
  tezos?: TezosToolkit
  accountPkh?: string
  ready: boolean
  error?: any
}

const walletDefaultState: WalletState = {
  wallet: undefined,
  tezos: undefined,
  accountPkh: undefined,
  ready: false,
}

export function wallet(state = walletDefaultState, action: any): WalletState {
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
    default:
      return state
  }
}
