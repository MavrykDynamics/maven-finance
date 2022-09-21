import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
/* @ts-ignore */
import Time from 'react-pure-time'

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
} from './EGovHistoryCard.style'

type EGovHistoryCardProps = {
  emergencyGovernance: EmergencyGovernanceStorage['emergencyGovernanceLedger'][0]
}
export const EGovHistoryCard = ({ emergencyGovernance }: EGovHistoryCardProps) => {
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)
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

  const currentData = emergencyGovernance.startTimestamp

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
      <EGovHistoryCardTopSection className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <EGovHistoryCardTitleTextGroup>
          <h3>Title</h3>
          <p className="group-data">{emergencyGovernance.title}</p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>Date</h3>
          <p className="group-data">
            <Time value={currentData} format="M d\t\h, Y, H:m:s \U\T\C" />
          </p>
        </EGovHistoryCardTitleTextGroup>
        <EGovHistoryCardTitleTextGroup>
          <h3>Proposer</h3>
          <div className="group-data">
            <TzAddress tzAddress={emergencyGovernance.proposerId} hasIcon={false} />
          </div>
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
          <div>
            <h3>Description</h3>
            <p>{emergencyGovernance.description}</p>
          </div>
          <div>
            <VotingArea voteStatistics={votingStatistic} isVotingActive={false} quorumText="Percentage Required" />
          </div>
        </div>
      </EGovHistoryCardDropDown>
    </EGovHistoryCardStyled>
  )
}
