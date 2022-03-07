import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { getGovernanceStorage, proposalRoundVote, votingRoundVote } from './Governance.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'
import { ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'
import { getDelegationStorage } from '../Satellites/Satellites.actions'
import { MOCK_PAST_PROPOSAL_LIST } from './mockProposals'
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

export type VoteStatistics = {
  passVotesCount: number
  passVotesMVKTotal: number
  forVotesCount: number
  forVotesMVKTotal: number
  againstVotesCount: number
  againstVotesMVKTotal: number
  abstainVotesCount: number
  abstainVotesMVKTotal: number
  unusedVotesCount: number
  unusedVotesMVKTotal: number
}
export const Governance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)
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
  const firstKeyInProposalLedger = currentRoundProposals?.keys().next().value || 0
  let rightSideContent = currentRoundProposals
    ? currentRoundProposals?.get(firstKeyInProposalLedger)
    : {
        id: 0,
        proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
        proposalMetadata: {},

        title: 'Grant Program V2',
        details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
        description:
          'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
        invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
        invoiceTable:
          '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
        successReward: 1235,
        executed: false,
        locked: false,

        passVoteCount: 0,
        passVoteMvkTotal: 0,
        passVotersMap: {},

        upvoteCount: 14,
        upvoteMvkTotal: 4898123,
        abstainCount: 5,
        abstainMvkTotal: 50000,
        downvoteCount: 3,
        downvoteMvkTotal: 340998,
        voters: {},

        minQuorumMvkTotal: 5000000,
        minQuorumPercentage: 64.89,
        quorumCount: 0,
        quorumMvkTotal: 0,
        startDateTime: new Date(),

        currentCycleEndLevel: 626004,
        currentCycleStartLevel: 591444,

        status: ProposalStatus.ONGOING,
      }
  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesCount: Number(rightSideContent?.abstainCount),
    abstainVotesMVKTotal: Number(rightSideContent?.abstainMvkTotal),
    againstVotesCount: Number(rightSideContent?.downvoteCount),
    againstVotesMVKTotal: Number(rightSideContent?.downvoteMvkTotal),
    forVotesCount: Number(rightSideContent?.upvoteCount),
    forVotesMVKTotal: Number(rightSideContent?.upvoteMvkTotal),
    passVotesCount: Number(rightSideContent?.passVoteCount),
    passVotesMVKTotal: Number(rightSideContent?.passVoteMvkTotal),
    unusedVotesCount: 0,
    unusedVotesMVKTotal:
      mvkTokenStorage.totalSupply -
      (rightSideContent?.abstainMvkTotal + rightSideContent?.downvoteMvkTotal + rightSideContent?.upvoteMvkTotal),
  })

  useEffect(() => {
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch])

  // const handleItemSelect = (chosenProposal: ProposalRecordType) => {
  //   // console.log(chosenProposal.id, selectedProposalToShow, chosenProposal.id === selectedProposalToShow)
  //   //
  //   // setSelectedProposalToShow(chosenProposal.id === selectedProposalToShow ? selectedProposalToShow : chosenProposal.id)
  //   // console.log(rightSideContent.id)
  //   // rightSideContent = chosenProposal
  //   // console.log(rightSideContent.id)
  //   setVoteStatistics({
  //     passVotesCount: Number(chosenProposal.passVoteCount),
  //     passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
  //     forVotesCount: Number(chosenProposal.upvoteCount),
  //     forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
  //     againstVotesCount: Number(chosenProposal.downvoteCount),
  //     againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
  //     abstainVotesCount: Number(chosenProposal.abstainCount),
  //     abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
  //     //TODO: Correct calculation for unused votes count
  //     unusedVotesCount: Number(chosenProposal.abstainCount),
  //     unusedVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
  //   })
  // }
  const handleProposalRoundVote = (proposalId: number) => {
    console.log('Here in Proposal round vote', proposalId)
    //TODO: Adjust for the number of votes / voting power each satellite has
    setVoteStatistics({
      ...voteStatistics,
      passVotesCount: voteStatistics.passVotesCount + 1,
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
          forVotesCount: voteStatistics.forVotesCount + 1,
          forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
        })
        break
      case 'AGAINST':
        voteType = 0
        setVoteStatistics({
          ...voteStatistics,
          againstVotesCount: voteStatistics.againstVotesCount + 1,
          againstVotesMVKTotal: voteStatistics.againstVotesMVKTotal + 1,
        })
        break
      case 'ABSTAIN':
      default:
        voteType = 2
        setVoteStatistics({
          ...voteStatistics,
          abstainVotesCount: voteStatistics.abstainVotesCount + 1,
          abstainVotesMVKTotal: voteStatistics.abstainVotesMVKTotal + 1,
        })
        break
    }
    setVoteStatistics({
      ...voteStatistics,
      unusedVotesCount: voteStatistics.unusedVotesCount - 1,
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
        // ongoingProposals={MOCK_ONGOING_PROPOSAL_LIST}
        nextProposals={currentRoundProposals || undefined}
        pastProposals={MOCK_PAST_PROPOSAL_LIST}
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
