import {
  GovTopBarSidewaysArrowIcon,
  GovernanceTopBarStyled,
  GovTopBarPhaseText,
  TimeLeftArea,
  GovTopBarEmergencyGovText,
} from './GovernanceTopBar.style'
import * as React from 'react'
import { GovernancePhase } from '../../../reducers/governance'

export type GovernanceTopBarViewProps = {
  governancePhase: GovernancePhase
  timeLeftInPhase: Date
  isInEmergencyGovernance: boolean
}
export const GovernanceTopBarView = ({
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
}: GovernanceTopBarViewProps) => {
  const isInExecution =
    governancePhase !== 'PROPOSAL' && governancePhase !== 'VOTING' && governancePhase !== 'TIME_LOCK'

  return (
    <GovernanceTopBarStyled>
      {isInEmergencyGovernance ? (
        <GovTopBarEmergencyGovText>EMERGENCY GOVERNANCE PROTOCOL ACTIVE</GovTopBarEmergencyGovText>
      ) : (
        <>
          <GovTopBarPhaseText isCorrectPhase={governancePhase === 'PROPOSAL'}>Proposal</GovTopBarPhaseText>
          <GovTopBarSidewaysArrowIcon>
            <use xlinkHref="/icons/sprites.svg#greater-than" />
          </GovTopBarSidewaysArrowIcon>
          <GovTopBarPhaseText isCorrectPhase={governancePhase === 'VOTING'}>Voting</GovTopBarPhaseText>
          <GovTopBarSidewaysArrowIcon>
            <use xlinkHref="/icons/sprites.svg#greater-than" />
          </GovTopBarSidewaysArrowIcon>
          <GovTopBarPhaseText isCorrectPhase={governancePhase === 'TIME_LOCK'}>Time Lock</GovTopBarPhaseText>
          <GovTopBarSidewaysArrowIcon>
            <use xlinkHref="/icons/sprites.svg#greater-than" />
          </GovTopBarSidewaysArrowIcon>
          <GovTopBarPhaseText isCorrectPhase={isInExecution}>Execution</GovTopBarPhaseText>
          <TimeLeftArea>
            Ends {timeLeftInPhase.toLocaleDateString('en-GB')} at {timeLeftInPhase.toLocaleTimeString('en-GB')}
          </TimeLeftArea>
        </>
      )}
    </GovernanceTopBarStyled>
  )
}
