import { TempleDAppNetwork, TempleWallet } from '@temple-wallet/dapp'
import { State } from 'reducers'

import { CLEAN_USER_DATA, getUserData } from '../../../pages/Doorman/Doorman.actions'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import type { AppDispatch, GetState } from '../../App.controller'

// const network = process.env.REACT_APP_API_NETWORK
const network = 'ghostnet'

export const SET_WALLET = 'SET_WALLET'
export const setWallet = (wallet: TempleWallet) => (dispatch: AppDispatch) => {
  dispatch({
    type: SET_WALLET,
    wallet,
  })
}

export const CONNECT = 'CONNECT'
export const connect =
  ({ forcePermission = false }: { forcePermission?: boolean }) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()
    try {
      if (!state.wallet) {
        dispatch(showToaster(ERROR, 'Temple Wallet not available', ''))
        throw new Error('Temple Wallet not available')
      } else {
        await state.wallet.wallet?.connect((network || 'hangzhounet') as TempleDAppNetwork, {
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
    } catch (err) {
      if (err instanceof Error) {
        dispatch(showToaster(ERROR, 'Failed to connect TempleWallet', err.message))
        console.error(`Failed to connect TempleWallet: ${err.message}`)
      }
    }
  }

export const DISCONNECT = 'DISCONNECT'
export const disconnect = () => async (dispatch: AppDispatch) => {
  try {
    // clearing wallet data
    dispatch({ type: DISCONNECT })
    // set some wallet data, so user can see connect wallet instead of install wallet btn
    dispatch(setWallet(new TempleWallet(process.env.REACT_APP_NAME || 'MAVRYK')))
    // clear user data
    dispatch({
      type: CLEAN_USER_DATA,
    })
  } catch (err) {
    if (err instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', err.message))
      console.error(`Failed to disconnect TempleWallet: ${err.message}`)
    }
  }
}
