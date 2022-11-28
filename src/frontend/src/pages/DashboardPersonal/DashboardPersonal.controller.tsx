import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { State } from 'reducers'
import { Page } from 'styles/components'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { isValidId, PORTFOLIO_TAB_ID } from './DashboardPersonal.utils'
import DashboardPersonalView from './DashboardPersonal.view'

const DashboardPersonal = () => {
  const { tabId } = useParams<{ tabId: string }>()

  const {
    myAddress,
    myDoormanRewardsData,
    myFarmRewardsData,
    mySatelliteRewardsData,
    myMvkTokenBalance,
    mySMvkTokenBalance,
    myXTZTokenBalance,
    mytzBTCTokenBalance,
    isSatellite,
  } = useSelector((state: State) => state.user)
  const {
    tokensPrices: { tezos },
  } = useSelector((state: State) => state.tokens)
  const { exchangeRate: mvkRate } = useSelector((state: State) => state.mvkToken)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  const claimRewards = useCallback(() => {
    console.log('claim rewards in DashboardPersonal')
  }, [])

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardPersonalView
        walletData={{
          xtzAmount: myXTZTokenBalance,
          sMVKAmount: mySMvkTokenBalance,
          notsMVKAmount: myMvkTokenBalance,
          tzBTCAmount: mytzBTCTokenBalance,
        }}
        isUserSatellite={isSatellite}
        activeTab={isValidId(tabId) ? tabId : PORTFOLIO_TAB_ID}
        claimRewardsHandler={claimRewards}
        earnings={{
          mvkRate,
          xtzRate: tezos?.usd ?? 1,
          satelliteRewards: 232323,
          governanceRewards: 313,
          farmsRewards: 3131.31,
          exitRewards: 131,
          maxSupply: 31.13123,
          lendingIncome: 3131.31,
        }}
        satelliteRecord={satelliteLedger.find(({ address }) => address === myAddress)}
      />
    </Page>
  )
}

export default DashboardPersonal
