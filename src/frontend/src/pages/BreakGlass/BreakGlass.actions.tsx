import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  BREAK_GLASS_STATUS_QUERY,
  BREAK_GLASS_STATUS_QUERY_NAME,
  BREAK_GLASS_STATUS_QUERY_VARIABLE,
  BREAK_GLASS_STORAGE_QUERY,
  BREAK_GLASS_STORAGE_QUERY_NAME,
  BREAK_GLASS_STORAGE_QUERY_VARIABLE,
  WHITELIST_DEV_QUERY,
  WHITELIST_DEV_QUERY_NAME,
  WHITELIST_DEV_QUERY_VARIABLE,
} from '../../gql/queries'
import { normalizeBreakGlass, normalizeBreakGlassStatus, normalizeWhitelistDev } from './BreakGlass.helpers'

export const GET_BREAK_GLASS_STORAGE = 'GET_BREAK_GLASS_STORAGE'
export const SET_GLASS_BROKEN = 'SET_GLASS_BROKEN'
export const getBreakGlassStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const storage = await fetchFromIndexer(
    BREAK_GLASS_STORAGE_QUERY,
    BREAK_GLASS_STORAGE_QUERY_NAME,
    BREAK_GLASS_STORAGE_QUERY_VARIABLE,
  )

  const convertedStorage = normalizeBreakGlass(storage?.break_glass[0])

  dispatch({
    type: SET_GLASS_BROKEN,
    glassBroken: convertedStorage.glassBroken,
  })
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

  const breakGlassStatus = normalizeBreakGlassStatus(storage)

  dispatch({
    type: GET_BREAK_GLASS_STATUS,
    breakGlassStatus,
  })
}

export const GET_WHITELIST_DEV = 'GET_WHITELIST_DEVS'
export const getWhitelistDevs = () => async (dispatch: any) => {
  const storage = await fetchFromIndexer(WHITELIST_DEV_QUERY, WHITELIST_DEV_QUERY_NAME, WHITELIST_DEV_QUERY_VARIABLE)

  const whitelistDev = normalizeWhitelistDev(storage?.whitelist_developer[0])

  dispatch({
    type: GET_WHITELIST_DEV,
    whitelistDev,
  })
}
