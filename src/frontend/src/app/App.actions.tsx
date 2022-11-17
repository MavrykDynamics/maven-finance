import { getMvkTokenStorage } from '../pages/Doorman/Doorman.actions'
import { getDelegationStorage } from '../pages/Satellites/Satellites.actions'
import {
  getDipDupTokensStorage,
  getTokensPrices,
  getWhitelistTokensStorage,
} from 'reducers/actions/dipDupActions.actions'
import { getContractAddressesStorage } from 'reducers/actions/contractAddresses.actions'

// types
import { AppDispatch } from './App.controller'

/**
 * Function that gets all initial data that is common across the app
 */
export const onStart = () => async (dispatch: AppDispatch) => {
  await dispatch(getDipDupTokensStorage())
  await dispatch(getWhitelistTokensStorage())
  await dispatch(getTokensPrices())
  await dispatch(getMvkTokenStorage())
  await dispatch(getDelegationStorage())
  await dispatch(getContractAddressesStorage())
}
