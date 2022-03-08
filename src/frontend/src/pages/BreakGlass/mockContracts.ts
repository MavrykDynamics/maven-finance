export interface ContractBreakGlass {
  name: string
  address: string
  status: 'LIVE' | 'PAUSED'
  entrypoints: {
    name: string
    status: 'LIVE' | 'PAUSED'
  }[]
}

export const MOCK_CONTRACTS: ContractBreakGlass[] = [
  {
    name: 'Farms',
    address: 'KT1XrrjdLbHZmFMxkrs4uGeaEDmfmL2RZSEV',
    status: 'LIVE',
    entrypoints: [
      {
        name: 'initFarm',
        status: 'PAUSED',
      },
      {
        name: 'deposit',
        status: 'LIVE',
      },
      {
        name: 'withdraw',
        status: 'PAUSED',
      },
      {
        name: 'claim',
        status: 'LIVE',
      },
      {
        name: 'updateBlocksPerMinute',
        status: 'PAUSED',
      },
      {
        name: 'setAdmin',
        status: 'PAUSED',
      },
    ],
  },
  {
    name: 'Doorman',
    address: 'KT1Ld5ph7B1jFQk1nsVEFykc6UbFYGvQu3y5',
    status: 'PAUSED',
    entrypoints: [
      {
        name: 'stake',
        status: 'PAUSED',
      },
      {
        name: 'unstake',
        status: 'PAUSED',
      },
      {
        name: 'getStakedBalance',
        status: 'PAUSED',
      },
      {
        name: 'setMvkTokenAddress',
        status: 'PAUSED',
      },
      {
        name: 'setDelegationAddress',
        status: 'PAUSED',
      },
      {
        name: 'setExitFeePoolAddress',
        status: 'PAUSED',
      },
    ],
  },
  {
    name: 'Delegation',
    address: 'KT1Qw9xYDFaFfN1nHoYaeQ7r7xLwvZAERT8S',
    status: 'PAUSED',
    entrypoints: [
      {
        name: 'delegateToSatellite',
        status: 'PAUSED',
      },
      {
        name: 'undelegateFromSatellite',
        status: 'PAUSED',
      },
      {
        name: 'registerAsSatellite',
        status: 'PAUSED',
      },
      {
        name: 'unregisterAsSatellite',
        status: 'PAUSED',
      },
      {
        name: 'updateSatelliteRecord',
        status: 'PAUSED',
      },
      {
        name: 'setAdmin',
        status: 'PAUSED',
      },
      {
        name: 'setGovernanceAddress',
        status: 'PAUSED',
      },
    ],
  },
  {
    name: 'MVK Token',
    address: 'KT1Cn6kVR7F9yscbNBx4uRnrra19pcuHniuH',
    status: 'PAUSED',
    entrypoints: [
      {
        name: 'transfer',
        status: 'LIVE',
      },
      {
        name: 'balance_of',
        status: 'LIVE',
      },
      {
        name: 'update_operators',
        status: 'PAUSED',
      },
      {
        name: 'assertMetadata',
        status: 'LIVE',
      },
      {
        name: 'mint',
        status: 'PAUSED',
      },
      {
        name: 'burn',
        status: 'PAUSED',
      },
      {
        name: 'onStakeChange',
        status: 'PAUSED',
      },
      {
        name: 'updateGeneralContracts',
        status: 'PAUSED',
      },
      {
        name: 'getTotalSupply',
        status: 'LIVE',
      },
    ],
  },
  {
    name: 'Governance',
    address: 'KT1Wq5wTqkr47SGsMha3UvDmZQYZimXdBBJQ',
    status: 'PAUSED',
    entrypoints: [
      {
        name: 'delegateToSatellite',
        status: 'PAUSED',
      },
      {
        name: 'undelegateFromSatellite',
        status: 'PAUSED',
      },
      {
        name: 'registerAsSatellite',
        status: 'PAUSED',
      },
      {
        name: 'unregisterAsSatellite',
        status: 'PAUSED',
      },
      {
        name: 'updateSatelliteRecord',
        status: 'PAUSED',
      },
      {
        name: 'setAdmin',
        status: 'PAUSED',
      },
      {
        name: 'setGovernanceAddress',
        status: 'PAUSED',
      },
    ],
  },
]
