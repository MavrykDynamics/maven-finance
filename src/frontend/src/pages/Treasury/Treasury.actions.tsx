import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import {
  GET_TREASURY_DATA,
  TREASURY_STORAGE_QUERY_NAME,
  TREASURY_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getTreasuryStorage'
import { getTreasuryDataByAddress } from 'utils/api'
import { FetchedTreasuryType } from 'utils/TypesAndInterfaces/Treasury'

import { State } from '../../reducers'
import { TezosToolkit } from '@taquito/taquito'
import { COUNCIL_STORAGE_QUERY, COUNCIL_STORAGE_QUERY_NAME, COUNCIL_STORAGE_QUERY_VARIABLE } from '../../gql/queries'
import { TREASURYS_COLORS } from 'app/App.components/PieСhart/pieChart.const'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const SET_TREASURY_STORAGE = 'SET_TREASURY_STORAGE'

export const fillTreasuryStorage = () => async (dispatch: any) => {
  try {
    // Get treasury addresses from gql
    const treasuryAddressesStorage = await fetchFromIndexer(
      GET_TREASURY_DATA,
      TREASURY_STORAGE_QUERY_NAME,
      TREASURY_STORAGE_QUERY_VARIABLE,
    )

    // Parse gql data to understandable data format
    const convertedStorage = storageToTypeConverter('treasury', treasuryAddressesStorage)

    // Map addresses to api cals with treasury addresses
    const getTreasuryCallbacks: Array<() => FetchedTreasuryType> = convertedStorage.treasuryAddresses.map(
      ({ address }: { address: string }) =>
        () =>
          getTreasuryDataByAddress(address),
    )

    // Await promises from upper
    const fetchedTheasuryData = await Promise.all(getTreasuryCallbacks.map((fn) => fn()))

    // Map every treasury to combine treasury name, and divide balance by constant
    const BALANCE_DIVIDER = Math.pow(10, 9)
    const treasuryStorage = convertedStorage.treasuryAddresses.map(
      (treasuryData: Record<string, unknown>, idx: number) => {
        const tresuryTokensWithValidBalances = fetchedTheasuryData[idx].balances.map((token, tokenIdx) => ({
          ...token,
          balance: Number(token.balance) / BALANCE_DIVIDER,
          tokenColor:
            TREASURYS_COLORS[tokenIdx >= TREASURYS_COLORS.length ? tokenIdx - TREASURYS_COLORS.length : tokenIdx],
        }))

        return {
          ...treasuryData,
          balances: tresuryTokensWithValidBalances,
        }
      },
    )

    dispatch({
      type: SET_TREASURY_STORAGE,
      treasuryStorage,
    })
  } catch (error) {
    console.log('%c ---- error getTreasuryStorage', 'color:red', error)
  }
}

export const GET_COUNCIL_STORAGE = 'GET_COUNCIL_STORAGE'
export const getCouncilStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // const contract = accountPkh
  //   ? await state.wallet.tezos?.wallet.at(councilAddress.address)
  //   : await new TezosToolkit(
  //       (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
  //     ).contract.at(councilAddress.address)
  //
  // const storage = await (contract as any).storage()
  // console.log('Printing out Council storage:\n', storage)
  const storage = await fetchFromIndexer(
    COUNCIL_STORAGE_QUERY,
    COUNCIL_STORAGE_QUERY_NAME,
    COUNCIL_STORAGE_QUERY_VARIABLE,
  )
  const convertedStorage = storageToTypeConverter('council', storage?.council[0])

  dispatch({
    type: GET_COUNCIL_STORAGE,
    councilStorage: convertedStorage,
  })
}

export const GET_VESTING_STORAGE = 'GET_VESTING_STORAGE'
export const getVestingStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  try {
    const state: State = getState()

    console.log('%c ||||| state', 'color:yellowgreen', state)

    // if (!accountPkh) {
    //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
    //   return
    // }
    console.log('%c ||||| accountPkh', 'color:yellowgreen', accountPkh)
    const contract = accountPkh
      ? await state?.wallet?.tezos?.wallet?.at(state?.contractAddresses?.vestingAddress?.address)
      : await new TezosToolkit(
          (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
        )?.contract?.at(state?.contractAddresses?.vestingAddress?.address)

    const storage = await (contract as any).storage()
    console.log('Printing out Vesting storage:\n', storage)

    dispatch({
      type: GET_VESTING_STORAGE,
      vestingStorage: storage,
    })
  } catch (error) {
    console.log('%c ----- error getVestingStorage', 'color:red', error)
  }
}
