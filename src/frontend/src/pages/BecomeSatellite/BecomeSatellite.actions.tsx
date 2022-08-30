import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { PRECISION_NUMBER } from '../../utils/constants'
import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'
import type { AppDispatch, GetState } from '../../app/App.controller'

export const REGISTER_AS_SATELLITE_REQUEST = 'REGISTER_AS_SATELLITE_REQUEST'
export const REGISTER_AS_SATELLITE_RESULT = 'REGISTER_AS_SATELLITE_RESULT'
export const REGISTER_AS_SATELLITE_ERROR = 'REGISTER_AS_SATELLITE_ERROR'
export const registerAsSatellite =
  (form: RegisterAsSatelliteForm, accountPkh: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      console.log('contract', contract)

      console.log(form)
      const transaction = await contract?.methods
        .registerAsSatellite(form.name, form.description, form.image, form.website, form.fee * 100)
        .send()
      console.log('transaction', transaction)

      dispatch({
        type: REGISTER_AS_SATELLITE_REQUEST,
        form,
      })
      dispatch(showToaster(INFO, 'Registering...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Satellite Registered.', 'All good :)'))

      dispatch({
        type: REGISTER_AS_SATELLITE_RESULT,
      })
      dispatch(getDelegationStorage())
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: REGISTER_AS_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

export const UPDATE_AS_SATELLITE_REQUEST = 'UPDATE_AS_SATELLITE_REQUEST'
export const UPDATE_AS_SATELLITE_RESULT = 'UPDATE_AS_SATELLITE_RESULT'
export const UPDATE_AS_SATELLITE_ERROR = 'UPDATE_AS_SATELLITE_ERROR'
export const updateSatelliteRecord =
  (form: RegisterAsSatelliteForm) => async (dispatch: AppDispatch, getState: GetState) => {
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
      console.log('contract', contract)

      const transaction = await contract?.methods
        .updateSatelliteRecord(form.name, form.description, form.image, form.website, form.fee * PRECISION_NUMBER)
        .send()
      console.log('transaction', transaction)

      dispatch({
        type: UPDATE_AS_SATELLITE_REQUEST,
        form,
      })
      dispatch(showToaster(INFO, 'Registering...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Satellite Registered.', 'All good :)'))

      dispatch({
        type: UPDATE_AS_SATELLITE_RESULT,
      })
      dispatch(getDelegationStorage())
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: UPDATE_AS_SATELLITE_ERROR,
          error,
        })
      }
    }
  }

export const UNREGISTER_AS_SATELLITE_REQUEST = 'UNREGISTER_AS_SATELLITE_REQUEST'
export const UNREGISTER_AS_SATELLITE_RESULT = 'UNREGISTER_AS_SATELLITE_RESULT'
export const UNREGISTER_AS_SATELLITE_ERROR = 'UNREGISTER_AS_SATELLITE_ERROR'
export const unregisterAsSatellite = () => async (dispatch: AppDispatch, getState: GetState) => {
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
    console.log('contract', contract)

    const transaction = await contract?.methods.unregisterAsSatellite().send()
    console.log('transaction', transaction)

    dispatch({
      type: UNREGISTER_AS_SATELLITE_REQUEST,
    })
    dispatch(showToaster(INFO, 'Unregistering...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Satellite is no longer registered.', 'All good :)'))

    dispatch({
      type: UNREGISTER_AS_SATELLITE_RESULT,
    })
    dispatch(getDelegationStorage())
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: UNREGISTER_AS_SATELLITE_ERROR,
        error,
      })
    }
  }
}
