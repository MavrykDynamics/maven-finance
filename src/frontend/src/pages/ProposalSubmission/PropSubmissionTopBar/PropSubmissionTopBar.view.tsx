import {
  PropSubTopBarTabsContainer,
  PropSubmissionTopBarStyled,
  PropSubTopBarPhaseText,
  TimeLeftArea,
  PropSubTopBarEmergencyGovText,
  PropSubTopBarTimeContainer,
  PropSubTopBarTabsText,
  CurrentPhaseContainer,
} from './PropSubmissionTopBar.style'
import * as React from 'react'
import { GovernancePhase } from '../../../reducers/governance'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { GOV_PROPOSAL_SUBMISSION_FORM } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.constants'

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
  const isInExecution =
    governancePhase !== 'PROPOSAL' && governancePhase !== 'VOTING' && governancePhase !== 'TIME_LOCK'
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
              <PropSubTopBarPhaseText id={'isPhaseText'}>
                {governancePhase.substring(0, 1)}
                {governancePhase.substring(1).toLocaleLowerCase()}
              </PropSubTopBarPhaseText>
            </CurrentPhaseContainer>

            <div>
              {typeof timeLeftInPhase === 'number' ? (
                <TimeLeftArea>{Math.ceil(timeLeftInPhase)} days remaining</TimeLeftArea>
              ) : (
                <TimeLeftArea>
                  Ends {timeLeftInPhase.toLocaleDateString('en-GB')} at {timeLeftInPhase.toLocaleTimeString('en-GB')}
                </TimeLeftArea>
              )}
            </div>
          </PropSubTopBarTimeContainer>
        </>
      )}
    </PropSubmissionTopBarStyled>
  )
}
