import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { hideExitFeeModal, stake } from './ExitFeeModal.actions'
import { ExitFeeModalView } from './ExitFeeModal.view'

export const ExitFeeModal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { showing } = useSelector((state: State) => state.exitFeeModal)

  const hideExitFeeModalCallback = () => {
    dispatch(hideExitFeeModal())
  }

  const stakeCallback = ({ amount }: { amount: number }) => {
    if (true) dispatch(stake({ amount }))
    else dispatch(showToaster(ERROR, 'Exit fee canot be calculated', 'Please wait and try again'))
  }

  return (
    <ExitFeeModalView
      loading={loading}
      showing={showing}
      hideExitFeeModalCallback={hideExitFeeModalCallback}
      stakeCallback={stakeCallback}
    />
  )
}
