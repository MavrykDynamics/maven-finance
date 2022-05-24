import { State } from '../../reducers'
import councilAddress from '../../deployments/councilAddress.json'
import { TezosToolkit } from '@taquito/taquito'

/**
 * TODO: Placeholder function until work on the Dashboard pages starts
 */
export const GET_FARM_STORAGE = 'GET_FARM_STORAGE'
export const getFarmStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  console.log('%c ||||| state', 'color:yellowgreen', state)
  const contract = accountPkh
    ? await state?.wallet?.tezos?.wallet?.at(councilAddress?.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(councilAddress?.address)

  const storage = await (contract as any).storage()
  console.log(`Printing out Farm storage:\n${storage}`)

  dispatch({
    type: GET_FARM_STORAGE,
    farmStorage: storage,
  })
}
