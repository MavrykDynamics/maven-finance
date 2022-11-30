import { useParams } from 'react-router'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { calcWithoutPrecision } from 'utils/calcFunctions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getDelegationStorage, getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { isValidId, PORTFOLIO_TAB_ID } from './DashboardPersonal.utils'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles/components'
import DashboardPersonalView from './DashboardPersonal.view'

import { State } from 'reducers'

const DashboardPersonal = () => {
  const { tabId } = useParams<{ tabId: string }>()

  const {
    myDoormanRewardsData,
    myFarmRewardsData,
    mySatelliteRewardsData,
    myMvkTokenBalance = 0,
    mySMvkTokenBalance = 0,
    myXTZTokenBalance = 0,
    mytzBTCTokenBalance = 0,
    isSatellite = false,
  } = useSelector((state: State) => state.user)
  const {
    tokensPrices: { tezos },
  } = useSelector((state: State) => state.tokens)
  const { exchangeRate: mvkRate } = useSelector((state: State) => state.mvkToken)

  const claimRewards = useCallback(() => {
    console.log('claim rewards in DashboardPersonal')
  }, [])

  useEffect(() => {
    getGovernanceStorage()
    getOracleStorage()
    getDelegationStorage()
    getEmergencyGovernanceStorage()
  }, [])

  return (
    <Page>
      <PageHeader page={'dashboard'} avatar={'/images/default-avatar.png'} />
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
        rewards={{
          rewardsToClaim: 234234,
          earnedRewards: 23324,
        }}
      />
    </Page>
  )
}

export default DashboardPersonal
