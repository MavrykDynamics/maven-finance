export const calculateAPR = (currentRewardPerBlock: number, lpTokenBalance: number): string => {
  const rewardRate = currentRewardPerBlock / Math.pow(10, 9)
  const blocksPerYear = 2 * 60 * 24 * 365 // 2 blocks per minute -> 1051200 blocks per year
  const result = lpTokenBalance ? (((rewardRate * blocksPerYear) / lpTokenBalance) * 100).toFixed(2) : 0
  return `${result}%`
}
