import { PropSubmissionTopBarView } from './PropSubmissionTopBar.view'
import { useSelector } from 'react-redux'
import { State } from '../../../reducers'
import { calcTimeToBlock } from '../../../utils/calcFunctions'
import { useState } from 'react'

export type PropSubmissionTopBarProps = {
  value?: number | any
  valueCallback?: (val?: any) => void
}
export const PropSubmissionTopBar = ({ value, valueCallback }: PropSubmissionTopBarProps) => {
  const loading = useSelector((state: State) => state.loading)
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)
  const { headData } = useSelector((state: State) => state.preferences)
  const timeToEndOfPhase =
    headData?.knownLevel && governanceStorage?.currentRoundEndLevel
      ? calcTimeToBlock(headData.knownLevel, governanceStorage.currentRoundEndLevel)
      : 0
  const currentDate = new Date()
  const [periodEndsOn, _] = useState<Date>(new Date(currentDate.getTime() + timeToEndOfPhase * (1000 * 60 * 60 * 24)))
  const daysLeftOfPhase = timeToEndOfPhase

  const handleChangeTab = (tabId: number) => {
    // TODO: Implement function and dispatch action
    if (valueCallback) valueCallback(tabId)
  }

  return (
    <PropSubmissionTopBarView
      loading={loading}
      governancePhase={governancePhase}
      timeLeftInPhase={daysLeftOfPhase}
      isInEmergencyGovernance={false}
      handleTabChange={handleChangeTab}
    />
  )
}
