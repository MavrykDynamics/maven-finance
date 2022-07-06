import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import qs from 'qs'

import Pagination from '../Pagination/Pagination.view'
import FRSListItem from './FRSListItem.view'

import { ITEMS_PER_PAGE } from '../FinancialRequests.helpers'

import { FRListProps } from '../FinancialRequests.types'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './FRList.styles'

// http://localhost:3000/financial-requests?page%5B%5D%5Bongoing_requests%5D=1&page%5B%5D%5Bpast_requests%5D=2
// const data = { page: { list1: 1, lsit2: 2 } }
// const parsedSearch = qs.stringify(data)

const FRList = ({ listTitle, items, noItemsText, handleItemSelect, selectedItem, name }: FRListProps) => {
  const { pathname, search } = useLocation()
  const { page = [] } = qs.parse(search, { ignoreQueryPrefix: true })
  const currentPage = (page as any)?.[name] || 1
  const itemsToShow = useMemo(
    () => items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage],
  )

  return (
    <FRListWrapper>
      <GovRightContainerTitleArea>
        <h1>{listTitle}</h1>
      </GovRightContainerTitleArea>
      {items.length ? (
        itemsToShow.map((item) => (
          <FRSListItem
            onClickHandler={() => handleItemSelect(item)}
            id={item.id}
            title={item.request_type}
            status={''}
            selected={selectedItem?.id === item.id}
          />
        ))
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No proposals to show" />
          <figcaption>{noItemsText}</figcaption>
        </EmptyContainer>
      )}

      <Pagination itemsCount={items.length} side={'right'} listName={name} />
    </FRListWrapper>
  )
}

export default FRList
