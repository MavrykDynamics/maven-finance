// import { TempleDAppNetwork, TempleWallet } from '@temple-wallet/dapp'
// import { State } from 'reducers'

// import { CLEAN_USER_DATA, getUserData } from '../../../pages/Doorman/Doorman.actions'
// import { showToaster } from '../Toaster/Toaster.actions'
// import { ERROR } from '../Toaster/Toaster.constants'
// import type { AppDispatch, GetState } from '../../App.controller'

// // const network = process.env.REACT_APP_API_NETWORK
// const network = 'ghostnet'

import { BeaconWallet } from '@taquito/beacon-wallet'
import { Network, NetworkType } from '@airgap/beacon-sdk'
import { TezosToolkit } from '@taquito/taquito'
import { AppDispatch, GetState } from 'app/App.controller'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { getUserData } from 'pages/Doorman/Doorman.actions'

export const SET_WALLET = 'SET_WALLET'

export const CONNECT = 'CONNECT'

export const DISCONNECT = 'DISCONNECT'

const Beacon_localStorage_keys = [
  'beacon:active-account',
  'beacon:postmessage-peers-dapp',
  'beacon:accounts',
  'beacon:sdk-secret-seed',
  'beacon:sdk_version',
]
export const network: Network = { type: NetworkType.MAINNET }
export const WalletOptions = {
  name: process.env.REACT_APP_NAME || 'MAVRYK',
  preferredNetwork: network.type,
}
export const setWallet = (wallet?: BeaconWallet) => (dispatch: AppDispatch) => {
  try {
    const walletOptions = {
      name: process.env.REACT_APP_NAME || 'MAVRYK',
      preferredNetwork: (process.env.REACT_APP_NETWORK || 'mainnet') as any,
    }
    const wallet = new BeaconWallet(walletOptions)
    dispatch({
      type: SET_WALLET,
      wallet,
    })
  } catch (err: any) {
    dispatch(showToaster(ERROR, 'Failed to initiate Wallet', err.message))
    console.error(`Failed to initiate Wallet: ${err.message}`)
  }

  dispatch({
    type: SET_WALLET,
    wallet,
  })
}

export const changeWallet = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(disconnect())
    await dispatch(connect())
  } catch (err: any) {
    console.error(`Failed to change wallet: `, err)
  }
}

export const connect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    const rpcNetwork = state.preferences.REACT_APP_RPC_PROVIDER || 'https://mainnet.smartpy.io'
    const wallet = new BeaconWallet(WalletOptions)
    const walletResponse = await checkIfWalletIsConnected(wallet)

    if (walletResponse.success) {
      const Tezos = new TezosToolkit(rpcNetwork)
      let account = await wallet.client.getActiveAccount()
      if (!account) {
        await wallet.client.requestPermissions({
          network,
        })
        account = await wallet.client.getActiveAccount()
      }

      dispatch({
        type: CONNECT,
        wallet,
        tezos: Tezos,
        ready: Boolean(wallet),
        accountPkh: account?.address,
      })
      if (account?.address) dispatch(getUserData(account?.address))
    }
  } catch (err: any) {
    console.error(`Failed to connect Wallet:`, err)
  }
}

export const disconnect = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const state = getState()
    // clearing wallet data
    await state.wallet.wallet?.clearActiveAccount()
    Beacon_localStorage_keys.forEach((key) => localStorage.removeItem(key))
    dispatch({ type: DISCONNECT })
    // set some wallet data, so user can see connect wallet instead of install wallet btn
    dispatch(setWallet())
  } catch (err) {
    if (err instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', err.message))
      console.error(`Failed to disconnect TempleWallet: ${err.message}`)
    }
  }
}

export const checkIfWalletIsConnected = async (wallet: any) => {
  try {
    const activeAccount = await wallet.client.getActiveAccount()
    if (!activeAccount) {
      await wallet.client.requestPermissions({
        network,
      })
    }
    return {
      success: true,
    }
  } catch (e) {
    // The user is not connected. A button should be displayed where the user can connect to his wallet.
    return { success: false, e }
  }
}
