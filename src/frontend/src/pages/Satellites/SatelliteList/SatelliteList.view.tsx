import { Input } from 'app/App.components/Input/Input.controller'
import Select from 'react-select'
import {
  SatelliteListEmptyContainer,
  SatelliteListStyled,
  SatelliteSearchFilter,
  SelectContainer,
} from './SatelliteList.style'
import { SatelliteListCard } from './SatellliteListCard/SatelliteListCard.view'
import { darkMode, lightMode } from '../../../styles'
import { useSelector } from 'react-redux'
import { State } from '../../../reducers'
import { SatelliteRecord } from '../../../utils/TypesAndInterfaces/Delegation'

type SatelliteListViewProps = {
  loading: boolean
  satellitesList: SatelliteRecord[]
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: (satelliteAddress: string) => void
  handleSearch: (e: any) => void
  handleSelect: (selectedOption: any) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  satelliteFound: boolean | undefined
}

export const SatelliteListView = ({
  loading,
  satellitesList,
  delegateCallback,
  undelegateCallback,
  handleSearch,
  handleSelect,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  satelliteFound,
}: SatelliteListViewProps) => {
  if (satelliteFound === undefined && !loading && satellitesList.length === 0) {
    return <EmptySatelliteList />
  } else {
    return (
      <ListWithSatellites
        loading={loading}
        satellitesList={satellitesList}
        delegateCallback={delegateCallback}
        undelegateCallback={undelegateCallback}
        handleSearch={handleSearch}
        handleSelect={handleSelect}
        userStakedBalance={userStakedBalance}
        satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
        satelliteFound={satelliteFound}
      />
    )
  }
}

const EmptySatelliteList = () => {
  return <SatelliteListEmptyContainer>No satellites currently active</SatelliteListEmptyContainer>
}

const ListWithSatellites = ({
  loading,
  satellitesList,
  delegateCallback,
  undelegateCallback,
  handleSearch,
  handleSelect,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  satelliteFound,
}: SatelliteListViewProps) => {
  const { darkThemeEnabled } = useSelector((state: State) => state.preferences)
  const selectOptions = [
    { value: 'satelliteFee', label: 'Lowest Fee' },
    { value: 'satelliteFee', label: 'Highest Fee' },
    { value: 'totalDelegatedAmount', label: 'Delegated MVK' },
    { value: 'participation', label: 'Participation' },
  ]
  const customStyles = {
    menu: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: darkThemeEnabled ? darkMode.placeholderColor : lightMode.placeholderColor,
      color: darkThemeEnabled ? darkMode.subTextColor : lightMode.subTextColor,
    }),
  }
  return (
    <SatelliteListStyled>
      <SatelliteSearchFilter>
        <Input type="text" placeholder="Search by address..." onChange={handleSearch} onBlur={() => {}} />
        <SelectContainer>
          <p>Order by:</p>
          <Select styles={customStyles} options={selectOptions} onChange={handleSelect} />
        </SelectContainer>
      </SatelliteSearchFilter>
      {satelliteFound === false && <SatelliteListEmptyContainer>Satellite Not Found</SatelliteListEmptyContainer>}
      {satellitesList.map((item, index) => {
        return (
          <SatelliteListCard
            key={String(index + item.address)}
            satellite={item}
            loading={loading}
            delegateCallback={delegateCallback}
            undelegateCallback={undelegateCallback}
            userStakedBalance={userStakedBalance}
            satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
          />
        )
      })}
    </SatelliteListStyled>
  )
}
