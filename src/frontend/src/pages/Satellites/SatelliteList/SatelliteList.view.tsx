import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { Input } from 'app/App.components/Input/Input.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import {
  SatelliteCard,
  SatelliteCardBottomRow,
  SatelliteCardTopRow,
  SatelliteListStyled,
  SatelliteMainText,
  SatelliteProfileImage,
  SatelliteProfileImageContainer,
  SatelliteSearchFilter,
  SatelliteSubText,
  SatelliteTextGroup,
  SelectContainer,
  SideBySideImageAndText,
} from './SatelliteList.style'
import { testData } from '../__tests__/testData'

type SatelliteListViewProps = {
  satellitesList: SatelliteRecord[]
  delegateCallback: () => void
  undelegateCallback: () => void
  setChosenSatelliteCallback: (item: SatelliteRecord) => void
  loading: boolean
}

export const SatelliteListView = ({
  satellitesList,
  delegateCallback,
  undelegateCallback,
  setChosenSatelliteCallback,
}: SatelliteListViewProps) => {
  const loading = useSelector((state: State) => state.loading)
  const dispatch = useDispatch()
  const [allSatellites, setAllSatellites] = useState<any[]>([])
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(testData)
  const selectOptions = [
    { value: 'satelliteFee', label: 'Lowest Fee' },
    { value: 'satelliteFee', label: 'Highest Fee' },
    { value: 'totalDelegatedAmount', label: 'Delegated MVK' },
    { value: 'participation', label: 'Participation' },
  ]

  useEffect(() => {
    setAllSatellites(testData)
    setFilteredSatelliteList(testData)
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

  const _handleProfileDetailsClick = (item: SatelliteRecord) => {
    setChosenSatelliteCallback(item)
  }

  const _handleCopyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    dispatch(showToaster('SUCCESS', 'Copied to Clipboard', `${address}`))
  }
  return (
    <SatelliteListStyled>
      <SatelliteSearchFilter>
        <Input type="text" placeholder="Search by address..." onChange={handleSearch} onBlur={() => {}} />
        <SelectContainer>
          <p>Order by:</p>
          <Select options={selectOptions} onChange={handleSelect} />
        </SelectContainer>
      </SatelliteSearchFilter>
      {filteredSatelliteList.map((item, index) => {
        return (
          <SatelliteCard key={item.address}>
            <SatelliteCardTopRow>
              <SideBySideImageAndText>
                <SatelliteProfileImageContainer>
                  <SatelliteProfileImage src={item.image} />
                </SatelliteProfileImageContainer>
                <SatelliteTextGroup>
                  <SatelliteMainText>{item.name}</SatelliteMainText>
                  <SatelliteSubText
                    className={'toClick'}
                    onClick={() => {
                      _handleCopyToClipboard(item.address)
                    }}
                  >{`${item.address.slice(0, 7)}...${item.address.slice(
                    item.address.length - 4,
                    item.address.length,
                  )}`}</SatelliteSubText>
                </SatelliteTextGroup>
              </SideBySideImageAndText>
              <SatelliteTextGroup>
                <SatelliteMainText>{item.totalDelegatedAmount}</SatelliteMainText>
                <SatelliteSubText>Delegated MVK</SatelliteSubText>
              </SatelliteTextGroup>
              <SatelliteTextGroup>
                <SatelliteMainText>{item.totalDelegatedAmount}</SatelliteMainText>
                <SatelliteSubText>Your delegated MVK</SatelliteSubText>
              </SatelliteTextGroup>
              <Button text="Delegate" icon="man-check" loading={loading} onClick={() => delegateCallback()} />
              <Link to={{ pathname: `/satellite-details/${item.address}`, item }}>
                <Button
                  text="Profile Details"
                  icon="man"
                  kind="transparent"
                  onClick={() => _handleProfileDetailsClick(item)}
                />
              </Link>
              <SatelliteTextGroup>
                <SatelliteMainText>{item.totalDelegatedAmount}%</SatelliteMainText>
                <SatelliteSubText>Participation</SatelliteSubText>
              </SatelliteTextGroup>
              <SatelliteTextGroup>
                <SatelliteMainText>{item.satelliteFee}%</SatelliteMainText>
                <SatelliteSubText>Fee</SatelliteSubText>
              </SatelliteTextGroup>
              <Button
                text="Undelegate"
                icon="man-close"
                kind="secondary"
                loading={loading}
                onClick={() => undelegateCallback()}
              />
            </SatelliteCardTopRow>
            <ColoredLine kind="secondary" />
            <SatelliteCardBottomRow>
              Currently supporting Proposal 42 - Adjusting Auction Parameters
            </SatelliteCardBottomRow>
          </SatelliteCard>
        )
      })}
    </SatelliteListStyled>
  )
}
