import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import OracleSatellitesView from './SatelliteNodes.view'

import { getOracleSatellites } from 'pages/Satellites/Satellites.actions'

import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { State } from 'reducers'

const SatelliteNodes = () => {
  const {
    oraclesStorage: { oraclesSatellites },
  } = useSelector((state: State) => state.oracles)
  const dispatch = useDispatch()

  const [allSatellites, setAllSatellites] = useState<SatelliteRecord[]>(oraclesSatellites)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(oraclesSatellites)

  useEffect(() => {
    dispatch(getOracleSatellites())
    setAllSatellites(oraclesSatellites)
    setFilteredSatelliteList(oraclesSatellites)
  }, [])

  const handleSearch = (e: any) => {
    const searchQuery = e.target.value
    let searchResult: SatelliteRecord[] = []
    if (searchQuery !== '') {
      searchResult = allSatellites.filter(
        (item: SatelliteRecord) =>
          item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    } else {
      searchResult = allSatellites
    }

    setFilteredSatelliteList(searchResult)
  }

  const handleSelect = (selectedOption: any) => {
    const sortLabel = selectedOption.text,
      sortValue = selectedOption.value

    if (sortValue !== '') {
      setFilteredSatelliteList((data: SatelliteRecord[]) => {
        const dataToSort = data ? [...data] : []

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
    <OracleSatellitesView
      handleSelect={handleSelect}
      handleSearch={handleSearch}
      satellitesList={filteredSatelliteList}
    />
  )
}

export default SatelliteNodes
