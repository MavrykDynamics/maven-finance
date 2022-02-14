import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { DashboardStyled } from './Dashboard.style'
import { getCouncilStorage, getTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'

export const Dashboard = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const { councilStorage } = useSelector((state: State) => state.council)
  const { vestingStorage } = useSelector((state: State) => state.vesting)

  useEffect(() => {
    dispatch(getTreasuryStorage())
    dispatch(getCouncilStorage())
    dispatch(getVestingStorage())
  }, [dispatch])

  return (
    <DashboardStyled>
      <div>Here on the Dashboard Page</div>
    </DashboardStyled>
  )
}
