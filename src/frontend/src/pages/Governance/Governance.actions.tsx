import { State } from '../../reducers'
import governanceAddress from '../../deployments/governanceAddress.json'
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json'
import breakGlassAddress from '../../deployments/breakGlassAddress.json'
import { TezosToolkit } from '@taquito/taquito'

export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const getGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(governanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(governanceAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Governance storage:\n', storage)

  dispatch({
    type: GET_GOVERNANCE_STORAGE,
    governanceStorage: storage,
  })
}

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const getEmergencyGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(emergencyGovernanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(emergencyGovernanceAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Emergency Governance storage:\n', storage)

  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceStorage: storage,
  })
}

export const GET_BREAK_GLASS_STORAGE = 'GET_BREAK_GLASS_STORAGE'
export const getBreakGlassStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(breakGlassAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(breakGlassAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Break Glass storage:\n', storage)

  dispatch({
    type: GET_BREAK_GLASS_STORAGE,
    breakGlassStorage: storage,
  })
}
