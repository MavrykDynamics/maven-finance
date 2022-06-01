import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Page } from 'styles'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { State } from '../../reducers'
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'
import { getDelegationStorage } from '../Satellites/Satellites.actions'
import {
  getGovernanceStorage,
  proposalRoundVote,
  votingRoundVote,
  getCurrentRoundProposals,
} from './Governance.actions'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'
import { checkIfUserIsSatellite } from '../Satellites/SatelliteSideBar/SatelliteSideBar.controller'

// const
import { MOCK_PAST_PROPOSAL_LIST, MOCK_ONGOING_PROPOSAL_LIST } from './mockProposals'

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
  const {
    governanceStorage,
    governancePhase,
    currentRoundProposals: currentRoundProposals1,
  } = useSelector((state: State) => state.governance)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, delegationStorage?.satelliteLedger)

  const { currentRoundProposals } = governanceStorage
  const { emergencyGovernanceStorage } = useSelector((state: State) => state.emergencyGovernance)
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
  //console.log(daysLeftOfPeriod)
  const firstKeyInProposalLedger = currentRoundProposals?.keys ? currentRoundProposals.keys().next().value : 0
  let rightSideContent = currentRoundProposals?.get ? currentRoundProposals.get(firstKeyInProposalLedger) : undefined

  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: Number(rightSideContent?.abstainMvkTotal),
    againstVotesMVKTotal: Number(rightSideContent?.downvoteMvkTotal),
    forVotesMVKTotal: Number(rightSideContent?.upvoteMvkTotal),
    passVotesMVKTotal: Number(rightSideContent?.passVoteMvkTotal),
    unusedVotesMVKTotal:
      mvkTokenStorage.totalSupply -
      (rightSideContent?.abstainMvkTotal + rightSideContent?.downvoteMvkTotal + rightSideContent?.upvoteMvkTotal),
  })

  useEffect(() => {
    dispatch(getCurrentRoundProposals())
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch])

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
        voteType = 1
        setVoteStatistics({
          ...voteStatistics,
          forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
        })
        break
      case 'AGAINST':
        voteType = 0
        setVoteStatistics({
          ...voteStatistics,
          againstVotesMVKTotal: voteStatistics.againstVotesMVKTotal + 1,
        })
        break
      case 'ABSTAIN':
      default:
        voteType = 2
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
        ongoingProposals={MOCK_ONGOING_PROPOSAL_LIST}
        nextProposals={currentRoundProposals1}
        watingProposals={MOCK_PAST_PROPOSAL_LIST}
        pastProposals={MOCK_PAST_PROPOSAL_LIST}
        // pastProposals={currentRoundProposals1}
        handleProposalRoundVote={handleProposalRoundVote}
        handleVotingRoundVote={handleVotingRoundVote}
        setVoteStatistics={setVoteStatistics}
        selectedProposal={rightSideContent}
        governancePhase={governancePhase}
        voteStatistics={voteStatistics}
      />
    </Page>
  )
}
