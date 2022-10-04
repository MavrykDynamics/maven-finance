import { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { BOTTOM_INPUT, TOP_INPUT } from './RoiCalc.helpers'

export type SelectedTabsStateType = {
  balanceTab: null | (TabItem & { actualValue: number })
  stakedTab: null | (TabItem & { actualValue: number })
  compoundTab: null | (TabItem & { actualValue: number })
}

export type InputValuesType = {
  [TOP_INPUT]: number | ''
  [BOTTOM_INPUT]: number | ''
}

export type InputStatusesType = {
  amountStatus: InputStatusType
  backwardStatus: InputStatusType
}

export type RoiCalcProps = {
  onClose: () => void
}
