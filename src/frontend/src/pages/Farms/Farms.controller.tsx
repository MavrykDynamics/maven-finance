import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect, useState } from 'react'
import { getFarmFactoryStorage, getFarmStorage } from './Farms.actions'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'
import { FarmTopBar } from './FarmTopBar/FarmTopBar.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import { FarmCard } from './FarmCard/FarmCard.controller'

// styles
import { FarmsStyled } from './Farms.style'
import { EmptyContainer as EmptyList } from 'app/App.style'

export type FarmsViewVariantType = 'vertical' | 'horizontal'

const EmptyContainer = () => (
  <EmptyList>
    <img src="/images/not-found.svg" alt=" No results to show" />
    <figcaption> No results to show</figcaption>
  </EmptyList>
)

export const Farms = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { farmStorage } = useSelector((state: State) => state.farm)
  const { farmFactoryStorage } = useSelector((state: State) => state.farmFactory)
  const { trackedFarms } = farmFactoryStorage
  const [farmsList, setFarmsList] = useState(trackedFarms)
  const [stakedFarmsOnly, setStakeFarmsOnly] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [farmsViewVariant, setFarmsViewVariant] = useState<FarmsViewVariantType>('vertical')

  console.log('%c ||||| farmsList', 'color:yellowgreen', farmsList)

  useEffect(() => {
    dispatch(getFarmStorage())
    // dispatch(getFarmFactoryStorage())
  }, [dispatch])

  const handleToggleStakedFarmsOnly = () => {
    setStakeFarmsOnly(!stakedFarmsOnly)
    console.log('Here in handleToggleStakedFarmsOnly')
  }

  const handleSetFarmsViewVariant = (variant: FarmsViewVariantType) => {
    setFarmsViewVariant(variant)
  }

  const handleLiveFinishedToggleButtons = () => {
    console.log('Here in handleLiveFinishedToggleButtons')
  }
  const handleOnSearch = (e: any) => {
    setSearchValue(e.target.value)
    console.log('Here in handle search')
  }
  const handleOnSort = (sortValue: any) => {
    setSortBy(sortValue)
    if (sortValue !== 'null') {
      setFarmsList((data: any[]) => {
        const dataToSort = data ? [...data] : []
        dataToSort.sort((a: any, b: any) => {
          let res = 0
          switch (sortValue) {
            case 'open':
              res = Number(a[sortValue]) - Number(b[sortValue])
              break
            case 'lpBalance':
            case 'rewardPerBlock':
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
    <Page>
      <PageHeader page={'farms'} kind={'primary'} loading={loading} />
      <FarmsStyled>
        {farmsList?.length ? (
          <>
            <FarmTopBar
              loading={loading}
              searchValue={searchValue}
              onSearch={handleOnSearch}
              onSort={handleOnSort}
              handleToggleStakedOnly={handleToggleStakedFarmsOnly}
              handleLiveFinishedToggleButtons={handleLiveFinishedToggleButtons}
              handleSetFarmsViewVariant={handleSetFarmsViewVariant}
              className={farmsViewVariant}
            />
            <section className={`farm-list ${farmsViewVariant}`}>
              {farmsList.map((farm: any, index: number) => {
                return (
                  <FarmCard
                    variant={farmsViewVariant}
                    farmAddress={farm.address}
                    firstToken={'MVK'}
                    secondToken={'USDM'}
                    lpToken={'Plenty LP'}
                    lpTokenAddress={'KT1UxUjMrLhUMaSkU6TCArF32sozs2YqotR6'}
                    firstTokenAddress={'KT1NeR6WHT4NJ7DQiquQVpiQzqFQ3feLmwy6'}
                    secondTokenAddress={'KT1UxUjMrLhUMaSkU6TCArF32sozs2YqotR6'}
                    totalLiquidity={1231243}
                  />
                )
              })}
            </section>
          </>
        ) : (
          <EmptyContainer />
        )}
      </FarmsStyled>
    </Page>
  )
}
