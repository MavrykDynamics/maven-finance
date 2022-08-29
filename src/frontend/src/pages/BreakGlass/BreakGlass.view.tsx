import React, { useEffect, useMemo, useState } from 'react'
import {
  BGCardsWrapper,
  BGInfo,
  BGMiddleWrapper,
  BGStatusIndicator,
  BGStyled,
  BGTitle,
  BGTop,
} from './BreakGlass.style'
import { ContractBreakGlass } from './mockContracts'
import { FAQLink } from '../Satellites/SatellitesSideBar/SatelliteSideBar.style'
import { ContractCard } from './ContractCard/ContractCard.controller'
import { ToggleButton } from './ToggleButton/Toggle-button.view'
import { SlidingTabButtons } from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

type BreakGlassViewProps = {
  contracts: ContractBreakGlass[]
  glassBroken: boolean
  whitelistDev: string
  pauseAllActive: boolean
  breakGlassStatuses: Record<string, unknown>[]
}

const ALL = 'All Contracts'
const GENERAL = 'General Contracts'

export const BreakGlassView = ({
  contracts,
  glassBroken,
  pauseAllActive,
  breakGlassStatuses,
  whitelistDev,
}: BreakGlassViewProps) => {
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

  const filteredBreakGlassStatuses = breakGlassStatuses
    ? selectedContract === ALL
      ? breakGlassStatuses
      : breakGlassStatuses?.filter((item) => {
          const type = item.type as string
          return selectedContract === type
        })
    : []

  const brakeGlassTabsList = uniqueContracts.map((item, i) => {
    return {
      text: item,
      id: i + 1,
      active: i === 0,
    }
  })

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
          <div className="status-indicator-wrapper whitelist">
            Whitelist Developer: <TzAddress tzAddress={whitelistDev} hasIcon />
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
      </BGTop>

      <BGMiddleWrapper>
        <BGTitle>Contract Status</BGTitle>
        <SlidingTabButtons className="brake-glass-tabs" tabItems={brakeGlassTabsList} onClick={handleTabChange} />
      </BGMiddleWrapper>

      <BGCardsWrapper>
        {filteredBreakGlassStatuses.map((item: Record<string, unknown>) => {
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
      </BGCardsWrapper>
    </BGStyled>
  )
}
