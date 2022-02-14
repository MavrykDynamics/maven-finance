import { State } from '../../reducers'
import councilAddress from '../../deployments/councilAddress.json'
import { TezosToolkit } from '@taquito/taquito'

export const GET_FARM_STORAGE = 'GET_FARM_STORAGE'
export const getFarmStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // TODO: Change address used to that of the Farm address when possible
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(councilAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(councilAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Farm storage:\n', storage)

  dispatch({
    type: GET_FARM_STORAGE,
    farmStorage: storage,
  })
}

export const GET_FARM_FACTORY_STORAGE = 'GET_FARM_FACTORY_STORAGE'
export const getFarmFactoryStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  // TODO: Change address used to that of the Farm Factory address when possible
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(councilAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(councilAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Farm Factory storage:\n', storage)

  dispatch({
    type: GET_FARM_FACTORY_STORAGE,
    farmFactoryStorage: storage,
  })
}
