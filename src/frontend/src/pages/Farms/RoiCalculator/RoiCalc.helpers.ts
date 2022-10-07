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

export const LP_EXCHANGE_RATE = 0.5
export const TOP_INPUT = 'amount'
export const BOTTOM_INPUT = 'backwardAmount'

/**
 * FORMULAS LINKS ---------
 * ROI formula: https://www.youtube.com/watch?v=wPVZBPWYYXY
 * Compouding formula: https://corporatefinanceinstitute.com/resources/knowledge/finance/compound-interest-formula/
 * THOUGHTS ---------------
 * the formula is (profit / startValue * 100) => it's and annual roi
 * (from here a need to get a profit, is it a 2 rewards per minute for staked time and * by rewards rate to usd? but then for 1$ and 100$ it will be the same reward, now it's calculating by apr% of the farm)
 *
 * Then we need to calc periodRoi, so take a annual roi, and use this formula ((1 + annualRoi)^(stakedPeriod / 365) - 1), but also, there is no place for compound periods
 * I suggest to use compound it will be our return value: returnValue = 100$ * (1 + (periodRoi / compoundFrequency)) ^ (compoundFrequency * (stakedDays / 365)) =>
 * => calcs return amount in$, so if we invest 100$ based on other values it will return like 128$ so 28$ profit
 *
 * @constructor
 * @param {numebr} startUSDAmount - Investment start value
 * @param {numebr} stakedDays - Days to stake this amount
 * @param {boolean} useCompound - Flag to see is we're using compound periods
 * @param {number | undefined} compoundFrequency - Compound periods selected
 * @param {FarmStorage[number]} farm - Selected farm
 */
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
  console.log(
    'startUSDAmount: ',
    startUSDAmount,
    'stakedDays: ',
    stakedDays,
    'useCompound: ',
    useCompound,
    'compoundFrequency: ',
    compoundFrequency,
  )

  // amount of block for staked period
  const blocksAmount = 2 * 60 * 24 * stakedDays
  // get profit% of farm via apr
  const apr = calculateAPR(farm.currentRewardPerBlock, blocksAmount, farm.lpBalance)
  // get revenue if invest inputted amount
  const revenue = (startUSDAmount / 100) * apr - startUSDAmount
  // get annual ROI%
  const annualizedROI = (revenue / startUSDAmount) * 100
  // get ROI% for staked time
  const roiPerStakedPeriod = Math.pow(1 + annualizedROI, stakedDays / 365) - 1

  console.log(
    'revenue: ',
    revenue,
    'annualizedROI: ',
    `${annualizedROI}%`,
    'roiPerStakedPeriod: ',
    `${roiPerStakedPeriod}%`,
  )

  // If we using compouding periods
  if (useCompound && compoundFrequency) {
    const amountWithCompound =
      startUSDAmount * (1 + Math.pow(roiPerStakedPeriod / compoundFrequency, compoundFrequency * (stakedDays / 365)))
    const persentWithCompound = (amountWithCompound * 100) / startUSDAmount

    console.log('amountWithCompound: ', `${amountWithCompound}$`, 'persentWithCompound: ', `${persentWithCompound}%`)
    console.log('------------------')
    return persentWithCompound
  }

  console.log('------------------')
  return roiPerStakedPeriod
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
