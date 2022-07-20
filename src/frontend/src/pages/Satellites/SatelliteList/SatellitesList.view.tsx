import React from 'react'

// view
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { SatelliteListItem } from './ListCards/SateliteCard.view'
import { DataFeedCard } from './ListCards/DataFeedCard.view'

// consts

// types
import { SatellitesListProps } from '../helpers/Satellites.types'

// styles
import { FRListWrapper } from 'pages/FinacialRequests/FRList/FRList.styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { PAGINATION_SIDE_RIGHT } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { OracleCard } from './ListCards/DataFeedOracleCard.view'
import { UserDataFeedCard } from './ListCards/UsersFeedCard.view'

function SatteliteListView({ listTitle, items, name, listType, additionaldata, loading }: SatellitesListProps) {
  return items.length ? (
    <FRListWrapper className="oracle">
      {listTitle ? (
        <GovRightContainerTitleArea>
          <h1>{listTitle}</h1>
        </GovRightContainerTitleArea>
      ) : null}
      {items.map((item, idx) => {
        const additionalClassName = idx === 0 ? 'first' : idx === items.length - 1 ? 'last' : ''
        switch (listType) {
          case 'satellites':
            return (
              <SatelliteListItem
                className={additionalClassName}
                satellite={item}
                key={item.address}
                loading={loading}
                delegateCallback={additionaldata?.delegateCallback}
                undelegateCallback={additionaldata?.undelegateCallback}
                userStakedBalance={additionaldata?.userStakedBalance || 0}
                satelliteUserIsDelegatedTo={additionaldata?.satelliteUserIsDelegatedTo || ''}
                isExtendedListItem={additionaldata?.isAllOracles}
              />
            )
          case 'feeds':
            return <DataFeedCard feed={item} key={item.address} />
          case 'userFeeds':
            return <UserDataFeedCard feed={item} key={item.address} />
          case 'oracles':
            return <OracleCard oracle={item} key={item.address} />
          default:
            return null
        }
      })}

      <Pagination itemsCount={additionaldata?.fullItemsCount || 0} side={PAGINATION_SIDE_RIGHT} listName={name} />
    </FRListWrapper>
  ) : null
}

export default SatteliteListView
