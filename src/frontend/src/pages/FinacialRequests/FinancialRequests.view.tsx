import React, { useState } from 'react'

// helpers, actions
import { distinctRequestsByExecuting, getDate_MDHMTZ_Format, getRequestStatus } from './FinancialRequests.helpers'
import {
  ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST,
  PAST_REQUESTS_FINANCIAL_REQUESTS_LIST,
} from './Pagination/pagination.consts'

// types
import { FinancialRequestBody } from './FinancialRequests.types'
import { GovernanceFinancialRequestRecordGraphQL } from '../../utils/TypesAndInterfaces/Governance'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import FRList from './FRList/FRList.view'
import FRVoting from './FRVoting/FRVoting.view'

// styles
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  FinancialRequestsContainer,
  FinancialRequestsRightContainer,
  FinancialRequestsStyled,
  InfoBlockDescr,
  InfoBlockListValue,
  InfoBlockTitle,
} from './FinancialRequests.style'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { EmptyContainer } from 'app/App.style'
import { calcWithoutMu, calcWithoutPrecision } from 'utils/calcFunctions'

type FinancialRequestsViewProps = {
  ready: boolean
  loading: boolean
  financialRequestsList: GovernanceFinancialRequestRecordGraphQL[]
}

export const FinancialRequestsView = ({ ready, loading, financialRequestsList = [] }: FinancialRequestsViewProps) => {
  const [rightSideContent, setRightSideContent] = useState(financialRequestsList[0])

  const { ongoing, past } = distinctRequestsByExecuting(financialRequestsList)

  const handleItemSelect = (selectedRequest: GovernanceFinancialRequestRecordGraphQL) => {
    if (selectedRequest.id !== rightSideContent?.id) {
      setRightSideContent(selectedRequest)
    }
  }

  const rightItemStatus = rightSideContent && getRequestStatus(rightSideContent)
  const tokenName = rightSideContent.token_name

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
          {getDate_MDHMTZ_Format(rightSideContent.expiration_datetime as string)}
        </div>

        <FRVoting
          isActiveVoting={rightItemStatus === ProposalStatus.ONGOING}
          walletConnected={ready}
          loading={loading}
          selectedRequest={rightSideContent}
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
              <InfoBlockListValue fontColor="#77A4F2">Amount Requested</InfoBlockListValue>
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
              <InfoBlockListValue fontColor="#77A4F2">Contract Address</InfoBlockListValue>
              <InfoBlockListValue fontColor="#86D4C9">
                <TzAddress tzAddress={rightSideContent.token_contract_address} hasIcon={false} />
              </InfoBlockListValue>
            </div> */}

            <div className="list_item">
              <InfoBlockListValue fontColor="#77A4F2">Type</InfoBlockListValue>
              <InfoBlockListValue fontColor="#86D4C9">{tokenName}</InfoBlockListValue>
            </div>
          </div>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Date Requested</InfoBlockTitle>
          <InfoBlockDescr>{getDate_MDHMTZ_Format(rightSideContent.requested_datetime as string)}</InfoBlockDescr>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Governance Info</InfoBlockTitle>
          <div className="list">
            <div className="list_item">
              <InfoBlockListValue fontColor="#77A4F2">Governance Contract</InfoBlockListValue>
              <InfoBlockListValue fontColor="#86D4C9">
                <TzAddress tzAddress={rightSideContent.governance_financial.governance.address} hasIcon={false} />
              </InfoBlockListValue>
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
