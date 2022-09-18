import { TreasuryBalanceType, TreasuryType } from './../../utils/TypesAndInterfaces/Treasury'
export type mvkStatsType = {
  marketCap: number
  stakedMvk: number
  circuatingSupply: number
  maxSupply: number
  livePrice: number
  prevPrice: number
}

export const LENDING_TAB_ID = 'lending'
export const VAULTS_TAB_ID = 'vaults'
export const FARMS_TAB_ID = 'farms'
export const SATELLITES_TAB_ID = 'satellites'
export const ORACLES_TAB_ID = 'oracles'
export const TREASURY_TAB_ID = 'treasury'

export type TabId =
  | typeof LENDING_TAB_ID
  | typeof VAULTS_TAB_ID
  | typeof FARMS_TAB_ID
  | typeof SATELLITES_TAB_ID
  | typeof ORACLES_TAB_ID
  | typeof TREASURY_TAB_ID

export const isValidId = (x: string): x is TabId =>
  x === LENDING_TAB_ID ||
  x === VAULTS_TAB_ID ||
  x === FARMS_TAB_ID ||
  x === SATELLITES_TAB_ID ||
  x === ORACLES_TAB_ID ||
  x === TREASURY_TAB_ID

export const calcTreasuryAseetsToTableDataFormat = (
  treasuryData: TreasuryType[],
): { assets: Record<string, TreasuryBalanceType>; globalTreasury: number } =>
  treasuryData.reduce(
    (acc, { balances }) => {
      balances.forEach((balanceAsset) => {
        console.log(acc.assets, balanceAsset)

        if (acc.assets[balanceAsset.symbol]) {
          acc.assets[balanceAsset.symbol].balance += balanceAsset.balance
          acc.assets[balanceAsset.symbol].usdValue += Number(balanceAsset.usdValue)
        } else {
          acc.assets[balanceAsset.symbol] = balanceAsset
        }

        acc.globalTreasury += balanceAsset.usdValue
      })

      return acc
    },
    { assets: {}, globalTreasury: 0 } as { assets: Record<string, TreasuryBalanceType>; globalTreasury: number },
  )
