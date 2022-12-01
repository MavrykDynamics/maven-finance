import { BeaconWallet } from '@taquito/beacon-wallet'
import { Network, NetworkType } from '@airgap/beacon-sdk'
import { TezosToolkit } from '@taquito/taquito'
import { AppDispatch, GetState } from 'app/App.controller'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { fetchUserData } from 'pages/Doorman/Doorman.actions'
import { DEFAULT_USER } from 'reducers/wallet'

// TODO: check ts-ignores, here NetworkType is not compatible with  NetworkType | undefined

export const Beacon_localStorage_keys = [
  'beacon:active-account',
  'beacon:postmessage-peers-dapp',
  'beacon:accounts',
  'beacon:sdk-secret-seed',
  'beacon:sdk_version',
]
export const network: Network = { type: NetworkType.GHOSTNET }
export const WalletOptions = {
  name: process.env.REACT_APP_NAME || 'MAVRYK',
  preferredNetwork: network.type,
}

export const SET_WALLET = 'SET_WALLET'
export const setWallet = () => (dispatch: AppDispatch) => {
  try {
    // @ts-ignore
    const wallet = new BeaconWallet(WalletOptions)
    dispatch({
      type: SET_WALLET,
      wallet,
    })
  } catch (e) {
    console.error(`Failed to initiate wallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to initiate wallet', e.message))
    }
  }
}

export const changeWallet = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(disconnect())
    await dispatch(connect())
  } catch (e) {
    console.error(`Failed to change wallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to change wallet', e.message))
    }
  }
}

export const CONNECT = 'CONNECT'
export const connect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()

  try {
    // getting userWallet data
    const rpcNetwork = state.preferences.REACT_APP_RPC_PROVIDER
    // @ts-ignore
    const wallet = new BeaconWallet(WalletOptions)
    const walletResponse = await checkIfWalletIsConnected(wallet)

    if (walletResponse.success) {
      const Tezos = new TezosToolkit(rpcNetwork)
      let account = await wallet.client.getActiveAccount()
      if (!account) {
        await wallet.client.requestPermissions({
          // @ts-ignore
          network,
        })
        account = await wallet.client.getActiveAccount()
      }

      await Tezos.setRpcProvider(rpcNetwork)
      await Tezos.setWalletProvider(wallet)

      const accountPkh = account?.address

      // getting userData
      const userData = accountPkh
        ? await fetchUserData(
            accountPkh,
            state.delegation.delegationStorage.activeSatellites,
            state.preferences.headData?.level,
          )
        : DEFAULT_USER

      console.log('userData', userData)

      dispatch({
        type: CONNECT,
        wallet,
        tezos: Tezos,
        userData,
        accountPkh,
      })
    }
  } catch (e) {
    console.error(`Failed to connect wallet:`, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, `Failed to connect wallet:`, e.message))
    }
  }
}

export const DISCONNECT = 'DISCONNECT'
export const disconnect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    // clearing wallet data
    await state.wallet.wallet?.clearActiveAccount()
    Beacon_localStorage_keys.forEach((key) => localStorage.removeItem(key))

    dispatch({ type: DISCONNECT })
    dispatch(setWallet())
  } catch (e) {
    console.error(`Failed to disconnect TempleWallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', e.message))
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
