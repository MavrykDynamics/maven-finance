import { State } from '../../reducers'
import councilAddress from '../../deployments/councilAddress.json'
import { TezosToolkit } from '@taquito/taquito'

/**
 * TODO: Placeholder function until work on the Vault pages starts
 */
export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const getTreasuryStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
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
  console.log('Printing out Treasury storage:\n', storage)

  dispatch({
    type: GET_TREASURY_STORAGE,
    treasuryStorage: storage,
  })
}
