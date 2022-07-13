import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Pagination from '../Pagination/Pagination.view'
import FRSListItem from './FRSListItem.view'

import { getPageNumber, getRequestStatus } from '../FinancialRequests.helpers'
import { calculateSlicePositions, PAGINATION_SIDE_RIGHT } from '../Pagination/pagination.consts'

import { FinancialRequestBody, FRListProps } from '../FinancialRequests.types'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './FRList.styles'

function FRList({ listTitle, items, noItemsText, handleItemSelect, selectedItem, name }: FRListProps) {
  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, name)

  const proposalsDuplicated: FinancialRequestBody[] = []
  let proposalListCounter = 0
  while (proposalsDuplicated.length < 50) {
    if (proposalListCounter < items.length) {
      proposalListCounter++
    } else {
      proposalListCounter = 0
    }
    if (items[proposalListCounter]) proposalsDuplicated.push(items[proposalListCounter])
  }

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, name)
    return proposalsDuplicated.slice(from, to)
  }, [currentPage, proposalsDuplicated])

  return paginatedItemsList.length ? (
    <FRListWrapper>
      <GovRightContainerTitleArea>
        <h1>{listTitle}</h1>
      </GovRightContainerTitleArea>
      {paginatedItemsList.map((item) => {
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
      })}

      <Pagination itemsCount={proposalsDuplicated.length} side={PAGINATION_SIDE_RIGHT} listName={name} />
    </FRListWrapper>
  ) : null
}

export default FRList
