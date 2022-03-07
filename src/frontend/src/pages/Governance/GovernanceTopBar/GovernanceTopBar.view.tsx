import {
  GovTopBarSidewaysArrowIcon,
  GovernanceTopBarStyled,
  GovTopBarPhaseText,
  TimeLeftArea,
  GovTopBarEmergencyGovText,
} from './GovernanceTopBar.style'
import * as React from 'react'
import { GovernancePhase } from '../../../reducers/governance'
import { Button } from '../../../app/App.components/Button/Button.controller'

export type GovernanceTopBarViewProps = {
  loading: boolean
  governancePhase: GovernancePhase
  timeLeftInPhase: number | Date
  isInEmergencyGovernance: boolean
  handleMoveToNextRound: () => void
}
export const GovernanceTopBarView = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
  handleMoveToNextRound,
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

          {timeLeftInPhase >= 0 ? (
            <div>
              {typeof timeLeftInPhase === 'number' ? (
                <TimeLeftArea>{Math.round(timeLeftInPhase)} days remaining</TimeLeftArea>
              ) : (
                <TimeLeftArea>
                  Ends {timeLeftInPhase.toLocaleDateString('en-GB')} at {timeLeftInPhase.toLocaleTimeString('en-GB')}
                </TimeLeftArea>
              )}
            </div>
          ) : (
            <Button
              icon="man-running"
              text={'Move to next round'}
              loading={loading}
              kind="primary"
              onClick={handleMoveToNextRound}
            />
          )}
        </>
      )}
    </GovernanceTopBarStyled>
  )
}
