import { setItemInStorage } from './storage'
import { DoormanStorage } from '../reducers/doorman'
import { calcWithoutMu } from './calcFunctions'
import { MvkTokenStorage } from '../reducers/mvkToken'
import { DelegateRecord, DelegationStorage, SatelliteRecord } from '../reducers/delegation'
import { MichelsonMap } from '@taquito/taquito'

export default function storageToTypeConverter(contract: string, storage: any): any {
  let res = {}
  switch (contract) {
    case 'addresses':
      res = convertToContractAddressesType(storage)
      setItemInStorage('ContractAddresses', res)
      break
    case 'doorman':
      res = convertToDoormanStorageType(storage)
      setItemInStorage('DoormanStorage', res)
      break
    case 'mvkToken':
      res = convertToMvkTokenStorageType(storage)
      setItemInStorage('MvkTokenStorage', res)
      break
    case 'delegation':
      res = convertToDelegationStorageType(storage)
      setItemInStorage('DelegationStorage', res)
      break
  }

  return res
}

function convertToDoormanStorageType(storage: any): DoormanStorage {
  return {
    unclaimedRewards: calcWithoutMu(storage.unclaimed_rewards),
    minMvkAmount: calcWithoutMu(storage.min_mvk_amount),
    stakedMvkTotalSupply: calcWithoutMu(storage.smvk_total_supply),
    breakGlassConfig: {
      stakeIsPaused: storage.stake_paused,
      unstakeIsPaused: storage.unstake_paused,
      compoundIsPaused: storage.compound_paused,
    },
    accumulatedFeesPerShare: calcWithoutMu(storage.accumulated_fees_per_share),
  }
}

function convertToMvkTokenStorageType(storage: any): MvkTokenStorage {
  return {
    totalSupply: calcWithoutMu(storage.total_supply),
    maximumTotalSupply: calcWithoutMu(storage.maximum_supply),
  }
}
function convertToDelegationStorageType(storage: any): DelegationStorage {
  const satelliteMap: SatelliteRecord[] = []
  storage.satellite_records.map((item: any) => {
    const totalDelegatedAmount = item.delegation_records.reduce(
      (sum: any, current: { user: { smvk_balance: any } }) => sum + current.user.smvk_balance,
      0,
    )
    const newSatelliteRecord: SatelliteRecord = {
      address: item.user_id,
      description: item.description,
      image: item.image,
      mvkBalance: '0',
      name: item.name,
      registeredDateTime: new Date(item.registered_datetime),
      satelliteFee: calcWithoutMu(item.fee),
      active: item.status,
      totalDelegatedAmount: String(calcWithoutMu(totalDelegatedAmount)),
      unregisteredDateTime: new Date(item.unregistered_datetime),
    }
    satelliteMap.push(newSatelliteRecord)
  })

  return {
    breakGlassConfig: {
      delegateToSatelliteIsPaused: storage.delegate_to_satellite_paused,
      undelegateFromSatelliteIsPaused: storage.undelegate_from_satellite_paused,
      registerAsSatelliteIsPaused: storage.register_as_satellite_paused,
      unregisterAsSatelliteIsPaused: storage.unregister_as_satellite_paused,
      updateSatelliteRecordIsPaused: storage.update_satellite_record_paused,
    },
    config: {
      maxSatellites: storage.max_satellites,
      delegationRatio: storage.delegation_ratio,
      minimumStakedMvkBalance: calcWithoutMu(storage.minimum_smvk_balance),
    },
    delegateLedger: new MichelsonMap<string, DelegateRecord>(),
    satelliteLedger: satelliteMap,
  }
}
function convertToContractAddressesType(storage: any) {
  return {
    farm: storage.farm[0],
    farmFactory: storage.farm_factory[0],
    delegation: storage.delegation[0],
    doorman: storage.doorman[0],
    mvkToken: storage.mvk_token[0],
    governance: storage.delegation[0],
    emergencyGovernance: storage.delegation[0],
    breakGlass: storage.delegation[0],
    council: storage.delegation[0],
    treasury: storage.delegation[0],
  }
}
