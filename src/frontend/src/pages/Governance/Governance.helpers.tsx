import { MichelsonMap } from '@taquito/taquito'
import { GovernancePhase } from '../../reducers/governance'
import {
  ProposalStatus,
  TokenGraphQL,
  PaymentType,
  GovernanceStorageGraphQL,
  ProposalRecordType,
  GovernanceProposalGraphQL,
} from '../../utils/TypesAndInterfaces/Governance'
import { calcWithoutMu, calcWithoutPrecision } from '../../utils/calcFunctions'

export const getProposalStatusInfo = (
  governancePhase: GovernancePhase,
  proposal: ProposalRecordType | undefined,
  timelockProposalId: number,
  isProposalPhase: boolean,
  cycleHighestVotedProposalId: number,
  cycleCounter: number,
): {
  statusFlag: ProposalStatus
  satelliteAbleToMakeProposalRoundVote: boolean
  showWaitingForExecutionHeader: boolean
  anyUserCanExecuteProposal: boolean
  showWaitingForPaymentToBeProcessedHeader: boolean
  anyUserCanProcessProposalPayment: boolean
  satelliteAbleToMakeVotingRoundVote: boolean
} => {
  // let statusFlag = ProposalStatus.ACTIVE
  let statusFlag = ProposalStatus.DROPPED
  let satelliteAbleToMakeProposalRoundVote = false
  let showWaitingForExecutionHeader = false
  let anyUserCanExecuteProposal = false
  let showWaitingForPaymentToBeProcessedHeader = false
  let anyUserCanProcessProposalPayment = false
  let satelliteAbleToMakeVotingRoundVote = false
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalPhase) {
    if (isProposalRound) {
      // is Proposal Period
      if (proposal?.currentRoundProposal) {
        if (proposal?.locked) {
          statusFlag = ProposalStatus.LOCKED
          satelliteAbleToMakeProposalRoundVote = true
        } else {
          statusFlag = ProposalStatus.UNLOCKED
          satelliteAbleToMakeProposalRoundVote = false
        }
        // if proposal from a previous round and their id matches the id of the proposal from the timelock round
      } else if (timelockProposalId === proposal?.id) {
        if (!proposal?.executed) {
          statusFlag = ProposalStatus.WAITING
          showWaitingForExecutionHeader = true
          anyUserCanExecuteProposal = true // Already passed the voting and just waiting to be executed
        } else if (!proposal.paymentProcessed && proposal?.proposalPayments && proposal?.proposalPayments?.length > 0) {
          statusFlag = ProposalStatus.WAITING
          showWaitingForPaymentToBeProcessedHeader = true
          anyUserCanProcessProposalPayment = true // Already executed and just need the payment to be processed
        } else {
          //Don't show the proposal as its already executed
        }
      } else {
        statusFlag = ProposalStatus.DROPPED
      }
    }

    if (isVotingRound) {
      // If proposal is of current round
      // NEW: && if the proposal's id === the cycle_highest_voted_proposal_id in the governanceStorage
      if (proposal?.currentRoundProposal && proposal.id === cycleHighestVotedProposalId) {
        statusFlag = ProposalStatus.ONGOING
        satelliteAbleToMakeVotingRoundVote = true
      }
      //There is only 1 proposal to be shown during the voting round
    }

    if (isTimeLockRound) {
      // Timelock Period
      // If proposal is of current round
      // NEW: && if the proposal's id === the timelock_proposal_id in the governanceStorage
      if (proposal?.currentRoundProposal && proposal.id === timelockProposalId) {
        statusFlag = ProposalStatus.TIMELOCK
      }
      //There is only 1 proposal to be shown during the timelock
      // round and not able to vote on it at all
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (proposal?.status === 1) {
        statusFlag = ProposalStatus.DROPPED
      } else {
        if (proposal?.executed) {
          statusFlag = ProposalStatus.EXECUTED
        } else if (proposal?.locked) {
          statusFlag = ProposalStatus.LOCKED
        }
      }
    }
  } else {
    // If a proposal is not of the current round so its a past proposal
    // Assuming its a proposal that has been executed or defeated. Not one that
    // is waiting to be executed / have its payment processed. STILL need to check
    // for this to show it on the main proposals page
    // if (!proposal?.currentRoundProposal && proposal && proposal?.cycle < cycleCounter) {
    if (!proposal?.currentRoundProposal && proposal) {
      if (proposal?.executed) {
        statusFlag = ProposalStatus.EXECUTED
      } else {
        statusFlag = ProposalStatus.DEFEATED
      }
    }
  }
  return {
    statusFlag,
    satelliteAbleToMakeProposalRoundVote,
    showWaitingForExecutionHeader,
    anyUserCanExecuteProposal,
    showWaitingForPaymentToBeProcessedHeader,
    anyUserCanProcessProposalPayment,
    satelliteAbleToMakeVotingRoundVote,
  }
}

export const normalizeProposalStatus = (
  governancePhase: GovernancePhase,
  numberSatus: number,
  executed: boolean,
  locked: boolean,
  isProposalPhase: boolean,
): ProposalStatus => {
  let status = ProposalStatus.ACTIVE
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalPhase) {
    if (isProposalRound) {
      if (locked) {
        status = ProposalStatus.LOCKED
      } else {
        status = ProposalStatus.UNLOCKED
      }
    }

    if (isVotingRound) {
      if (locked) {
        status = ProposalStatus.ONGOING
      }
    }

    if (isTimeLockRound) {
      if (locked) {
        status = ProposalStatus.TIMELOCK
      }
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (numberSatus === 1) {
        status = ProposalStatus.DROPPED
      } else {
        if (executed) {
          status = ProposalStatus.EXECUTED
        } else if (locked) {
          status = ProposalStatus.LOCKED
        }
      }
    }
  } else {
    if (numberSatus === 1) {
      status = ProposalStatus.DROPPED
    } else {
      if (executed) {
        status = ProposalStatus.EXECUTED
      } else {
        status = ProposalStatus.DEFEATED
      }
    }
  }
  return status
}

export const normalizeTokenStandart = (token?: TokenGraphQL): PaymentType => {
  return token?.type === 0 ? 'XTZ' : 'MVK'
}

const BEFORE_DIGIT = 24
const AFTER_DIGIT = 12
export const getShortByte = (
  byte: string,
  beforeDigit: number = BEFORE_DIGIT,
  afterDigit: number = AFTER_DIGIT,
): string => {
  const shortBype = byte.length
    ? [
        byte.substring(0, beforeDigit),
        byte.length > beforeDigit ? '...' : '',
        byte.length > beforeDigit ? byte.substring(byte.length - afterDigit) : '',
      ]
    : []

  return shortBype.join('')
}

function convertGovernanceRound(round: number) {
  return round === 0 ? 'PROPOSAL' : round === 1 ? 'VOTING' : round === 2 ? 'TIME_LOCK' : ''
}

export const normalizeProposal = (item: GovernanceProposalGraphQL) => {
  return {
    id: item.id,
    proposerId: item.proposer_id,
    status: item.status,
    title: item.title,
    description: item.description,
    invoice: item.invoice,
    successReward: item.success_reward,
    startDateTime: item.start_datetime,
    executed: item.executed,
    locked: item.locked,
    sourceCode: item.source_code,
    passVoteMvkTotal: calcWithoutPrecision(item.proposal_vote_smvk_total),
    upvoteMvkTotal: calcWithoutPrecision(item.yay_vote_smvk_total),
    downvoteMvkTotal: calcWithoutPrecision(item.nay_vote_count),
    abstainMvkTotal: calcWithoutPrecision(item.pass_vote_smvk_total),
    minProposalRoundVoteRequirement: item.min_proposal_round_vote_req,
    minProposalRoundVotePercentage: item.min_proposal_round_vote_pct,
    minQuorumPercentage: item.min_quorum_percentage,
    minQuorumMvkTotal: item.min_yay_vote_percentage,
    quorumMvkTotal: item.quorum_smvk_total,
    currentRoundProposal: item.current_round_proposal,
    currentCycleStartLevel: item.current_cycle_start_level,
    currentCycleEndLevel: item.current_cycle_end_level,
    cycle: item.cycle,
    proposalData: item.data,
    proposalPayments: item.payments,
    governanceId: item.governance_id,
    paymentProcessed: item.payment_processed,
  }
}

export const normalizeProposals = (proposalsList?: GovernanceProposalGraphQL[]) => {
  return proposalsList?.length ? proposalsList.map((item) => normalizeProposal(item)) : []
}

export const normalizeGovernanceStorage = (storage: GovernanceStorageGraphQL | null) => {
  const currentGovernance = storage?.governance?.[0]
  const proposalLedger = normalizeProposals(storage?.governance_proposal)

  return {
    activeSatellitesMap: new MichelsonMap<string, Date>(),
    address: currentGovernance?.address || '',
    fee: currentGovernance?.proposal_submission_fee_mutez
      ? calcWithoutMu(currentGovernance.proposal_submission_fee_mutez)
      : 0,
    config: {
      successReward: calcWithoutPrecision(currentGovernance?.success_reward ?? 0),
      minQuorumPercentage: currentGovernance?.min_quorum_percentage ?? 0,
      minQuorumMvkTotal: currentGovernance?.min_yay_vote_percentage ?? 0,
      blocksPerProposalRound: currentGovernance?.blocks_per_proposal_round ?? 0,
      blocksPerVotingRound: currentGovernance?.blocks_per_voting_round ?? 0,
      blocksPerTimelockRound: currentGovernance?.blocks_per_timelock_round,
    },
    currentCycleEndLevel: currentGovernance?.current_cycle_end_level ?? 0,
    currentRound: convertGovernanceRound(currentGovernance?.current_round ?? 0),
    currentRoundEndLevel: currentGovernance?.current_round_end_level ?? 0,
    currentRoundProposals: new MichelsonMap<string, ProposalRecordType>(),
    currentRoundStartLevel: currentGovernance?.current_round_start_level ?? 0,
    currentRoundVotes: new MichelsonMap<string, Date>(),
    financialRequestLedger: storage?.governance_financial_request,
    governanceLambdaLedger: new MichelsonMap<string, Date>(),
    nextProposalId: currentGovernance?.next_proposal_id ?? 0,
    proposalLedger,
    timelockProposalId: currentGovernance?.timelock_proposal_id ?? 0,
    cycleHighestVotedProposalId: currentGovernance?.cycle_highest_voted_proposal_id ?? 0,
    cycleCounter: 0,
  }
}
