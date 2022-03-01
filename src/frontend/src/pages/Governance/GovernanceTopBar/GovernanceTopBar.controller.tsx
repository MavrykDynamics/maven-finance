import { GovernanceTopBarView } from './GovernanceTopBar.view'
import { GovernancePhase } from '../../../reducers/governance'
import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

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
  return (
    <GovernanceTopBarView
      governancePhase={governancePhase}
      timeLeftInPhase={timeLeftInPhase}
      isInEmergencyGovernance={isInEmergencyGovernance}
    />
  )
}
