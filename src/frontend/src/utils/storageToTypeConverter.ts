import { setItemInStorage } from './storage'
import { calcWithoutMu } from './calcFunctions'
import { MichelsonMap } from '@taquito/taquito'
import { MvkTokenStorage } from './TypesAndInterfaces/MvkToken'
import { DelegateRecord, DelegationStorage, SatelliteRecord } from './TypesAndInterfaces/Delegation'
import { DoormanStorage } from './TypesAndInterfaces/Doorman'
import { FarmStorage } from './TypesAndInterfaces/Farm'
import { FarmFactoryStorage } from './TypesAndInterfaces/FarmFactory'
import {
  EmergencyGovernanceProposalRecord,
  EmergencyGovernanceStorage,
  EmergencyGovProposalVoter,
} from './TypesAndInterfaces/EmergencyGovernance'

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
    case 'farm':
      res = convertToFarmStorageType(storage)
      setItemInStorage('FarmStorage', res)
      break
    case 'farmFactory':
      res = convertToFarmFactoryStorageType(storage)
      setItemInStorage('FarmFactoryStorage', res)
      break
    case 'emergencyGovernance':
      res = convertToEmergencyGovernanceStorageType(storage)
      setItemInStorage('EmergencyGovernanceStorage', res)
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
  const temp = storage.satellite_records.map((item: any) => {
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
      active: item.active,
      totalDelegatedAmount: String(calcWithoutMu(totalDelegatedAmount)),
      unregisteredDateTime: new Date(item.unregistered_datetime),
    }
    satelliteMap.push(newSatelliteRecord)
    return true
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

function convertToFarmStorageType(storage: any): FarmStorage[] {
  const farms: FarmStorage[] = []
  storage.forEach((farmItem: any) => {
    const newFarm: FarmStorage = {
      address: farmItem.address,
      open: farmItem.open,
      withdrawPaused: farmItem.withdraw_paused,
      claimPaused: farmItem.claim_paused,
      depositPaused: farmItem.deposit_paused,
      blocksPerMinute: farmItem.blocks_per_minute,
      farmFactoryId: farmItem.farm_factory_id,
      infinite: farmItem.infinite,
      initBlock: farmItem.init_block,
      accumulatedMvkPerShare: calcWithoutMu(farmItem.accumulated_mvk_per_share),
      lastBlockUpdate: farmItem.last_block_update,
      lpBalance: calcWithoutMu(farmItem.lp_balance),
      lpToken: farmItem.lp_token,
      rewardPerBlock: calcWithoutMu(farmItem.reward_per_block),
      rewardsFromTreasury: farmItem.rewards_from_treasury,
      totalBlocks: farmItem.total_blocks,
    }
    farms.push(newFarm)
  })

  return farms
}

function convertToFarmFactoryStorageType(storage: any): FarmFactoryStorage {
  return {
    address: storage.address,
    breakGlassConfig: {
      createFarmIsPaused: storage.create_farm_paused,
      trackFarmIsPaused: storage.track_farm_paused,
      untrackFarmIsPaused: storage.untrack_farm_paused,
    },
    trackedFarms: convertToFarmStorageType(storage.farms),
  }
}
function convertToEmergencyGovernanceStorageType(storage: any): EmergencyGovernanceStorage {
  const eGovRecords: EmergencyGovernanceProposalRecord[] = []
  storage.emergency_governance_records.forEach((record: any) => {
    const voters: EmergencyGovProposalVoter[] = []

    record.voters?.forEach(
      (voter: {
        emergency_governance_record_id: any
        id: any
        smvk_amount: any
        timestamp: string | number | Date
        voter_id: any
      }) => {
        const newVoter: EmergencyGovProposalVoter = {
          emergencyGovernanceRecordId: voter.emergency_governance_record_id,
          id: voter.id,
          sMvkAmount: voter.smvk_amount,
          timestamp: new Date(voter.timestamp),
          voterId: voter.voter_id,
        }
        voters.push(newVoter)
      },
    )
    const newEGovRecord: EmergencyGovernanceProposalRecord = {
      id: record.id,
      title: record.title,
      description: record.description,
      status: record.status,
      dropped: record.dropped,
      executed: record.executed,
      proposerId: record.proposer_id,
      emergencyGovernanceId: record.emergency_governance_id,
      startTimestamp: new Date(record.start_timestamp),
      executedTimestamp: new Date(record.executed_timestamp),
      expirationTimestamp: new Date(record.expiration_timestamp),
      sMvkPercentageRequired: record.smvk_percentage_required / 100,
      sMvkRequiredForTrigger: calcWithoutMu(record.smvk_required_for_trigger),
      voters,
    }
    eGovRecords.push(newEGovRecord)
  })
  const eGovStorage: EmergencyGovernanceStorage = {
    emergencyGovernanceLedger: eGovRecords,
    address: storage.address,
    config: {
      minStakedMvkPercentageForTrigger: storage.min_smvk_required_to_trigger,
      requiredFee: storage.required_fee / 100000,
      voteDuration: storage.vote_expiry_days,
      sMvkPercentageRequired: storage.smvk_percentage_required / 100,
    },
    currentEmergencyGovernanceId: storage.current_emergency_record_id,
    nextEmergencyGovernanceProposalId: storage.next_emergency_record_id,
  }

  return eGovStorage
}
