import { FarmStorage } from 'utils/TypesAndInterfaces/Farm'
import { calculateAPR } from '../Farms.helpers'
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

export const LP_EXCHANGE_RATE = 0.001
export const TOP_INPUT = 'amount'
export const BOTTOM_INPUT = 'backwardAmount'

export const calcRoi = ({
  startUSDAmount,
  stakedDays,
  useCompound,
  compoundFrequency,
  farm,
}: {
  startUSDAmount: number
  stakedDays: number
  useCompound: boolean
  compoundFrequency?: number
  farm: FarmStorage[number]
}) => {
  const blocksAmount = 2 * 60 * 24 * stakedDays // blocks amount depends on staked time amount
  // const farmDepositedAmount = farm.farmAccounts.reduce(
  //   (acc, { deposited_amount }) => (acc += deposited_amount * LP_EXCHANGE_RATE),
  //   0,
  // ) // deposited LP Tokens amount of farm, converted to USD
  if (useCompound && compoundFrequency) {
    // 5 blocks per day  => 5$ => 100$ => 5$ => 100 105$ =. 5.50 => 110.5$ - 100$
    return Math.pow((startUSDAmount + 1) / startUSDAmount, 1 / (stakedDays / 365))
  } else {
    // const persentOfDepositedAmount = startUSDAmount * 100 / (farmDepositedAmount + startUSDAmount) // persent of deposit if invest input amount in farm

    // 1. how user revenue grow due to staked amount revenue for 1$ and revenue for 100$
    // formula from https://www.youtube.com/watch?v=wPVZBPWYYXY

    const revenue = blocksAmount * farm.currentRewardPerBlock * LP_EXCHANGE_RATE // getting how many revenue for this period
    const annualizedROI = revenue / startUSDAmount * 100
    const roiPerStakedPeriod = Math.pow(1 + annualizedROI, stakedDays / 365) - 1

    console.log('usd value to stake: ', startUSDAmount)
    console.log('annualizedROI: ', `${annualizedROI}%`, 'revenue: ', revenue)
    console.log('roiPerStakedPeriod: ', `${roiPerStakedPeriod}%`, 'years staked:', stakedDays / 365)
    console.log('------------------')

    return roiPerStakedPeriod
  }
}

export const getOppositeROIvalue = (
  typingInput: typeof BOTTOM_INPUT | typeof TOP_INPUT,
  inputValue: number | string,
  useCompound: boolean,
  farm: FarmStorage[number],
  stakedValue?: number,
  compoundValue?: number,
) => {
  const ROIpersent = calcRoi({
    startUSDAmount: Number(inputValue),
    stakedDays: Number(stakedValue),
    useCompound: useCompound,
    compoundFrequency: Number(compoundValue),
    farm,
  })

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
