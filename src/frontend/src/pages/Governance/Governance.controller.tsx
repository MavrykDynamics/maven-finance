import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Page } from 'styles'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { State } from '../../reducers'
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'
import { getDelegationStorage } from '../Satellites/Satellites.actions'
import { getGovernanceStorage, getCurrentRoundProposals } from './Governance.actions'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'
import { checkIfUserIsSatellite } from '../Satellites/SatelliteSideBar/SatelliteSideBar.controller'

// const
import { MOCK_PAST_PROPOSAL_LIST, MOCK_ONGOING_PROPOSAL_LIST, MOCK_EXEC_PROPOSAL_LIST } from './mockProposals'

export type VoteStatistics = {
  passVotesMVKTotal: number
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
}
export const Governance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase, currentRoundProposals } = useSelector((state: State) => state.governance)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, delegationStorage?.satelliteLedger)

  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  // Period end time calculation
  const { headData } = useSelector((state: State) => state.preferences)
  const timeToEndOfPeriod =
    headData?.knownLevel && governanceStorage?.currentRoundEndLevel
      ? calcTimeToBlock(headData.knownLevel, governanceStorage.currentRoundEndLevel)
      : 0
  const currentDate = new Date()
  const [periodEndsOn, _] = useState<Date>(new Date(currentDate.getTime() + timeToEndOfPeriod * (1000 * 60 * 60 * 24)))
  const daysLeftOfPeriod = timeToEndOfPeriod

  useEffect(() => {
    dispatch(getCurrentRoundProposals())
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch])

  const currentRoundProposalsList = currentRoundProposals?.values ? Array.from(currentRoundProposals.values()) : []
  const pastroposalsList = MOCK_PAST_PROPOSAL_LIST?.values ? Array.from(MOCK_PAST_PROPOSAL_LIST.values()) : []

  console.log('%c ||||| currentRoundProposalsList', 'color:yellowgreen', currentRoundProposalsList)
  console.log('%c ||||| pastroposalsList', 'color:yellowgreen', pastroposalsList)

  // console.log('%c ||||| currentRoundProposals', 'color:yellowgreen', currentRoundProposals)
  // console.log('%c ~~~~~~~~~ governanceStorage', 'color:blue', governanceStorage)

  // console.log('%c ||||| MOCK_PAST_PROPOSAL_LIST', 'color:yellowgreen', MOCK_PAST_PROPOSAL_LIST)

  return (
    <Page>
      <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
      <GovernanceTopBar
        governancePhase={governancePhase}
        timeLeftInPhase={daysLeftOfPeriod}
        isInEmergencyGovernance={false}
        loading={loading}
      />
      <GovernanceView
        ready={ready}
        loading={loading}
        accountPkh={accountPkh}
        userIsSatellite={userIsSatellite}
        ongoingProposals={currentRoundProposalsList}
        nextProposals={currentRoundProposalsList}
        watingProposals={[]}
        pastProposals={[]}
        governancePhase={governancePhase}
      />
    </Page>
  )
}
