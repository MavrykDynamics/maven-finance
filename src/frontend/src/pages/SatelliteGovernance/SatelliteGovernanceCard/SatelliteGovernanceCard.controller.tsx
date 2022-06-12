import { useEffect, useRef, useState } from 'react'
import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { Link, useLocation } from 'react-router-dom'

import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { VotingArea } from '../../Governance/VotingArea/VotingArea.controller'

import {
  SatelliteGovernanceArrowButton,
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardStyled,
  SatelliteGovernanceCardTitleTextGroup,
  SatelliteGovernanceCardTopSection,
} from './SatelliteGovernanceCard.style'

type SatelliteGovernanceCardType = {
  id: number
  title: string
  startTimestamp: string
  proposerId: string
  description: string
  dropped: boolean
  executed: boolean
}

type Props = {
  satelliteGovernanceCard: SatelliteGovernanceCardType
}

export const SatelliteGovernanceCard = ({ satelliteGovernanceCard }: Props) => {
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)

  const open = () => setExpanded(!expanded)

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  const handleProposalRoundVote = () => {}
  const handleVotingRoundVote = () => {}

  const status = satelliteGovernanceCard.executed ? ProposalStatus.EXECUTED : ProposalStatus.DROPPED

  return (
    <SatelliteGovernanceCardStyled
      key={String(satelliteGovernanceCard.title + satelliteGovernanceCard.id)}
      onClick={open}
    >
      <SatelliteGovernanceCardTopSection className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Date</h3>
          <p>
            Nov 11th, 2022
            {/* <Time value={satelliteGovernanceCard.startTimestamp} format="M d\t\h, Y, H:m \U\T\C" /> */}
          </p>
        </SatelliteGovernanceCardTitleTextGroup>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Action</h3>
          <p>{satelliteGovernanceCard.title}</p>
        </SatelliteGovernanceCardTitleTextGroup>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Satellite</h3>
          <p>
            <TzAddress tzAddress={satelliteGovernanceCard.proposerId} hasIcon={false} />
          </p>
        </SatelliteGovernanceCardTitleTextGroup>
        <SatelliteGovernanceArrowButton>
          {expanded ? (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-up`} />
            </svg>
          ) : (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-down`} />
            </svg>
          )}
        </SatelliteGovernanceArrowButton>
        <SatelliteGovernanceCardTitleTextGroup className={'statusFlag'}>
          <StatusFlag status={status} text={status} />
        </SatelliteGovernanceCardTitleTextGroup>
      </SatelliteGovernanceCardTopSection>

      <SatelliteGovernanceCardDropDown
        onClick={open}
        className={expanded ? 'show' : 'hide'}
        height={accordionHeight}
        ref={ref}
      >
        <div className={'description accordion ' + `${expanded}`} ref={ref}>
          <div>
            <h3>Purpose</h3>
            <p>{satelliteGovernanceCard.description}</p>
            <Link to="/">View Satellite</Link>
          </div>
          <div>
            <h3>Vote Satistics</h3>
            {/* <VotingArea
              ready={true}
              loading={true}
              accountPkh={'1111'}
              handleProposalRoundVote={handleProposalRoundVote}
              handleVotingRoundVote={handleVotingRoundVote}
            /> */}
          </div>
        </div>
      </SatelliteGovernanceCardDropDown>
    </SatelliteGovernanceCardStyled>
  )
}
