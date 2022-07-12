import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import FRSListItem from './OraclesSateliteListItem.view'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './OraclesList.styles'
import { OraclesListProps } from '../Oracles.types'
import { ITEMS_PER_PAGE, PAGINATION_SIDE_RIGHT } from 'pages/FinacialRequests/FinancialRequests.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

function FRList({ listTitle, items, noItemsText, onClickHandler, name, listType }: OraclesListProps) {
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
          switch (listType) {
            case 'satellites':
              return <OracleSatelliteListItem />
            case 'feeds':
              return
            case 'oracles':
              return
          }
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
