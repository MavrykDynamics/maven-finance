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
  executed: boolean
}

type Props = {
  satelliteGovernanceCard: SatelliteGovernanceCardType
  satellite: string
  date: string
  executed: boolean
  status: number
}

export const SatelliteGovernanceCard = ({ satelliteGovernanceCard, satellite, date, executed, status }: Props) => {
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

  const timeNow = Date.now()
  const expirationDatetime = new Date(date).getTime()
  const isEndedVotingTime = expirationDatetime > timeNow

  const statusFlag = executed
    ? ProposalStatus.EXECUTED
    : status === 1
    ? ProposalStatus.DROPPED
    : isEndedVotingTime
    ? ProposalStatus.ONGOING
    : ProposalStatus.ACTIVE

  return (
    <SatelliteGovernanceCardStyled
      key={String(satelliteGovernanceCard.title + satelliteGovernanceCard.id)}
      onClick={open}
    >
      <SatelliteGovernanceCardTopSection className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Date</h3>
          <p>
            <Time value={date} format="M d\t\h, Y" />
          </p>
        </SatelliteGovernanceCardTitleTextGroup>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Action</h3>
          <p>{satelliteGovernanceCard.title}</p>
        </SatelliteGovernanceCardTitleTextGroup>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Satellite</h3>
          <p>
            <TzAddress tzAddress={satellite} hasIcon={false} />
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
          <StatusFlag status={statusFlag} text={statusFlag} />
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
