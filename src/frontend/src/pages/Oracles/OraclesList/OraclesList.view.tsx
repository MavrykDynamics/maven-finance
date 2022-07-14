import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './OraclesList.styles'
import { OraclesListProps } from '../Oracles.types'
import { ITEMS_PER_PAGE, PAGINATION_SIDE_RIGHT } from 'pages/FinacialRequests/FinancialRequests.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { OracleSatelliteListItem } from './OraclesSateliteListItem.view'
import { OraclesListItemDataFeed } from './OraclesListItemDataFeed.view'

function OracleList({
  listTitle,
  items,
  noItemsText,
  onClickHandler,
  name,
  listType,
  additionaldata,
  loading,
}: OraclesListProps) {
  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, name)

  console.log('%c ||||| items', 'color:yellowgreen', items)

  const itemsToShow = useMemo(
    () => items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, items],
  )

  return (
    <FRListWrapper className="oracle">
      {listTitle ? (
        <GovRightContainerTitleArea>
          <h1>{listTitle}</h1>
        </GovRightContainerTitleArea>
      ) : null}
      {items.length ? (
        itemsToShow.map((item) => {
          switch (listType) {
            case 'satellites':
              return (
                <OracleSatelliteListItem
                  satelliteOracle={item}
                  key={item.id}
                  loading={loading}
                  delegateCallback={onClickHandler}
                  userStakedBalance={additionaldata?.userStakedBalance || 0}
                  satelliteUserIsDelegatedTo={additionaldata?.satelliteUserIsDelegatedTo || ''}
                  isExtendedListItem={additionaldata?.isAllOracles}
                />
              )
            case 'feeds':
              return <OraclesListItemDataFeed key={item.address} />
            case 'oracles':
              return // oracle listitem component
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

export default OracleList
