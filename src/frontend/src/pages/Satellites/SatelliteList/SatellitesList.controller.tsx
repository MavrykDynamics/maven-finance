import { ITEMS_PER_PAGE } from 'pages/FinacialRequests/FinancialRequests.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
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

  const itemsToShow = useMemo(
    () => items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, items],
  )

  return (
    <SatteliteListView
      additionaldata={additionaldata}
      items={itemsToShow}
      listType={listType}
      name={name}
      listTitle={listTitle}
      onClickHandler={onClickHandler}
      loading={loading}
    />
  )
}

export default SatteliteList
