import { BeaconWallet } from '@taquito/beacon-wallet'
import { TezosToolkit } from '@taquito/taquito'
import { TempleDAppNetwork, TempleWallet } from '@temple-wallet/dapp'
import { State } from 'reducers'

import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../Toaster/Toaster.constants'
import { getChainInfo } from '../../../utils/api'
import { getUserData } from '../../../pages/Doorman/Doorman.actions'
import mvkTokenAddress from '../../../deployments/mvkTokenAddress.json'

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
        debugger
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

export const GET_HEAD_DATA = 'SET_HEAD_DATA'
export const getHeadData = () => async (dispatch: any, getState: any) => {
  const state: State = getState()
  const headData = await getChainInfo()
  if (JSON.stringify(state.preferences.headData) !== JSON.stringify(headData)) {
    dispatch({
      type: GET_HEAD_DATA,
      headData,
    })
  }
}

export const UPDATE_OPERATORS_REQUEST = 'UPDATE_OPERATORS_REQUEST'
export const UPDATE_OPERATORS_RESULT = 'UPDATE_OPERATORS_RESULT'
export const UPDATE_OPERATORS_ERROR = 'UPDATE_OPERATORS_ERROR'
export const updateOperators =
  (contractName: string, contractAddress: string, accountPkh?: string) => async (dispatch: any, getState: any) => {
    const state: State = getState()
    try {
      const contract = accountPkh
        ? await state.wallet.tezos?.wallet.at(mvkTokenAddress.address)
        : await new TezosToolkit(
            (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
          ).contract.at(mvkTokenAddress.address)

      console.log('contract', contract)
      const transaction = await contract?.methods
        .update_operators([
          {
            add_operator: {
              owner: accountPkh,
              operator: contractAddress,
              token_id: 0,
            },
          },
        ])
        .send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, `Allowing ${contractName} permission...`, 'Please wait 30s'))
      const done = await transaction?.confirmation()
      console.log('done here in Update Operators', done)

      dispatch({
        type: UPDATE_OPERATORS_REQUEST,
        contract: contractAddress,
        // @ts-ignore
        isAuthorized: done['completed'],
      })
      dispatch(showToaster(SUCCESS, `${contractName} is authorized`, 'All good :)'))

      dispatch({
        type: UPDATE_OPERATORS_RESULT,
      })
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: UPDATE_OPERATORS_ERROR,
        error,
      })
    }
  }
