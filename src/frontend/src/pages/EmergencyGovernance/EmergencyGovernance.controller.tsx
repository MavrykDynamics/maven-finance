import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'

// types
import type { VoteStatistics } from '../Governance/Governance.controller'

import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { getEmergencyGovernanceStorage } from './EmergencyGovernance.actions'
import { EmergencyGovernanceView } from './EmergencyGovernance.view'
import { getBreakGlassStorage } from '../BreakGlass/BreakGlass.actions'
import { MOCK_E_GOV_PAST_PROPOSALS } from './mockEGovProposals'
import { MOCK_PAST_PROPOSAL_LIST } from '../Governance/mockProposals'
import { EmergencyGovProposalModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal.controller'
import { showExitFeeModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal.actions'
import { proposalRoundVote, votingRoundVote } from '../Governance/Governance.actions'

export type EmergencyGovernanceLedgerType = {
  id: number
  title: string
  startTimestamp: string
  executedTimestamp: string
  proposerId: string
  description: string
  dropped: boolean
  executed: boolean
}

export const EmergencyGovernance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage, emergencyGovActive } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage, glassBroken } = useSelector((state: State) => state.breakGlass)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)

  const selectedProposal = MOCK_PAST_PROPOSAL_LIST.values().next().value

  const emergencyGovernanceLedger = emergencyGovernanceStorage?.emergencyGovernanceLedger

  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch])

  const handleVoteForEmergencyProposal = () => {
    console.log('Here in handleVoteForEmergencyProposal')
  }
  const handleTriggerEmergencyProposal = () => {
    dispatch(showExitFeeModal())
    console.log('Here in handleVoteForEmergencyProposal')
  }

  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: Number(selectedProposal?.abstainMvkTotal),
    againstVotesMVKTotal: Number(selectedProposal?.downvoteMvkTotal),
    forVotesMVKTotal: Number(selectedProposal?.upvoteMvkTotal),
    passVotesMVKTotal: Number(selectedProposal?.passVoteMvkTotal),
    unusedVotesMVKTotal:
      mvkTokenStorage.totalSupply -
      (selectedProposal?.abstainMvkTotal + selectedProposal?.downvoteMvkTotal + selectedProposal?.upvoteMvkTotal),
  })

  const handleProposalRoundVote = (proposalId: number) => {
    console.log('Here in Proposal round vote', proposalId)
    //TODO: Adjust for the number of votes / voting power each satellite has
    setVoteStatistics({
      ...voteStatistics,
      passVotesMVKTotal: voteStatistics.passVotesMVKTotal + 1,
    })
    dispatch(proposalRoundVote(proposalId))
  }

  const handleVotingRoundVote = (vote: string) => {
    console.log('Here in Vote for Proposal', vote)
    //TODO: Adjust for the number of votes / voting power each satellite has
    let voteType
    switch (vote) {
      case 'FOR':
        voteType = 'yay'
        setVoteStatistics({
          ...voteStatistics,
          forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
        })
        break
      case 'AGAINST':
        voteType = 'nay'
        setVoteStatistics({
          ...voteStatistics,
          againstVotesMVKTotal: voteStatistics.againstVotesMVKTotal + 1,
        })
        break
      case 'ABSTAIN':
      default:
        voteType = 'abstain'
        setVoteStatistics({
          ...voteStatistics,
          abstainVotesMVKTotal: voteStatistics.abstainVotesMVKTotal + 1,
        })
        break
    }
    setVoteStatistics({
      ...voteStatistics,
      unusedVotesMVKTotal: voteStatistics.unusedVotesMVKTotal - 1,
    })
    dispatch(votingRoundVote(voteType))
  }

  return (
    <Page>
      <EmergencyGovProposalModal />
      <PageHeader page={'emergency governance'} kind={PRIMARY} loading={loading} />
      <EmergencyGovernanceView
        ready={ready}
        emergencyGovernanceActive={emergencyGovActive}
        glassBroken={glassBroken}
        handleTriggerEmergencyProposal={handleTriggerEmergencyProposal}
        handleVoteForEmergencyProposal={handleVoteForEmergencyProposal}
        handleVotingRoundVote={handleVotingRoundVote}
        handleProposalRoundVote={handleProposalRoundVote}
        loading={loading}
        accountPkh={accountPkh}
        pastProposals={MOCK_E_GOV_PAST_PROPOSALS}
        // pastProposals={pastProposals}
        selectedProposal={selectedProposal}
        voteStatistics={voteStatistics}
        emergencyGovernanceLedger={emergencyGovernanceLedger}
      />
    </Page>
  )
}
