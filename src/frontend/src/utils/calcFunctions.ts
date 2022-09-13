import { FIXED_POINT_ACCURACY, PRECISION_NUMBER, SECONDS_PER_BLOCK } from './constants'
import { UserData, UserSatelliteRewardsData } from './TypesAndInterfaces/User'

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

export function calcTimeToBlock(currentBlockLevel?: number, endBlockLevel?: number) {
  if (!currentBlockLevel || !endBlockLevel) return 0

  const blockFrequency = SECONDS_PER_BLOCK //seconds
  const blocksToGo = endBlockLevel - currentBlockLevel
  const minutesUntilEndBlockReached = blocksToGo / (60 / blockFrequency)
  const hoursUntilEndBlockReached = minutesUntilEndBlockReached / 60
  const daysUntilEndBlockReached = hoursUntilEndBlockReached / 24
  return daysUntilEndBlockReached
}

export function calcWithoutPrecision(amount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  return numberMu > 0 ? numberMu / PRECISION_NUMBER : 0
}

export function calcWithoutMu(amount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  return numberMu > 0 ? numberMu / 1000000 : 0
}

// TODO: implement this rewards calculations
// export function calcUsersDoormanRewards(userInfo: UserData): UserDoormanRewardsData {
//   const { mySMvkTokenBalance, myDoormanRewardsData } = userInfo
//   const currentFeesPerShare =
//     myDoormanRewardsData.generalAccumulatedFeesPerShare - myDoormanRewardsData.myParticipationFeesPerShare
//   const usersAvailableDoormanRewards =
//     (mySMvkTokenBalance * PRECISION_NUMBER * currentFeesPerShare) / FIXED_POINT_ACCURACY
//   myDoormanRewardsData.myAvailableDoormanRewards = calcWithoutPrecision(
//     String(Math.trunc(usersAvailableDoormanRewards)),
//   ) r
//   return myDoormanRewardsData
// }

// export function calcUsersFarmRewards(userInfo: UserData, currentBlockLevel: number): UserFarmRewardsData[] {
//   const { myFarmRewardsData } = userInfo
//   const newFarmRewardsData: UserFarmRewardsData[] = []

//   myFarmRewardsData.forEach((farmAccount) => {
//     // Update farm general values
//     const blockMultiplier = currentBlockLevel - farmAccount.lastBlockUpdate
//     const suspectedRewards = blockMultiplier * farmAccount.currentRewardPerBlock
//     const totalClaimedRewards = farmAccount.generalPaidReward + farmAccount.generalUnpaidReward
//     const totalFarmRewards = suspectedRewards * totalClaimedRewards
//     const totalPlannedRewards = farmAccount.generalTotalRewards
//     const reward =
//       totalFarmRewards > totalPlannedRewards && !farmAccount.infinite
//         ? totalPlannedRewards - totalClaimedRewards
//         : suspectedRewards
//     const tempAccumulatedRewardsPerShare =
//       farmAccount.generalAccumulatedRewardsPerShare +
//       (reward * FIXED_POINT_ACCURACY) / farmAccount.totalLPTokenDeposited

//     // Update user unclaimed rewards
//     const currentRewardsPerShare = tempAccumulatedRewardsPerShare - farmAccount.myParticipationRewardsPerShare
//     const usersAvailableFarmRewards = (currentRewardsPerShare * farmAccount.myDepositedAmount) / FIXED_POINT_ACCURACY

//     farmAccount.myAvailableFarmRewards = calcWithoutPrecision(String(usersAvailableFarmRewards))
//     newFarmRewardsData.push(farmAccount)
//   })

//   return newFarmRewardsData
// }

export function calcUsersSatelliteRewards(userInfo: UserData): UserSatelliteRewardsData {
  const { mySMvkTokenBalance, mySatelliteRewardsData } = userInfo
  const satelliteRewardRatio =
    mySatelliteRewardsData.satelliteAccumulatedRewardPerShare - mySatelliteRewardsData.participationRewardsPerShare
  const usersAvailableSatelliteRewards =
    (mySatelliteRewardsData.unpaid + satelliteRewardRatio * mySMvkTokenBalance * PRECISION_NUMBER) /
    FIXED_POINT_ACCURACY
  mySatelliteRewardsData.myAvailableSatelliteRewards = calcWithoutPrecision(
    String(Math.trunc(usersAvailableSatelliteRewards)),
  )
  return mySatelliteRewardsData
}
