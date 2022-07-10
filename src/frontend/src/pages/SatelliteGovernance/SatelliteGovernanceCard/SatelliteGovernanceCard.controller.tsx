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
import { VotingBarBlockView } from '../../Governance/VotingArea/VotingBar/VotingBarBlock.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

import { getSeparateSnakeCase } from '../../../utils/parse'

// action
import { dropAction, voteForAction } from '../SatelliteGovernance.actions'

import {
  SatelliteGovernanceArrowButton,
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardStyled,
  SatelliteGovernanceCardTitleTextGroup,
  SatelliteGovernanceCardTopSection,
} from './SatelliteGovernanceCard.style'
import { VotingAreaStyled, VotingButtonsContainer } from '../../Governance/VotingArea/VotingArea.style'

type Props = {
  satellite: string
  date: string
  executed: boolean
  status: number
  id: number
  purpose: string
  governanceType: string
  linkAdress: string
  smvkPercentageForApproval: number
  yayVotesSmvkTotal: number
  nayVotesSmvkTotal: number
  passVoteSmvkTotal: number
  snapshotSmvkTotalSupply: number
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
  smvkPercentageForApproval,
  yayVotesSmvkTotal,
  nayVotesSmvkTotal,
  passVoteSmvkTotal,
  snapshotSmvkTotalSupply,
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

  const handleVotingRoundVote = (type: string) => {
    dispatch(voteForAction(id, type, open))
  }

  const handleClick = async () => {
    await dispatch(dropAction(id, open))
  }

  const timeNow = Date.now()
  const expirationDatetime = new Date(date).getTime()
  const isEndingVotingTime = expirationDatetime > timeNow

  const statusFlag = executed
    ? ProposalStatus.EXECUTED
    : status === 1
    ? ProposalStatus.DROPPED
    : isEndingVotingTime
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
            <p className="purpose">{purpose}</p>
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
          <div className="voting-block">
            <h3>Vote Satistics</h3>
            <b className="voting-ends">
              Voting {!isEndingVotingTime ? 'ended' : 'ending'} in{' '}
              <Time value={date} format="M d\t\h, Y, H:m:s \C\E\R\T" />
            </b>
            <div className="voting-bar">
              <VotingBarBlockView
                yayVotesSmvkTotal={yayVotesSmvkTotal}
                nayVotesSmvkTotal={nayVotesSmvkTotal}
                passVoteSmvkTotal={passVoteSmvkTotal}
                snapshotSmvkTotalSupply={snapshotSmvkTotalSupply}
                smvkPercentageForApproval={smvkPercentageForApproval}
              />
            </div>
            {statusFlag === ProposalStatus.ONGOING ? (
              <VotingButtonsContainer className="voting-buttons">
                <Button text={'Vote YES'} onClick={() => handleVotingRoundVote('yay')} kind={'votingFor'} />
                <Button text={'Vote PASS'} onClick={() => handleVotingRoundVote('pass')} kind={'votingAbstain'} />
                <Button text={'Vote NO'} onClick={() => handleVotingRoundVote('nay')} kind={'votingAgainst'} />
              </VotingButtonsContainer>
            ) : null}
          </div>
        </div>
      </SatelliteGovernanceCardDropDown>
    </SatelliteGovernanceCardStyled>
  )
}
