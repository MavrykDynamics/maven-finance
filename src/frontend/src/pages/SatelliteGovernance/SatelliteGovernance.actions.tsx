import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  GOVERNANCE_SATELLITE_STORAGE_QUERY,
  GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME,
  GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries/getGovernanceSatelliteStorage'

import { SatelliteGovernanceTransfer } from '../../utils/TypesAndInterfaces/Delegation'

//getGovernanceSatelliteStorage
export const GET_GOVERNANCE_SATELLITE_STORAGE = 'GET_GOVERNANCE_SATELLITE_STORAGE'
export const getGovernanceSatelliteStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    const governanceSatelliteStorage = await fetchFromIndexerWithPromise(
      GOVERNANCE_SATELLITE_STORAGE_QUERY,
      GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME,
      GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE,
    )

    await dispatch({
      type: GET_GOVERNANCE_SATELLITE_STORAGE,
      governanceSatelliteStorage,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: GET_GOVERNANCE_SATELLITE_STORAGE,
        error,
      })
    }
  }
}

// Suspend Satellite
export const SUSPEND_SATELLITE_REQUEST = 'SUSPEND_SATELLITE_REQUEST'
export const SUSPEND_SATELLITE_RESULT = 'SUSPEND_SATELLITE_RESULT'
export const SUSPEND_SATELLITE_ERROR = 'SUSPEND_SATELLITE_ERROR'
export const suspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: SUSPEND_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

// Unsuspend Satellite
export const UNSUSPEND_SATELLITE_REQUEST = 'UNSUSPEND_SATELLITE_REQUEST'
export const UNSUSPEND_SATELLITE_RESULT = 'UNSUSPEND_SATELLITE_RESULT'
export const UNSUSPEND_SATELLITE_ERROR = 'UNSUSPEND_SATELLITE_ERROR'
export const unsuspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: UNSUSPEND_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

// Ban Satellite
export const BAN_SATELLITE_REQUEST = 'BAN_SATELLITE_REQUEST'
export const BAN_SATELLITE_RESULT = 'BAN_SATELLITE_RESULT'
export const BAN_SATELLITE_ERROR = 'BAN_SATELLITE_ERROR'
export const banSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: BAN_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

// Unban Satellite
export const UNBAN_SATELLITE_REQUEST = 'UNBAN_SATELLITE_REQUEST'
export const UNBAN_SATELLITE_RESULT = 'UNBAN_SATELLITE_RESULT'
export const UNBAN_SATELLITE_ERROR = 'UNBAN_SATELLITE_ERROR'
export const unbanSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: UNBAN_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

// Remove all Oracles from Satellite
export const REMOVE_ORACLES_SATELLITE_REQUEST = 'REMOVE_ORACLES_SATELLITE_REQUEST'
export const REMOVE_ORACLES_SATELLITE_RESULT = 'REMOVE_ORACLES_SATELLITE_RESULT'
export const REMOVE_ORACLES_SATELLITE_ERROR = 'REMOVE_ORACLES_SATELLITE_ERROR'
export const removeOracles =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: REMOVE_ORACLES_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

// Remove from Aggregator
export const REMOVE_FROM_AGGREGATOR_REQUEST = 'REMOVE_FROM_AGGREGATOR_REQUEST'
export const REMOVE_FROM_AGGREGATOR_RESULT = 'REMOVE_FROM_AGGREGATOR_RESULT'
export const REMOVE_FROM_AGGREGATOR_ERROR = 'REMOVE_FROM_AGGREGATOR_ERROR'
export const removeOracleInAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: REMOVE_FROM_AGGREGATOR_ERROR,
          error,
        })
      }
    }
  }

// Add Oracle to Aggregator
export const ADD_FROM_AGGREGATOR_REQUEST = 'ADD_FROM_AGGREGATOR_REQUEST'
export const ADD_FROM_AGGREGATOR_RESULT = 'ADD_FROM_AGGREGATOR_RESULT'
export const ADD_FROM_AGGREGATOR_ERROR = 'ADD_FROM_AGGREGATOR_ERROR'
export const addOracleToAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: ADD_FROM_AGGREGATOR_ERROR,
          error,
        })
      }
    }
  }

// Set Aggregator Maintainer
export const SET_AGGREGATOR_MAINTAINER_REQUEST = 'SET_AGGREGATOR_MAINTAINER_REQUEST'
export const SET_AGGREGATOR_MAINTAINER_RESULT = 'SET_AGGREGATOR_MAINTAINER_RESULT'
export const SET_AGGREGATOR_MAINTAINER_ERROR = 'SET_AGGREGATOR_MAINTAINER_ERROR'
export const setAggregatorMaintainer =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
        type: SET_AGGREGATOR_MAINTAINER_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods
        .setAggregatorMaintainer(oracleAddress, satelliteAddress, purpose)
        .send()
      console.log('transaction', transaction)

      await dispatch(showToaster(INFO, 'Set Aggregator Maintainer...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Set Aggregator Maintainer done', 'All good :)'))

      await dispatch({
        type: SET_AGGREGATOR_MAINTAINER_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: SET_AGGREGATOR_MAINTAINER_ERROR,
          error,
        })
      }
    }
  }

// Drop Action
export const DROP_ACTION_REQUEST = 'DROP_ACTION_REQUEST'
export const DROP_ACTION_RESULT = 'DROP_ACTION_RESULT'
export const DROP_ACTION_ERROR = 'DROP_ACTION_ERROR'
export const dropAction =
  (actionId: number, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: DROP_ACTION_ERROR,
          error,
        })
      }
    }
  }

// Vote YES
export const VOTE_FOR_ACTION_REQUEST = 'VOTE_FOR_ACTION_REQUEST'
export const VOTE_FOR_ACTION_RESULT = 'VOTE_FOR_ACTION_RESULT'
export const VOTE_FOR_ACTION_ERROR = 'VOTE_FOR_ACTION_ERROR'
export const voteForAction =
  (actionId: number, voteType: string, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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
        type: VOTE_FOR_ACTION_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.voteForAction(actionId, voteType).send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Vote YES...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Vote YES done', 'All good :)'))

      await dispatch({
        type: VOTE_FOR_ACTION_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
      callback()
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: VOTE_FOR_ACTION_ERROR,
          error,
        })
      }
    }
  }

// Restore Satellite
export const RESTORE_SATELLITE_REQUEST = 'RESTORE_SATELLITE_REQUEST'
export const RESTORE_SATELLITE_RESULT = 'RESTORE_SATELLITE_RESULT'
export const RESTORE_SATELLITE_ERROR = 'RESTORE_SATELLITE_ERROR'
export const restoreSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
        type: RESTORE_SATELLITE_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.restoreSatellite(satelliteAddress, purpose).send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Restore Satellite...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Restore Satellite done', 'All good :)'))

      await dispatch({
        type: RESTORE_SATELLITE_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: RESTORE_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

// Update Aggregator Status
export const UPDATE_AGGREGATOR_STATUS_REQUEST = 'UPDATE_AGGREGATOR_STATUS_REQUEST'
export const UPDATE_AGGREGATOR_STATUS_RESULT = 'UPDATE_AGGREGATOR_STATUS_RESULT'
export const UPDATE_AGGREGATOR_STATUS_ERROR = 'UPDATE_AGGREGATOR_STATUS_ERROR'
export const updateAggregatorStatus =
  (aggregatorAddress: string, status: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
        type: UPDATE_AGGREGATOR_STATUS_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.updateAggregatorStatus(aggregatorAddress, status, purpose).send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Update Aggregator Status...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Update Aggregator Status done', 'All good :)'))

      await dispatch({
        type: UPDATE_AGGREGATOR_STATUS_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: UPDATE_AGGREGATOR_STATUS_ERROR,
          error,
        })
      }
    }
  }

// Register Aggregator
export const REGISTER_AGGREGATOR_REQUEST = 'REGISTER_AGGREGATOR_REQUEST'
export const REGISTER_AGGREGATOR_RESULT = 'REGISTER_AGGREGATOR_RESULT'
export const REGISTER_AGGREGATOR_ERROR = 'REGISTER_AGGREGATOR_ERROR'
export const registerAggregator =
  (aggregatorPair: string, aggregatorAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
        type: REGISTER_AGGREGATOR_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.registerAggregator(aggregatorPair, aggregatorAddress).send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Register Aggregator...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Register Aggregator done', 'All good :)'))

      await dispatch({
        type: REGISTER_AGGREGATOR_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: REGISTER_AGGREGATOR_ERROR,
          error,
        })
      }
    }
  }

// Fix Mistaken Transfer
export const FIX_TRANSFER_REQUEST = 'FIX_TRANSFER_REQUEST'
export const FIX_TRANSFER_RESULT = 'FIX_TRANSFER_RESULT'
export const FIX_TRANSFER_ERROR = 'FIX_TRANSFER_ERROR'
export const fixMistakenTransfer =
  (targetContractAddress: string, purpose: string, transferList: SatelliteGovernanceTransfer[]) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
        type: FIX_TRANSFER_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods
        .fixMistakenTransfer(targetContractAddress, purpose, transferList)
        .send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Fix Mistaken Transfer...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Fix Mistaken Transfer done', 'All good :)'))

      await dispatch({
        type: FIX_TRANSFER_RESULT,
      })

      await dispatch(getGovernanceSatelliteStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: FIX_TRANSFER_ERROR,
          error,
        })
      }
    }
  }
