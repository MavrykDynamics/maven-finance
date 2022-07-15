import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { calculateSlicePositions } from 'pages/FinacialRequests/Pagination/pagination.consts'
import React, { useMemo } from 'react'
import { useLocation } from 'react-router'
import { SatellitesListProps } from '../helpers/Satellites.types'
import SatteliteListView from './SatellitesList.view'

const SatteliteList = ({
  listTitle,
  items,
  onClickHandler,
  name,
  listType,
  additionaldata,
  loading,
}: SatellitesListProps) => {
  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, name)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, name)
    console.log(currentPage, name, from, to)
    return items.slice(from, to)
  }, [currentPage, items])

  console.log('items', items, paginatedItemsList)

  return (
    <SatteliteListView
      additionaldata={{ ...additionaldata, fullItemsCount: items.length }}
      items={paginatedItemsList}
      listType={listType}
      name={name}
      listTitle={listTitle}
      onClickHandler={onClickHandler}
      loading={loading}
    />
  )
}

export default SatteliteList
