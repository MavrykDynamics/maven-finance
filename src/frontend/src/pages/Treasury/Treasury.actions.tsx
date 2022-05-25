import { State } from '../../reducers'
import treasuryAddress from '../../deployments/treasuryAddress.json'
import { TezosToolkit } from '@taquito/taquito'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { COUNCIL_STORAGE_QUERY, COUNCIL_STORAGE_QUERY_NAME, COUNCIL_STORAGE_QUERY_VARIABLE } from '../../gql/queries'
import storageToTypeConverter from '../../utils/storageToTypeConverter'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const getTreasuryStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // TODO: Change address used to that of the Treasury when possible
  console.log(state?.contractAddresses)
  const contract = accountPkh
    ? await state?.wallet?.tezos?.wallet?.at(state?.contractAddresses?.treasuryAddress?.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(state?.contractAddresses?.treasuryAddress?.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Treasury storage:\n', storage)

  dispatch({
    type: GET_TREASURY_STORAGE,
    treasuryStorage: storage,
  })
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
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state?.wallet?.tezos?.wallet?.at(state?.contractAddresses?.vestingAddress?.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(state?.contractAddresses?.vestingAddress?.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Vesting storage:\n', storage)

  dispatch({
    type: GET_VESTING_STORAGE,
    vestingStorage: storage,
  })
}
