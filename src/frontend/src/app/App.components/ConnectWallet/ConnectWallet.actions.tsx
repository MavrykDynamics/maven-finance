import { TempleDAppNetwork, TempleWallet } from '@temple-wallet/dapp'
import { State } from 'reducers'

import { getUserData } from '../../../pages/Doorman/Doorman.actions'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'

export const SET_WALLET = 'SET_WALLET'
export const setWallet = (wallet: TempleWallet) => (dispatch: any, getState: any) => {
  /*
  //TODO: For change to Beacon, don't forget to substitute params wall: TempleWallet to wallet?: any
  try {
    const walletOptions = {
      name: process.env.REACT_APP_NAME || 'MAVRYK',
      preferredNetwork: (process.env.REACT_APP_NETWORK || 'hangzhounet') as any,
    }
    const wallet = new BeaconWallet(walletOptions)
    console.log('Here in set wallet')
    dispatch({
      type: SET_WALLET,
      wallet,
    })
  } catch (err: any) {
    dispatch(showToaster(ERROR, 'Failed to initiate Wallet', err.message))
    console.error(`Failed to initiate Wallet: ${err.message}`)
  }
  */
  dispatch({
    type: SET_WALLET,
    wallet,
  })
}

export const CONNECT = 'CONNECT'
export const connect =
  ({ forcePermission = false }: { forcePermission?: boolean }) =>
  async (dispatch: any, getState: any) => {
    const state: State = getState()
    try {
      if (!state.wallet) {
        dispatch(showToaster(ERROR, 'Temple Wallet not available', ''))
        throw new Error('Temple Wallet not available')
      } else {
        await state.wallet.wallet?.connect((process.env.REACT_APP_NETWORK || 'hangzhounet') as TempleDAppNetwork, {
          forcePermission,
        })
        const tzs = state.wallet.wallet?.toTezos()
        const accountPkh = await tzs?.wallet.pkh()
        dispatch({
          type: CONNECT,
          tezos: tzs,
          ready: Boolean(tzs),
          accountPkh: accountPkh,
        })
        if (accountPkh) dispatch(getUserData(accountPkh))
      }
    } catch (err: any) {
      dispatch(showToaster(ERROR, 'Failed to connect TempleWallet', err.message))
      console.error(`Failed to connect TempleWallet: ${err.message}`)
    }
    /*
    //TODO: For use when using Beacon Wallet instead of above code for temple wallet
    try {
      if (!state.wallet) {
        dispatch(showToaster(ERROR, 'Wallet not available', ''))
        throw new Error('Wallet not available')
      } else {
        const tzs = new TezosToolkit(process.env.REACT_APP_RPC_PROVIDER as any)
        await state.wallet.wallet?.requestPermissions({
          network: {
            type: (process.env.REACT_APP_NETWORK || 'hangzhounet') as any,
          },
        })
        tzs.setWalletProvider(state.wallet.wallet)

        const accountPkh = await state.wallet.wallet.getPKH()

        dispatch({
          type: CONNECT,
          tezos: tzs,
          ready: Boolean(tzs),
          accountPkh: accountPkh,
        })
      }
    } catch (err: any) {
      dispatch(showToaster(ERROR, 'Failed to connect Wallet', err.message))
      console.error(`Failed to connect Wallet: ${err.message}`)
    }
    */
  }
