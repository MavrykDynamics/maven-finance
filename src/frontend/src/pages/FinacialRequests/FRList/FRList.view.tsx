import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import React from 'react'
import { FRListProps } from '../FinancialRequests.types'
import { FRListWrapper } from './FRList.styles'

const FRList = ({ listTitle, listItemsGenerator, hasItems, noItemsText }: FRListProps) => {
  return (
    <FRListWrapper>
      <GovRightContainerTitleArea>
        <h1>{listTitle}</h1>
      </GovRightContainerTitleArea>
      {hasItems ? (
        listItemsGenerator()
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No proposals to show" />
          <figcaption>{noItemsText}</figcaption>
        </EmptyContainer>
      )}
    </FRListWrapper>
  )
}

export default FRList
