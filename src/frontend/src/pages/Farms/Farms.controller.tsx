import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import qs from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FarmTopBar, LIVE_TAB_ID } from './FarmTopBar/FarmTopBar.controller'
import { FarmCard } from './FarmCard/FarmCard.controller'
import { Modal } from '../../app/App.components/Modal/Modal.controller'

// helpers
import { calculateAPY, getSummDepositedAmount } from './Farms.helpers'

// styles
import { FarmsStyled } from './Farms.style'
import { Page } from 'styles'
import { EmptyContainer as EmptyList } from 'app/App.style'
import { getFarmStorage } from './Farms.actions'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import {
  calculateSlicePositions,
  FARMS_HORIZONTAL_CARDS,
  FARMS_VERTICAL_CARDS,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import { State } from '../../reducers'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'

export const VERTICAL_FARM_VIEW = 'vertical'
export const HORIZONTAL_FARM_VIEW = 'horizontal'
export type FarmsViewVariantType = typeof VERTICAL_FARM_VIEW | typeof HORIZONTAL_FARM_VIEW

const EmptyContainer = () => (
  <EmptyList>
    <img src="/images/not-found.svg" alt=" No results to show" />
    <figcaption> No farms to show</figcaption>
  </EmptyList>
)

export const Farms = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { ready } = useSelector((state: State) => state.wallet)
  const { farmStorage } = useSelector((state: State) => state.farm)

  const [farmsList, setFarmsList] = useState(farmStorage)

  // filters states
  const [toggleChecked, setToggleChecked] = useState(false)
  const [openedFarmsCards, setOpenedFarmsCards] = useState<Array<string>>([])
  const [liveFinished, setLiveFinished] = useState<number>(LIVE_TAB_ID)
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [farmsViewVariant, setFarmsViewVariant] = useState<FarmsViewVariantType>(VERTICAL_FARM_VIEW)

  const { search, pathname } = useLocation()
  const {
    openedCards = [],
    isLive = LIVE_TAB_ID,
    searchFarm = '',
    sortType = '',
    isStakedOny = false,
  } = useMemo(
    () =>
      qs.parse(search, { ignoreQueryPrefix: true }) as {
        openedCards?: Array<string>
        isLive?: number
        searchFarm?: string
        sortType?: string
        isStakedOny?: boolean
      },
    [search],
  )

  // pagination stuff
  const listName = useMemo(
    () => (farmsViewVariant === VERTICAL_FARM_VIEW ? FARMS_VERTICAL_CARDS : FARMS_HORIZONTAL_CARDS),
    [farmsViewVariant],
  )

  const currentPage = useMemo(() => getPageNumber(search, listName), [search, listName])

  const farmsCards = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return farmsList?.slice(from, to)
  }, [farmsList, isLive, searchFarm, sortType, isStakedOny, currentPage, listName])

  // effect to set all filters state from queryParams on mount
  useEffect(() => {
    dispatch(getFarmStorage())

    setToggleChecked(isStakedOny)
    setSearchValue(searchFarm)
    setSortBy(sortType)
    setLiveFinished(Number(isLive))
    setOpenedFarmsCards(openedCards)
  }, [])

  // fn to add/remove card address fron query params, is it open or not
  const handleOpenCard = useCallback(
    (cardAdrress: string) => {
      const newOpenCardArr = openedFarmsCards.find((openCardAddress) => openCardAddress === cardAdrress)
        ? openedFarmsCards.filter((openCardAddress) => openCardAddress !== cardAdrress)
        : openedFarmsCards.concat(cardAdrress)

      setOpenedFarmsCards(newOpenCardArr)

      const filtersQP = {
        openedCards: newOpenCardArr,
        isLive: liveFinished,
        ...(searchFarm ? { searchFarm: searchValue } : {}),
        ...(sortType ? { sortType: sortBy } : {}),
        ...(isStakedOny ? { isStakedOny: isStakedOny } : {}),
      }

      const stringifiedQP = qs.stringify(filtersQP, { addQueryPrefix: true })
      history.push(`${pathname}${stringifiedQP}`)
    },
    [isStakedOny, liveFinished, openedFarmsCards, pathname, searchFarm, searchValue, sortBy, sortType],
  )

  // effect to handle all sortings and filters in top bar
  useEffect(() => {
    let farmsToSortFilter = [...farmStorage]

    // apply live finished filter
    farmsToSortFilter = farmsToSortFilter.filter(({ isLive }) =>
      liveFinished === 1 ? isLive === true : isLive === false,
    )

    // apply staked only filter
    farmsToSortFilter = toggleChecked
      ? farmsToSortFilter.filter(
          (item) => item.farmAccounts?.length && item.farmAccounts.some((account) => account?.deposited_amount > 0),
        )
      : farmsToSortFilter

    // apply search
    farmsToSortFilter = searchValue.length
      ? farmsToSortFilter.filter(({ lpTokenAddress, name }) => {
          const isIncludesTokenAddress = lpTokenAddress.includes(searchValue)
          const isIncludesName = name.includes(searchValue)
          return isIncludesTokenAddress || isIncludesName
        })
      : farmsToSortFilter

    // apply sorting
    if (sortBy) {
      const dataToSort = farmsToSortFilter ? [...farmsToSortFilter] : []
      dataToSort.sort((a, b) => {
        let res = 0
        switch (sortBy) {
          case 'active':
            res = Number(a.open) - Number(b.open)
            break
          case 'highestAPY':
            res =
              calculateAPY(a.currentRewardPerBlock, a.lpBalance) < calculateAPY(a.currentRewardPerBlock, a.lpBalance)
                ? 1
                : -1
            break
          case 'lowestAPY':
            res =
              calculateAPY(a.currentRewardPerBlock, a.lpBalance) > calculateAPY(a.currentRewardPerBlock, a.lpBalance)
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
      setFarmsList(farmsToSortFilter)
    }

    // creating qp object and update qp
    const filtersQP = {
      openedCards,
      isLive: liveFinished,
      ...(searchValue ? { searchFarm: searchValue } : {}),
      ...(sortBy ? { sortType: sortBy } : {}),
      ...(toggleChecked ? { isStakedOny: toggleChecked } : {}),
    }

    const stringifiedQP = qs.stringify(filtersQP)
    history.push(`${pathname}?${stringifiedQP}`)
  }, [farmStorage, liveFinished, searchValue, toggleChecked, sortBy])

  // Handler for top bar
  const handleToggleStakedFarmsOnly = (e?: { target: { checked: boolean } }) => {
    setToggleChecked(Boolean(e?.target?.checked))
  }

  const handleSetFarmsViewVariant = (variant: FarmsViewVariantType) => {
    setFarmsViewVariant(variant)
  }

  const handleLiveFinishedToggleButtons = (tabId: number) => {
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
          liveFinishedIdSelected={liveFinished}
        />
        {farmsList.length ? (
          <section className={`farm-list ${farmsViewVariant}`}>
            {farmsCards.map((farm, index: number) => {
              const depositAmount = getSummDepositedAmount(farm.farmAccounts)
              return (
                <div key={farm.address + index}>
                  <FarmCard
                    farm={farm}
                    variant={farmsViewVariant}
                    currentRewardPerBlock={farm.currentRewardPerBlock}
                    depositAmount={depositAmount}
                    expandCallback={handleOpenCard}
                    isOpenedCard={Boolean(openedCards.find((address) => farm.address === address))}
                  />
                </div>
              )
            })}
            <Pagination itemsCount={farmsList.length} listName={listName} />
          </section>
        ) : (
          <EmptyContainer />
        )}
      </FarmsStyled>
      <Modal />
    </Page>
  )
}
