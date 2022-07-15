import { GovernancePhase } from '../../../reducers/governance'
import { GovernanceTopBarView } from './GovernanceTopBar.view'

// hooks
import useGovernence from '../UseGovernance'

export type GovernanceTopBarProps = {
  loading: boolean
  governancePhase: GovernancePhase
  timeLeftInPhase: Date | number
  isInEmergencyGovernance: boolean
  isExecutionRound?: boolean
  handleMoveNextRound: any
}
export const GovernanceTopBar = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
  handleMoveNextRound,
  isExecutionRound,
}: GovernanceTopBarProps) => {
  const handleMoveToNextRound = () => {
    handleMoveNextRound()
  }

  return (
    <GovernanceTopBarView
      loading={false}
      governancePhase={governancePhase}
      timeLeftInPhase={timeLeftInPhase}
      isInEmergencyGovernance={isInEmergencyGovernance}
      handleMoveToNextRound={handleMoveToNextRound}
      isExecutionRound={isExecutionRound}
    />
  )
}
