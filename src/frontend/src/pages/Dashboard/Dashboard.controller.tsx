import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { DashboardStyled } from './Dashboard.style'
import { getVestingStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

export const Dashboard = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { councilStorage } = useSelector((state: State) => state.council)
  const { vestingStorage } = useSelector((state: State) => state.vesting)

  useEffect(() => {
    dispatch(getVestingStorage())
  }, [dispatch])

  return (
    <Page>
      <DashboardStyled>
        <PageHeader page={'dashboard'} />
        <div>Here on the Dashboard Page</div>
      </DashboardStyled>
    </Page>
  )
}
