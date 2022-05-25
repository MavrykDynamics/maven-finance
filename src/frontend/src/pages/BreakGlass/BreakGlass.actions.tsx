import { State } from '../../reducers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  BREAK_GLASS_STORAGE_QUERY,
  BREAK_GLASS_STORAGE_QUERY_NAME,
  BREAK_GLASS_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries'
import storageToTypeConverter from '../../utils/storageToTypeConverter'

export const GET_BREAK_GLASS_STORAGE = 'GET_BREAK_GLASS_STORAGE'
export const SET_GLASS_BROKEN = 'SET_GLASS_BROKEN'
export const getBreakGlassStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // const contract = accountPkh
  //   ? await state.wallet.tezos?.wallet.at(breakGlassAddress.address)
  //   : await new TezosToolkit(
  //       (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
  //     ).contract.at(breakGlassAddress.address)
  //
  // const storage = await (contract as any).storage()
  // console.log('Printing out Break Glass storage:\n', storage)

  const storage = await fetchFromIndexer(
    BREAK_GLASS_STORAGE_QUERY,
    BREAK_GLASS_STORAGE_QUERY_NAME,
    BREAK_GLASS_STORAGE_QUERY_VARIABLE,
  )
  const convertedStorage = storageToTypeConverter('breakGlass', storage?.break_glass[0])

  dispatch({ type: SET_GLASS_BROKEN, glassBroken: convertedStorage.glassBroken })
  dispatch({
    type: GET_BREAK_GLASS_STORAGE,
    breakGlassStorage: storage,
  })
}
