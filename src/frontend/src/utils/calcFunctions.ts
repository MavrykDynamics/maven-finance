import { FIXED_POINT_ACCURACY, PRECISION_NUMBER, SECONDS_PER_BLOCK } from './constants'
import {
  UserData,
  UserDoormanRewardsData,
  UserFarmRewardsData,
  UserSatelliteRewardsData,
} from './TypesAndInterfaces/User'

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

export function calcWithoutPrecision(amount: string): number {
  const numberMu = parseFloat(amount) || 0
  return numberMu > 0 ? numberMu / PRECISION_NUMBER : 0
}

export function calcWithoutMu(amount: string): number {
  const numberMu = parseFloat(amount) || 0
  return numberMu > 0 ? numberMu / 1000000 : 0
}

export function calcUsersDoormanRewards(userInfo: UserData): UserDoormanRewardsData {
  const { myMvkTokenBalance, mySMvkTokenBalance, myDoormanRewardsData } = userInfo
  /*
     TODO: For Tristan - Doorman rewards calculation
   */
  const currentFeesPerShare          = myDoormanRewardsData.generalAccumulatedFeesPerShare - myDoormanRewardsData.myParticipationFeesPerShare
  const usersAvailableDoormanRewards = (mySMvkTokenBalance * PRECISION_NUMBER * currentFeesPerShare) / FIXED_POINT_ACCURACY

  myDoormanRewardsData.myAvailableDoormanRewards = calcWithoutPrecision(String(Math.trunc(usersAvailableDoormanRewards)))
  return myDoormanRewardsData
}

export function calcUsersFarmRewards(userInfo: UserData): UserFarmRewardsData[] {
  const { myMvkTokenBalance, mySMvkTokenBalance, myFarmRewardsData } = userInfo
  const newFarmRewardsData: UserFarmRewardsData[] = []

  console.log("HEY I'M HERE FARM")
  console.log(myFarmRewardsData)
  myFarmRewardsData.forEach((farmAccount) => {
    let usersAvailableFarmRewards = 0
    /*
       TODO: For Tristan - Farm rewards calculation
     */
     console.log(myFarmRewardsData)

    farmAccount.myAvailableFarmRewards = usersAvailableFarmRewards
    newFarmRewardsData.push(farmAccount)
  })

  return newFarmRewardsData
}

export function calcUsersSatelliteRewards(userInfo: UserData): UserSatelliteRewardsData {
  const { myMvkTokenBalance, mySMvkTokenBalance, mySatelliteRewardsData } = userInfo
  /*
     TODO: For Tristan - Satellite rewards calculation
   */
  const satelliteRewardRatio  = mySatelliteRewardsData.satelliteAccumulatedRewardPerShare - mySatelliteRewardsData.participationRewardsPerShare
  const usersAvailableSatelliteRewards = (mySatelliteRewardsData.unpaid + satelliteRewardRatio * mySMvkTokenBalance * PRECISION_NUMBER) / FIXED_POINT_ACCURACY

  mySatelliteRewardsData.myAvailableSatelliteRewards = calcWithoutPrecision(String(Math.trunc(usersAvailableSatelliteRewards)))
  return mySatelliteRewardsData
}
