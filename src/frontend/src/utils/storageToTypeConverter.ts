import { MichelsonMap } from '@taquito/taquito'

import { ContractAddressesState } from '../reducers/contractAddresses'
import { calcWithoutMu, calcWithoutPrecision } from './calcFunctions'
import { setItemInStorage } from './storage'
import { BreakGlassActionRecord, BreakGlassActionSigner, BreakGlassStorage } from './TypesAndInterfaces/BreakGlass'
import { CouncilActionRecord, CouncilActionSigner, CouncilStorage } from './TypesAndInterfaces/Council'
import {
  DelegateRecord,
  DelegationStorage,
  SatelliteFinancialRequestVotingHistory,
  SatelliteProposalVotingHistory,
  SatelliteRecord,
} from './TypesAndInterfaces/Delegation'
import { DoormanStorage } from './TypesAndInterfaces/Doorman'
import {
  EmergencyGovernanceProposalRecord,
  EmergencyGovernanceStorage,
  EmergencyGovProposalVoter,
} from './TypesAndInterfaces/EmergencyGovernance'
import { FarmStorage } from './TypesAndInterfaces/Farm'
import { FarmFactoryStorage } from './TypesAndInterfaces/FarmFactory'
import {
  FinancialRequestRecord,
  FinancialRequestVote,
  GovernanceStorage,
  ProposalRecordType,
  ProposalVote,
  SnapshotRecordType,
  GovernanceRoundType,
  CurrentRoundProposalsStorageType,
  ProposalStatusType,
} from './TypesAndInterfaces/Governance'
import { MvkTokenStorage } from './TypesAndInterfaces/MvkToken'
import { VestingStorage } from './TypesAndInterfaces/Vesting'
import { ProposalStatus } from './TypesAndInterfaces/Governance'

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
    case 'satelliteRecord':
      res = convertToSatelliteRecordInterface(storage)
      break
  }

  return res
}

function convertToContractAddressesType(storage: any): ContractAddressesState {
  return {
    farmAddress: { address: storage?.farm?.[0]?.address },
    farmFactoryAddress: { address: storage?.farm_factory?.[0]?.address },
    delegationAddress: { address: storage?.delegation?.[0]?.address },
    doormanAddress: { address: storage?.doorman?.[0]?.address },
    mvkTokenAddress: { address: storage?.mvk_token?.[0]?.address },
    governanceAddress: { address: storage?.governance?.[0]?.address },
    emergencyGovernanceAddress: { address: storage?.emergency_governance?.[0]?.address },
    breakGlassAddress: { address: storage?.break_glass?.[0]?.address },
    councilAddress: { address: storage?.council?.[0]?.address },
    treasuryAddress: { address: storage?.delegation?.[0]?.address },
    vestingAddress: { address: storage?.vesting?.[0]?.address },
  }
}

function convertToDoormanStorageType(storage: any): DoormanStorage {
  const totalStakedMvk = storage?.stake_accounts_aggregate?.aggregate.sum.smvk_balance ?? 0
  return {
    unclaimedRewards: calcWithoutPrecision(storage?.unclaimed_rewards ?? 0),
    minMvkAmount: calcWithoutPrecision(storage?.min_mvk_amount ?? 0),
    totalStakedMvk: calcWithoutPrecision(totalStakedMvk),
    breakGlassConfig: {
      stakeIsPaused: storage?.stake_paused,
      unstakeIsPaused: storage?.unstake_paused,
      compoundIsPaused: storage?.compound_paused,
      farmClaimIsPaused: storage?.farm_claimed_paused,
    },
    accumulatedFeesPerShare: calcWithoutPrecision(storage?.accumulated_fees_per_share),
  }
}

function convertToMvkTokenStorageType(storage: any): MvkTokenStorage {
  return {
    totalSupply: calcWithoutPrecision(storage?.total_supply),
    maximumTotalSupply: calcWithoutPrecision(storage?.maximum_supply),
  }
}

function convertToDelegationStorageType(storage: any): DelegationStorage {
  const satelliteMap: SatelliteRecord[] = convertToSatelliteRecordsInterface(storage?.satellite_records)
  // const temp = storage?.satellite_records.map((item: any) => {
  //   const totalDelegatedAmount = item.delegation_records.reduce(
  //     (sum: any, current: { user: { smvk_balance: any } }) => sum + current.user.smvk_balance,
  //     0,
  //   )
  //   const proposalVotingHistory: SatelliteProposalVotingHistory[] = [],
  //     financialRequestsVotes: SatelliteFinancialRequestVotingHistory[] = []
  //
  //   item.governance_proposal_records_votes.forEach(
  //     (vote: {
  //       id: any
  //       current_round_vote: any
  //       governance_proposal_record_id: any
  //       round: any
  //       timestamp: string | number | Date
  //       vote: any
  //       voter_id: any
  //       voting_power: string
  //       governance_proposal_record: any
  //     }) => {
  //       const newRequestVote: SatelliteProposalVotingHistory = {
  //         id: vote.id,
  //         currentRoundVote: vote.current_round_vote,
  //         governanceProposalRecordId: vote.governance_proposal_record_id,
  //         round: vote.round,
  //         timestamp: new Date(vote.timestamp),
  //         vote: vote.vote,
  //         voterId: vote.voter_id,
  //         votingPower: calcWithoutMu(vote.voting_power),
  //         requestData: vote.governance_proposal_record,
  //       }
  //       proposalVotingHistory.push(newRequestVote)
  //     },
  //   )
  //   item.governance_financial_requests_votes.forEach(
  //     (vote: {
  //       id: any
  //       governance_financial_request_id: any
  //       round: any
  //       timestamp: string | number | Date
  //       vote: any
  //       voter_id: any
  //       voting_power: string
  //       governance_financial_request: any
  //     }) => {
  //       const newRequestVote: SatelliteFinancialRequestVotingHistory = {
  //         id: vote.id,
  //         governanceFinancialRequestId: vote.governance_financial_request_id,
  //         timestamp: new Date(vote.timestamp),
  //         vote: vote.vote,
  //         voterId: vote.voter_id,
  //         votingPower: calcWithoutMu(vote.voting_power),
  //         requestData: vote.governance_financial_request,
  //       }
  //       financialRequestsVotes.push(newRequestVote)
  //     },
  //   )
  //   const newSatelliteRecord: SatelliteRecord = {
  //     address: item.user_id,
  //     description: item.description,
  //     image: item.image,
  //     mvkBalance: calcWithoutMu(item.user.mvk_balance),
  //     sMvkBalance: calcWithoutMu(item.user.smvk_balance),
  //     name: item.name,
  //     registeredDateTime: new Date(item.registered_datetime),
  //     satelliteFee: parseFloat(item.fee),
  //     active: item.active,
  //     totalDelegatedAmount: calcWithoutMu(totalDelegatedAmount),
  //     unregisteredDateTime: new Date(item.unregistered_datetime),
  //     proposalVotingHistory,
  //     financialRequestsVotes,
  //   }
  //   satelliteMap.push(newSatelliteRecord)
  //   return true
  // })
  return {
    breakGlassConfig: {
      delegateToSatelliteIsPaused: storage?.delegate_to_satellite_paused,
      undelegateFromSatelliteIsPaused: storage?.undelegate_from_satellite_paused,
      registerAsSatelliteIsPaused: storage?.register_as_satellite_paused,
      unregisterAsSatelliteIsPaused: storage?.unregister_as_satellite_paused,
      updateSatelliteRecordIsPaused: storage?.update_satellite_record_paused,
      distributeRewardPaused: storage?.distribute_reward_paused,
    },
    config: {
      maxSatellites: storage?.max_satellites,
      delegationRatio: storage?.delegation_ratio,
      minimumStakedMvkBalance: calcWithoutMu(storage?.minimum_smvk_balance),
      satelliteNameMaxLength: storage?.satellite_name_max_length,
      satelliteDescriptionMaxLength: storage?.satellite_description_max_length,
      satelliteImageMaxLength: storage?.satellite_image_max_length,
      satelliteWebsiteMaxLength: storage?.satellite_website_max_length,
    },
    delegateLedger: new MichelsonMap<string, DelegateRecord>(),
    satelliteLedger: satelliteMap,
    numberActiveSatellites: storage?.max_satellites,
    totalDelegatedMVK: storage?.max_satellites,
  }
}

function convertToSatelliteRecordsInterface(satelliteRecordObject: any): SatelliteRecord[] {
  const satelliteRecords: SatelliteRecord[] = []
  if (Array.isArray(satelliteRecordObject)) {
    satelliteRecordObject.map((item: any) => {
      const newSatelliteRecord = convertToSatelliteRecordInterface(item)
      satelliteRecords.push(newSatelliteRecord)
      return true
    })
  }
  return satelliteRecords
}

function convertToSatelliteRecordInterface(satelliteRecord: any): SatelliteRecord {
  const totalDelegatedAmount = satelliteRecord
    ? satelliteRecord.delegation_records.reduce(
        (sum: any, current: { user: { smvk_balance: any } }) => sum + current.user.smvk_balance,
        0,
      )
    : 0

  const proposalVotingHistory: SatelliteProposalVotingHistory[] = [],
    financialRequestsVotes: SatelliteFinancialRequestVotingHistory[] = []
  if (satelliteRecord) {
    satelliteRecord.governance_proposal_records_votes?.forEach(
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
          votingPower: calcWithoutPrecision(vote.voting_power),
          requestData: vote.governance_proposal_record,
        }
        proposalVotingHistory.push(newRequestVote)
      },
    )
    if (satelliteRecord.governance_financial_requests_votes) {
      satelliteRecord.governance_financial_requests_votes.forEach(
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
            votingPower: calcWithoutPrecision(vote.voting_power),
            requestData: vote.governance_financial_request,
          }
          financialRequestsVotes.push(newRequestVote)
        },
      )
    }
  }
  const newSatelliteRecord: SatelliteRecord = {
    address: satelliteRecord?.user_id || '',
    description: satelliteRecord?.description || '',
    website: satelliteRecord?.website || '',
    participation: satelliteRecord?.participation || 0,
    image: satelliteRecord?.image || '',
    mvkBalance: calcWithoutPrecision(satelliteRecord?.user.mvk_balance),
    sMvkBalance: calcWithoutPrecision(satelliteRecord?.user.smvk_balance),
    name: satelliteRecord?.name || '',
    registeredDateTime: new Date(satelliteRecord?.registered_datetime),
    satelliteFee: parseFloat(satelliteRecord?.fee || '0'),
    active: Boolean(satelliteRecord?.active),
    totalDelegatedAmount: calcWithoutPrecision(totalDelegatedAmount),
    unregisteredDateTime: new Date(satelliteRecord?.unregistered_datetime),
    proposalVotingHistory,
    financialRequestsVotes,
  }
  return newSatelliteRecord
}

function convertToFarmStorageType(storage: any): FarmStorage[] {
  const farms: FarmStorage[] = []
  storage?.forEach((farmItem: any) => {
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
      accumulatedMvkPerShare: calcWithoutPrecision(farmItem.accumulated_mvk_per_share),
      lastBlockUpdate: farmItem.last_block_update,
      lpBalance: calcWithoutPrecision(farmItem.lp_balance),
      lpToken: farmItem.lp_token,
      rewardPerBlock: calcWithoutPrecision(farmItem.reward_per_block),
      rewardsFromTreasury: farmItem.rewards_from_treasury,
      totalBlocks: farmItem.total_blocks,
    }
    farms.push(newFarm)
  })

  return farms
}

function convertToFarmFactoryStorageType(storage: any): FarmFactoryStorage {
  return {
    address: storage?.address,
    breakGlassConfig: {
      createFarmIsPaused: storage?.create_farm_paused,
      trackFarmIsPaused: storage?.track_farm_paused,
      untrackFarmIsPaused: storage?.untrack_farm_paused,
    },
    trackedFarms: convertToFarmStorageType(storage?.farms),
  }
}

function convertToEmergencyGovernanceStorageType(storage: any): EmergencyGovernanceStorage {
  const eGovRecords: EmergencyGovernanceProposalRecord[] = []
  storage?.emergency_governance_records.forEach((record: any) => {
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
      sMvkRequiredForTrigger: calcWithoutPrecision(record.smvk_required_for_trigger),
      voters,
    }
    eGovRecords.push(newEGovRecord)
  })
  const eGovStorage: EmergencyGovernanceStorage = {
    emergencyGovernanceLedger: eGovRecords,
    address: storage?.address,
    config: {
      minStakedMvkRequiredToTrigger: storage?.min_smvk_required_to_trigger,
      minStakedMvkRequiredToVote: storage?.min_smvk_required_to_vote,
      requiredFeeMutez: calcWithoutMu(storage?.required_fee_mutez),
      voteExpiryDays: storage?.vote_expiry_days,
      sMvkPercentageRequired: storage?.smvk_percentage_required / 100,
      proposalTitleMaxLength: 400,
      proposalDescMaxLength: 400,
      decimals: storage?.decmials,
    },
    currentEmergencyGovernanceRecordId: storage?.current_emergency_record_id,
    nextEmergencyGovernanceRecordId: storage?.next_emergency_record_id,
  }

  return eGovStorage
}

function convertToBreakGlassStorageType(storage: any): BreakGlassStorage {
  const actionLedger: BreakGlassActionRecord[] = [],
    councilMembers: { address: string }[] = []
  storage?.break_glass_action_records.forEach(
    (actionRecord: {
      action_type: any
      break_glass_id: any
      executed: any
      executed_datetime: string | number | Date
      executed_level: number
      expiration_datetime: string | number | Date
      id: any
      initiator_id: any
      start_datetime: string | number | Date
      status: any
      signers: any
      signers_count: number
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
        executedLevel: actionRecord.executed_level,
        signersCount: actionRecord.signers_count,
      }

      actionLedger.push(newActionRecord)
    },
  )
  // storage?.council_members.forEach((member: { address: string }) => {
  //   const newMember = {
  //     address: member.address,
  //   }
  //   councilMembers.push(newMember)
  // })
  return {
    address: storage?.address,
    admin: storage?.admin,
    governanceId: storage?.governance_id,
    config: {
      threshold: storage?.threshold,
      actionExpiryDays: storage?.action_expiry_days,
      councilMemberNameMaxLength: storage?.council_member_name_max_length,
      councilMemberImageMaxLength: storage?.council_member_image_max_length,
      councilMemberWebsiteMaxLength: storage?.council_member_website_max_length,
    },
    actionCounter: storage?.currentActionId,
    glassBroken: storage?.glassBroken,
    actionLedger,
  }
}



function convertToCouncilStorageType(storage: any): CouncilStorage {
  const councilActionsLedger: CouncilActionRecord[] = [],
    councilMembers: { address: string }[] = []
  storage?.council_action_records.forEach(
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
  return {
    address: storage?.address,
    config: {
      threshold: storage?.threshold,
      actionExpiryDays: storage?.action_expiry_days,
    },
    actionCounter: storage?.action_counter,
    councilActionsLedger,
  }
}

function convertToVestingStorageType(storage: any): VestingStorage {
  return {
    address: storage?.address,
    config: {
      defaultCliffPeriod: storage?.default_cliff_period,
      defaultCooldownPeriod: storage?.default_cooldown_period,
    },
    sumAmountClaimed: storage?.amount_claimed,
    sumRemainingVested: storage?.remainder_vested,
    totalVestedAmount: storage?.total_vested_amount,
  }
}

function convertGovernanceRound(round: number): GovernanceRoundType {
  return round === 0 ? 'PROPOSAL' : round === 1 ? 'VOTING' : 'TIME_LOCK'
}

function convertToGovernanceStorageType(storage: {
  governance: any
  governance_financial_request_record: any
  governance_proposal_record: any
  governance_satellite_snapshot_record: any
}): GovernanceStorage {
  const financialRequestRecords = convertGovernanceFinancialRequestRecordToInterface(
    storage?.governance_financial_request_record,
  )
  const proposalLedger = convertGovernanceProposalRecordToInterface(storage?.governance_proposal_record)
  const satelliteSnapshotLedger = convertGovernanceSatelliteSnapshotRecordsToInterface(
    storage?.governance_satellite_snapshot_record,
  )
  const currentGovernance = storage?.governance?.[1] || {}

  return {
    activeSatellitesMap: new MichelsonMap<string, Date>(),
    address: currentGovernance.address,
    config: {
      successReward: currentGovernance.success_reward,
      minQuorumPercentage: currentGovernance.min_quorum_percentage,
      minQuorumMvkTotal: currentGovernance.min_quorum_mvk_total,
      votingPowerRatio: currentGovernance.voting_power_ratio,
      proposalSubmissionFee: currentGovernance.proposal_submission_fee, // 10 tez
      minimumStakeReqPercentage: currentGovernance.minimum_stake_req_percentage, // 0.01% for testing: change to 10,000 later -> 10%
      maxProposalsPerDelegate: currentGovernance.max_proposal_per_delegate,
      newBlockTimeLevel: currentGovernance.new_blocktime_level,
      newBlocksPerMinute: currentGovernance.new_block_per_minute,
      blocksPerMinute: currentGovernance.blocks_per_minute,
      blocksPerProposalRound: currentGovernance.blocks_per_proposal_round,
      blocksPerVotingRound: currentGovernance.blocks_per_voting_round,
      blocksPerTimelockRound: currentGovernance.blocks_per_timelock_round,
    },
    currentCycleEndLevel: currentGovernance.current_cycle_end_level,
    currentRound: convertGovernanceRound(currentGovernance.current_round || 0),
    currentRoundEndLevel: currentGovernance.current_round_end_level,
    currentRoundProposals: new MichelsonMap<string, ProposalRecordType>(),
    currentRoundStartLevel: currentGovernance.current_round_start_level,
    currentRoundVotes: new MichelsonMap<string, Date>(),
    financialRequestLedger: financialRequestRecords,
    governanceLambdaLedger: new MichelsonMap<string, Date>(),
    nextProposalId: currentGovernance.next_proposal_id,
    proposalLedger: proposalLedger,
    snapshotLedger: satelliteSnapshotLedger,
    startLevel: currentGovernance.start_level,
    tempFlag: currentGovernance.start_level,
    timelockProposalId: currentGovernance.timelock_proposal,
    cycleCounter: currentGovernance.cycle_counter,
    // currentRoundHighestVotedProposalId: storage?.,
    // whitelistTokenContracts: new MichelsonMap<string, Date>(),
    // financialRequestCounter: storage?.,
    // snapshotMvkTotalSupply:storage?.,
    // financialRequestSnapshotLedger: storage?.,
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
  if (Array.isArray(governance_financial_request_vote)) {
    governance_financial_request_vote.forEach((record) => {
      const newRequestRecord = record as unknown as FinancialRequestRecord
      newRequestRecord.votes = convertGovernanceFinancialRequestVoteToInterface(record.votes)
      financialRequestRecords.push(newRequestRecord)
    })
  }
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
  if (Array.isArray(governance_proposal_record)) {
    governance_proposal_record.forEach((record) => {
      const newProposalRecord = record as unknown as ProposalRecordType
      newProposalRecord.votes = convertGovernanceProposalVoteToInterface(record.votes)
      governanceProposalRecords.push(newProposalRecord)
    })
  }
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
      votingPower: calcWithoutPrecision(record.voting_power),
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
  if (Array.isArray(governance_satellite_snapshot_record)) {
    governance_satellite_snapshot_record.forEach((record) => {
      const newProposalRecord = record as unknown as SnapshotRecordType
      governanceProposalRecords.push(newProposalRecord)
    })
  }
  return governanceProposalRecords
}

function convertProposalStatus(executed: boolean, locked: boolean, numberSatus: number): ProposalStatus {
  let status = 'ACTIVE'
  if (numberSatus === 1) {
    status = 'DEFEATED'
  } else {
    if (executed) {
      status = 'EXECUTED'
    } else if (locked) {
      status = 'LOCKED'
    }
  }

  return status as ProposalStatus
}

export function convertGovernanceProposalRecordItemToStorageType(item: any): ProposalRecordType {
  const convertData = {
    id: item.id,
    proposerId: item.proposer_id,
    status: convertProposalStatus(item.executed, item.locked, item.status),
    title: item.title,
    description: item.description,
    invoice: item.invoice,
    successReward: item.successReward,
    startDateTime: item.start_datetime,
    executed: item.executed,
    locked: item.locked,
    timelockProposal: item.timelock_proposal,
    passVoteMvkTotal: item.pass_vote_mvk_total,
    upvoteMvkTotal: item.up_vote_mvk_total,
    downvoteMvkTotal: item.down_vote_count,
    abstainMvkTotal: item.abstain_mvk_total,
    votes: convertGovernanceProposalVoteToInterface(item.votes),
    minProposalRoundVoteRequirement: item.min_proposal_round_vote_req,
    minProposalRoundVotePercentage: item.min_proposal_round_vote_pct,
    minQuorumPercentage: item.min_quorum_percentage,
    minQuorumMvkTotal: item.min_quorum_mvk_total,
    quorumMvkTotal: item.quorum_mvk_total,
    currentRoundProposal: item.quorum_mvk_total,
    currentCycleStartLevel: item.current_cycle_start_level,
    currentCycleEndLevel: item.current_cycle_end_level,
    roundHighestVotedProposal: item.round_highest_voted_proposal,
    cycle: item.cycle,
    details: item.details,
    invoiceTable: item.invoice_table,
  }
  // @ts-ignore
  return convertData
}



export function convertCurrentRoundProposalsStorageType(storage: {
  governance_proposal_record: ProposalRecordType[]
}): Map<string, ProposalRecordType> | undefined {
  const governanceProposalRecord = storage?.governance_proposal_record
  const mapProposalRecordType = governanceProposalRecord.length
    ? new Map(
      governanceProposalRecord.map((item, i) => [`${i}`, convertGovernanceProposalRecordItemToStorageType(item)]),
      )
      : undefined
      return mapProposalRecordType
    }

    export function convertBreakGlassStatusStorageType(storage: any): Record<string, unknown>[] {
      const convert = [] as Record<string, unknown>[]

      if (storage?.doorman?.length) {
        storage.doorman.forEach((item: any) => {
          convert.push({
            title: 'Doorman',
            type: 'General Contracts',
            address: item.address,
            methods: {
              compound: item.compound_paused,
              'distribute reward': item.distribute_reward_paused,
              'farm claimed': item.farm_claimed_paused,
              unstake: item.unstake_paused,
            },
          })
        })
      } 

      if (storage?.delegation?.length) {
        storage.delegation.forEach((item: any) => {
          convert.push({
            title: 'Delegation',
            type: "General Contracts",
            address: item.address,
            methods: {
              'delegate to satellite': item.delegate_to_satellite_paused,
              'distribute reward': item.distribute_reward_paused,
              'register as satellite': item.register_as_satellite_paused,
              'undelegate from satellite': item.undelegate_from_satellite_paused,
              'unregister as satellite': item.unregister_as_satellite_paused,
              'update satellite record': item.update_satellite_record_paused,
            },
          })
        })
      }
      
      if (storage?.farm_factory?.length) {
        storage.farm_factory.forEach((item: any) => {
          convert.push({
            title: 'Farm factory',
            type: 'Farms',
            address: item.address,
            methods: {
              'create farm': item.create_farm_paused,
              'track farm': item.track_farm_paused,
              'untrack farm': item.untrack_farm_paused,
            },
          })
        })
      }

      if (storage?.farm?.length ) {
        storage.farm.forEach((item: any) => {
          convert.push({
            title: 'Farms',
            type: 'Farms',
            address: item.address,
            methods: {
              claim: item.claim_paused,
              deposit: item.deposit_paused,
              withdraw: item.withdraw_paused,
            },
          })
        })
      }
    
      if (storage?.treasury?.length) {
        storage.treasury.forEach((item: any) => {
          convert.push({
            title: 'Treasury',
            type: 'Treasury',
            address: item.address,
            methods: {
              'mint mvk and transfer': item.mint_mvk_and_transfer_paused,
              'stake mvk': item.stake_mvk_paused,
              transfer: item.transfer_paused,
              'unstake mvk': item.unstake_mvk_paused,
            },
          })
        })
      }
      
  return convert
}



