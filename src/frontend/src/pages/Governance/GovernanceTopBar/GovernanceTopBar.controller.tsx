import { GovernancePhase } from '../../../reducers/governance'
import { GovernanceTopBarView } from './GovernanceTopBar.view'

export type GovernanceTopBarProps = {
  loading: boolean
  governancePhase: GovernancePhase
  timeLeftInPhase: Date | number
  isInEmergencyGovernance: boolean
  handleOpenModalMoveNextRound: any
}
export const GovernanceTopBar = ({
  loading,
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
  handleOpenModalMoveNextRound,
}: GovernanceTopBarProps) => {
  const handleMoveToNextRound = () => {
    // TODO: Implement function and dispatch action
    console.log('Here in move to next round')
    handleOpenModalMoveNextRound()
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
