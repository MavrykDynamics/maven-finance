import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { Input } from 'app/App.components/Input/Input.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { SatelliteRecord } from 'reducers/delegation'

import {
  SatelliteCard,
  SatelliteCardRow,
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

type SatelliteListViewProps = {
  loading: boolean
  satellitesList: SatelliteRecord[]
  delegateCallback: () => void
  undelegateCallback: () => void
  handleProfileDetailsClick: (item: SatelliteRecord) => void
  handleSearch: (e: any) => void
  handleSelect: (selectedOption: any) => void
}

export const SatelliteListView = ({
  loading,
  satellitesList,
  delegateCallback,
  undelegateCallback,
  handleProfileDetailsClick,
  handleSearch,
  handleSelect,
}: SatelliteListViewProps) => {
  const selectOptions = [
    { value: 'satelliteFee', label: 'Lowest Fee' },
    { value: 'satelliteFee', label: 'Highest Fee' },
    { value: 'totalDelegatedAmount', label: 'Delegated MVK' },
    { value: 'participation', label: 'Participation' },
  ]
  return (
    <SatelliteListStyled>
      <SatelliteSearchFilter>
        <Input type="text" placeholder="Search by address..." onChange={handleSearch} onBlur={() => {}} />
        <SelectContainer>
          <p>Order by:</p>
          <Select options={selectOptions} onChange={handleSelect} />
        </SelectContainer>
      </SatelliteSearchFilter>
      {satellitesList.map((item, index) => {
        return (
          <SatelliteCard key={item.address}>
            <SatelliteCardTopRow>
              <SideBySideImageAndText>
                <SatelliteProfileImageContainer>
                  <SatelliteProfileImage src={item.image} />
                </SatelliteProfileImageContainer>
                <SatelliteTextGroup>
                  <SatelliteMainText>{item.name}</SatelliteMainText>
                  <TzAddress tzAddress={item.address} type={'secondary'} hasIcon={true} isBold={true} />
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
              <Button text="Delegate" icon="man-check" loading={loading} onClick={delegateCallback} />
              <Link to={{ pathname: `/satellite-details/${item.address}`, item }}>
                <Button
                  text="Profile Details"
                  icon="man"
                  kind="transparent"
                  onClick={() => handleProfileDetailsClick(item)}
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
                onClick={undelegateCallback}
              />
            </SatelliteCardTopRow>
            <ColoredLine kind="secondary" />
            <SatelliteCardRow>Currently supporting Proposal 42 - Adjusting Auction Parameters</SatelliteCardRow>
          </SatelliteCard>
        )
      })}
    </SatelliteListStyled>
  )
}
