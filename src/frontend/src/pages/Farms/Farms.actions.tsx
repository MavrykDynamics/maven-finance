import { State } from '../../reducers'

// types
import { FarmContractType } from '../../utils/TypesAndInterfaces/Farm'

//helpers
import { getEndsInTimestampForFarmCards, getLPTokensInfo, normalizeFarmStorage } from './Frams.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE } from '../../gql/queries'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from '../Doorman/Doorman.actions'
import { PRECISION_NUMBER } from '../../utils/constants'
import { hideModal } from '../../app/App.components/Modal/Modal.actions'
import type { AppDispatch, GetState } from '../../app/App.controller'

export const SELECT_FARM_ADDRESS = 'SELECT_FARM_ADDRESS'
export const GET_FARM_STORAGE = 'GET_FARM_STORAGE'
export const getFarmStorage = () => async (dispatch: AppDispatch) => {
  // main try/catch to fetch endTime for farmsCards and farms cards from gql, if nested willl end up with error, it will set fetched card, of if this fail, will set []
  try {
    const storage = await fetchFromIndexer(FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE)
    const farmCardEndsIn = await getEndsInTimestampForFarmCards(storage?.farm)

    // try/catch to fetch lp coins metadata, if fails will log error and dispatch just farms cards with endTime
    try {
      const farmLPTokensInfo = await getLPTokensInfo(storage?.farm)

      // try/catch to fetch farms contracts, if fails it will log error and dispatch farms cards without contacts data
      try {
        const urls = farmLPTokensInfo.reduce<string[]>(
          (acc, item: { liquidityPairToken: { tokenAddress: Array<string> } }) => {
            if (item?.liquidityPairToken?.tokenAddress?.[0]) {
              acc.push(`https://api.tzkt.io/v1/contracts/${item.liquidityPairToken.tokenAddress[0]}`)
            }
            return acc
          },
          [],
        )

        const farmContracts: FarmContractType[] = await Promise.all(
          urls.map(async (url) => await (await fetch(url)).json()),
        )

        const farmStorage = normalizeFarmStorage(storage?.farm, farmCardEndsIn, farmLPTokensInfo, farmContracts)
        dispatch({
          type: GET_FARM_STORAGE,
          farmStorage,
        })
      } catch (e) {
        console.error('getFarmStorage, fetching contracts error: ', e)

        const farmStorage = normalizeFarmStorage(storage?.farm, farmCardEndsIn, farmLPTokensInfo, [])
        dispatch({
          type: GET_FARM_STORAGE,
          farmStorage,
        })
      }
    } catch (e) {
      console.error('getFarmStorage, fetching metadata error: ', e)

      const farmStorage = normalizeFarmStorage(storage?.farm, [], [], [])
      dispatch({
        type: GET_FARM_STORAGE,
        farmStorage,
      })
    }
  } catch (e) {
    dispatch(showToaster(ERROR, 'Error while fetching farms data', 'Please try to reload page'))
    dispatch({
      type: GET_FARM_STORAGE,
      farmStorage: [],
    })
  }
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
