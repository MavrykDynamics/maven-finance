import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getDoormanStorage, getMvkTokenStorage, unstake } from '../Doorman.actions'

import { hideExitFeeModal } from './ExitFeeModal.actions'
import { ExitFeeModalView } from './ExitFeeModal.view'

export const ExitFeeModal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { showing, amount } = useSelector((state: State) => state.exitFeeModal)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { doormanStorage, totalStakedMvk } = useSelector((state: State) => state.doorman)

  useEffect(() => {
    if (accountPkh && showing) {
      dispatch(getMvkTokenStorage(accountPkh))
    }
    dispatch(getDoormanStorage())
  }, [dispatch, accountPkh, showing])

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
      totalStakedMvkSupply={totalStakedMvk}
      unstakeCallback={unstakeCallback}
      cancelCallback={cancelCallback}
    />
  )
}
