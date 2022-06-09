import { GovernancePhase } from '../../../reducers/governance'
import { GovernanceTopBarView } from './GovernanceTopBar.view'

export type GovernanceTopBarProps = {
  loading: boolean
  governancePhase: GovernancePhase
  timeLeftInPhase: Date | number
  isInEmergencyGovernance: boolean
  handleMoveNextRound: any
}
export const GovernanceTopBar = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
  handleMoveNextRound,
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
    />
  )
}
