import { SatellitesHeader } from 'pages/Satellites/SatellitesHeader/SatellitesHeader.controller'
import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { Message, Page } from 'styles'

import { getMvkTokenStorage, getVMvkTokenStorage, stake, unstake } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'

export const BecomeSatellite = () => {
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

  // const stakeCallback = (amount: number) => {
  //   dispatch(stake(amount))
  // }

  // const unstakeCallback = (amount: number) => {
  //   dispatch(showExitFeeModal(amount))
  // }

  return <BecomeSatelliteView />
}
