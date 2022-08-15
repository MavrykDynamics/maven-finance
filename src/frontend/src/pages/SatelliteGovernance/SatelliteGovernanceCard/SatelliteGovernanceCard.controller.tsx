import { useState } from 'react'
import { useDispatch } from 'react-redux'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { Button } from '../../../app/App.components/Button/Button.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { getSeparateSnakeCase } from '../../../utils/parse'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { VotingButtonsContainer } from '../../Governance/VotingArea/VotingArea.style'
import { VotingBarBlockView } from '../../Governance/VotingArea/VotingBar/VotingBarBlock.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Expand from '../../../app/App.components/Expand/Expand.view'

import { getSeparateSnakeCase } from '../../../utils/parse'

// action
import { dropAction, voteForAction } from '../SatelliteGovernance.actions'

import { SatelliteGovernanceCardDropDown, SatelliteGovernanceCardTitleTextGroup } from './SatelliteGovernanceCard.style'
import { VotingButtonsContainer } from '../../Governance/VotingArea/VotingArea.style'

type Props = {
  satelliteId: string
  initiatorId: string
  date: string
  executed: boolean
  status: number
  id: number
  purpose: string
  governanceType: string
  linkAddress: string
  smvkPercentageForApproval: number
  yayVotesSmvkTotal: number
  nayVotesSmvkTotal: number
  passVoteSmvkTotal: number
  snapshotSmvkTotalSupply: number
}

export const SatelliteGovernanceCard = ({
  id,
  satelliteId,
  initiatorId,
  date,
  executed,
  status,
  purpose,
  governanceType,
  linkAddress,
  smvkPercentageForApproval,
  yayVotesSmvkTotal,
  nayVotesSmvkTotal,
  passVoteSmvkTotal,
  snapshotSmvkTotalSupply,
}: Props) => {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(false)

  const open = () => setExpanded(!expanded)

  const handleVotingRoundVote = (type: string) => {
    dispatch(voteForAction(id, type, open))
  }

  const handleClick = async () => {
    await dispatch(dropAction(id, open))
  }

  const timeNow = Date.now()
  const expirationDatetime = new Date(date).getTime()
  const isEndingVotingTime = expirationDatetime > timeNow

  const timeFormat = `${new Date(date).getHours()}:${new Date(date).getMinutes()}`

  const statusFlag = executed
    ? ProposalStatus.EXECUTED
    : status === 1
    ? ProposalStatus.DROPPED
    : isEndingVotingTime
    ? ProposalStatus.ONGOING
    : expirationDatetime < timeNow
    ? ProposalStatus.DEFEATED
    : ProposalStatus.ACTIVE

  return (
    <Expand
      className="expand-satellite-governance"
      header={
        <>
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
              <TzAddress tzAddress={satelliteId} hasIcon={false} />
            </p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Initiator</h3>
            <p>
              <TzAddress tzAddress={initiatorId} hasIcon={false} />
            </p>
          </SatelliteGovernanceCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag status={statusFlag} text={statusFlag} />}
    >
      <SatelliteGovernanceCardDropDown>
        <div>
          <h3>Purpose</h3>
          <p className="purpose">{purpose}</p>
          {linkAddress ? (
            <Link className={'view-satellite'} to={`/satellite-details/${linkAddress}`}>
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
          <h3>Vote Statistics</h3>
          <b className="voting-ends">
            Voting {!isEndingVotingTime ? 'ended' : 'ending'} on <Time value={date} format="M d\t\h, Y" /> {timeFormat}{' '}
            CEST
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
      </SatelliteGovernanceCardDropDown>
    </Expand>
  )
}
