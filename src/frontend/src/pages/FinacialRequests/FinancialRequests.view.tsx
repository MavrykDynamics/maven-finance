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
import { GovernanceStyled, GovRightContainerTitleArea, RightSideSubContent } from 'pages/Governance/Governance.style'
import { EmptyContainer } from '../../app/App.style'
import {
  FinancialRequestsContainer,
  FinancialRequestsStyled,
  FinancialRequestsRightContainer,
  InfoBlockDescr,
  InfoBlockTitle,
  InfoBlockListValue,
} from './FinancialRequests.style'
import { VotingArea } from 'pages/Governance/VotingArea/VotingArea.controller'
import { FinancialRequestBody } from './FinancialRequests.types'
import { proposalRoundVote, votingRoundVote } from 'pages/Governance/Governance.actions'
import FRList from './FRList/FRList.view'
import { distinctRequestsByExecuting } from './FinancialRequests.helpers'
import FRSListItem from './FRList/FRSListItem.view'

type FinancialRequestsViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  financialRequestsList: Array<FinancialRequestBody>
}

export const FinancialRequestsView = ({
  ready,
  loading,
  accountPkh,
  financialRequestsList,
}: FinancialRequestsViewProps) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  const [votingEnding, setVotingEnding] = useState<string>('')
  const [rightSideContent, setRightSideContent] = useState<FinancialRequestBody | undefined>(undefined)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const { governanceStorage } = useSelector((state: State) => state.governance)

  const isExecuteProposal = true

  const [voteStatistics, setVoteStatistics] = useState<VoteStatistics>({
    abstainVotesMVKTotal: 0,
    againstVotesMVKTotal: 0,
    forVotesMVKTotal: 0,
    passVotesMVKTotal: 0,
    unusedVotesMVKTotal: 0,
  })

  const { ongoing, past } = distinctRequestsByExecuting(financialRequestsList)

  // useEffect(() => {
  //   setVoteStatistics({
  //     abstainVotesMVKTotal: Number(rightSideContent?.abstainMvkTotal),
  //     againstVotesMVKTotal: Number(rightSideContent?.downvoteMvkTotal),
  //     forVotesMVKTotal: Number(rightSideContent?.upvoteMvkTotal),
  //     passVotesMVKTotal: Number(rightSideContent?.passVoteMvkTotal),
  //     unusedVotesMVKTotal:
  //       mvkTokenStorage.totalSupply -
  //       (rightSideContent?.abstainMvkTotal ?? 0) +
  //       (rightSideContent?.downvoteMvkTotal ?? 0) +
  //       (rightSideContent?.upvoteMvkTotal ?? 0),
  //   })
  // }, [mvkTokenStorage.totalSupply, rightSideContent])

  // VOTING STAFF

  const handleClickExecuteProposal = () => {
    // if (rightSideContent?.id) {
    //   handleOpenModalMoveNextRound(rightSideContent.id)
    // }
  }

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

  const handleItemSelect = (chosenProposal: FinancialRequestBody | undefined) => {
    if (chosenProposal) {
      setRightSideContent(chosenProposal.id !== rightSideContent?.id ? chosenProposal : undefined)
      // if (chosenProposal.passVoteMvkTotal) {
      //   setVoteStatistics({
      //     passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
      //     forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
      //     againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
      //     abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
      //     unusedVotesMVKTotal:
      //       mvkTokenStorage.totalSupply -
      //       (chosenProposal?.abstainMvkTotal ?? 0) +
      //       (chosenProposal?.downvoteMvkTotal ?? 0) +
      //       (chosenProposal?.upvoteMvkTotal ?? 0),
      //   })
      // }
    }
  }

  const timeNow = Date.now()
  const votingTime = new Date(votingEnding).getTime()
  const isEndedVotingTime = votingTime < timeNow

  return (
    <FinancialRequestsStyled>
      <FinancialRequestsContainer>
        <FRList
          listTitle="Ongoing Requests"
          noItemsText="No requests to show"
          items={ongoing}
          handleItemSelect={(request: FinancialRequestBody) => handleItemSelect(request)}
          name={'ongoing_requests'}
          selectedItem={rightSideContent}
        />
        <FRList
          listTitle="Past Requests"
          noItemsText="No requests to show"
          items={past}
          name={'past_requests'}
          handleItemSelect={(request: FinancialRequestBody) => handleItemSelect(request)}
          selectedItem={rightSideContent}
        />
      </FinancialRequestsContainer>

      {rightSideContent && (
        <FinancialRequestsRightContainer>
          <GovRightContainerTitleArea>
            <h1>
              Transfer Tokens to{' '}
              <TzAddress tzAddress={rightSideContent.governance_financial_id} hasIcon={false}></TzAddress>
            </h1>
            <StatusFlag text={'EXECUTED'} />
          </GovRightContainerTitleArea>

          <hr />

          <div className="info_section_wrapper">
            <div className="info_section">
              <InfoBlockTitle>Type</InfoBlockTitle>
              <InfoBlockDescr>{rightSideContent.request_type}</InfoBlockDescr>
            </div>

            <div className="info_section">
              <InfoBlockTitle>Requester</InfoBlockTitle>
              <InfoBlockDescr>
                <TzAddress tzAddress={rightSideContent.requester_id} hasIcon={false} />
              </InfoBlockDescr>
            </div>
          </div>

          <div className="info_section">
            <InfoBlockTitle>Purpose</InfoBlockTitle>
            <InfoBlockDescr>{rightSideContent.request_purpose}</InfoBlockDescr>
          </div>

          <div className="info_section">
            <InfoBlockTitle>Token Info</InfoBlockTitle>
            <div className="list">
              <div className="list_item">
                <InfoBlockListValue fontColor="#77A4F2">Amount Requested</InfoBlockListValue>
                <InfoBlockListValue fontColor="#86D4C9">
                  <CommaNumber value={rightSideContent.token_amount} endingText="MVK" />
                </InfoBlockListValue>
              </div>

              <div className="list_item">
                <InfoBlockListValue fontColor="#77A4F2">Contract Address</InfoBlockListValue>
                <InfoBlockListValue fontColor="#86D4C9">
                  <TzAddress tzAddress={rightSideContent.token_contract_address} hasIcon={false} />
                </InfoBlockListValue>
              </div>

              <div className="list_item">
                <InfoBlockListValue fontColor="#77A4F2">Type</InfoBlockListValue>
                <InfoBlockListValue fontColor="#86D4C9">{rightSideContent.token_type}</InfoBlockListValue>
              </div>
            </div>
          </div>

          <div className="info_section">
            <InfoBlockTitle>Date Requested</InfoBlockTitle>
            <InfoBlockDescr>{rightSideContent.expiration_datetime}</InfoBlockDescr>
          </div>

          <div className="info_section">
            <InfoBlockTitle>Governance Info</InfoBlockTitle>
            <div className="list">
              <div className="list_item">
                <InfoBlockListValue fontColor="#77A4F2">Governance Contract</InfoBlockListValue>
                <InfoBlockListValue fontColor="#86D4C9">no info</InfoBlockListValue>
              </div>

              <div className="list_item">
                <InfoBlockListValue fontColor="#77A4F2">Governance Financial Contract</InfoBlockListValue>
                <InfoBlockListValue fontColor="#86D4C9">
                  <TzAddress tzAddress={rightSideContent.governance_financial_id} hasIcon={false} />
                </InfoBlockListValue>
              </div>

              <div className="list_item">
                <InfoBlockListValue fontColor="#77A4F2">Treasury Contract</InfoBlockListValue>
                <InfoBlockListValue fontColor="#86D4C9">
                  <TzAddress tzAddress={rightSideContent.treasury_id} hasIcon={false} />
                </InfoBlockListValue>
              </div>
            </div>
          </div>
        </FinancialRequestsRightContainer>
      )}
    </FinancialRequestsStyled>
  )
}
