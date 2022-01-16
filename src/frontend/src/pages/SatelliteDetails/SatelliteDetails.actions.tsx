import { TezosToolkit } from '@taquito/taquito'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import doormanAddress from 'deployments/doormanAddress.json'
import mvkTokenAddress from 'deployments/mvkTokenAddress.json'
import { State } from 'reducers'
import { getMvkTokenStorage } from '../Doorman/Doorman.actions'
import { PRECISION_NUMBER } from '../../utils/constants'

/**
 * Currently unused content
 */
export const STAKE_REQUEST = 'STAKE_REQUEST'
export const STAKE_RESULT = 'STAKE_RESULT'
export const STAKE_ERROR = 'STAKE_ERROR'
export const stake = (amount: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(doormanAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.stake(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)

    dispatch({
      type: STAKE_REQUEST,
      amount,
    })
    dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))

    dispatch({
      type: STAKE_RESULT,
    })

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: STAKE_ERROR,
      error,
    })
  }
}

export const UNSTAKE_REQUEST = 'UNSTAKE_REQUEST'
export const UNSTAKE_RESULT = 'UNSTAKE_RESULT'
export const UNSTAKE_ERROR = 'UNSTAKE_ERROR'
export const unstake = (amount: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(doormanAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.unstake(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)

    dispatch({
      type: UNSTAKE_REQUEST,
      amount,
    })
    dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))

    dispatch({
      type: UNSTAKE_RESULT,
    })

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNSTAKE_ERROR,
      error,
    })
  }
}
