import { GovernanceTopBarView } from './GovernanceTopBar.view'
import { GovernancePhase } from '../../../reducers/governance'

export type GovernanceTopBarProps = {
  governancePhase: GovernancePhase
  timeLeftInPhase: Date
  isInEmergencyGovernance: boolean
}
export const GovernanceTopBar = ({
  governancePhase,
  timeLeftInPhase,
  isInEmergencyGovernance,
}: GovernanceTopBarProps) => {
  const handleGoToPreviousPeriod = () => {}
  return (
    <GovernanceTopBarView
      governancePhase={governancePhase}
      timeLeftInPhase={timeLeftInPhase}
      isInEmergencyGovernance={isInEmergencyGovernance}
    />
  )
}
