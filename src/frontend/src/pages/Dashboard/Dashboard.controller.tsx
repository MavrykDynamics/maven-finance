import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { fillTreasuryStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DashboardView } from './Dashboard.view'
import { useParams } from 'react-router'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { mvkStatsType, isValidId, LENDING_TAB_ID } from './Dashboard.utils'

export const Dashboard = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    exchangeRate,
    mvkTokenStorage: { totalSupply, maximumTotalSupply },
  } = useSelector((state: State) => state.mvkToken)
  const { totalStakedMvk = 0 } = useSelector((state: State) => state.doorman)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)

  const marketCapValue = exchangeRate ? exchangeRate * totalSupply : 0
  const treasuryTVL = treasuryStorage.reduce((acc, { balances }) => {
    balances.forEach((balanceAsset) => {
      acc += balanceAsset.usdValue || 0
    })
    return acc
  }, 0)

  //TODO: add calculation for tvl value (farms, loans, vaults)
  const tvlValue = totalStakedMvk * exchangeRate + treasuryTVL

  useEffect(() => {
    dispatch(fillTreasuryStorage())
    dispatch(getFarmStorage())
    dispatch(getDelegationStorage())
  }, [dispatch])

  const mvkStatsBlock: mvkStatsType = {
    marketCap: marketCapValue,
    stakedMvk: totalStakedMvk,
    circuatingSupply: totalSupply,
    maxSupply: maximumTotalSupply,
    livePrice: exchangeRate,
    prevPrice: exchangeRate - 0.1,
  }

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardView
        tvl={tvlValue}
        mvkStatsBlock={mvkStatsBlock}
        activeTab={isValidId(tabId) ? tabId : LENDING_TAB_ID}
      />
    </Page>
  )
}
