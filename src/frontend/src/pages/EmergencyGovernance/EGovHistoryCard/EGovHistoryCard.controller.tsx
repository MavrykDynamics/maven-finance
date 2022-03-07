import { EmergencyGovernancePastProposal } from '../mockEGovProposals'
import {
  EGovHistoryArrowButton,
  CardDropDownContainer,
  EGovHistoryCardStyled,
  EGovHistoryCardTitleTextGroup,
  EGovHistoryCardTopSection,
} from './EGovHistoryCard.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { useEffect, useRef, useState } from 'react'
import * as React from 'react'

type EGovHistoryCardProps = {
  pastProposal: EmergencyGovernancePastProposal
}
export const EGovHistoryCard = ({ pastProposal }: EGovHistoryCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)

  const open = () => setExpanded(!expanded)

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  return (
    <EGovHistoryCardStyled key={String(pastProposal.title + pastProposal.proposer)}>
      <EGovHistoryCardTopSection className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <EGovHistoryCardTitleTextGroup>
          <h3>Title</h3>
          <p>{pastProposal.title}</p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>Date</h3>
          <p>{pastProposal.date}</p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>MVK Burned</h3>
          <p>{pastProposal.mvkBurned}</p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>Proposer</h3>
          <p>
            <TzAddress tzAddress={pastProposal.proposer} hasIcon={false} />
          </p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryArrowButton onClick={open}>
          {expanded ? (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-up`} />
            </svg>
          ) : (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-down`} />
            </svg>
          )}
        </EGovHistoryArrowButton>
        <StatusFlag status={pastProposal.status} text={pastProposal.status} />
      </EGovHistoryCardTopSection>

      <CardDropDownContainer onClick={open} className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <div className={'accordion ' + `${expanded}`} ref={ref}>
          Hello
        </div>
      </CardDropDownContainer>
    </EGovHistoryCardStyled>
  )
}
