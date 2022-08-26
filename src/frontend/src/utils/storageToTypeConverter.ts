import { MichelsonMap } from '@taquito/taquito'
import { Feed, InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'

import { calcWithoutMu, calcWithoutPrecision } from './calcFunctions'

import { ProposalRecordType, ProposalVote } from './TypesAndInterfaces/Governance'
import { TreasuryType } from './TypesAndInterfaces/Treasury'

export default function storageToTypeConverter(contract: string, storage: any): any {
  let res = {}
  switch (contract) {
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
