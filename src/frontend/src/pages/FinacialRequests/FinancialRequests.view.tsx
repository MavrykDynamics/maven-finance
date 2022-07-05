import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// @ts-ignore
import Time from 'react-pure-time'

// helpers, actions
import { calcTimeToBlock } from '../../utils/calcFunctions'

// types
import { State } from 'reducers'
import { ProposalRecordType, CurrentRoundProposalsStorageType } from '../../utils/TypesAndInterfaces/Governance'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { GovernancePhase } from '../../reducers/governance'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { VoteStatistics } from 'pages/Governance/Governance.controller'

// styles
import { GovernanceStyled } from 'pages/Governance/Governance.style'
import { EmptyContainer } from '../../app/App.style'

type FinancialRequestsViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
}

export const FinancialRequestsView = ({ ready, loading, accountPkh }: FinancialRequestsViewProps) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  const [votingEnding, setVotingEnding] = useState<string>('')
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const { governanceStorage } = useSelector((state: State) => state.governance)

  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: 0,
    againstVotesMVKTotal: 0,
    forVotesMVKTotal: 0,
    passVotesMVKTotal: 0,
    unusedVotesMVKTotal: 0,
  })

  useEffect(() => {
    setVoteStatistics({
      abstainVotesMVKTotal: Number(rightSideContent?.abstainMvkTotal),
      againstVotesMVKTotal: Number(rightSideContent?.downvoteMvkTotal),
      forVotesMVKTotal: Number(rightSideContent?.upvoteMvkTotal),
      passVotesMVKTotal: Number(rightSideContent?.passVoteMvkTotal),
      unusedVotesMVKTotal:
        mvkTokenStorage.totalSupply -
        (rightSideContent?.abstainMvkTotal ?? 0) +
        (rightSideContent?.downvoteMvkTotal ?? 0) +
        (rightSideContent?.upvoteMvkTotal ?? 0),
    })
  }, [mvkTokenStorage.totalSupply, rightSideContent])

  // VOTING STAFF
  // const handleProposalRoundVote = (proposalId: number) => {
  //   console.log('Here in Proposal round vote', proposalId)
  //   //TODO: Adjust for the number of votes / voting power each satellite has
  //   setVoteStatistics({
  //     ...voteStatistics,
  //     passVotesMVKTotal: voteStatistics.passVotesMVKTotal + 1,
  //   })
  //   dispatch(proposalRoundVote(proposalId))
  // }

  // const handleVotingRoundVote = (vote: string) => {
  //   console.log('Here in Vote for Proposal', vote)
  //   //TODO: Adjust for the number of votes / voting power each satellite has
  //   let voteType
  //   switch (vote) {
  //     case 'FOR':
  //       voteType = 1
  //       setVoteStatistics({
  //         ...voteStatistics,
  //         forVotesMVKTotal: voteStatistics.forVotesMVKTotal + 1,
  //       })
  //       break
  //     case 'AGAINST':
  //       voteType = 0
  //       setVoteStatistics({
  //         ...voteStatistics,
  //         againstVotesMVKTotal: voteStatistics.againstVotesMVKTotal + 1,
  //       })
  //       break
  //     case 'ABSTAIN':
  //     default:
  //       voteType = 2
  //       setVoteStatistics({
  //         ...voteStatistics,
  //         abstainVotesMVKTotal: voteStatistics.abstainVotesMVKTotal + 1,
  //       })
  //       break
  //   }
  //   setVoteStatistics({
  //     ...voteStatistics,
  //     unusedVotesMVKTotal: voteStatistics.unusedVotesMVKTotal - 1,
  //   })
  //   dispatch(votingRoundVote(voteType))
  // }

  const handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    if (chosenProposal) {
      setRightSideContent(chosenProposal)
      if (chosenProposal.passVoteMvkTotal) {
        setVoteStatistics({
          passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
          forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
          againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
          abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
          unusedVotesMVKTotal:
            mvkTokenStorage.totalSupply -
            (chosenProposal?.abstainMvkTotal ?? 0) +
            (chosenProposal?.downvoteMvkTotal ?? 0) +
            (chosenProposal?.upvoteMvkTotal ?? 0),
        })
      }
    }
  }

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No proposals to show</figcaption>
    </EmptyContainer>
  )

  const timeNow = Date.now()
  const votingTime = new Date(votingEnding).getTime()
  const isEndedVotingTime = votingTime < timeNow

  return (
    <GovernanceStyled>
      <div>LeftSide</div>
      <div>RightSide</div>
    </GovernanceStyled>
  )
}
