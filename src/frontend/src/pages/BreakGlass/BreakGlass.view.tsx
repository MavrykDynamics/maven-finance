import * as React from 'react'
import {
  BGContractCard,
  BGTextTitle,
  BGTextWithStatus,
  BGTitle,
  BreakGlassContractCardsContainer,
  BreakGlassStyled,
  BreakGlassTop,
  BreakGlassTopLeftCard,
  BreakGlassTopRightCard,
  ContractCardTitleStatusContainer,
} from './BreakGlass.style'
import { ContractBreakGlass } from './mockContracts'
import { FAQLink } from '../Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { ContractCard } from './ContractCard/ContractCard.controller'

type BreakGlassViewProps = {
  contracts: ContractBreakGlass[]
  glassBroken: boolean
  pauseAllActive: boolean
}

export const BreakGlassView = ({ contracts, glassBroken, pauseAllActive }: BreakGlassViewProps) => {
  const breakGlassStatus = glassBroken ? 'Glass Broken' : 'Waiting'
  const pauseAllStatus = pauseAllActive ? 'Active' : 'Inactive'
  return (
    <BreakGlassStyled>
      <BreakGlassTop>
        <BreakGlassTopLeftCard>
          <div>
            <BGTextTitle>Status:</BGTextTitle>
            <BGTextWithStatus status={glassBroken}>{breakGlassStatus}</BGTextWithStatus>
          </div>
          <div>
            <BGTextTitle>Pause All:</BGTextTitle>
            <BGTextWithStatus status={pauseAllActive}>{pauseAllStatus}</BGTextWithStatus>
          </div>
        </BreakGlassTopLeftCard>
        <BreakGlassTopRightCard>
          <p>
            The Break Glass protocol (BGP) allows MVK holders to shutdown the system without waiting for a central
            authority. The BGP is triggered through the Emergency governance vote.{' '}
            <FAQLink>
              <a
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                Read documentation here.
              </a>
            </FAQLink>
          </p>
        </BreakGlassTopRightCard>
      </BreakGlassTop>
      <BGTitle>Contract Status'</BGTitle>
      <BreakGlassContractCardsContainer>
        {contracts.map((item: ContractBreakGlass, index: number) => {
          return <ContractCard contract={item} key={index} />
        })}
      </BreakGlassContractCardsContainer>
    </BreakGlassStyled>
  )
}
