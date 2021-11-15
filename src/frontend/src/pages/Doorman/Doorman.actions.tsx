import mvkTokenAddress from 'deployments/mvkTokenAddress'
import { State } from 'reducers'

export const GET_MVK_TOKEN_STORAGE = 'GET_MVK_TOKEN_STORAGE'

export const getMvkTokenStorage = (accountPkh: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const contract = await state.wallet.tezos?.wallet.at(mvkTokenAddress)
  const storage = await (contract as any).storage()
  const myLedgerEntry = await storage['ledger'].get(accountPkh)
  const myMvkBalanceMu = myLedgerEntry?.balance.toNumber()
  const myMvkBalance = myMvkBalanceMu > 0 ? myMvkBalanceMu / 1000000 : 0

  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: storage,
    myMvkTokenBalance: myMvkBalance?.toFixed(2),
  })
}
