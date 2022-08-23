import { MichelsonMap } from '@taquito/taquito'
import { Feed, InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'

import { calcWithoutMu, calcWithoutPrecision } from './calcFunctions'

import { CouncilActionRecord, CouncilActionSigner, CouncilStorage } from './TypesAndInterfaces/Council'

import {
  FinancialRequestRecord,
  FinancialRequestVote,
  GovernanceRoundType,
  GovernanceStorage,
  ProposalRecordType,
  ProposalVote,
  SnapshotRecordType,
} from './TypesAndInterfaces/Governance'
import { TreasuryType } from './TypesAndInterfaces/Treasury'
import { VestingStorage } from './TypesAndInterfaces/Vesting'

export default function storageToTypeConverter(contract: string, storage: any): any {
  let res = {}
  switch (contract) {
    case 'council':
      res = convertToCouncilStorageType(storage)
      break
    case 'vesting':
      res = convertToVestingStorageType(storage)
      break
    case 'governance':
      res = convertToGovernanceStorageType(storage)
      break
    case 'treasury':
      res = convertToTreasuryAddressType(storage)
      break
    case 'oracle':
      res = convertToOracleStorageType(storage)
      break
  }

  return res
}

function convertToTreasuryAddressType(storage: any): {
  treasuryAddresses: Array<TreasuryType>
  treasuryFactoryAddress: string
} {
  return {
    treasuryAddresses: storage?.treasury,
    treasuryFactoryAddress: storage?.treasury_factory[0].address,
  }
}

function convertToOracleStorageType(storage: any): InitialOracleStorageType {
  return {
    feeds: storage?.aggregator.map((feed: Feed) => ({
      ...feed,
      category: 'Cryptocurrency (USD pairs)',
      network: 'Tezos',
    })),
    feedsFactory: storage?.aggregator_factory,
    totalOracleNetworks: storage?.aggregator
      ? storage.aggregator.reduce((acc: number, cur: any) => acc + cur.oracle_records.length, 0)
      : 0,
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
    councilMembers: storage?.council_council_members?.length ? storage.council_council_members : [],
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
  return round === 0 ? 'PROPOSAL' : round === 1 ? 'VOTING' : round === 2 ? 'TIME_LOCK' : ''
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

  const currentGovernance = storage?.governance?.[0] || {}

  return {
    activeSatellitesMap: new MichelsonMap<string, Date>(),
    address: currentGovernance.address,
    fee: currentGovernance.proposal_submission_fee_mutez
      ? calcWithoutMu(currentGovernance.proposal_submission_fee_mutez)
      : 0,
    config: {
      successReward: calcWithoutPrecision(currentGovernance.success_reward),
      minQuorumPercentage: currentGovernance.min_quorum_percentage,
      minQuorumMvkTotal: currentGovernance.min_yay_vote_percentage,
      votingPowerRatio: currentGovernance.voting_power_ratio ?? 0,
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
    timelockProposalId: currentGovernance.timelock_proposal_id,
    cycleCounter: currentGovernance.cycle_counter ?? 0,
    cycleHighestVotedProposalId: currentGovernance.cycle_highest_voted_proposal_id,
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
    pass_vote_smvk_total: any
    current_cycle_end_level: any
    current_cycle_start_level: any
    current_round_proposal: any
    cycle: any
    description: any
    nay_vote_smvk_total: any
    id: any
    executed: any
    invoice: any
    locked: any
    min_proposal_round_vote_pct: any
    proposal_vote_smvk_total: any
    min_quorum_percentage: any
    min_yay_vote_percentage: any
    min_proposal_round_vote_req: any
    proposer_id: any
    quorum_smvk_total: any
    source_code: any
    round_highest_voted_proposal: any
    start_datetime: any
    status: any
    success_reward: any
    timelock_proposal: any
    title: any
    yay_vote_smvk_total: any
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
      const newProposalRecord = convertGovernanceProposalRecordItemToStorageType(record)
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
      proposalId: record.governance_proposal_record_id,
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

export function convertGovernanceProposalRecordItemToStorageType(item: any): ProposalRecordType {
  const convertData = {
    id: item.id,
    proposerId: item.proposer_id,
    status: item.status,
    title: item.title,
    description: item.description,
    invoice: item.invoice,
    successReward: item.successReward,
    startDateTime: item.start_datetime,
    executed: item.executed,
    locked: item.locked,
    timelockProposal: item.timelock_proposal,
    sourceCode: item.source_code,
    passVoteMvkTotal: calcWithoutPrecision(item.proposal_vote_smvk_total),
    upvoteMvkTotal: calcWithoutPrecision(item.yay_vote_smvk_total),
    downvoteMvkTotal: calcWithoutPrecision(item.nay_vote_count),
    abstainMvkTotal: calcWithoutPrecision(item.pass_vote_smvk_total),
    votes: convertGovernanceProposalVoteToInterface(item.votes),
    minProposalRoundVoteRequirement: item.min_proposal_round_vote_req,
    minProposalRoundVotePercentage: item.min_proposal_round_vote_pct,
    minQuorumPercentage: item.min_quorum_percentage,
    minQuorumMvkTotal: item.min_yay_vote_percentage,
    quorumMvkTotal: item.quorum_smvk_total,
    currentRoundProposal: item.current_round_proposal,
    currentCycleStartLevel: item.current_cycle_start_level,
    currentCycleEndLevel: item.current_cycle_end_level,
    roundHighestVotedProposal: item.round_highest_voted_proposal,
    cycle: item.cycle,
    proposalData: item.proposal_data,
    proposalPayments: item.proposal_payments,
    governanceId: item.governance_id,
    details: item.details,
    invoiceTable: item.invoice_table,
    paymentProcessed: item.payment_processed,
  }
  // @ts-ignore
  return convertData
}

export function convertCurrentRoundProposalsStorageType(storage: {
  governance_proposal_record: ProposalRecordType[]
}): Map<string, ProposalRecordType> | undefined {
  const governanceProposalRecord = storage?.governance_proposal_record
  const mapProposalRecordType = governanceProposalRecord?.length
    ? new Map(
        governanceProposalRecord.map((item, i) => [`${i}`, convertGovernanceProposalRecordItemToStorageType(item)]),
      )
    : undefined
  return mapProposalRecordType
}

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue)
  return keys.length > 0 ? keys[0] : null
}
