import { TezosToolkit } from '@taquito/taquito'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import doormanAddress from 'deployments/doormanAddress.json'
import mvkTokenAddress from 'deployments/mvkTokenAddress.json'
import { State } from 'reducers'
import { DoormanBreakGlassConfigType, DoormanStorage, UserStakeBalanceLedger } from 'reducers/doorman'

import { HIDE_EXIT_FEE_MODAL } from './ExitFeeModal/ExitFeeModal.actions'
import { PRECISION_NUMBER } from '../../utils/constants'
import { MvkTokenStorage } from '../../reducers/mvkToken'
import { calcWithoutMu } from '../../utils/calcFunctions'
import { setItemInStorage, updateItemInStorage } from '../../utils/storage'

import { getContractBigmapKeys, getContractStorage } from '../../utils/api'

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
  const myBalance = myLedgerEntry ? calcWithoutMu(myLedgerEntry?.toNumber()) : 0
  const totalMvkSupply = calcWithoutMu(storage?.totalSupply)

  const mvkTokenStorage: MvkTokenStorage = {
    admin: storage.admin,
    contractAddresses: storage.contractAddresses,
    totalSupply: totalMvkSupply,
    whitelistContracts: storage.contractAddresses,
  }
  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: mvkTokenStorage,
    myMvkTokenBalance: myBalance,
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

  // if (!state.wallet.contractPermissionsMap.get(doormanAddress.address)) {
  //   dispatch(showToaster(ERROR, "Doorman contract doesn't have permission", 'Please approve permissions update'))
  //   dispatch(updateOperators('doorman', doormanAddress.address, state.wallet.accountPkh))
  // }

  try {
    console.log('Here in stake', amount * PRECISION_NUMBER)
    const doormanContract = await state.wallet.tezos?.wallet.at(doormanAddress.address)
    console.log('contract', doormanContract)
    const transaction = await doormanContract?.methods.stake(amount * PRECISION_NUMBER).send()
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
export const getDoormanStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    // const storage = await fetchFromIndexer(
    //   DOORMAN_STORAGE_QUERY,
    //   DOORMAN_STORAGE_QUERY_NAME,
    //   DOORMAN_STORAGE_QUERY_VARIABLE,
    // )
    // const convertedStorage = storageToTypeConverter('doorman', storage.doorman[0])
    const storage = await getContractStorage(doormanAddress.address)
    const userStakeBalanceLedgerBigMap = await getContractBigmapKeys(doormanAddress.address, 'userStakeBalanceLedger')

    const userStakeBalanceLedger: UserStakeBalanceLedger = new Map<string, string>()

    userStakeBalanceLedgerBigMap.forEach((element: any) => {
      const keyAddress = element.key
      const myStakeBalanceMu = Number(element.value?.balance) || 0
      const myStakeBalance = myStakeBalanceMu > 0 ? myStakeBalanceMu / PRECISION_NUMBER : 0
      userStakeBalanceLedger.set(keyAddress, myStakeBalance.toFixed(2))
    })

    const doormanBreakGlassConfig: DoormanBreakGlassConfigType = {
      stakeIsPaused: storage.breakGlassConfig?.stakeIsPaused,
      unstakeIsPaused: storage.breakGlassConfig?.unstakeIsPaused,
      compoundIsPaused: storage.breakGlassConfig?.compoundIsPaused,
    }

    const stakedMvkTotalSupply = calcWithoutMu(storage?.stakedMvkTotalSupply)
    const tempMvkTotalSupply = calcWithoutMu(storage?.tempMvkTotalSupply)
    const accumulatedFeesPerShare = calcWithoutMu(storage?.accumulatedFeesPerShare)
    const minMvkAmount = calcWithoutMu(storage?.minMvkAmount)
    const tempMvkMaximumTotalSupply = calcWithoutMu(storage?.tempMvkMaximumTotalSupply)

    const doormanStorage: DoormanStorage = {
      admin: storage.admin,
      breakGlassConfig: doormanBreakGlassConfig,
      userStakeBalanceLedger: userStakeBalanceLedger,
      tempMvkTotalSupply: tempMvkTotalSupply,
      stakedMvkTotalSupply: stakedMvkTotalSupply,
      accumulatedFeesPerShare: accumulatedFeesPerShare,
      minMvkAmount: minMvkAmount,
      tempMvkMaximumTotalSupply: tempMvkMaximumTotalSupply,
    }

    updateItemInStorage('DoormanStorage', doormanStorage)
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
