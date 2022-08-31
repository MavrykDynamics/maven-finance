import type { TreasuryGraphQL, TreasuryFactoryGraphQL } from '../../utils/TypesAndInterfaces/Treasury'

export function normalizeTreasury(storage: {
  treasury: TreasuryGraphQL[]
  treasury_factory: TreasuryFactoryGraphQL[]
}) {
  return {
    treasuryAddresses: storage.treasury,
    treasuryFactoryAddress: storage.treasury_factory[0].address,
  }
}
