import { getInitialData } from '../gql/fetchGraphQL'
import { GET_DOORMAN_STORAGE, GET_MVK_TOKEN_STORAGE } from '../pages/Doorman/Doorman.actions'
import storageToTypeConverter from '../utils/storageToTypeConverter'
import { GET_DELEGATION_STORAGE } from '../pages/Satellites/Satellites.actions'

export const RECAPTCHA_REQUEST = 'RECAPTCHA_REQUEST'
export const recaptchaRequest = () => (dispatch: any) => {
  dispatch({
    type: RECAPTCHA_REQUEST,
  })
}

export const onStart = () => async (dispatch: any, getState: any) => {
  console.log('Here in onStart')

  const res = await getInitialData()
  const addressesStorage = storageToTypeConverter('addresses', res[0])
  const mvkTokenStorage = storageToTypeConverter('mvkToken', res[1].mvk_token[0])
  const doormanStorage = storageToTypeConverter('doorman', res[2].doorman[0])
  const delegationStorage = storageToTypeConverter('delegation', res[3].delegation[0])

  dispatch({
    type: GET_DOORMAN_STORAGE,
    storage: doormanStorage,
    totalStakedMvkSupply: doormanStorage.stakedMvkTotalSupply,
  })
  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: mvkTokenStorage,
  })
  dispatch({
    type: GET_DELEGATION_STORAGE,
    delegationStorage: delegationStorage,
  })
}
