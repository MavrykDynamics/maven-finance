import { Input } from 'app/App.components/Input/Input.controller'
import Select from 'react-select'
import { SatelliteRecord } from 'reducers/delegation'

import { SatelliteListStyled, SatelliteSearchFilter, SelectContainer } from './SatelliteList.style'
import { SatelliteListCard } from './SatellliteListCard/SatelliteListCard.view'

type SatelliteListViewProps = {
  loading: boolean
  satellitesList: SatelliteRecord[]
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: (satelliteAddress: string) => void
  handleSearch: (e: any) => void
  handleSelect: (selectedOption: any) => void
}

export const SatelliteListView = ({
  loading,
  satellitesList,
  delegateCallback,
  undelegateCallback,
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
          <SatelliteListCard
            satellite={item}
            loading={loading}
            delegateCallback={delegateCallback}
            undelegateCallback={undelegateCallback}
          />
        )
      })}
    </SatelliteListStyled>
  )
}
