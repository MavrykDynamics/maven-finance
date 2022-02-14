import { State } from '../../reducers'
import councilAddress from '../../deployments/councilAddress.json'
import vestingAddress from '../../deployments/vestingAddress.json'
import { TezosToolkit } from '@taquito/taquito'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const getTreasuryStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // TODO: Change address used to that of the Treasury when possible
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(councilAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(councilAddress.address)

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
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(councilAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(councilAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Council storage:\n', storage)

  dispatch({
    type: GET_COUNCIL_STORAGE,
    councilStorage: storage,
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
    ? await state.wallet.tezos?.wallet.at(vestingAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(vestingAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Vesting storage:\n', storage)

  dispatch({
    type: GET_VESTING_STORAGE,
    vestingStorage: storage,
  })
}
