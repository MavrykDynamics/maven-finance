// types
import { FarmAccountsType, FarmGraphQL } from '../../utils/TypesAndInterfaces/Farm'

// helpers
import { getContractBigmapKeys } from 'utils/api'

export const normalizeFarmStorage = async (farmList: FarmGraphQL[]) => {
  if (!farmList?.length) return []

  const farmCardEndsIn = await getEndsInTimestampForFarmCards(farmList)
  const farmLPTokensInfo = await getLPTokensInfo(farmList)

  return farmList.map((farmItem: FarmGraphQL, idx: number) => {
    const endsIn = farmCardEndsIn[idx].endsIn
    const lpMetadata = farmLPTokensInfo[idx]
    return {
      address: farmItem.address,
      name: farmItem.name,
      endsIn: endsIn,
      isLive: Date.now() - new Date(endsIn).getTime() < 0,
      open: farmItem.open,

      withdrawPaused: farmItem.withdraw_paused,
      claimPaused: farmItem.claim_paused,
      depositPaused: farmItem.deposit_paused,
      blocksPerMinute: 0,
      lpTokenBalance: farmItem.lp_token_balance,
      currentRewardPerBlock: farmItem.current_reward_per_block,
      farmFactoryId: farmItem.farm_factory_id || '',
      infinite: farmItem.infinite,
      initBlock: farmItem.init_block,
      accumulatedMvkPerShare: 0,
      lastBlockUpdate: farmItem.last_block_update,
      lpBalance: farmItem.lp_token_balance / Math.pow(10, farmItem.lp_token?.decimals ?? 0),
      // TODO: find appropriate value in gql
      lpTokenAddress: '',
      lpToken1: {
        symbol: lpMetadata.liquidityPairToken.token0.symbol[0],
        address: lpMetadata.liquidityPairToken.token0.tokenAddress[0],
      },
      lpToken2: {
        symbol: lpMetadata.liquidityPairToken.token1.symbol[0],
        address: lpMetadata.liquidityPairToken.token1.tokenAddress[0],
      },
      rewardPerBlock: 0,
      rewardsFromTreasury: false,
      totalBlocks: farmItem.total_blocks,
      farmAccounts: farmItem.farm_accounts,
    }
  })
}

// helper functions
export const calculateAPR = (currentRewardPerBlock: number, lpTokenBalance: number): string => {
  const rewardRate = currentRewardPerBlock / Math.pow(10, 9)
  const blocksPerYear = 2 * 60 * 24 * 365 // 2 blocks per minute -> 1051200 blocks per year
  const result = lpTokenBalance ? (((rewardRate * blocksPerYear) / lpTokenBalance) * 100).toFixed(2) : 0
  return `${result}%`
}

export const getSummDepositedAmount = (farmAccounts: FarmAccountsType[]): number => {
  return farmAccounts.reduce((acc, cur) => acc + cur.deposited_amount, 0)
}

// getting end time for farm cards
export const getEndsInTimestampForFarmCards = async (farmList: FarmGraphQL[]) => {
  try {
    return await Promise.all(
      farmList.map(async (farmCard: { init_block: number; total_blocks: number; address: string }) => {
        const endsIn = await getLvlTimestamp(farmCard.init_block + farmCard.total_blocks)
        return { endsIn, address: farmCard.address }
      }),
    )
  } catch (e: unknown) {
    console.error('getEndsInTimestampForFarmCards fetching error: ', e)
    return []
  }
}

export const getLvlTimestamp = async (blocksLvl: number) => {
  try {
    return await (await fetch(`${process.env.REACT_APP_RPC_TZKT_API}/v1/blocks/${blocksLvl}/timestamp`)).json()
  } catch (e) {
    console.error('getLvlTimestamp fetching error: ', e)
    throw e
  }
}

// getting metadata for liquidity pair coins
export const getLPTokensInfo = async (farmList: FarmGraphQL[]) => {
  try {
    return await Promise.all(
      farmList.map(async (farmCard: { address: string }) => {
        const lpTokenInfo = await getFarmMetadata(farmCard.address)
        return typeof lpTokenInfo === 'string' ? JSON.parse(lpTokenInfo) : lpTokenInfo
      }),
    )
  } catch (e: unknown) {
    console.error('getLPTokensInfo fetching error: ', e)
    return []
  }
}

export async function getFarmMetadata(farmAddress: string) {
  try {
    const farmMetadata = await getContractBigmapKeys(farmAddress, 'metadata')
    const targetMetadataItem =
      farmMetadata.filter((farmItem: any) => {
        const output = Buffer.from(farmItem.value, 'hex').toString()
        return !output.endsWith('tezos-storage:data')
      })[0] || {}
    const targetFarmMetadataValue = Buffer.from(targetMetadataItem.value, 'hex').toString()

    const parsedMetadataValue = JSON.parse(targetFarmMetadataValue)

    if (!parsedMetadataValue['liquidityPairToken']) {
      throw new Error(`invalid farm metadata: ${farmAddress}`)
    }

    return parsedMetadataValue
  } catch (e) {
    console.error('getFarmMetadata error: ', e)

    return {
      liquidityPairToken: {
        token0: { symbol: [''], tokenAddress: [''] },
        token1: { symbol: [''], tokenAddress: [''] },
      },
    }
  }
}
