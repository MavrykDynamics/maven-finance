// type
import { FarmStorage, FarmContractType } from '../../utils/TypesAndInterfaces/Farm'

import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect, useState } from 'react'
import { getFarmFactoryStorage, getFarmStorage } from './Farms.actions'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'
import { FarmTopBar } from './FarmTopBar/FarmTopBar.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import { FarmCard } from './FarmCard/FarmCard.controller'
import { Modal } from '../../app/App.components/Modal/Modal.controller'

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
  const { farmStorage, farmContracts } = useSelector((state: State) => state.farm)
  const [farmsList, setFarmsList] = useState(farmStorage)
  const [stakedFarmsOnly, setStakeFarmsOnly] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [farmsViewVariant, setFarmsViewVariant] = useState<FarmsViewVariantType>('vertical')

  useEffect(() => {
    dispatch(getFarmStorage())
  }, [dispatch])

  const handleToggleStakedFarmsOnly = (e?: any) => {
    if (e?.target?.checked) {
      const filteredStakeOnly = farmsList.filter(
        (item) => item.farmAccounts?.length && item.farmAccounts.some((account) => account?.deposited_amount > 0),
      )
      setFarmsList(filteredStakeOnly)
    } else {
      setFarmsList(farmStorage)
    }
  }

  const handleSetFarmsViewVariant = (variant: FarmsViewVariantType) => {
    setFarmsViewVariant(variant)
  }

  const handleLiveFinishedToggleButtons = () => {
    console.log('Here in handleLiveFinishedToggleButtons')
  }
  const handleOnSearch = (text: string) => {
    setSearchValue(text)
    const filteredFarmsList = farmStorage.filter((farm) => {
      const isIncludesTokenAddress = farm.lpTokenAddress.includes(text)
      const isIncludesName = farm.name.includes(text)
      const lpTokenAddress = farm.lpTokenAddress || ''
      const farmContract = farmContracts.find((item) => item.address === lpTokenAddress)
      const isIncludesAlias =
        farmContract?.creator?.alias?.includes(text) || farmContract?.metadata?.alias?.includes(text)
      return isIncludesTokenAddress || isIncludesName || isIncludesAlias
    })
    setFarmsList(filteredFarmsList)
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
        <FarmTopBar
          ready={ready}
          searchValue={searchValue}
          onSearch={handleOnSearch}
          onSort={handleOnSort}
          handleToggleStakedOnly={handleToggleStakedFarmsOnly}
          handleLiveFinishedToggleButtons={handleLiveFinishedToggleButtons}
          handleSetFarmsViewVariant={handleSetFarmsViewVariant}
          className={farmsViewVariant}
        />
        {farmsList?.length ? (
          <>
            <section className={`farm-list ${farmsViewVariant}`}>
              {farmsList.map((farm: FarmStorage, index: number) => {
                const lpTokenAddress = farm.lpTokenAddress || ''
                const farmContract = farmContracts.find((item) => item.address === lpTokenAddress)
                return (
                  <FarmCard
                    variant={farmsViewVariant}
                    farmAddress={farm.address}
                    name={farm.name}
                    lpTokenAddress={farm.lpTokenAddress}
                    lpTokenBalance={farm.lpTokenBalance}
                    currentRewardPerBlock={farm.currentRewardPerBlock}
                    firstToken={'MVK'}
                    secondToken={'USDM'}
                    distributer={farmContract?.creator.alias || ''}
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
      <Modal />
    </Page>
  )
}
