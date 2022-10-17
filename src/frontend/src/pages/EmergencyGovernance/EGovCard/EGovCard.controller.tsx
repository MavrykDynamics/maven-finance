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

type EGovHistoryCardProps = {
  emergencyGovernance: EmergencyGovernanceStorage['emergencyGovernanceLedger'][0]
}
export const EGovHistoryCard = ({ emergencyGovernance }: EGovHistoryCardProps) => {
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)
  const [expanded, setExpanded] = useState(false)
  const open = () => setExpanded(!expanded)

  const isActiveProposal = true //!emergencyGovernance.executed && !emergencyGovernance.dropped

  const status = isActiveProposal
    ? ProposalStatus.WAITING
    : emergencyGovernance.executed
    ? ProposalStatus.EXECUTED
    : ProposalStatus.DROPPED

  const votingStatistic = useMemo(
    () => ({
      forVotesMVKTotal: emergencyGovernance.totalsMvkVotes,
      unusedVotesMVKTotal: Math.round((totalStakedMvk ?? 0 / PRECISION_NUMBER) - emergencyGovernance.totalsMvkVotes),
      quorum: emergencyGovernance?.sMvkPercentageRequired ?? 0,
    }),
    [emergencyGovernance?.sMvkPercentageRequired, emergencyGovernance.totalsMvkVotes, totalStakedMvk],
  )

  return (
    <EGovHistoryCardStyled key={String(emergencyGovernance.title + emergencyGovernance.id)} onClick={open}>
      <EGovHistoryCardTopSection className={expanded ? 'show' : 'hide'}>
        {expanded ? (
          <div className="expanded-top">
            <BGPrimaryTitle>{emergencyGovernance.title}</BGPrimaryTitle>
            <EGovHistoryArrowButton className="arrow-btn">
              <svg>
                <use xlinkHref={`/icons/sprites.svg#arrow-up`} />
              </svg>
            </EGovHistoryArrowButton>
            <EGovHistoryCardTitleTextGroup className={'statusFlag'}>
              <StatusFlag status={status} text={status} />
            </EGovHistoryCardTitleTextGroup>
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

      <EGovHistoryCardDropDown onClick={open} className={expanded ? 'show' : 'hide'}>
        <div className={`accordion ${expanded}`}>
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
            <div>
              <p>{emergencyGovernance.description}</p>
            </div>
            <Button
              icon="close-stroke"
              className="drop"
              text="Drop Proposal"
              kind={ACTION_SECONDARY}
              onClick={() => console.log('drop')}
            />
          </div>

          <div>
            <VotingArea voteStatistics={votingStatistic} isVotingActive={false} quorumText="Percentage Required" />
          </div>
        </div>
      </EGovHistoryCardDropDown>
    </EGovHistoryCardStyled>
  )
}
