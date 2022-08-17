import { State } from '../../reducers'
import { TezosToolkit } from '@taquito/taquito'

// types
import { FarmStorage, FarmContractType } from '../../utils/TypesAndInterfaces/Farm'

//helpers
import { normalizeFarmStorage } from './Frams.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE } from '../../gql/queries'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from '../Doorman/Doorman.actions'
import { PRECISION_NUMBER } from '../../utils/constants'
import { hideModal } from '../../app/App.components/Modal/Modal.actions'

export const GET_FARM_CONTRACTS = 'GET_FARM_CONTRACTS'
export const getFarmsContracts = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const { farmStorage } = state.farm
  // const requests = [
  //   'https://api.tzkt.io/v1/contracts/KT1DZ41c1mV12oh8YNXm54JpwUNZ2C5R6VaG',
  //   'https://api.tzkt.io/v1/contracts/KT1DZ41c1mV12oh8YNXm54JpwUNZ2C5R6VaG',
  // ]
  const urls = farmStorage.map(
    (item: FarmStorage) => `${process.env.REACT_APP_RPC_TZKT_API}/v1/contracts/${item.lpTokenAddress}`,
  ) as string[]

  try {
    const farmContracts = (await Promise.all(urls.map((url) => fetch(url))).then(async (res) => {
      return Promise.all(res.map(async (data) => await data.json()))
    })) as FarmContractType[]

    // TODO remore after test
    const testData = farmContracts.map((item) => {
      return {
        ...item,
        creator: {
          ...item.creator,
          alias: 'Test provider distributer',
        },
      }
    })

    await dispatch({
      type: GET_FARM_CONTRACTS,
      farmContracts: testData,
    })
  } catch (error) {
    console.log('error getFarmsContracts', error)
  }
}

export const SELECT_FARM_ADDRESS = 'SELECT_FARM_ADDRESS'
export const GET_FARM_STORAGE = 'GET_FARM_STORAGE'
export const getFarmStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const storage = await fetchFromIndexer(FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE)
  const farmStorage = normalizeFarmStorage(storage?.farm)
  console.log('%c ||||| farmStorage', 'color:yellowgreen', farmStorage)
  const convertedFarmFactoryStorage = storageToTypeConverter('farmFactory', storage?.farm_factory[0])
  await dispatch({
    type: GET_FARM_STORAGE,
    farmStorage,
  })
  await dispatch({
    type: GET_FARM_FACTORY_STORAGE,
    farmFactoryStorage: convertedFarmFactoryStorage,
  })

  await dispatch(getFarmsContracts())
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
    await dispatch({
      type: HARVEST_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(farmAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.claim().send()
    console.log('transaction', transaction)

    await dispatch(showToaster(INFO, 'Harvesting...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Harvesting done', 'All good :)'))

    await dispatch({
      type: HARVEST_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    await dispatch(getFarmStorage())
    await dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    await dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    await dispatch(showToaster(ERROR, 'Error', error.message))
    await dispatch({
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
    await dispatch({
      type: DEPOSIT_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(farmAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.deposit(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)

    await dispatch(showToaster(INFO, 'Depositing...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Depositing done', 'All good :)'))

    await dispatch({
      type: DEPOSIT_RESULT,
    })

    if (state.wallet.accountPkh) await dispatch(getUserData(state.wallet.accountPkh))

    await dispatch(getFarmStorage())
    await dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    await dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    await dispatch(showToaster(ERROR, 'Error', error.message))
    await dispatch({
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
    await dispatch({
      type: WITHDRAW_REQUEST,
    })

    const contract = await state.wallet.tezos?.wallet.at(farmAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.withdraw(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)
    await dispatch(showToaster(INFO, 'Withdrawing...', 'Please wait 30s'))
    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Withdrawing done', 'All good :)'))
    await dispatch({
      type: WITHDRAW_RESULT,
    })
    await dispatch(hideModal())
    if (state.wallet.accountPkh) await dispatch(getUserData(state.wallet.accountPkh))
    await dispatch(getFarmStorage())
    await dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    await dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: WITHDRAW_ERROR,
      error,
    })
  }
}
