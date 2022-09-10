import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import qs from 'qs'
import { useEffect } from 'react'
import { fillTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DashboardView } from './Dashboard.view'
import { useLocation } from 'react-router'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'

export type mvkStatsType = {
  marketCap: number
  stakedMvk: number
  circuatingSupply: number
  maxSupply: number
  livePrice: number
  prevPrice: number
}

export type TabId = 'lending' | 'vaults' | 'satellites' | 'treasury' | 'farms' | 'oracles'
const tabIds = ['lending', 'vaults', 'satellites', 'treasury', 'farms', 'oracles'] as const
type TabIdTypes = typeof tabIds[number]
const isValidId = (x: any): x is TabIdTypes => tabIds.includes(x)

export const Dashboard = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const { tab = 'lending' } = qs.parse(search, { ignoreQueryPrefix: true }) as { tab?: string }

  const {
    exchangeRate,
    mvkTokenStorage: { totalSupply, maximumTotalSupply },
  } = useSelector((state: State) => state.mvkToken)

  useEffect(() => {
    dispatch(fillTreasuryStorage())
    dispatch(getFarmStorage())
    dispatch(getDelegationStorage())
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
      <DashboardView tvl={38545844} mvkStatsBlock={mvkStatsBlock} activeTab={isValidId(tab) ? tab : 'lending'} />
    </Page>
  )
}
