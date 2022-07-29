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
}
export const GovernanceTopBar = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
  isExecutionRound,
}: GovernanceTopBarProps) => {
  return (
    <GovernanceTopBarView
      loading={false}
      governancePhase={governancePhase}
      timeLeftInPhase={timeLeftInPhase}
      isInEmergencyGovernance={isInEmergencyGovernance}
      isExecutionRound={isExecutionRound}
    />
  )
}
