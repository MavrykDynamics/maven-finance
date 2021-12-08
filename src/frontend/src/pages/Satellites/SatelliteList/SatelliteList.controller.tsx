import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { SatelliteRecord } from 'reducers/delegation'
import { setChosenSatellite } from '../Satellites.actions'
import { testData } from '../__tests__/testData'
import { SatelliteListView } from './SatelliteList.view'

type SatelliteListProps = {
  satellitesList: SatelliteRecord[]
  loading: boolean
}

export const SatelliteList = ({ satellitesList, loading }: SatelliteListProps) => {
  const dispatch = useDispatch()
  const [allSatellites, setAllSatellites] = useState<any[]>([])
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(testData)

  useEffect(() => {
    setAllSatellites(testData)
    setFilteredSatelliteList(testData)
  }, [satellitesList, setAllSatellites, setFilteredSatelliteList])

  const delegateCallback = () => {
    console.log('Here in delegate callback')
  }

  const undelegateCallback = () => {
    console.log('Here in undelegate callback')
  }

  const setChosenSatelliteCallback = (satellite: SatelliteRecord) => {
    dispatch(setChosenSatellite(satellite))
  }

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
      handleProfileDetailsClick={setChosenSatelliteCallback}
      handleSearch={handleSearch}
      handleSelect={handleSelect}
    />
  )
}
