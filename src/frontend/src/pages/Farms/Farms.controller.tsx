// type
import { FarmStorage } from '../../utils/TypesAndInterfaces/Farm'

import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'
import { FarmTopBar } from './FarmTopBar/FarmTopBar.controller'
import { FarmCard } from './FarmCard/FarmCard.controller'
import { Modal } from '../../app/App.components/Modal/Modal.controller'

// helpers
import { calculateAPR, getSummDepositedAmount } from './Frams.helpers'

// styles
import { FarmsStyled } from './Farms.style'
import { EmptyContainer as EmptyList } from 'app/App.style'
import { useHistory, useLocation } from 'react-router-dom'
import qs from 'qs'

export type FarmsViewVariantType = 'vertical' | 'horizontal'

const EmptyContainer = () => (
  <EmptyList>
    <img src="/images/not-found.svg" alt=" No results to show" />
    <figcaption> No results to show</figcaption>
  </EmptyList>
)

export const Farms = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  let { farmStorage, farmContracts } = useSelector((state: State) => state.farm)

  const [farmsList, setFarmsList] = useState(farmStorage)
  const [farmsListSearch, setFarmsListSearch] = useState<FarmStorage>([])
  const [toggleChecked, setToggleChecked] = useState(false)
  const [liveFinished, setLiveFinished] = useState<number | undefined>(1)
  const [stakedFarmsOnly, setStakeFarmsOnly] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [farmsViewVariant, setFarmsViewVariant] = useState<FarmsViewVariantType>('vertical')

  const { search, pathname } = useLocation()
  const { openedCards = [] } = qs.parse(search, { ignoreQueryPrefix: true }) as { openedCards?: Array<string> }

  const addOpenedCardToQP = (cardAddress: string) => {
    const arrayOfCards = openedCards.find((address) => cardAddress === address)
      ? openedCards.filter((address) => address !== cardAddress)
      : [...openedCards, cardAddress]

    const stringifiedQP = qs.stringify({ openedCards: arrayOfCards })
    history.push(`${pathname}?${stringifiedQP}`)
  }

  const farmsTVL = useMemo(
    () =>
      farmStorage.reduce((acc, farm) => {
        return (acc += farm.lpBalance)
      }, 0),
    [],
  )

  useEffect(() => {
    const filterStakedOnly = toggleChecked
      ? farmStorage.filter(
          (item) => item.farmAccounts?.length && item.farmAccounts.some((account) => account?.deposited_amount > 0),
        )
      : farmStorage

    const isLive = liveFinished === 1
    const filteredLiveFinished = filterStakedOnly.filter((item) => item.open === isLive)
    const filteredSearch = searchValue.length
      ? filteredLiveFinished.filter((farm) => {
          const isIncludesTokenAddress = farm.lpTokenAddress.includes(searchValue)
          const isIncludesName = farm.name.includes(searchValue)
          const lpTokenAddress = farm.lpTokenAddress || ''
          const farmContract = farmContracts.find((item) => item.address === lpTokenAddress)
          const isIncludesAlias =
            farmContract?.creator?.alias?.includes(searchValue) || farmContract?.metadata?.alias?.includes(searchValue)
          return isIncludesTokenAddress || isIncludesName || isIncludesAlias
        })
      : filteredLiveFinished

    if (sortBy) {
      const dataToSort = filteredSearch ? [...filteredSearch] : []

      dataToSort.sort((a, b) => {
        let res = 0
        switch (sortBy) {
          case 'active':
            res = Number(a.open) - Number(b.open)
            break
          case 'highestAPY':
            res =
              parseFloat(calculateAPR(a.currentRewardPerBlock, a.lpBalance)) <
              parseFloat(calculateAPR(b.currentRewardPerBlock, b.lpBalance))
                ? 1
                : -1

            break
          case 'lowestAPY':
            res =
              parseFloat(calculateAPR(a.currentRewardPerBlock, a.lpBalance)) >
              parseFloat(calculateAPR(b.currentRewardPerBlock, b.lpBalance))
                ? 1
                : -1
            break
          case 'highestLiquidity':
            res = a.lpBalance < b.lpBalance ? 1 : -1
            break
          case 'lowestLiquidity':
            res = a.lpBalance > b.lpBalance ? 1 : -1
            break
          case 'yourLargestStake':
            res = getSummDepositedAmount(a.farmAccounts) < getSummDepositedAmount(b.farmAccounts) ? 1 : -1
            break
          case 'rewardsPerBlock':
            res = a.currentRewardPerBlock < b.currentRewardPerBlock ? 1 : -1
            break
          default:
            res = 1
            break
        }
        return res
      })

      setFarmsList(dataToSort)
    } else {
      setFarmsList(filteredSearch)
    }
  }, [farmStorage, liveFinished, searchValue, toggleChecked, sortBy])

  const handleToggleStakedFarmsOnly = (e?: { target: { checked: boolean } }) => {
    setToggleChecked(Boolean(e?.target?.checked))
  }

  const handleSetFarmsViewVariant = (variant: FarmsViewVariantType) => {
    setFarmsViewVariant(variant)
  }

  const handleLiveFinishedToggleButtons = (tabId?: number) => {
    setLiveFinished(tabId)
  }

  const handleOnSearch = (text: string) => {
    setSearchValue(text)
  }

  const handleOnSort = (sortValue: string) => {
    setSortBy(sortValue)
  }

  return (
    <Page>
      <PageHeader page={'farms'} />
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
          toggleChecked={toggleChecked}
        />
        {farmsList.length ? (
          <>
            <section className={`farm-list ${farmsViewVariant}`}>
              {farmsList.map((farm, index: number) => {
                const depositAmount = getSummDepositedAmount(farm.farmAccounts)
                return (
                  <div key={farm.address + index}>
                    <FarmCard
                      variant={farmsViewVariant}
                      farmAddress={farm.address}
                      name={farm.name}
                      lpTokenBalance={farm.lpBalance}
                      lpTokenAddress={farm.lpTokenAddress}
                      currentRewardPerBlock={farm.currentRewardPerBlock}
                      depositAmount={depositAmount}
                      firstToken={farm.lpToken1}
                      secondToken={farm.lpToken2}
                      liquidity={farm.lpBalance}
                      totalLiquidity={farmsTVL}
                      expandCallback={addOpenedCardToQP}
                      isOpenedCard={Boolean(openedCards.find((address) => farm.address === address))}
                    />
                  </div>
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
