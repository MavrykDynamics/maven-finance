import React, { useMemo } from 'react'

// view
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { OracleSatelliteListItem } from './ListCards/SateliteCard.view'
import { OraclesListItemDataFeed } from './ListCards/DataFeedCard.view'

// consts
import { PAGINATION_SIDE_RIGHT } from 'pages/FinacialRequests/FinancialRequests.consts'

// types
import { SatellitesListProps } from '../helpers/Satellites.types'

// styles
import { FRListWrapper } from 'pages/FinacialRequests/FRList/FRList.styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

function SatteliteListView({
  listTitle,
  items,
  onClickHandler,
  name,
  listType,
  additionaldata,
  loading,
}: SatellitesListProps) {
  console.log('%c ||||| items', 'color:yellowgreen', items)

  return items.length ? (
    <FRListWrapper className="oracle">
      {listTitle ? (
        <GovRightContainerTitleArea>
          <h1>{listTitle}</h1>
        </GovRightContainerTitleArea>
      ) : null}
      {items.map((item) => {
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
      })}

      <Pagination itemsCount={items.length} side={PAGINATION_SIDE_RIGHT} listName={name} />
    </FRListWrapper>
  ) : null
}

export default SatteliteListView
