import { calcRoi } from '../Farms.helpers'
import { InputStatusesType, InputValuesType } from './RoiCalc.types'

export const STAKED_ITEMS = [
  { text: '1D', id: 1, active: true, actualValue: 1 },
  { text: '7D', id: 2, active: false, actualValue: 7 },
  { text: '30D', id: 3, active: false, actualValue: 30 },
  { text: '1Y', id: 4, active: false, actualValue: 365 },
  { text: '5Y', id: 5, active: false, actualValue: 1825 },
]

export const COMPOUNDING_ITEMS = [
  { text: '1D', id: 1, active: false, actualValue: 1 },
  { text: '7D', id: 2, active: false, actualValue: 7 },
  { text: '14D', id: 3, active: false, actualValue: 14 },
  { text: '30D', id: 4, active: false, actualValue: 30 },
]

export const LP_EXCHANGE_RATE = 0.5
export const TOP_INPUT = 'amount'
export const BOTTOM_INPUT = 'backwardAmount'

export const getOppositeROIvalue = (
  typingInput: typeof BOTTOM_INPUT | typeof TOP_INPUT,
  inputValue: number | string,
  useCompound: boolean,
  stakedValue?: number,
  compoundValue?: number,
) => {
  const ROIpersent = calcRoi(Number(inputValue), Number(stakedValue), useCompound, Number(compoundValue))

  if (typingInput === TOP_INPUT) {
    return +inputValue + (+inputValue / 100) * ROIpersent
  } else {
    return +inputValue - (+inputValue / 100) * ROIpersent
  }
}

export const oppositeInputNameMapper = {
  [TOP_INPUT]: BOTTOM_INPUT,
  [BOTTOM_INPUT]: TOP_INPUT,
}

export const defaultInputStatuses: InputStatusesType = {
  amountStatus: '',
  backwardStatus: '',
}

export const defaultInputValues: InputValuesType = {
  [TOP_INPUT]: 0,
  [BOTTOM_INPUT]: 0,
}
