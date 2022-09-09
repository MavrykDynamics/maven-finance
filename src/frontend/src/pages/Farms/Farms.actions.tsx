import { State } from '../../reducers'

// types
import { FarmStorage, FarmContractType } from '../../utils/TypesAndInterfaces/Farm'

//helpers
import { normalizeFarmStorage } from './Frams.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE } from '../../gql/queries'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from '../Doorman/Doorman.actions'
import { PRECISION_NUMBER } from '../../utils/constants'
import { hideModal } from '../../app/App.components/Modal/Modal.actions'
import type { AppDispatch, GetState } from '../../app/App.controller'

export const GET_FARM_CONTRACTS = 'GET_FARM_CONTRACTS'
export const getFarmsContracts = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  const { farmStorage } = state.farm
  // const requests = [
  //   'https://api.tzkt.io/v1/contracts/KT1DZ41c1mV12oh8YNXm54JpwUNZ2C5R6VaG',
  //   'https://api.tzkt.io/v1/contracts/KT1DZ41c1mV12oh8YNXm54JpwUNZ2C5R6VaG',
  // ]
  const urls = farmStorage.map(
    (item) => `${process.env.REACT_APP_RPC_TZKT_API}/v1/contracts/${item.lpTokenAddress}`,
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
export const getFarmStorage = () => async (dispatch: AppDispatch) => {
  const storage = await fetchFromIndexer(FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE)
  const farmStorage = normalizeFarmStorage(storage?.farm)

  await dispatch({
    type: GET_FARM_STORAGE,
    farmStorage,
  })

  await dispatch(getFarmsContracts())
}

export const HARVEST_REQUEST = 'HARVEST_REQUEST'
export const HARVEST_RESULT = 'HARVEST_RESULT'
export const HARVEST_ERROR = 'HARVEST_ERROR'
export const harvest = (farmAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch({
      type: HARVEST_ERROR,
      error,
    })
  }
}

export const DEPOSIT_REQUEST = 'DEPOSIT_REQUEST'
export const DEPOSIT_RESULT = 'DEPOSIT_RESULT'
export const DEPOSIT_ERROR = 'DEPOSIT_ERROR'
export const deposit = (farmAddress: string, amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch({
      type: DEPOSIT_ERROR,
      error,
    })
  }
}

export const WITHDRAW_REQUEST = 'WITHDRAW_REQUEST'
export const WITHDRAW_RESULT = 'WITHDRAW_RESULT'
export const WITHDRAW_ERROR = 'WITHDRAW_ERROR'
export const withdraw = (farmAddress: string, amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: WITHDRAW_ERROR,
      error,
    })
  }
}
