// hooks
import useGovernence from '../../Governance/UseGovernance'

// components
import TimeRemaining from '../../Governance/TimeRemaining/TimeRemaining.controller'
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
} from './PropSubmissionTopBar.style'

export type PropSubmissionTopBarViewProps = {
  governancePhase: GovernancePhase
  isInEmergencyGovernance: boolean
  handleTabChange: (val?: any) => void
}
export const PropSubmissionTopBarView = ({
  governancePhase,
  isInEmergencyGovernance,
  handleTabChange,
}: PropSubmissionTopBarViewProps) => {
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
            <TimeRemaining />
          </PropSubTopBarTimeContainer>
        </>
      )}
    </PropSubmissionTopBarStyled>
  )
}
