import { TezosToolkit } from '@taquito/taquito'
import { TempleWallet } from '@temple-wallet/dapp'
import {
  CONNECT,
  SET_WALLET,
  UPDATE_OPERATORS_ERROR,
  UPDATE_OPERATORS_REQUEST,
  UPDATE_OPERATORS_RESULT,
} from 'app/App.components/Menu/Menu.actions'

export interface WalletState {
  wallet?: TempleWallet
  tezos?: TezosToolkit
  accountPkh?: string
  ready: boolean
  contractPermissionsMap: Map<string, boolean>
  error?: any
}
const defaultContractPermissionsMap = new Map<string, boolean>()
const walletDefaultState: WalletState = {
  wallet: undefined,
  tezos: undefined,
  accountPkh: undefined,
  ready: false,
  contractPermissionsMap: defaultContractPermissionsMap,
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
    case UPDATE_OPERATORS_REQUEST:
      const stateContractPermissionMap = new Map<string, boolean>(state.contractPermissionsMap.entries())
      stateContractPermissionMap.set(action.contract, action.isAuthorized)
      return {
        ...state,
        contractPermissionsMap: stateContractPermissionMap,
      }
    case UPDATE_OPERATORS_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case UPDATE_OPERATORS_RESULT:
    default:
      return state
  }
}
