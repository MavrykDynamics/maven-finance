import { State } from '../../reducers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  BREAK_GLASS_STATUS_QUERY,
  BREAK_GLASS_STATUS_QUERY_NAME,
  BREAK_GLASS_STATUS_QUERY_VARIABLE,
  BREAK_GLASS_STORAGE_QUERY,
  BREAK_GLASS_STORAGE_QUERY_NAME,
  BREAK_GLASS_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries'
import storageToTypeConverter from '../../utils/storageToTypeConverter'

export const GET_BREAK_GLASS_STORAGE = 'GET_BREAK_GLASS_STORAGE'
export const SET_GLASS_BROKEN = 'SET_GLASS_BROKEN'
export const getBreakGlassStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

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

export const GET_BREAK_GLASS_STATUS = 'GET_BREAK_GLASS_STATUS'
export const getBreakGlassStatus = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const storage = await fetchFromIndexer(
    BREAK_GLASS_STATUS_QUERY,
    BREAK_GLASS_STATUS_QUERY_NAME,
    BREAK_GLASS_STATUS_QUERY_VARIABLE,
  )
  console.log(storage)
  const convertedStorage = storageToTypeConverter('breakGlassStatus', storage)

  dispatch({
    type: GET_BREAK_GLASS_STATUS,
    breakGlassStatus: convertedStorage,
  })
}
