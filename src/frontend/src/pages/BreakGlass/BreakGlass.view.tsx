import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

// components
import { ContractCard } from './ContractCard/ContractCard.controller'
import { SlidingTabButtons } from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// helpers
import {
  BREAK_GLASS_LIST_NAME,
  calculateSlicePositions,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// styles
import {
  BGCardsWrapper,
  BGInfo,
  BGMiddleWrapper,
  BGStatusIndicator,
  BGStyled,
  BGPrimaryTitle,
  BGSecondaryTitle,
  BGTop,
  BGWhitelist,
} from './BreakGlass.style'
import { FAQLink } from '../Satellites/SatellitesSideBar/SatelliteSideBar.style'

type BreakGlassViewProps = {
  glassBroken: boolean
  whitelistDev: string
  pauseAllActive: boolean
  breakGlassStatuses: Record<string, unknown>[]
}

const ALL = 'All Contracts'
const GENERAL = 'General Contracts'

export const BreakGlassView = ({
  glassBroken,
  pauseAllActive,
  breakGlassStatuses,
  whitelistDev,
}: BreakGlassViewProps) => {
  const { search } = useLocation()

  const breakGlassStatus = glassBroken ? 'glass broken' : 'not broken'
  const pauseAllStatus = pauseAllActive ? 'paused' : 'not paused'
  const [selectedContract, setSelectedContract] = useState<string>(ALL)
  const [activeCard, setActiveCard] = React.useState<null | string>(null)
  const [openedAccordeon, setOpenedAcordeon] = React.useState<null | string>(null)

  const uniqueContracts = useMemo(() => {
    const uniqueAllContracts = breakGlassStatuses
      ? (Array.from(new Set(breakGlassStatuses.map((key) => key.type))) as string[])
      : []
    return [ALL, ...uniqueAllContracts.filter((item) => item !== GENERAL)]
  }, [breakGlassStatuses])

  const filteredBreakGlassStatuses = useMemo(() => {
    return breakGlassStatuses
    ? selectedContract === ALL
      ? breakGlassStatuses
      : breakGlassStatuses?.filter((item) => {
          const type = item.type as string
          return selectedContract === type
        })
    : []}, [breakGlassStatuses, selectedContract])

  const currentPage = getPageNumber(
    search,
    BREAK_GLASS_LIST_NAME,
  )

  const paginatedMyPastCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_LIST_NAME)
    return filteredBreakGlassStatuses?.slice(from, to)
  }, [currentPage, filteredBreakGlassStatuses])

  const brakeGlassTabsList = useMemo(
    () =>
      uniqueContracts.map((item, i) => {
        return {
          text: item,
          id: i + 1,
          active: item === selectedContract,
        }
      }),
    [selectedContract, uniqueContracts],
  )

  const handleTabChange = (tabId?: number) => {
    setSelectedContract(tabId ? brakeGlassTabsList.find((item) => item.id === tabId)?.text || '' : '')
  }

  return (
    <BGStyled className={'breakGlassContainer'}>
      <BGTop>
        <BGStatusIndicator>
          <div className="status-indicator-wrapper">
            Status: <span className={glassBroken ? 'color-red' : 'color-green'}>{breakGlassStatus}</span>
          </div>
          <div className="status-indicator-wrapper">
            Pause All: <span className={pauseAllActive ? 'color-red' : 'color-green'}>{pauseAllStatus}</span>
          </div>
        </BGStatusIndicator>
        <BGInfo>
          <p>
            The breakglass protocol (BGP) allows MVK holders to shutdown the system without waiting for a central
            authority. The BGP is triggered through the Emergency governance vote.
          </p>

          <FAQLink className="BG-faq-link">
            <a
              href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
              target="_blank"
              rel="noreferrer"
            >
              Read documentation here
            </a>
          </FAQLink>
        </BGInfo>
        <BGWhitelist>
          <BGSecondaryTitle>Whitelist Developers</BGSecondaryTitle>
          <div className="adress-list">
            <TzAddress tzAddress={whitelistDev} hasIcon />
          </div>
        </BGWhitelist>
      </BGTop>

      <BGMiddleWrapper>
        <BGPrimaryTitle>Contract Status</BGPrimaryTitle>
        <SlidingTabButtons className="brake-glass-tabs" tabItems={brakeGlassTabsList} onClick={handleTabChange} />
      </BGMiddleWrapper>

      <BGCardsWrapper>
        {paginatedMyPastCouncilActions.map((item: Record<string, unknown>) => {
          const trimmedTitle = (item.title as string).trim()
          const address = (item.address as string).trim()
          const isCardActive = activeCard === address
          return (
            <ContractCard
              isActive={isCardActive}
              contract={item}
              key={trimmedTitle + address}
              onClick={() => {
                if (isCardActive) {
                  setActiveCard(null)
                } else {
                  setActiveCard(address || '')
                }
              }}
              isExpanded={openedAccordeon === item.address}
              handleExpandAccordeon={setOpenedAcordeon}
            />
          )
        })}

        <Pagination
          itemsCount={filteredBreakGlassStatuses.length}
          listName={BREAK_GLASS_LIST_NAME}
        />
      </BGCardsWrapper>
    </BGStyled>
  )
}
