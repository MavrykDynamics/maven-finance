import { useEffect, useRef, useState } from 'react'
import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'

// types
import { EmergencyGovernanceLedgerType } from '../EmergencyGovernance.controller'

import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { EmergencyGovernancePastProposal } from '../mockEGovProposals'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

import {
  EGovHistoryArrowButton,
  EGovHistoryCardDropDown,
  EGovHistoryCardStyled,
  EGovHistoryCardTitleTextGroup,
  EGovHistoryCardTopSection,
} from './EGovHistoryCard.style'

type EGovHistoryCardProps = {
  emergencyGovernance: EmergencyGovernanceLedgerType
}
export const EGovHistoryCard = ({ emergencyGovernance }: EGovHistoryCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)

  const open = () => setExpanded(!expanded)

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  const status = emergencyGovernance.executed ? ProposalStatus.EXECUTED : ProposalStatus.DROPPED

  console.log('%c ||||| emergencyGovernance', 'color:yellowgreen', emergencyGovernance)

  const currentData = emergencyGovernance.executed
    ? emergencyGovernance.executedTimestamp
    : emergencyGovernance.startTimestamp

  return (
    <EGovHistoryCardStyled key={String(emergencyGovernance.title + emergencyGovernance.id)} onClick={open}>
      <EGovHistoryCardTopSection className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <EGovHistoryCardTitleTextGroup>
          <h3>Title</h3>
          <p>{emergencyGovernance.title}</p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>Date</h3>
          <p>
            <Time value={currentData} format="M d\t\h, Y, H:m:s \U\T\C" />
          </p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>Proposer</h3>
          <p>
            <TzAddress tzAddress={emergencyGovernance.proposerId} hasIcon={false} />
          </p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryArrowButton>
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
        <EGovHistoryCardTitleTextGroup className={'statusFlag'}>
          <StatusFlag status={status} text={status} />
        </EGovHistoryCardTitleTextGroup>
      </EGovHistoryCardTopSection>

      <EGovHistoryCardDropDown onClick={open} className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <div className={'accordion ' + `${expanded}`} ref={ref}>
          <h3>Description</h3>
          <p>{emergencyGovernance.description}</p>
          {/* <ul>
            <li>What the exact fatal flaw was</li>
            <li>What the break glass triggered</li>
            <li>What actions the council took</li>
          </ul> */}
        </div>
      </EGovHistoryCardDropDown>
    </EGovHistoryCardStyled>
  )
}
