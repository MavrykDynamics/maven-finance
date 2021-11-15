import { TempleDAppNetwork, TempleWallet } from '@temple-wallet/dapp'
import { State } from 'reducers'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'

export const SET_WALLET = 'SET_WALLET'
export const setWallet = (wallet: TempleWallet) => (dispatch: any, getState: any) => {
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
        await state.wallet.wallet?.connect((process.env.REACT_APP_NETWORK || 'granadanet') as TempleDAppNetwork, {
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
      }
    } catch (err: any) {
      dispatch(showToaster(ERROR, 'Failed to connect TempleWallet', err.message))
      console.error(`Failed to connect TempleWallet: ${err.message}`)
    }
  }
