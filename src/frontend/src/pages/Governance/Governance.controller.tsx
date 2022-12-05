import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Page } from 'styles'
import { State } from 'reducers'

// actions
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'
import { getDelegationStorage } from '../Satellites/Satellites.actions'
import { getCurrentRoundProposals, executeProposal, getGovernanceStorage } from './Governance.actions'
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
  const { watingProposals, waitingForPaymentToBeProcessed } = useGovernence()

  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const { isInitialDataloading } = useSelector((state: State) => state.loading)
  const { governanceStorage, governancePhase, currentRoundProposals, pastProposals } = useSelector(
    (state: State) => state.governance,
  )

  useEffect(() => {
    // TODO: clarify how to make this fethces on the global level, fetch some data after initial data loads
    if (!isInitialDataloading) {
      ;(async () => {
        await dispatch(getCurrentRoundProposals())
        await dispatch(getEmergencyGovernanceStorage())
        await dispatch(getDelegationStorage())
        await dispatch(getGovernanceStorage())
      })()
    }
  }, [isInitialDataloading])

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
        accountPkh={accountPkh}
        userIsSatellite={Boolean(isSatellite)}
        ongoingProposals={ongoingProposals}
        nextProposals={currentRoundProposals}
        watingProposals={watingProposals}
        waitingForPaymentToBeProcessed={waitingForPaymentToBeProcessed}
        pastProposals={pastProposals}
        governancePhase={governancePhase}
      />
    </Page>
  )
}
