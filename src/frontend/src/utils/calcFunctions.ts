import { PRECISION_NUMBER, SECONDS_PER_BLOCK } from './constants'

/**
 * Calculates the MVK Loyalty Index (MLI) per the function in the litepaper
 * @param totalStakedMVK
 * @param totalMvkSupply
 */
export function calcMLI(totalMvkSupply: number | undefined, totalStakedMVK: number | undefined): number {
  const mvkSupplyActual = totalMvkSupply ?? 0
  const stakedMvkSupplyActual = totalStakedMVK ?? 0
  const mli = (stakedMvkSupplyActual / (mvkSupplyActual | 1)) * 10
  return mli
}
export function calcExitFee(totalMvkSupply: number | undefined, totalStakedMVK: number | undefined): number {
  const mli = calcMLI(totalMvkSupply, totalStakedMVK) * 10 //Need to multiply by 10 again so the MLI is adjusted properly to reflect the Litepaper
  const fee = 500 / (mli + 5)
  return fee
}

export function calcTimeToBlock(currentBlockLevel: number, endBlockLevel: number) {
  const blockFrequency = SECONDS_PER_BLOCK //seconds
  const blocksToGo = endBlockLevel - currentBlockLevel
  const minutesUntilEndBlockReached = blocksToGo / (60 / blockFrequency)
  const hoursUntilEndBlockReached = minutesUntilEndBlockReached / 60
  const daysUntilEndBlockReached = hoursUntilEndBlockReached / 24
  return daysUntilEndBlockReached
}

export function calcWithoutMu(amount: string): number {
  const numberMu = parseFloat(amount) || 0
  return numberMu > 0 ? numberMu / PRECISION_NUMBER : 0
}
