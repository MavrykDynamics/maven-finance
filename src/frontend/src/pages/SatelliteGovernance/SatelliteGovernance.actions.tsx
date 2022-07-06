import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  GOVERNANCE_SATELLITE_STORAGE_QUERY,
  GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME,
  GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries/getGovernanceSatelliteStorage'

//getGovernanceSatelliteStorage
export const GET_GOVERNANCE_SATELLITE_STORAGE = 'GET_GOVERNANCE_SATELLITE_STORAGE'
export const getGovernanceSatelliteStorage = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const governanceSatelliteStorage = await fetchFromIndexerWithPromise(
      GOVERNANCE_SATELLITE_STORAGE_QUERY,
      GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME,
      GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE,
    )

    console.log('%c ||||| governanceSatelliteStorage', 'color:yellowgreen', governanceSatelliteStorage)

    await dispatch({
      type: GET_GOVERNANCE_SATELLITE_STORAGE,
      governanceSatelliteStorage,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_GOVERNANCE_SATELLITE_STORAGE,
      error,
    })
  }
}

// Suspend Satellite
export const SUSPEND_SATELLITE_REQUEST = 'SUSPEND_SATELLITE_REQUEST'
export const SUSPEND_SATELLITE_RESULT = 'SUSPEND_SATELLITE_RESULT'
export const SUSPEND_SATELLITE_ERROR = 'SUSPEND_SATELLITE_ERROR'
export const suspendSatellite = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
    dispatch({
      type: SUSPEND_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.suspendSatellite(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Suspend Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Suspend Satellite done', 'All good :)'))

    await dispatch({
      type: SUSPEND_SATELLITE_RESULT,
    })

    await dispatch(getGovernanceSatelliteStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: SUSPEND_SATELLITE_ERROR,
      error,
    })
  }
}

// Unsuspend Satellite
export const UNSUSPEND_SATELLITE_REQUEST = 'UNSUSPEND_SATELLITE_REQUEST'
export const UNSUSPEND_SATELLITE_RESULT = 'UNSUSPEND_SATELLITE_RESULT'
export const UNSUSPEND_SATELLITE_ERROR = 'UNSUSPEND_SATELLITE_ERROR'
export const unsuspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      dispatch({
        type: UNSUSPEND_SATELLITE_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.unsuspendSatellite(satelliteAddress, purpose).send()
      console.log('transaction', transaction)

      await dispatch(showToaster(INFO, 'Unsuspend Satellite...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Unsuspend Satellite done', 'All good :)'))

      await dispatch({
        type: UNSUSPEND_SATELLITE_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: UNSUSPEND_SATELLITE_ERROR,
        error,
      })
    }
  }

// Ban Satellite
export const BAN_SATELLITE_REQUEST = 'BAN_SATELLITE_REQUEST'
export const BAN_SATELLITE_RESULT = 'BAN_SATELLITE_RESULT'
export const BAN_SATELLITE_ERROR = 'BAN_SATELLITE_ERROR'
export const banSatellite = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
    dispatch({
      type: BAN_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.banSatellite(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    await dispatch(showToaster(INFO, 'Ban Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Ban Satellite done', 'All good :)'))

    await dispatch({
      type: BAN_SATELLITE_RESULT,
    })

    await dispatch(getGovernanceSatelliteStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: BAN_SATELLITE_ERROR,
      error,
    })
  }
}

// Unban Satellite
export const UNBAN_SATELLITE_REQUEST = 'UNBAN_SATELLITE_REQUEST'
export const UNBAN_SATELLITE_RESULT = 'UNBAN_SATELLITE_RESULT'
export const UNBAN_SATELLITE_ERROR = 'UNBAN_SATELLITE_ERROR'
export const unbanSatellite = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
    dispatch({
      type: UNBAN_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.unbanSatellite(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    await dispatch(showToaster(INFO, 'Unban Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Unban Satellite done', 'All good :)'))

    await dispatch({
      type: UNBAN_SATELLITE_RESULT,
    })

    await dispatch(getGovernanceSatelliteStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNBAN_SATELLITE_ERROR,
      error,
    })
  }
}

// Remove all Oracles from Satellite
export const REMOVE_ORACLES_SATELLITE_REQUEST = 'REMOVE_ORACLES_SATELLITE_REQUEST'
export const REMOVE_ORACLES_SATELLITE_RESULT = 'REMOVE_ORACLES_SATELLITE_RESULT'
export const REMOVE_ORACLES_SATELLITE_ERROR = 'REMOVE_ORACLES_SATELLITE_ERROR'
export const removeOracles = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
    dispatch({
      type: REMOVE_ORACLES_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.removeAllSatelliteOracles(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    await dispatch(showToaster(INFO, 'Remove all Oracles from Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Remove all Oracles from Satellite done', 'All good :)'))

    await dispatch({
      type: REMOVE_ORACLES_SATELLITE_RESULT,
    })

    await dispatch(getGovernanceSatelliteStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: REMOVE_ORACLES_SATELLITE_ERROR,
      error,
    })
  }
}

// Remove from Aggregator
export const REMOVE_FROM_AGGREGATOR_REQUEST = 'REMOVE_FROM_AGGREGATOR_REQUEST'
export const REMOVE_FROM_AGGREGATOR_RESULT = 'REMOVE_FROM_AGGREGATOR_RESULT'
export const REMOVE_FROM_AGGREGATOR_ERROR = 'REMOVE_FROM_AGGREGATOR_ERROR'
export const removeOracleInAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      dispatch({
        type: REMOVE_FROM_AGGREGATOR_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods
        .removeOracleInAggregator(oracleAddress, satelliteAddress, purpose)
        .send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Remove from Aggregator...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Remove from Aggregator done', 'All good :)'))

      await dispatch({
        type: REMOVE_FROM_AGGREGATOR_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: REMOVE_FROM_AGGREGATOR_ERROR,
        error,
      })
    }
  }

// Add Oracle to Aggregator
export const ADD_FROM_AGGREGATOR_REQUEST = 'ADD_FROM_AGGREGATOR_REQUEST'
export const ADD_FROM_AGGREGATOR_RESULT = 'ADD_FROM_AGGREGATOR_RESULT'
export const ADD_FROM_AGGREGATOR_ERROR = 'ADD_FROM_AGGREGATOR_ERROR'
export const addOracleToAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      dispatch({
        type: ADD_FROM_AGGREGATOR_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.addOracleToAggregator(oracleAddress, satelliteAddress, purpose).send()
      console.log('transaction', transaction)

      await dispatch(showToaster(INFO, 'Add Oracle to Aggregator...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Add Oracle to Aggregator done', 'All good :)'))

      await dispatch({
        type: ADD_FROM_AGGREGATOR_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: ADD_FROM_AGGREGATOR_ERROR,
        error,
      })
    }
  }

// Drop Action
export const DROP_ACTION_REQUEST = 'DROP_ACTION_REQUEST'
export const DROP_ACTION_RESULT = 'DROP_ACTION_RESULT'
export const DROP_ACTION_ERROR = 'DROP_ACTION_ERROR'
export const dropAction = (actionId: number, callback: () => void) => async (dispatch: any, getState: any) => {
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
    dispatch({
      type: DROP_ACTION_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.dropAction(actionId).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Drop Action...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Drop Action done', 'All good :)'))

    await dispatch({
      type: DROP_ACTION_RESULT,
    })

    await dispatch(getGovernanceSatelliteStorage())
    callback()
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: DROP_ACTION_ERROR,
      error,
    })
  }
}
