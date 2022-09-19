import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Page, ModalStyled } from 'styles'
import { State } from 'reducers'

// actions
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'
import { getDelegationStorage } from '../Satellites/Satellites.actions'
import { getCurrentRoundProposals, executeProposal } from './Governance.actions'
import { checkIfUserIsSatellite } from 'pages/Satellites/helpers/Satellites.consts'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'

// utils
import { calcTimeToBlock } from '../../utils/calcFunctions'

// hooks
import useGovernence from './UseGovernance'

export type VoteStatistics = {
  passVotesMVKTotal: number
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
}
export const Governance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => Boolean(state.loading))

  const { watingProposals, waitingForPaymentToBeProcessed } = useGovernence()

  const { ready, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase, currentRoundProposals, pastProposals } = useSelector(
    (state: State) => state.governance,
  )
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, delegationStorage?.satelliteLedger)
  // Period end time calculation
  const { headData } = useSelector((state: State) => state.preferences)

  const timeToEndOfPeriod =
    headData?.knownLevel && governanceStorage?.currentRoundEndLevel
      ? calcTimeToBlock(headData.knownLevel, governanceStorage.currentRoundEndLevel)
      : 0

  const daysLeftOfPeriod = timeToEndOfPeriod

  useEffect(() => {
    dispatch(getCurrentRoundProposals())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch])

  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const ongoingProposals = currentRoundProposals?.filter(
    (item) =>
      (isVotingRound || isTimeLockRound) &&
      Boolean(item.currentRoundProposal) &&
      Boolean(item.id === governanceStorage.cycleHighestVotedProposalId),
  )

  const handleExecuteProposal = (id: number) => {
    dispatch(executeProposal(id))
  }

  return (
    <Page>
      <PageHeader page={'governance'} />
      <GovernanceTopBar governancePhase={governancePhase} />
      <GovernanceView
        handleExecuteProposal={handleExecuteProposal}
        ready={ready}
        loading={loading}
        accountPkh={accountPkh}
        userIsSatellite={userIsSatellite}
        ongoingProposals={ongoingProposals}
        nextProposals={currentRoundProposals}
        watingProposals={watingProposals}
        waitingForPaymentToBeProcessed={waitingForPaymentToBeProcessed}
        pastProposals={pastProposals}
        governancePhase={governancePhase}
        timeLeftInPhase={daysLeftOfPeriod}
      />
    </Page>
  )
}
