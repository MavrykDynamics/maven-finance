import { FC, useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
/* @ts-ignore */
import Time from 'react-pure-time'
import { Link } from 'react-router-dom'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { getSeparateSnakeCase } from '../../../utils/parse'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { VotingButtonsContainer } from '../../Governance/VotingArea/VotingArea.style'
import { VotingBarBlockView } from '../../Governance/VotingArea/VotingBar/VotingBarBlock.view'
import Expand from '../../../app/App.components/Expand/Expand.view'

// action
import { dropAction, voteForAction } from 'pages/SatelliteGovernance/SatelliteGovernance.actions'

// styles
import { PastBreakGlassActionsCardCardDropDown as PastBreakGlassActionsCardDropDown, PastBreakGlassActionsCardTitleTextGroup } from './PastBreakGlassActionsCard.style'

type Props = {
  targetId: string
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

export const PastBreakGlassActionsCard: FC<Props> = ({
  id,
  targetId,
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
}) => {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)

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

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

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
      onClick={open}
      className="expand-governance"
      header={
        <>
          <PastBreakGlassActionsCardTitleTextGroup>
            <h3>Date</h3>
            <p className="inner">
              <Time value={date} format="M d\t\h, Y" />
            </p>
          </PastBreakGlassActionsCardTitleTextGroup>
          <PastBreakGlassActionsCardTitleTextGroup>
            <h3>Action</h3>
            <p className="inner first-big-letter">{getSeparateSnakeCase(governanceType)}</p>
          </PastBreakGlassActionsCardTitleTextGroup>
          <PastBreakGlassActionsCardTitleTextGroup>
            <h3>Target</h3>
            <div className="inner">
              <TzAddress tzAddress={targetId} hasIcon={false} />
            </div>
          </PastBreakGlassActionsCardTitleTextGroup>
          <PastBreakGlassActionsCardTitleTextGroup>
            <h3>Initiator</h3>
            <div className="inner">
              <TzAddress tzAddress={initiatorId} hasIcon={false} />
            </div>
          </PastBreakGlassActionsCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag status={statusFlag} text={statusFlag} />}
    >
      <PastBreakGlassActionsCardDropDown className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <div className='card'>
          <div className='main-block'>
            <div>
              <h3>Purpose</h3>
              <p className="purpose">{purpose}</p>

              {linkAddress ? (
                <Link className={'view-satellite'} to={`/satellite-details/${linkAddress}`}>
                  View Satellite
                </Link>
              ) : null}
            </div>

            <div className="voting-block">
              <h3>Vote Statistics</h3>
              <b className="voting-ends">
                Voting {!isEndingVotingTime ? 'ended' : 'ending'} on <Time value={date} format="M d\t\h, Y" /> {timeFormat}{' '}
                CEST
              </b>

              <VotingBarBlockView
                yayVotesSmvkTotal={yayVotesSmvkTotal}
                nayVotesSmvkTotal={nayVotesSmvkTotal}
                passVoteSmvkTotal={passVoteSmvkTotal}
                snapshotSmvkTotalSupply={snapshotSmvkTotalSupply}
                smvkPercentageForApproval={smvkPercentageForApproval}
              />
            </div>
          </div>

          {statusFlag === ProposalStatus.ONGOING ? (
            <VotingButtonsContainer className="voting-buttons">
              <Button
                text="Drop Action"
                className="brop-btn"
                icon="close-stroke"
                kind={'actionSecondary'}
                onClick={handleClick}
              />

              <div className='voting-buttons-right-block'>
                <Button text={'Vote YES'} onClick={() => handleVotingRoundVote('yay')} kind={'votingFor'} />
                <Button text={'Vote PASS'} onClick={() => handleVotingRoundVote('pass')} kind={'votingAbstain'} />
                <Button text={'Vote NO'} onClick={() => handleVotingRoundVote('nay')} kind={'votingAgainst'} />
              </div>
            </VotingButtonsContainer>
          ) : null}
        </div>
      </PastBreakGlassActionsCardDropDown>
    </Expand>
  )
}
