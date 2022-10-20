import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import type { EmergencyGovernanceStorage } from '../../../utils/TypesAndInterfaces/EmergencyGovernance'

// view
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'

import { PRECISION_NUMBER } from 'utils/constants'

import {
  EGovHistoryArrowButton,
  EGovHistoryCardDropDown,
  EGovHistoryCardStyled,
  EGovHistoryCardTitleTextGroup,
  EGovHistoryCardTopSection,
} from './EGovCard.style'
import { parseDate } from 'utils/time'
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { scrollToFullView } from 'utils/scrollToFullView'

type EGovHistoryCardProps = {
  emergencyGovernance: EmergencyGovernanceStorage['emergencyGovernanceLedger'][0]

  dropProposalHandler: (proposalId: number) => void
}
export const EGovHistoryCard = ({ emergencyGovernance, dropProposalHandler }: EGovHistoryCardProps) => {
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)
  const [expanded, setExpanded] = useState(false)
  const open = () => setExpanded(!expanded)

  const isActiveProposal =
    !emergencyGovernance.executed &&
    !emergencyGovernance.dropped &&
    emergencyGovernance.expirationTimestamp > Date.now()

  const status = isActiveProposal
    ? ProposalStatus.WAITING
    : emergencyGovernance.executed
    ? ProposalStatus.EXECUTED
    : emergencyGovernance.dropped
    ? ProposalStatus.DROPPED
    : ProposalStatus.DEFEATED

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (expanded) {
      // The function is called after 300ms because you first need to
      // animate the opening of the card. Because the scroll is deducted
      // based on the height of the element.
      setTimeout(() => scrollToFullView(ref.current), 300)
    }
  }, [expanded])

  // TODO: clarify it with sam, cuz this data isn't right
  const votingStatistic = useMemo(
    () => ({
      forVotesMVKTotal: emergencyGovernance.totalsMvkVotes,
      unusedVotesMVKTotal: Math.round((totalStakedMvk ?? 0 / PRECISION_NUMBER) - emergencyGovernance.totalsMvkVotes),
      quorum: emergencyGovernance?.sMvkPercentageRequired ?? 0,
    }),
    [emergencyGovernance?.sMvkPercentageRequired, emergencyGovernance.totalsMvkVotes, totalStakedMvk],
  )

  return (
    <EGovHistoryCardStyled
      key={String(emergencyGovernance.title + emergencyGovernance.id)}
      onClick={open}
      className={expanded ? 'open' : ''}
    >
      <EGovHistoryCardTopSection className={expanded ? 'show' : 'hide'} ref={ref}>
        {expanded ? (
          <div className="expanded-top">
            <BGPrimaryTitle>{emergencyGovernance.title}</BGPrimaryTitle>
          </div>
        ) : (
          <>
            <EGovHistoryCardTitleTextGroup>
              <h3>Title</h3>
              <p className="group-data">{emergencyGovernance.title}</p>
            </EGovHistoryCardTitleTextGroup>
            <EGovHistoryCardTitleTextGroup>
              <h3>Date</h3>
              <p className="group-data">
                {parseDate({
                  time: new Date(emergencyGovernance.startTimestamp).getTime(),
                  timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC',
                })}
              </p>
            </EGovHistoryCardTitleTextGroup>
            <EGovHistoryCardTitleTextGroup>
              <h3>Proposer</h3>
              <div className="group-data">
                <TzAddress tzAddress={emergencyGovernance.proposerId} hasIcon={false} />
              </div>
            </EGovHistoryCardTitleTextGroup>
            <EGovHistoryArrowButton>
              <svg>
                <use xlinkHref={`/icons/sprites.svg#arrow-down`} />
              </svg>
            </EGovHistoryArrowButton>
            <EGovHistoryCardTitleTextGroup className={'statusFlag'}>
              <StatusFlag status={status} text={status} />
            </EGovHistoryCardTitleTextGroup>
          </>
        )}
      </EGovHistoryCardTopSection>

      <EGovHistoryCardDropDown onClick={open} className={expanded ? 'show' : 'hide'} ref={ref}>
        <div className={`accordion ${expanded}`} ref={ref}>
          <div className="left">
            <div>
              <div className="voting-end">
                Voting {isActiveProposal ? 'ending' : 'ended'} on{' '}
                {parseDate({
                  time: isActiveProposal
                    ? emergencyGovernance.expirationTimestamp
                    : emergencyGovernance.executionTimestamp,
                  timeFormat: 'MMM DD, HH:mm:ss',
                })}
              </div>
            </div>
            <div className="descr">{emergencyGovernance.description}</div>
            {isActiveProposal ? (
              <Button
                icon="close-stroke"
                className="drop"
                text="Drop Proposal"
                kind={ACTION_SECONDARY}
                onClick={() => dropProposalHandler(emergencyGovernance.id)}
              />
            ) : null}
          </div>

          <div>
            <VotingArea voteStatistics={votingStatistic} isVotingActive={false} quorumText="Quorum" />
          </div>
        </div>
      </EGovHistoryCardDropDown>
    </EGovHistoryCardStyled>
  )
}
