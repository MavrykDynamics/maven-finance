import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getMvkTokenStorage, unstake } from '../Doorman.actions'

import { hideExitFeeModal } from './ExitFeeModal.actions'
import { ExitFeeModalView } from './ExitFeeModal.view'

export const ExitFeeModal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { showing, amount } = useSelector((state: State) => state.exitFeeModal)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)

  useEffect(() => {
    if (accountPkh && showing) {
      dispatch(getMvkTokenStorage(accountPkh))
      console.log('This is from Exit Fee modal')
    }
  }, [dispatch, accountPkh, showing])

  // useOnBlock(tezos, loadStorage)

  const cancelCallback = () => {
    dispatch(hideExitFeeModal())
  }

  const unstakeCallback = (amount: number) => {
    dispatch(unstake(amount))
  }

  return (
    <ExitFeeModalView
      loading={loading}
      showing={showing}
      amount={amount}
      mvkTotalSupply={mvkTokenStorage?.totalSupply}
      vMvkTotalSupply={vMvkTokenStorage?.totalSupply}
      unstakeCallback={unstakeCallback}
      cancelCallback={cancelCallback}
    />
  )
}
