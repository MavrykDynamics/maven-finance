import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Pagination from '../Pagination/Pagination.view'
import FRSListItem from './FRSListItem.view'

import { getPageNumber, getRequestStatus } from '../FinancialRequests.helpers'
import { ITEMS_PER_PAGE, PAGINATION_SIDE_RIGHT } from '../FinancialRequests.consts'

import { FRListProps } from '../FinancialRequests.types'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './FRList.styles'

function FRList({ listTitle, items, noItemsText, handleItemSelect, selectedItem, name }: FRListProps) {
  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, name)

  const itemsToShow = useMemo(
    () => items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, items],
  )

  return (
    <FRListWrapper>
      <GovRightContainerTitleArea>
        <h1>{listTitle}</h1>
      </GovRightContainerTitleArea>
      {items.length ? (
        itemsToShow.map((item) => {
          const financiaRequestTitle = `${item.request_type} ${item.request_purpose}`
          return (
            <FRSListItem
              onClickHandler={() => handleItemSelect(item)}
              id={item.id}
              title={financiaRequestTitle}
              status={getRequestStatus(item)}
              selected={selectedItem?.id === item.id}
            />
          )
        })
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No proposals to show" />
          <figcaption>{noItemsText}</figcaption>
        </EmptyContainer>
      )}

      <Pagination itemsCount={items.length} side={PAGINATION_SIDE_RIGHT} listName={name} />
    </FRListWrapper>
  )
}

export default FRList
