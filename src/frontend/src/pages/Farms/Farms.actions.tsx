import { State } from '../../reducers'
import { TezosToolkit } from '@taquito/taquito'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE } from '../../gql/queries'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from '../Doorman/Doorman.actions'
import { PRECISION_NUMBER } from '../../utils/constants'

export const GET_FARM_STORAGE = 'GET_FARM_STORAGE'
export const getFarmStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // const contract = accountPkh
  //   ? await state.wallet.tezos?.wallet.at(farmAddress.address)
  //   : await new TezosToolkit(
  //       (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
  //     ).contract.at(farmAddress.address)
  //
  // const storage = await (contract as any).storage()
  // console.log('Printing out Farm storage:\n', storage)
  const storage = await fetchFromIndexer(FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE)
  const convertedFarmStorage = storageToTypeConverter('farm', storage.farm)
  const convertedFarmFactoryStorage = storageToTypeConverter('farmFactory', storage.farm_factory[0])
  dispatch({
    type: GET_FARM_STORAGE,
    farmStorage: convertedFarmStorage,
  })
  dispatch({
    type: GET_FARM_FACTORY_STORAGE,
    farmFactoryStorage: convertedFarmFactoryStorage,
  })
}

export const GET_FARM_FACTORY_STORAGE = 'GET_FARM_FACTORY_STORAGE'
export const getFarmFactoryStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // TODO: Change address used to that of the Farm Factory address when possible
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(state.contractAddresses.farmFactoryAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(state.contractAddresses.farmFactoryAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Farm Factory storage:\n', storage)

  dispatch({
    type: GET_FARM_FACTORY_STORAGE,
    farmFactoryStorage: storage,
  })
}

export const HARVEST_REQUEST = 'HARVEST_REQUEST'
export const HARVEST_RESULT = 'HARVEST_RESULT'
export const HARVEST_ERROR = 'HARVEST_ERROR'
export const harvest = (farmAddress: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(farmAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.claim().send()
    console.log('transaction', transaction)

    dispatch({
      type: HARVEST_REQUEST,
    })
    dispatch(showToaster(INFO, 'Harvesting...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Harvesting done', 'All good :)'))

    dispatch({
      type: HARVEST_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getFarmStorage())
    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: HARVEST_ERROR,
      error,
    })
  }
}

export const DEPOSIT_REQUEST = 'DEPOSIT_REQUEST'
export const DEPOSIT_RESULT = 'DEPOSIT_RESULT'
export const DEPOSIT_ERROR = 'DEPOSIT_ERROR'
export const deposit = (farmAddress: string, amount: number) => async (dispatch: any, getState: any) => {
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
    const contract = await state.wallet.tezos?.wallet.at(farmAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.deposit(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)

    dispatch({
      type: DEPOSIT_REQUEST,
    })
    dispatch(showToaster(INFO, 'Depositing...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Depositing done', 'All good :)'))

    dispatch({
      type: DEPOSIT_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getFarmStorage())
    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: DEPOSIT_ERROR,
      error,
    })
  }
}

export const WITHDRAW_REQUEST = 'WITHDRAW_REQUEST'
export const WITHDRAW_RESULT = 'WITHDRAW_RESULT'
export const WITHDRAW_ERROR = 'WITHDRAW_ERROR'
export const withdraw = (farmAddress: string, amount: number) => async (dispatch: any, getState: any) => {
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
    const contract = await state.wallet.tezos?.wallet.at(farmAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.withdraw(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)

    dispatch({
      type: WITHDRAW_REQUEST,
    })
    dispatch(showToaster(INFO, 'Withdrawing...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Withdrawing done', 'All good :)'))

    dispatch({
      type: WITHDRAW_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getFarmStorage())
    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: WITHDRAW_ERROR,
      error,
    })
  }
}
