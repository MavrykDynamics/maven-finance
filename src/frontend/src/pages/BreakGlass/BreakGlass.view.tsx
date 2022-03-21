import * as React from 'react'
import {
  BGTextTitle,
  BGTextWithStatus,
  BGTitle,
  BreakGlassContractCardsContainer,
  BreakGlassStyled,
  BreakGlassTop,
  BreakGlassTopLeftCard,
  BreakGlassTopRightCard,
} from './BreakGlass.style'
import { ContractBreakGlass } from './mockContracts'
import { FAQLink } from '../Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { ContractCard } from './ContractCard/ContractCard.controller'
// @ts-ignore
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

type BreakGlassViewProps = {
  contracts: ContractBreakGlass[]
  glassBroken: boolean
  pauseAllActive: boolean
}

export const BreakGlassView = ({ contracts, glassBroken, pauseAllActive }: BreakGlassViewProps) => {
  const breakGlassStatus = glassBroken ? 'Glass Broken' : 'Waiting'
  const pauseAllStatus = pauseAllActive ? 'Active' : 'Inactive'

  return (
    <BreakGlassStyled className={'breakGlassContainer'}>
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
          <div>
            <p>
              The Break Glass protocol (BGP) allows MVK holders to shutdown the system without waiting for a central
              authority. The BGP is triggered through the Emergency governance vote.
            </p>
            <FAQLink>
              <a
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                Read documentation here.
              </a>
            </FAQLink>
          </div>
        </BreakGlassTopRightCard>
      </BreakGlassTop>
      <BGTitle>Contract Status'</BGTitle>
      <BreakGlassContractCardsContainer>
        <MasonryGallery>
          {contracts.map((item: ContractBreakGlass, index: number) => (
            <ContractCard contract={item} key={index} />
          ))}
        </MasonryGallery>
      </BreakGlassContractCardsContainer>
    </BreakGlassStyled>
  )
}

function MasonryGallery({ children }: { children: any }) {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 965: 2, 1280: 3, 1580: 4 }}>
      <Masonry gutter={'10px'}>{children}</Masonry>
    </ResponsiveMasonry>
  )
}
