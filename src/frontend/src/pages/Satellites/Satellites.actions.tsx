import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import {
  DELEGATION_STORAGE_QUERY,
  DELEGATION_STORAGE_QUERY_NAME,
  DELEGATION_STORAGE_QUERY_VARIABLE,
  ORACLE_STORAGE_QUERY,
  ORACLE_STORAGE_QUERY_NAME,
  ORACLE_STORAGE_QUERY_VARIABLE,
  DATA_FEEDS_HISTORY_QUERY,
  DATA_FEEDS_HISTORY_QUERY_NAME,
  DATA_FEEDS_HISTORY_QUERY_VARIABLE,
} from 'gql/queries'
import { fetchFromIndexer, fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import {
  normalizeDelegationStorage,
  normalizeDataFeedsHistory,
  normalizeDataFeedsVolatility,
} from './Satellites.helpers'
import { normalizeOracle } from 'app/App.helpers'
import { toggleLoader } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER } from 'utils/constants'

export const GET_DELEGATION_STORAGE = 'GET_DELEGATION_STORAGE'
export const getDelegationStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const delegationStorageFromIndexer = await fetchFromIndexerWithPromise(
      DELEGATION_STORAGE_QUERY,
      DELEGATION_STORAGE_QUERY_NAME,
      DELEGATION_STORAGE_QUERY_VARIABLE,
    )

    const delegationStorage = normalizeDelegationStorage(delegationStorageFromIndexer?.delegation[0])

    dispatch({
      type: GET_DELEGATION_STORAGE,
      delegationStorage,
    })
  } catch (error) {
    console.error('getDelegationStorage error: ', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: GET_DELEGATION_STORAGE,
        error,
      })
    }
  }
}

export const delegate = (satelliteAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  if (state.user.myMvkTokenBalance === 0 && state.user.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
    return
  }

  if (state.user.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please stake your MVK'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    const transaction = await contract?.methods.delegateToSatellite(state.wallet.accountPkh, satelliteAddress).send()
    dispatch(toggleLoader(ROCKET_LOADER))
    dispatch(showToaster(INFO, 'Delegating...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Delegation done', 'All good :)'))
    dispatch(toggleLoader())

    if (state.wallet.accountPkh) await dispatch(getUserData(state.wallet.accountPkh))

    await dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    await dispatch(getDelegationStorage())
    await dispatch(getDoormanStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleLoader())
    }
  }
}

export const undelegate = () => async (dispatch: AppDispatch, getState: GetState) => {
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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    const transaction = await contract?.methods.undelegateFromSatellite(state.wallet.accountPkh).send()

    dispatch(toggleLoader(ROCKET_LOADER))
    dispatch(showToaster(INFO, 'Undelegating...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Undelegating done', 'All good :)'))
    dispatch(toggleLoader())

    if (state.wallet.accountPkh) await dispatch(getUserData(state.wallet.accountPkh))

    await dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    await dispatch(getDelegationStorage())
    await dispatch(getDoormanStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleLoader())
    }
  }
}

export const GET_ORACLES_STORAGE = 'GET_ORACLES_STORAGE'
export const getOracleStorage = () => async (dispatch: AppDispatch) => {
  try {
    const oracleData = await fetchFromIndexer(
      ORACLE_STORAGE_QUERY,
      ORACLE_STORAGE_QUERY_NAME,
      ORACLE_STORAGE_QUERY_VARIABLE,
    )

    const oraclesStorage = normalizeOracle(oracleData)
    dispatch({ type: GET_ORACLES_STORAGE, oraclesStorage })
  } catch (error) {
    console.error('getOracleStorage: ', error)
  }
}

export const REGISTER_FEED = 'REGISTER_FEED'
export const REGISTER_FEED_ERROR = 'REGISTER_FEED_ERROR'
export const registerFeedAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot register feed', ''))
    return
  }

  try {
    // TODO: Implement this action ORACLES_SI
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: REGISTER_FEED_ERROR,
        error,
      })
    }
  }
}

// get Data Feeds History and Volatility
export const GET_DATA_FEEDS_HISTORY = 'GET_DATA_FEEDS_HISTORY'
export const getDataFeedsHistory = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      DATA_FEEDS_HISTORY_QUERY,
      DATA_FEEDS_HISTORY_QUERY_NAME,
      DATA_FEEDS_HISTORY_QUERY_VARIABLE,
    )

    const dataFeedsHistory = normalizeDataFeedsHistory(storage)
    const dataFeedsVolatility = normalizeDataFeedsVolatility(storage)

    dispatch({
      type: GET_DATA_FEEDS_HISTORY,
      dataFeedsHistory,
      dataFeedsVolatility,
    })
  } catch (error) {
    console.error('getDataFeedsHistory error: ', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: GET_DATA_FEEDS_HISTORY,
        error,
      })
    }
  }
}
