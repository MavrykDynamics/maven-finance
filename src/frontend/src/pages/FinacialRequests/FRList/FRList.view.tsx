import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Pagination from '../Pagination/Pagination.view'
import FRSListItem from './FRSListItem.view'

import { getPageNumber, getRequestStatus } from '../FinancialRequests.helpers'
import { calculateSlicePositions, PAGINATION_SIDE_RIGHT } from '../Pagination/pagination.consts'

import { FRListProps } from '../FinancialRequests.types'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FRListWrapper } from './FRList.styles'
import { PRECISION_NUMBER } from 'utils/constants'

function FRList({ listTitle, items, handleItemSelect, selectedItem, name }: FRListProps) {
  const { search } = useLocation()
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
            key={idx + financialRequestTitle}
            onClickHandler={() => handleItemSelect(item)}
            id={idx + 1}
            title={financialRequestTitle}
            dividedPassVoteMvkTotal={
              item.nay_vote_smvk_total / PRECISION_NUMBER + item.yay_vote_smvk_total / PRECISION_NUMBER
            }
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
