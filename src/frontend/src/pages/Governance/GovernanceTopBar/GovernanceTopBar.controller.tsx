import { GovernanceTopBarView } from './GovernanceTopBar.view'
import { GovernancePhase } from '../../../reducers/governance'

export type GovernanceTopBarProps = {
  loading: boolean
  governancePhase: GovernancePhase
  timeLeftInPhase: Date | number
  isInEmergencyGovernance: boolean
}
export const GovernanceTopBar = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
}: GovernanceTopBarProps) => {
  const handleMoveToNextRound = () => {
    // TODO: Implement function and dispatch action
    console.log('Here in move to next round')
  }
  return (
    <GovernanceTopBarView
      loading={loading}
      governancePhase={governancePhase}
      timeLeftInPhase={timeLeftInPhase}
      isInEmergencyGovernance={isInEmergencyGovernance}
      handleMoveToNextRound={handleMoveToNextRound}
    />
  )
}
