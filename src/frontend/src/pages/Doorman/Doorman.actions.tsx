import { TezosToolkit } from '@taquito/taquito'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import doormanAddress from 'deployments/doormanAddress'
import mvkTokenAddress from 'deployments/mvkTokenAddress'
import vMvkTokenAddress from 'deployments/vMvkTokenAddress'
import { State } from 'reducers'
import { HIDE_EXIT_FEE_MODAL } from './ExitFeeModal/ExitFeeModal.actions'

export const GET_MVK_TOKEN_STORAGE = 'GET_MVK_TOKEN_STORAGE'
export const getMvkTokenStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }

  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(mvkTokenAddress)
    : await new TezosToolkit(process.env.REACT_APP_RPC_PROVIDER as any).contract.at(mvkTokenAddress)

  const storage = await (contract as any).storage()
  const myLedgerEntry = accountPkh ? await storage['ledger'].get(accountPkh) : undefined
  const myBalanceMu = myLedgerEntry?.balance.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / 1000000 : 0

  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: storage,
    myMvkTokenBalance: myBalance?.toFixed(2),
  })
}

export const GET_V_MVK_TOKEN_STORAGE = 'GET_V_MVK_TOKEN_STORAGE'
export const getVMvkTokenStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }

  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(vMvkTokenAddress)
    : await new TezosToolkit(process.env.REACT_APP_RPC_PROVIDER as any).contract.at(vMvkTokenAddress)

  const storage = await (contract as any).storage()
  const myLedgerEntry = accountPkh ? await storage['ledger'].get(accountPkh) : undefined
  const myBalanceMu = myLedgerEntry?.balance.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / 1000000 : 0

  dispatch({
    type: GET_V_MVK_TOKEN_STORAGE,
    vMvkTokenStorage: storage,
    myVMvkTokenBalance: myBalance?.toFixed(2),
  })
}

export const STAKE_REQUEST = 'STAKE_REQUEST'
export const STAKE_RESULT = 'STAKE_RESULT'
export const STAKE_ERROR = 'STAKE_ERROR'
export const stake = (amount: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(doormanAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.stake(amount * 1000000).send()
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
    dispatch(getVMvkTokenStorage(state.wallet.accountPkh))
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

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(doormanAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.unstake(amount * 1000000).send()
    console.log('transaction', transaction)

    dispatch({
      type: UNSTAKE_REQUEST,
      amount,
    })
    dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))
    dispatch({
      type: HIDE_EXIT_FEE_MODAL,
    })

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))

    dispatch({
      type: UNSTAKE_RESULT,
    })

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getVMvkTokenStorage(state.wallet.accountPkh))
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNSTAKE_ERROR,
      error,
    })
  }
}
