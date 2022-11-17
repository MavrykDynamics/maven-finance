import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import OracleSatellitesView from './SatelliteNodes.view'

import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'

import { State } from 'reducers'
import { getDelegationStorage, delegate, undelegate } from 'pages/Satellites/Satellites.actions'

const SatelliteNodes = () => {
  const {
    delegationStorage: { satelliteLedger = [] },
  } = useSelector((state: State) => state.delegation)
  const dispatch = useDispatch()

  const [allSatellites, setAllSatellites] = useState<SatelliteRecord[]>(satelliteLedger)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(satelliteLedger)

  useEffect(() => {
    const updatedSatellites = satelliteLedger.filter((item) => item.currentlyRegistered)

    dispatch(getDelegationStorage())
    setAllSatellites(updatedSatellites)
    setFilteredSatelliteList(updatedSatellites)
  }, [])

  const handleSearch = (e: {
    target: {
      value: string
    }
  }) => {
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

  const handleSelect = (selectedOption: DropdownItemType) => {
    const sortLabel = selectedOption.text,
      sortValue = selectedOption.value

    if (sortValue !== '') {
      setFilteredSatelliteList((data: SatelliteRecord[]) => {
        const dataToSort = data ? [...data] : []

        dataToSort.sort((a, b) => {
          let res = 0
          switch (sortLabel) {
            case 'Lowest Fee':
              /* @ts-ignore */
              res = Number(a[sortValue]) - Number(b[sortValue])
              break
            case 'Highest Fee':
            case 'Delegated MVK':
            case 'Participation':
            default:
              /* @ts-ignore */
              res = Number(b[sortValue]) - Number(a[sortValue])
              break
          }
          return res
        })
        return dataToSort
      })
    }
  }

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  const undelegateCallback = (delegateAddress: string) => {
    dispatch(undelegate(delegateAddress))
  }

  return (
    <OracleSatellitesView
      handleSelect={handleSelect}
      handleSearch={handleSearch}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      satellitesList={filteredSatelliteList}
    />
  )
}

export default SatelliteNodes
