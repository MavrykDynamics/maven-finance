import { PropSubmissionTopBarView } from './PropSubmissionTopBar.view'
import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

export type PropSubmissionTopBarProps = {
  value?: number
  valueCallback?: (val?: number) => void
}
export const PropSubmissionTopBar = ({ value, valueCallback }: PropSubmissionTopBarProps) => {
  const { governancePhase } = useSelector((state: State) => state.governance)

  const handleChangeTab = (tabId: number) => {
    // TODO: Implement function and dispatch action
    if (valueCallback) valueCallback(tabId)
  }

  return (
    <PropSubmissionTopBarView
      governancePhase={governancePhase}
      isInEmergencyGovernance={false}
      handleTabChange={handleChangeTab}
    />
  )
}
