import { TezosToolkit } from '@taquito/taquito'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import doormanAddress from 'deployments/doormanAddress.json'
import mvkTokenAddress from 'deployments/mvkTokenAddress.json'
import { State } from 'reducers'
import { DoormanBreakGlassConfigType, DoormanStorage, UserStakeBalanceLedger, UserStakeRecord, UserStakeRecordsLedger } from 'reducers/doorman'
import { getContractBigmapKeys, getContractStorage } from 'utils/api'

import { MvkTokenStorage } from '../../reducers/mvkToken'
import { PRECISION_NUMBER } from '../../utils/constants'
import { HIDE_EXIT_FEE_MODAL } from './ExitFeeModal/ExitFeeModal.actions'

export const GET_MVK_TOKEN_STORAGE = 'GET_MVK_TOKEN_STORAGE'
export const getMvkTokenStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(mvkTokenAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(mvkTokenAddress.address)
  const storage = await (contract as any).storage()
  const myLedgerEntry = accountPkh ? await storage['ledger'].get(accountPkh) : undefined
  const myBalanceMu = myLedgerEntry?.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / PRECISION_NUMBER : 0

  const totalMvkSupplyMu = parseFloat(storage?.totalSupply) || 0
  const totalMvkSupply = totalMvkSupplyMu > 0 ? totalMvkSupplyMu / PRECISION_NUMBER : 0

  const mvkTokenStorage: MvkTokenStorage = {
    admin: storage.admin,
    contractAddresses: storage.contractAddresses,
    totalSupply: totalMvkSupply,
    whitelistContracts: storage.contractAddresses,
  }
  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: mvkTokenStorage,
    myMvkTokenBalance: myBalance?.toFixed(2),
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
    dispatch(getDoormanStorage())
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
    const contract = await state.wallet.tezos?.wallet.at(doormanAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.unstake(amount * PRECISION_NUMBER).send()
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
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNSTAKE_ERROR,
      error,
    })
  }
}

export const GET_DOORMAN_STORAGE = 'GET_DOORMAN_STORAGE'
export const getDoormanStorage = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const storage = await getContractStorage(doormanAddress.address)
    const userStakeBalanceLedgerBigMap = await getContractBigmapKeys(doormanAddress.address, 'userStakeBalanceLedger')
    const userStakeRecordsLedgerBigMap = await getContractBigmapKeys(doormanAddress.address, 'userStakeRecordsLedger')

    const userStakeBalanceLedger: UserStakeBalanceLedger = new Map<string, string>(),
      userStakeRecordsLedger: UserStakeRecordsLedger = new Map<string, Map<number, UserStakeRecord>>()

    userStakeBalanceLedgerBigMap.forEach((element: any) => {
      const keyAddress = element.key
      const myBalanceMu = Number(element.value) || 0
      const myBalance = myBalanceMu > 0 ? myBalanceMu / PRECISION_NUMBER : 0
      userStakeBalanceLedger.set(keyAddress, myBalance.toFixed(2))
    })
    userStakeRecordsLedgerBigMap.forEach((element: any) => {
      const keyAddress = element.key
      const value = (element.value as Map<number, UserStakeRecord>) || {}
      userStakeRecordsLedger.set(keyAddress, value)
    })

    const doormanBreakGlassConfig: DoormanBreakGlassConfigType = {
      stakeIsPaused: storage.breakGlassConfig?.stakeIsPaused,
      unstakeIsPaused: storage.breakGlassConfig?.unstakeIsPaused,
    }

    const stakedMvkTotalSupplyMu = parseFloat(storage?.stakedMvkTotalSupply) || 0
    const stakedMvkTotalSupply = stakedMvkTotalSupplyMu > 0 ? stakedMvkTotalSupplyMu / PRECISION_NUMBER : 0
    const tempMvkTotalSupplyMu = parseFloat(storage?.tempMvkTotalSupply) || 0
    const tempMvkTotalSupply = tempMvkTotalSupplyMu > 0 ? tempMvkTotalSupplyMu / PRECISION_NUMBER : 0
    const doormanStorage: DoormanStorage = {
      admin: storage.admin,
      breakGlassConfig: doormanBreakGlassConfig,
      mvkTokenAddress: storage.mvkTokenAddress,
      delegationAddress: storage.delegationAddress,
      exitFeePoolAddress: storage.exitFeePoolAddress,
      userStakeBalanceLedger: userStakeBalanceLedger,
      userStakeRecordsLedger: userStakeRecordsLedger,
      tempMvkTotalSupply: tempMvkTotalSupply,
      totalStakedMvkSupply: stakedMvkTotalSupply,
    }

    dispatch({
      type: GET_DOORMAN_STORAGE,
      storage: doormanStorage,
      totalStakedMvkSupply: stakedMvkTotalSupply,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_DOORMAN_STORAGE,
      error,
    })
  }
}
