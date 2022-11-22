import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Pagination from '../Pagination/Pagination.view'
import FRSListItem from './FRSListItem.view'

import { getPageNumber, getRequestStatus } from '../FinancialRequests.helpers'
import { calculateSlicePositions, PAGINATION_SIDE_RIGHT } from '../Pagination/pagination.consts'

import { FRListProps } from '../FinancialRequests.types'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './FRList.styles'

function FRList({ listTitle, items, noItemsText, handleItemSelect, selectedItem, name }: FRListProps) {
  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, name)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, name)
    return items.slice(from, to)
  }, [currentPage, items])

  return paginatedItemsList.length ? (
    <FRListWrapper>
      <GovRightContainerTitleArea>
        <h1>{listTitle}</h1>
      </GovRightContainerTitleArea>
      {paginatedItemsList.map((item, idx) => {
        const financialRequestTitle = `${item.request_type} ${item.request_purpose}`
        return (
          <FRSListItem
            onClickHandler={() => handleItemSelect(item)}
            id={idx + 1}
            title={financialRequestTitle}
            status={getRequestStatus(item)}
            selected={selectedItem?.id === item.id}
          />
        )
      })}

      <Pagination itemsCount={items.length} side={PAGINATION_SIDE_RIGHT} listName={name} />
    </FRListWrapper>
  ) : null
}

export default FRList
