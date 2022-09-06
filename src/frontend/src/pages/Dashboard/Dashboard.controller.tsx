import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getVestingStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DashboardView } from './Dashboard.view'

export type mvkStatsType = {
  marketCap: number
  stakedMvk: number
  circuatingSupply: number
  maxSupply: number
  livePrice: number
  prevPrice: number
}

export const Dashboard = () => {
  const dispatch = useDispatch()
  const {
    exchangeRate,
    mvkTokenStorage: { totalSupply, maximumTotalSupply },
  } = useSelector((state: State) => state.mvkToken)

  useEffect(() => {
    dispatch(getVestingStorage())
  }, [dispatch])

  const mvkStatsBlock: mvkStatsType = {
    marketCap: 0,
    stakedMvk: 0,
    circuatingSupply: totalSupply,
    maxSupply: maximumTotalSupply,
    livePrice: exchangeRate,
    prevPrice: exchangeRate - 0.1,
  }

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardView tvl={38545844} mvkStatsBlock={mvkStatsBlock} />
    </Page>
  )
}
