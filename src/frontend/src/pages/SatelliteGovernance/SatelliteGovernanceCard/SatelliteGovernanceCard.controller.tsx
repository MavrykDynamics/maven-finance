import { useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
/* @ts-ignore */
import Time from 'react-pure-time'
import { Link, useLocation } from 'react-router-dom'
import { State } from 'reducers'

import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { VotingArea } from '../../Governance/VotingArea/VotingArea.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'

import { getSeparateSnakeCase } from '../../../utils/parse'

// action
import { dropAction } from '../SatelliteGovernance.actions'

import {
  SatelliteGovernanceArrowButton,
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardStyled,
  SatelliteGovernanceCardTitleTextGroup,
  SatelliteGovernanceCardTopSection,
} from './SatelliteGovernanceCard.style'

type Props = {
  satellite: string
  date: string
  executed: boolean
  status: number
  id: number
  purpose: string
  governanceType: string
  linkAdress: string
}

export const SatelliteGovernanceCard = ({
  id,
  satellite,
  date,
  executed,
  status,
  purpose,
  governanceType,
  linkAdress,
}: Props) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
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

  const handleClick = async () => {
    await dispatch(dropAction(id, open))
  }

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
    <SatelliteGovernanceCardStyled>
      <SatelliteGovernanceCardTopSection
        onClick={open}
        className={expanded ? 'show' : 'hide'}
        height={accordionHeight}
        ref={ref}
      >
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Date</h3>
          <p>
            <Time value={date} format="M d\t\h, Y" />
          </p>
        </SatelliteGovernanceCardTitleTextGroup>
        <SatelliteGovernanceCardTitleTextGroup>
          <h3>Action</h3>
          <p className="first-big-letter">{getSeparateSnakeCase(governanceType)}</p>
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

      <SatelliteGovernanceCardDropDown className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <div className={'description accordion ' + `${expanded}`} ref={ref}>
          <div>
            <h3>Purpose</h3>
            <p>{purpose}</p>
            {linkAdress ? (
              <Link className={'view-satellite'} to={`/satellite-details/${linkAdress}`}>
                View Satellite
              </Link>
            ) : null}
            {statusFlag === ProposalStatus.ONGOING ? (
              <Button
                text="Drop Action"
                className="brop-btn"
                icon="close-stroke"
                kind={'actionSecondary'}
                onClick={handleClick}
              />
            ) : null}
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
