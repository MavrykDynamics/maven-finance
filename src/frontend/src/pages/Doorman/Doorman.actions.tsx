import doormanAddress from 'deployments/doormanAddress'
import mvkTokenAddress from 'deployments/mvkTokenAddress'
import vMvkTokenAddress from 'deployments/vMvkTokenAddress'
import { State } from 'reducers'

export const GET_MVK_TOKEN_STORAGE = 'GET_MVK_TOKEN_STORAGE'
export const getMvkTokenStorage = (accountPkh: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const contract = await state.wallet.tezos?.wallet.at(mvkTokenAddress)
  const storage = await (contract as any).storage()
  const myLedgerEntry = await storage['ledger'].get(accountPkh)
  const myBalanceMu = myLedgerEntry?.balance.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / 1000000 : 0

  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: storage,
    myMvkTokenBalance: myBalance?.toFixed(2),
  })
}

export const GET_V_MVK_TOKEN_STORAGE = 'GET_V_MVK_TOKEN_STORAGE'
export const getVMvkTokenStorage = (accountPkh: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const contract = await state.wallet.tezos?.wallet.at(vMvkTokenAddress)
  const storage = await (contract as any).storage()
  const myLedgerEntry = await storage['ledger'].get(accountPkh)
  const myBalanceMu = myLedgerEntry?.balance.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / 1000000 : 0

  dispatch({
    type: GET_V_MVK_TOKEN_STORAGE,
    vMvkTokenStorage: storage,
    myVMvkTokenBalance: myBalance?.toFixed(2),
  })
}

export const STAKE = 'STAKE'
export const stake = (amount: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const contract = await state.wallet.tezos?.wallet.at(doormanAddress)
  await contract?.methods.stake(amount * 1000000).send()

  // async function handleStake(amount: number) {
  //   if (loading) {
  //     dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
  //   } else {
  //     stakeCallback({ amount })
  //       .then((e) => {
  //         //setTransactionPending(true)
  //         dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))
  //         // dispatch(stakeAnim())
  //         e.confirmation().then((e: any) => {
  //           dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))
  //           //setTransactionPending(false)
  //           return e
  //         })
  //         return e
  //       })
  //       .catch((e: any) => {
  //         dispatch(showToaster(ERROR, 'Error', e.message))
  //         console.error(e)
  //       })
  //   }
  // }

  dispatch({
    type: STAKE,
    amount,
  })
}

export const UN_STAKE = 'UN_STAKE'
export const unStake = (amount: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const contract = await state.wallet.tezos?.wallet.at(doormanAddress)
  await contract?.methods.unstake(amount * 1000000).send()

  dispatch({
    type: STAKE,
    amount,
  })
}
