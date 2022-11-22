import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// helpers, actions, consts
import { distinctRequestsByExecuting, getRequestStatus } from './FinancialRequests.helpers'
import {
  ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST,
  PAST_REQUESTS_FINANCIAL_REQUESTS_LIST,
} from './Pagination/pagination.consts'
import { PRECISION_NUMBER } from 'utils/constants'
import { calcWithoutMu, calcWithoutPrecision } from 'utils/calcFunctions'
import { votingRinancialRequestVote } from 'pages/Governance/Governance.actions'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'
import { parseDate } from 'utils/time'

// types
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { GovernanceFinancialRequestGraphQL } from '../../utils/TypesAndInterfaces/Governance'
import { State } from 'reducers'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import FRList from './FRList/FRList.view'

// styles
import {
  GovRightContainerTitleArea,
  FinancialRequestsContainer,
  FinancialRequestsRightContainer,
  FinancialRequestsStyled,
  InfoBlockDescr,
  InfoBlockListName,
  InfoBlockListValue,
  InfoBlockTitle,
  VotingArea,
} from './FinancialRequests.style'
import { EmptyContainer } from 'app/App.style'

type FinancialRequestsViewProps = {
  financialRequestsList: GovernanceFinancialRequestGraphQL[]
}

export const FinancialRequestsView = ({ financialRequestsList = [] }: FinancialRequestsViewProps) => {
  const dispatch = useDispatch()
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const { ongoing, past } = distinctRequestsByExecuting(financialRequestsList)

  const [rightSideContent, setRightSideContent] = useState(ongoing[0] ?? past[0])

  const handleItemSelect = (selectedRequest: GovernanceFinancialRequestGraphQL) => {
    if (selectedRequest.id !== rightSideContent?.id) {
      setRightSideContent(selectedRequest)
    }
  }

  const rightItemStatus = rightSideContent && getRequestStatus(rightSideContent)
  const tokenName = dipDupTokens.find(({ contract }) => (contract = rightSideContent.token_address))?.metadata.symbol

  // Voting data & handlers
  const [votingStats, setVoteStatistics] = useState({
    forVotesMVKTotal: 0,
    againstVotesMVKTotal: 0,
    unusedVotesMVKTotal: 0,
    quorum: 0,
  })

  useEffect(() => {
    setVoteStatistics({
      forVotesMVKTotal: rightSideContent.yay_vote_smvk_total / PRECISION_NUMBER,
      againstVotesMVKTotal: rightSideContent.nay_vote_smvk_total / PRECISION_NUMBER,
      unusedVotesMVKTotal: Math.round(
        rightSideContent.snapshot_smvk_total_supply / PRECISION_NUMBER -
          rightSideContent.yay_vote_smvk_total / PRECISION_NUMBER -
          rightSideContent.nay_vote_smvk_total / PRECISION_NUMBER,
      ),
      quorum: rightSideContent.smvk_percentage_for_approval / 100,
    })
  }, [rightSideContent])

  const handleVotingRoundVote = (vote: string) => {
    switch (vote) {
      case VotingTypes.YES:
        setVoteStatistics({
          ...votingStats,
          forVotesMVKTotal: +votingStats.forVotesMVKTotal + 1,
          unusedVotesMVKTotal: +votingStats.unusedVotesMVKTotal - 1,
        })
        break
      case VotingTypes.NO:
        setVoteStatistics({
          ...votingStats,
          againstVotesMVKTotal: +votingStats.againstVotesMVKTotal + 1,
          unusedVotesMVKTotal: +votingStats.unusedVotesMVKTotal - 1,
        })
        break
      default:
        return
    }

    dispatch(votingRinancialRequestVote(vote, rightSideContent.id))
  }

  const RightSideBlock = () =>
    rightSideContent ? (
      <FinancialRequestsRightContainer>
        <GovRightContainerTitleArea className="financial-request">
          <h1>{rightSideContent.request_type}</h1>
          <StatusFlag text={rightItemStatus} status={rightItemStatus} />
        </GovRightContainerTitleArea>
        <InfoBlockTitle>{rightSideContent.request_purpose}</InfoBlockTitle>

        <div className="voting_ending">
          Voting {rightItemStatus !== ProposalStatus.ONGOING ? 'ended' : 'ending'} on{' '}
          {parseDate({
            time: rightSideContent.execution_datetime || rightSideContent.expiration_datetime,
            timeFormat: 'MMM DD, HH:mm:ss',
          })}
        </div>

        <VotingArea
          voteStatistics={votingStats}
          isVotingActive={rightItemStatus === ProposalStatus.ONGOING}
          handleVote={handleVotingRoundVote}
          buttonsToShow={{ forBtn: { text: 'Approve' }, againsBtn: { text: 'Disapprove' } }}
          className={'fr-voting'}
          disableVotingButtons={Boolean(rightSideContent?.votes?.find(({ voter_id }) => voter_id === accountPkh))}
        />

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
              <InfoBlockListName fontColor="#77A4F2">Amount Requested</InfoBlockListName>
              <InfoBlockListValue fontColor="#86D4C9">
                <CommaNumber
                  value={
                    tokenName === 'MVK'
                      ? calcWithoutPrecision(rightSideContent.token_amount)
                      : calcWithoutMu(rightSideContent.token_amount)
                  }
                  endingText={tokenName}
                />
              </InfoBlockListValue>
            </div>

            {/* TODO token_contract_address not in graphQl <div className="list_item">
              <InfoBlockListName fontColor="#77A4F2">Contract Address</InfoBlockListName>
              <InfoBlockListValue fontColor="#86D4C9">
                <TzAddress tzAddress={rightSideContent.token_contract_address} hasIcon={false} />
              </InfoBlockListValue>
            </div> */}

            <div className="list_item">
              <InfoBlockListName fontColor="#77A4F2">Type</InfoBlockListName>
              <InfoBlockListValue fontColor="#86D4C9">{tokenName}</InfoBlockListValue>
            </div>
          </div>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Date Requested</InfoBlockTitle>
          <InfoBlockDescr>
            {parseDate({ time: rightSideContent.requested_datetime, timeFormat: 'MMM DD, HH:mm:ss' })}
          </InfoBlockDescr>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Governance Info</InfoBlockTitle>
          <div className="list">
            <div className="list_item">
              <InfoBlockListName fontColor="#77A4F2">Governance Contract</InfoBlockListName>
              <InfoBlockListValue fontColor="#86D4C9">
                <TzAddress tzAddress={rightSideContent.governance_financial.governance.address} hasIcon={false} />
              </InfoBlockListValue>
            </div>

            <div className="list_item">
              <InfoBlockListName fontColor="#77A4F2">Governance Financial Contract</InfoBlockListName>
              <InfoBlockListValue fontColor="#86D4C9">
                <TzAddress tzAddress={rightSideContent.governance_financial_id} hasIcon={false} />
              </InfoBlockListValue>
            </div>

            <div className="list_item">
              <InfoBlockListName fontColor="#77A4F2">Treasury Contract</InfoBlockListName>
              <InfoBlockListValue fontColor="#86D4C9">
                <TzAddress tzAddress={rightSideContent.treasury_id} hasIcon={false} />
              </InfoBlockListValue>
            </div>
          </div>
        </div>
      </FinancialRequestsRightContainer>
    ) : null

  return (
    <FinancialRequestsStyled>
      {financialRequestsList.length ? (
        <>
          <FinancialRequestsContainer>
            <FRList
              listTitle="Ongoing Requests"
              items={ongoing}
              handleItemSelect={handleItemSelect}
              name={ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST}
              selectedItem={rightSideContent}
            />
            <FRList
              listTitle="Past Requests"
              items={past}
              name={PAST_REQUESTS_FINANCIAL_REQUESTS_LIST}
              handleItemSelect={handleItemSelect}
              selectedItem={rightSideContent}
            />
          </FinancialRequestsContainer>
          <RightSideBlock />
        </>
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No financial requests to show" />
          <figcaption>No requests to show</figcaption>
        </EmptyContainer>
      )}
    </FinancialRequestsStyled>
  )
}
