import React, { useMemo, useState, useEffect } from 'react'
import {
  BGStyled,
  BGTop,
  BGInfo,
  BGStatusIndicator,
  BGMiddleWrapper,
  BGCardsWrapper,
  BGTitle,
} from './BreakGlass.style'
import { ContractBreakGlass } from './mockContracts'
import { FAQLink } from '../Satellites/SatellitesSideBar/SatelliteSideBar.style'
import { ContractCard } from './ContractCard/ContractCard.controller'
import { ToggleButton } from './ToggleButton/Toggle-button.view'

type BreakGlassViewProps = {
  contracts: ContractBreakGlass[]
  glassBroken: boolean
  pauseAllActive: boolean
  breakGlassStatuses: Record<string, unknown>[]
}

export const BreakGlassView = ({ contracts, glassBroken, pauseAllActive, breakGlassStatuses }: BreakGlassViewProps) => {
  const breakGlassStatus = glassBroken ? 'glass broken' : 'not broken'
  const pauseAllStatus = pauseAllActive ? 'paused' : 'not paused'
  const [selectedContract, setSelectedContract] = useState<string>('')
  const [activeCard, setActiveCard] = React.useState<null | string>(null)

  const uniqueContracts = useMemo(() => {
    return breakGlassStatuses ? (Array.from(new Set(breakGlassStatuses.map((key) => key.type))) as string[]) : []
  }, [breakGlassStatuses])

  useEffect(() => {
    if (uniqueContracts?.length) {
      setSelectedContract(uniqueContracts[0] as string)
    }
  }, [breakGlassStatuses])

  const filteredBreakGlassStatuses = breakGlassStatuses
    ? breakGlassStatuses?.filter((item) => {
        const type = item.type as string
        return selectedContract === type
      })
    : []

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
            The breakglass protocal (BGP) allows MVK holders to shutdown the system without waiting for a central
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
        <ToggleButton
          selected={selectedContract}
          handleSetSelectedToggler={(tabId: string) => {
            setSelectedContract(tabId)
            setActiveCard(null)
          }}
          uniqueContracts={uniqueContracts}
        />
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
            />
          )
        })}
      </BGCardsWrapper>
    </BGStyled>
  )
}
