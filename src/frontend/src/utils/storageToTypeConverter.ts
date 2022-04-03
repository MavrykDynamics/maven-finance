import { setItemInStorage } from './storage'
import { calcWithoutMu } from './calcFunctions'
import { MichelsonMap } from '@taquito/taquito'
import { MvkTokenStorage } from './TypesAndInterfaces/MvkToken'
import {
  DelegateRecord,
  DelegationStorage,
  SatelliteFinancialRequestVotingHistory,
  SatelliteProposalVotingHistory,
  SatelliteRecord,
} from './TypesAndInterfaces/Delegation'
import { DoormanStorage } from './TypesAndInterfaces/Doorman'
import { FarmStorage } from './TypesAndInterfaces/Farm'
import { FarmFactoryStorage } from './TypesAndInterfaces/FarmFactory'
import {
  EmergencyGovernanceProposalRecord,
  EmergencyGovernanceStorage,
  EmergencyGovProposalVoter,
} from './TypesAndInterfaces/EmergencyGovernance'
import { BreakGlassActionRecord, BreakGlassActionSigner, BreakGlassStorage } from './TypesAndInterfaces/BreakGlass'
import { CouncilActionRecord, CouncilActionSigner, CouncilStorage } from './TypesAndInterfaces/Council'
import { VestingStorage } from './TypesAndInterfaces/Vesting'
import {
  FinancialRequestRecord,
  FinancialRequestVote,
  GovernanceStorage,
  ProposalRecordType,
  ProposalVote,
  SnapshotRecordType,
} from './TypesAndInterfaces/Governance'

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
    case 'breakGlass':
      res = convertToBreakGlassStorageType(storage)
      setItemInStorage('BreakGlassStorage', res)
      break
    case 'council':
      res = convertToCouncilStorageType(storage)
      setItemInStorage('CouncilStorage', res)
      break
    case 'vesting':
      res = convertToVestingStorageType(storage)
      setItemInStorage('VestingStorage', res)
      break
    case 'governance':
      res = convertToGovernanceStorageType(storage)
      setItemInStorage('GovernanceStorage', res)
      break
  }

  return res
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
    const proposalVotingHistory: SatelliteProposalVotingHistory[] = [],
      financialRequestsVotes: SatelliteFinancialRequestVotingHistory[] = []

    item.governance_proposal_records_votes.forEach(
      (vote: {
        id: any
        current_round_vote: any
        governance_proposal_record_id: any
        round: any
        timestamp: string | number | Date
        vote: any
        voter_id: any
        voting_power: string
        governance_proposal_record: any
      }) => {
        const newRequestVote: SatelliteProposalVotingHistory = {
          id: vote.id,
          currentRoundVote: vote.current_round_vote,
          governanceProposalRecordId: vote.governance_proposal_record_id,
          round: vote.round,
          timestamp: new Date(vote.timestamp),
          vote: vote.vote,
          voterId: vote.voter_id,
          votingPower: calcWithoutMu(vote.voting_power),
          requestData: vote.governance_proposal_record,
        }
        proposalVotingHistory.push(newRequestVote)
      },
    )
    item.governance_financial_requests_votes.forEach(
      (vote: {
        id: any
        governance_financial_request_id: any
        round: any
        timestamp: string | number | Date
        vote: any
        voter_id: any
        voting_power: string
        governance_financial_request: any
      }) => {
        const newRequestVote: SatelliteFinancialRequestVotingHistory = {
          id: vote.id,
          governanceFinancialRequestId: vote.governance_financial_request_id,
          timestamp: new Date(vote.timestamp),
          vote: vote.vote,
          voterId: vote.voter_id,
          votingPower: calcWithoutMu(vote.voting_power),
          requestData: vote.governance_financial_request,
        }
        financialRequestsVotes.push(newRequestVote)
      },
    )
    const newSatelliteRecord: SatelliteRecord = {
      address: item.user_id,
      description: item.description,
      image: item.image,
      mvkBalance: String(calcWithoutMu(item.user.mvk_balance)),
      sMvkBalance: String(calcWithoutMu(item.user.smvk_balance)),
      name: item.name,
      registeredDateTime: new Date(item.registered_datetime),
      satelliteFee: calcWithoutMu(item.fee),
      active: item.active,
      totalDelegatedAmount: String(calcWithoutMu(totalDelegatedAmount)),
      unregisteredDateTime: new Date(item.unregistered_datetime),
      proposalVotingHistory,
      financialRequestsVotes,
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

function convertToBreakGlassStorageType(storage: any): BreakGlassStorage {
  const actionLedger: BreakGlassActionRecord[] = [],
    councilMembers: { address: string }[] = []
  storage.break_glass_action_records.forEach(
    (actionRecord: {
      action_type: any
      break_glass_id: any
      executed: any
      executed_datetime: string | number | Date
      expiration_datetime: string | number | Date
      id: any
      initiator_id: any
      start_datetime: string | number | Date
      status: any
      signers: any
    }) => {
      const signers: BreakGlassActionSigner[] = []
      actionRecord.signers?.forEach((signer: { break_glass_action_record_id: any; id: any; signer_id: any }) => {
        const newSigner: BreakGlassActionSigner = {
          breakGlassActionRecordId: signer.break_glass_action_record_id,
          id: signer.id,
          signerId: signer.signer_id,
        }
        signers.push(newSigner)
      })

      const newActionRecord: BreakGlassActionRecord = {
        actionType: actionRecord.action_type,
        breakGlassId: actionRecord.break_glass_id,
        executed: actionRecord.executed,
        executedDatetime: new Date(actionRecord.executed_datetime),
        expirationDatetime: new Date(actionRecord.expiration_datetime),
        id: actionRecord.id,
        initiatorId: actionRecord.initiator_id,
        startDatetime: new Date(actionRecord.start_datetime),
        status: actionRecord.status,
        signers,
      }

      actionLedger.push(newActionRecord)
    },
  )
  storage.council_members.forEach((member: { address: string }) => {
    const newMember = {
      address: member.address,
    }
    councilMembers.push(newMember)
  })
  return {
    address: storage.address,
    config: {
      threshold: storage.threshold,
      actionExpiryDuration: storage.action_expiry_days,
    },
    currentActionId: storage.currentActionId,
    glassBroken: storage.glassBroken,
    councilMembers,
    actionLedger,
  }
}

function convertToCouncilStorageType(storage: any): CouncilStorage {
  const councilActionsLedger: CouncilActionRecord[] = [],
    councilMembers: { address: string }[] = []
  storage.council_action_records.forEach(
    (actionRecord: {
      action_type: any
      council_id: any
      executed: any
      executed_datetime: string | number | Date
      expiration_datetime: string | number | Date
      id: any
      initiator_id: any
      start_datetime: string | number | Date
      status: any
      signers: any
    }) => {
      const signers: CouncilActionSigner[] = []
      actionRecord.signers?.forEach((signer: { council_action_record_id: any; id: any; signer_id: any }) => {
        const newSigner: CouncilActionSigner = {
          breakGlassActionRecordId: signer.council_action_record_id,
          id: signer.id,
          signerId: signer.signer_id,
        }
        signers.push(newSigner)
      })

      const newActionRecord: CouncilActionRecord = {
        actionType: actionRecord.action_type,
        councilId: actionRecord.council_id,
        executed: actionRecord.executed,
        executedDatetime: new Date(actionRecord.executed_datetime),
        expirationDatetime: new Date(actionRecord.expiration_datetime),
        id: actionRecord.id,
        initiatorId: actionRecord.initiator_id,
        startDatetime: new Date(actionRecord.start_datetime),
        status: actionRecord.status,
        signers,
      }

      councilActionsLedger.push(newActionRecord)
    },
  )
  storage.council_members.forEach((member: { address: string }) => {
    const newMember = {
      address: member.address,
    }
    councilMembers.push(newMember)
  })
  return {
    address: storage.address,
    config: {
      threshold: storage.threshold,
      actionExpiryDays: storage.action_expiry_days,
    },
    actionCounter: storage.action_counter,
    councilMembers,
    councilActionsLedger,
  }
}

function convertToVestingStorageType(storage: any): VestingStorage {
  return {
    address: storage.address,
    config: {
      defaultCliffPeriod: storage.default_cliff_period,
      defaultCooldownPeriod: storage.default_cooldown_period,
    },
    sumAmountClaimed: storage.amount_claimed,
    sumRemainingVested: storage.remainder_vested,
    totalVestedAmount: storage.total_vested_amount,
  }
}

function convertToGovernanceStorageType({
  governance,
  governance_financial_request_record,
  governance_proposal_record,
  governance_satellite_snapshot_record,
}: {
  governance: any
  governance_financial_request_record: any
  governance_proposal_record: any
  governance_satellite_snapshot_record: any
}): GovernanceStorage {
  const financialRequestRecords = convertGovernanceFinancialRequestRecordToInterface(
    governance_financial_request_record,
  )
  const proposalLedger = convertGovernanceProposalRecordToInterface(governance_proposal_record)
  const satelliteSnapshotLedger = convertGovernanceSatelliteSnapshotRecordsToInterface(
    governance_satellite_snapshot_record,
  )
  return {
    activeSatellitesMap: new MichelsonMap<string, Date>(),
    address: governance.address,
    config: {
      successReward: governance.success_reward,
      minQuorumPercentage: governance.min_quorum_percentage,
      minQuorumMvkTotal: governance.min_quorum_mvk_total,
      votingPowerRatio: governance.voting_power_ratio,
      proposalSubmissionFee: governance.proposal_submission_fee, // 10 tez
      minimumStakeReqPercentage: governance.minimum_stake_req_percentage, // 0.01% for testing: change to 10,000 later -> 10%
      maxProposalsPerDelegate: governance.max_proposal_per_delegate,
      newBlockTimeLevel: governance.new_blocktime_level,
      newBlocksPerMinute: governance.new_block_per_minute,
      blocksPerMinute: governance.blocks_per_minute,
      blocksPerProposalRound: governance.blocks_per_proposal_round,
      blocksPerVotingRound: governance.blocks_per_voting_round,
      blocksPerTimelockRound: governance.blocks_per_timelock_round,
    },
    currentCycleEndLevel: governance.current_cycle_end_level,
    currentRound: governance.current_round,
    currentRoundEndLevel: governance.current_round_end_level,
    currentRoundProposals: new MichelsonMap<string, ProposalRecordType>(),
    currentRoundStartLevel: governance.current_round_start_level,
    currentRoundVotes: new MichelsonMap<string, Date>(),
    financialRequestLedger: financialRequestRecords,
    governanceLambdaLedger: new MichelsonMap<string, Date>(),
    nextProposalId: governance.next_proposal_id,
    proposalLedger: proposalLedger,
    snapshotLedger: satelliteSnapshotLedger,
    startLevel: governance.start_level,
    tempFlag: governance.start_level,
    timelockProposalId: governance.timelock_proposal,
    // currentRoundHighestVotedProposalId: storage.,
    // whitelistTokenContracts: new MichelsonMap<string, Date>(),
    // financialRequestCounter: storage.,
    // snapshotMvkTotalSupply:storage.,
    // financialRequestSnapshotLedger: storage.,
  }
}

function convertGovernanceFinancialRequestRecordToInterface(
  governance_financial_request_vote: {
    approve_vote_total: any
    executed: any
    disapprove_vote_total: any
    expiration_datetime: any
    governance_id: any
    id: any
    ready: any
    request_purpose: any
    request_type: any
    requested_datetime: any
    smvk_percentage_for_approval: any
    requester_id: any
    smvk_required_for_approval: any
    snapshot_smvk_total_supply: any
    status: any
    token_amount: any
    token_contract_address: any
    token_id: any
    token_name: any
    treasury_id: any
    votes: any
  }[],
): FinancialRequestRecord[] {
  const financialRequestRecords: FinancialRequestRecord[] = []
  governance_financial_request_vote.forEach((record) => {
    const newRequestRecord = record as unknown as FinancialRequestRecord
    newRequestRecord.votes = convertGovernanceFinancialRequestVoteToInterface(record.votes)
    financialRequestRecords.push(newRequestRecord)
  })
  return financialRequestRecords
}

function convertGovernanceFinancialRequestVoteToInterface(
  governance_financial_request_records: any[],
): FinancialRequestVote[] {
  const financialRequestVotes: FinancialRequestVote[] = []
  governance_financial_request_records.forEach((record) => {
    const newRequestVote = record as FinancialRequestVote
    financialRequestVotes.push(newRequestVote)
  })
  return financialRequestVotes
}

function convertGovernanceProposalRecordToInterface(
  governance_proposal_record: {
    abstain_mvk_total: any
    current_cycle_end_level: any
    current_cycle_start_level: any
    current_round_proposal: any
    cycle: any
    description: any
    down_vote_mvk_total: any
    id: any
    executed: any
    invoice: any
    locked: any
    min_proposal_round_vote_pct: any
    pass_vote_mvk_total: any
    min_quorum_percentage: any
    min_quorum_mvk_total: any
    min_proposal_round_vote_req: any
    proposer_id: any
    quorum_mvk_total: any
    source_code: any
    round_highest_voted_proposal: any
    start_datetime: any
    status: any
    success_reward: any
    timelock_proposal: any
    title: any
    up_vote_mvk_total: any
    votes: {
      current_round_vote: any
      governance_proposal_record_id: any
      id: any
      round: any
      timestamp: any
      vote: any
      voter_id: any
      voting_power: any
    }[]
  }[],
): ProposalRecordType[] {
  const governanceProposalRecords: ProposalRecordType[] = []
  governance_proposal_record.forEach((record) => {
    const newProposalRecord = record as unknown as ProposalRecordType
    newProposalRecord.votes = convertGovernanceProposalVoteToInterface(record.votes)
    governanceProposalRecords.push(newProposalRecord)
  })
  return governanceProposalRecords
}

function convertGovernanceProposalVoteToInterface(
  votes: {
    current_round_vote: any
    governance_proposal_record_id: any
    id: any
    round: any
    timestamp: any
    vote: any
    voter_id: any
    voting_power: any
  }[],
): Map<string, ProposalVote> {
  const proposalVotes: Map<string, ProposalVote> = new Map<string, ProposalVote>()
  votes.forEach((record) => {
    const newRequestVote: ProposalVote = {
      id: record.id,
      currentRoundVote: record.current_round_vote,
      governanceProposalRecordId: record.governance_proposal_record_id,
      round: record.round,
      timestamp: new Date(record.timestamp),
      vote: record.vote,
      voterId: record.voter_id,
      votingPower: calcWithoutMu(record.voting_power),
    }
    proposalVotes.set(record.voter_id, newRequestVote)
  })
  return proposalVotes
}

function convertGovernanceSatelliteSnapshotRecordsToInterface(
  governance_satellite_snapshot_record: {
    id: any
    governance_id: any
    satellite_id: any
    current_cycle_end_level: any
    current_cycle_start_level: any
    total_delegated_amount: any
    total_mvk_balance: any
    total_voting_power: any
  }[],
): SnapshotRecordType[] {
  const governanceProposalRecords: SnapshotRecordType[] = []
  governance_satellite_snapshot_record.forEach((record) => {
    const newProposalRecord = record as unknown as SnapshotRecordType
    governanceProposalRecords.push(newProposalRecord)
  })
  return governanceProposalRecords
}
