import * as React from 'react'
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
import { FAQLink } from '../Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { ContractCard } from './ContractCard/ContractCard.controller'
import { ToggleButton } from './ToggleButton/Toggle-button.view'

type BreakGlassViewProps = {
  contracts: ContractBreakGlass[]
  glassBroken: boolean
  pauseAllActive: boolean
}

// TODO: remove this later, need to find data source for this
const toggleButtonData = [
  {
    buttonName: 'General Contracts',
    buttonId: 'GC',
  },
  {
    buttonName: 'Treasury',
    buttonId: 'treasury',
  },
  {
    buttonName: 'Farms',
    buttonId: 'farms',
  },
  {
    buttonName: 'Oracles',
    buttonId: 'oracles',
  },
]

export const BreakGlassView = ({ contracts, glassBroken, pauseAllActive }: BreakGlassViewProps) => {
  const breakGlassStatus = glassBroken ? 'glass broken' : 'not broken'
  const pauseAllStatus = pauseAllActive ? 'paused' : 'not paused'
  const [activeCards, setActiveCards] = React.useState<Array<string>>([])

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
              Read documentation here.
            </a>
          </FAQLink>
        </BGInfo>
      </BGTop>
      <BGMiddleWrapper>
        <BGTitle>Contract Status'</BGTitle>
        <ToggleButton toggleData={toggleButtonData} />
      </BGMiddleWrapper>

      <BGCardsWrapper>
        {contracts.map((item: ContractBreakGlass, index: number) => {
          const isCardActive = Boolean(activeCards.find((cardKey) => cardKey === item.name))
          return (
            <ContractCard
              isActive={isCardActive}
              contract={item}
              key={index}
              onClick={() => {
                if (isCardActive) {
                  setActiveCards(activeCards.filter((cardKey) => cardKey !== item.name))
                } else {
                  setActiveCards([...activeCards, item.name])
                }
              }}
            />
          )
        })}
      </BGCardsWrapper>
    </BGStyled>
  )
}
