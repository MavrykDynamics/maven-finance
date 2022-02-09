import * as React from 'react'
import { useEffect, useState } from 'react'
import { SatelliteRecord } from 'reducers/delegation'

import { testData } from '../__tests__/testData'
import { SatelliteListView } from './SatelliteList.view'

type SatelliteListProps = {
  satellitesList: SatelliteRecord[]
  loading: boolean
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: (satelliteAddress: string) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
}

export const SatelliteList = ({
  satellitesList,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
}: SatelliteListProps) => {
  const [allSatellites, setAllSatellites] = useState<SatelliteRecord[]>(satellitesList)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(satellitesList)

  useEffect(() => {
    setAllSatellites(satellitesList)
    setFilteredSatelliteList(satellitesList)
  }, [satellitesList, setAllSatellites, setFilteredSatelliteList])

  const handleSearch = (e: any) => {
    const searchQuery = e.target.value
    let searchResult: SatelliteRecord[] = []
    if (searchQuery !== '') {
      searchResult = allSatellites.filter((item: SatelliteRecord) => searchQuery === item.address)
    } else {
      searchResult = allSatellites
    }
    setFilteredSatelliteList(searchResult)
  }

  const handleSelect = (selectedOption: any) => {
    const sortLabel = selectedOption.label,
      sortValue = selectedOption.value
    if (sortValue !== '') {
      setFilteredSatelliteList((data: SatelliteRecord[]) => {
        const dataToSort = [...data]
        dataToSort.sort((a: any, b: any) => {
          let res = 0
          switch (sortLabel) {
            case 'Lowest Fee':
              res = Number(a[sortValue]) - Number(b[sortValue])
              break
            case 'Highest Fee':
            case 'Delegated MVK':
            case 'Participation':
            default:
              res = Number(b[sortValue]) - Number(a[sortValue])
              break
          }
          return res
        })
        return dataToSort
      })
    }
  }

  return (
    <SatelliteListView
      loading={loading}
      satellitesList={filteredSatelliteList}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      handleSearch={handleSearch}
      handleSelect={handleSelect}
      userStakedBalance={userStakedBalance}
      satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
    />
  )
}
