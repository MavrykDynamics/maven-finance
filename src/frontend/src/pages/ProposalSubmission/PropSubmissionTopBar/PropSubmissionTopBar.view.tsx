// hooks
import useGovernence from '../../Governance/UseGovernance'

// components
import TimeRemaining from '../../Governance/TimeRemaining/TimeRemaining.controller'
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
  handleTabChange: (val?: number) => void
}
const GOV_PROPOSAL_SUBMISSION_ITEMS = [
  { text: 'Stage 1', id: 1, active: true },
  { text: 'Stage 2', id: 2, active: false },
  { text: 'Stage 3', id: 3, active: false },
]
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
            <SlidingTabButtons tabItems={GOV_PROPOSAL_SUBMISSION_ITEMS} onClick={handleTabChange} />
          </PropSubTopBarTabsContainer>

          <PropSubTopBarTimeContainer>
            <CurrentPhaseContainer>
              <PropSubTopBarPhaseText>Current Period: </PropSubTopBarPhaseText>
              <PropSubTopBarValueText>{getSeparateSnakeCase(currentGovernancePhase)}</PropSubTopBarValueText>
            </CurrentPhaseContainer>
            <TimeRemaining />
          </PropSubTopBarTimeContainer>
        </>
      )}
    </PropSubmissionTopBarStyled>
  )
}
