import React, { useState } from 'react'

// helpers, actions
import { distinctRequestsByExecuting, getDate_MDHMTZ_Format, getRequestStatus } from './FinancialRequests.helpers'
import {
  ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST,
  PAST_REQUESTS_FINANCIAL_REQUESTS_LIST,
} from './Pagination/pagination.consts'

// types
import { FinancialRequestBody } from './FinancialRequests.types'

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

type FinancialRequestsViewProps = {
  ready: boolean
  loading: boolean
  financialRequestsList: Array<FinancialRequestBody>
}

export const FinancialRequestsView = ({ ready, loading, financialRequestsList }: FinancialRequestsViewProps) => {
  const [rightSideContent, setRightSideContent] = useState<FinancialRequestBody | undefined>(financialRequestsList[0])

  const { ongoing, past } = distinctRequestsByExecuting(financialRequestsList)

  const handleItemSelect = (selectedRequest: FinancialRequestBody | undefined) => {
    if (selectedRequest) {
      setRightSideContent(selectedRequest.id !== rightSideContent?.id ? selectedRequest : undefined)
    }
  }

  const rightItemStatus = rightSideContent && getRequestStatus(rightSideContent)

  return (
    <FinancialRequestsStyled>
      <FinancialRequestsContainer>
        {financialRequestsList.length ? (
          <>
            <FRList
              listTitle="Ongoing Requests"
              items={ongoing}
              handleItemSelect={(request: FinancialRequestBody) => handleItemSelect(request)}
              name={ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST}
              selectedItem={rightSideContent}
            />
            <FRList
              listTitle="Past Requests"
              items={past}
              name={PAST_REQUESTS_FINANCIAL_REQUESTS_LIST}
              handleItemSelect={(request: FinancialRequestBody) => handleItemSelect(request)}
              selectedItem={rightSideContent}
            />
          </>
        ) : (
          <EmptyContainer>
            <img src="/images/not-found.svg" alt=" No financial requests to show" />
            <figcaption>No requests to show</figcaption>
          </EmptyContainer>
        )}
      </FinancialRequestsContainer>

      {rightSideContent && (
        <FinancialRequestsRightContainer>
          <GovRightContainerTitleArea className="financial-request">
            <h1>{`${rightSideContent.request_type} ${rightSideContent.request_purpose}`}</h1>
            <StatusFlag text={rightItemStatus} status={rightItemStatus} />
          </GovRightContainerTitleArea>

          <div className="voting_ending">
            Voting {rightItemStatus !== ProposalStatus.ONGOING ? 'ended' : 'ending'} on{' '}
            {getDate_MDHMTZ_Format(rightSideContent.expiration_datetime)}
          </div>

          <FRVoting ready={ready} loading={loading} selectedRequest={rightSideContent} />

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
            <InfoBlockDescr>{getDate_MDHMTZ_Format(rightSideContent.requested_datetime)}</InfoBlockDescr>
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
      )}
    </FinancialRequestsStyled>
  )
}
