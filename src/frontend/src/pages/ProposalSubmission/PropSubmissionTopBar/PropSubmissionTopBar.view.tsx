import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import {
  getGovernanceStorage,
  getCurrentRoundProposals,
  startNextRound,
  executeProposal,
} from '../../Governance/Governance.actions'

// hooks
import useGovernence from '../../Governance/UseGovernance'

// components
import MoveToNextRound from '../../Governance/MoveNextRound/MoveNextRound.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { GOV_PROPOSAL_SUBMISSION_FORM } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.constants'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { GovernancePhase } from '../../../reducers/governance'
import { getSeparateSnakeCase } from '../../../utils/parse'

import {
  CurrentPhaseContainer,
  PropSubmissionTopBarStyled,
  PropSubTopBarEmergencyGovText,
  PropSubTopBarPhaseText,
  PropSubTopBarTabsContainer,
  PropSubTopBarTabsText,
  PropSubTopBarTimeContainer,
  PropSubTopBarValueText,
  TimeLeftArea,
  TimeLeftAreaWrap,
} from './PropSubmissionTopBar.style'

export type PropSubmissionTopBarViewProps = {
  loading: boolean
  governancePhase: GovernancePhase
  timeLeftInPhase: number | Date
  isInEmergencyGovernance: boolean
  handleTabChange: (val?: any) => void
}
export const PropSubmissionTopBarView = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
  handleTabChange,
}: PropSubmissionTopBarViewProps) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const handleMoveNextRound = () => {
    dispatch(startNextRound(false))
  }

  const { watingProposals } = useGovernence()
  const isInExecution = governancePhase === 'PROPOSAL' && Boolean(watingProposals?.length)
  const currentGovernancePhase = isInExecution ? 'Execution' : governancePhase

  return (
    <PropSubmissionTopBarStyled>
      {isInEmergencyGovernance ? (
        <PropSubTopBarEmergencyGovText>EMERGENCY GOVERNANCE PROTOCOL ACTIVE</PropSubTopBarEmergencyGovText>
      ) : (
        <>
          <PropSubTopBarTabsContainer>
            <PropSubTopBarTabsText>Submission Process:</PropSubTopBarTabsText>
            <SlidingTabButtons onClick={handleTabChange} type={GOV_PROPOSAL_SUBMISSION_FORM} />
          </PropSubTopBarTabsContainer>

          <PropSubTopBarTimeContainer>
            <CurrentPhaseContainer>
              <PropSubTopBarPhaseText>Current Phase: </PropSubTopBarPhaseText>
              <PropSubTopBarValueText>{getSeparateSnakeCase(currentGovernancePhase)}</PropSubTopBarValueText>
            </CurrentPhaseContainer>
            {timeLeftInPhase > 0 ? (
              <TimeLeftAreaWrap>
                {typeof timeLeftInPhase === 'number' ? (
                  <TimeLeftArea>{Math.ceil(timeLeftInPhase)} days remaining</TimeLeftArea>
                ) : (
                  <TimeLeftArea>
                    Ends {timeLeftInPhase.toLocaleDateString('en-GB')} at {timeLeftInPhase.toLocaleTimeString('en-GB')}
                  </TimeLeftArea>
                )}
              </TimeLeftAreaWrap>
            ) : (
              <MoveToNextRound />
            )}
          </PropSubTopBarTimeContainer>
        </>
      )}
    </PropSubmissionTopBarStyled>
  )
}
