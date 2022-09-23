import type {
  TreasuryGraphQL,
  TreasuryFactoryGraphQL,
  TreasuryType,
  TreasuryBalanceType,
} from '../../utils/TypesAndInterfaces/Treasury'

export const MIN_TREASURY_PERSENT_TO_DISPLAY = 0.1

export function normalizeTreasury(storage: {
  treasury: TreasuryGraphQL[]
  treasury_factory: TreasuryFactoryGraphQL[]
}) {
  return {
    treasuryAddresses: storage.treasury,
    treasuryFactoryAddress: storage.treasury_factory[0].address,
  }
}

export const reduceTreasuryAssets = (
  treasuryData: TreasuryType[],
): { assetsBalances: Array<TreasuryBalanceType>; globalTreasuryTVL: number } => {
  const { assets, globalTreasuryTVL } = treasuryData.reduce<{
    assets: Record<string, TreasuryBalanceType>
    globalTreasuryTVL: number
  }>(
    (acc, { balances, treasuryTVL }) => {
      balances.forEach((balanceAsset) => {
        if (acc.assets[balanceAsset.symbol]) {
          acc.assets[balanceAsset.symbol].balance += balanceAsset.balance
          acc.assets[balanceAsset.symbol].usdValue += Number(balanceAsset.usdValue)
        } else {
          acc.assets[balanceAsset.symbol] = { ...balanceAsset }
        }
      })

      acc.globalTreasuryTVL += treasuryTVL
      return acc
    },
    { assets: {}, globalTreasuryTVL: 0 },
  )

  return { assetsBalances: Object.values(assets), globalTreasuryTVL }
}
