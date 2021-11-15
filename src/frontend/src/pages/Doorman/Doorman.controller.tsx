import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Message, Page } from 'styles'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'

import { DoormanHeader } from './DoormanHeader/DoormanHeader.controller'
import { State } from 'reducers'
import { getMvkTokenStorage, getVMvkTokenStorage, stake, unstake } from './Doorman.actions'
import { StakeUnstakeView } from './StakeUnstake/StakeUnstake.view'
import { showExitFeeModal } from './ExitFeeModal/ExitFeeModal.actions'

export const Doorman = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getVMvkTokenStorage(accountPkh))
    }
  }, [dispatch, accountPkh])

  // useOnBlock(tezos, loadStorage)

  const stakeCallback = (amount: number) => {
    dispatch(stake(amount))
  }

  const unstakeCallback = (amount: number) => {
    dispatch(showExitFeeModal(amount))
  }

  return (
    <Page>
      <ExitFeeModal />
      <DoormanHeader />
      <StakeUnstakeView
        myMvkTokenBalance={myMvkTokenBalance}
        myVMvkTokenBalance={myVMvkTokenBalance}
        stakeCallback={stakeCallback}
        unstakeCallback={unstakeCallback}
        loading={loading}
      />
    </Page>
  )
}
