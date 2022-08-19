// types
import type {
  DelegateRecord,
  DelegationStorage,
  SatelliteFinancialRequestVotingHistory,
  SatelliteProposalVotingHistory,
  SatelliteRecord,
} from "../../utils/TypesAndInterfaces/Delegation";
import type { MavrykUserGraphQl } from "../../utils/TypesAndInterfaces/User";
import type { SatelliteRecordGraphQl } from "../../utils/TypesAndInterfaces/Delegation";

// helpers
import { calcWithoutMu, calcWithoutPrecision } from "../../utils/calcFunctions";

export function normalizeSatelliteRecord(
  satelliteRecord: SatelliteRecordGraphQl,
  userVotingHistory: MavrykUserGraphQl
): SatelliteRecord {
  const totalDelegatedAmount = satelliteRecord
    ? satelliteRecord.delegation_records.reduce(
        (sum: any, current: { user: { smvk_balance: any } }) =>
          sum + current.user.smvk_balance,
        0
      )
    : 0;

  const proposalVotingHistory = userVotingHistory
    ? userVotingHistory?.governance_proposal_records_votes?.map((vote) => {
        return {
          id: vote.id,
          currentRoundVote: vote.current_round_vote,
          proposalId: vote.governance_proposal_record_id || 0,
          round: vote.round,
          timestamp: new Date(vote.timestamp),
          vote: vote.vote,
          voterId: vote.voter_id,
          votingPower: calcWithoutPrecision(vote.voting_power),
          requestData: vote.governance_proposal_record,
        };
      })
    : [];

  const financialRequestsVotes = userVotingHistory
    ? userVotingHistory.governance_financial_requests_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.governance_financial_request_id || 0,
          timestamp: new Date(vote.timestamp),
          vote: vote.vote,
          voterId: vote.voter_id,
          votingPower: calcWithoutPrecision(vote.voting_power),
          requestData: vote.governance_financial_request,
        };
      })
    : [];

  const emergencyGovernanceVotes = userVotingHistory
    ? userVotingHistory.emergency_governance_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.emergency_governance_record_id,
          timestamp: new Date(vote.timestamp),
          voterId: vote.voter_id,
        };
      })
    : [];

  const newSatelliteRecord: SatelliteRecord = {
    address: satelliteRecord?.user_id || "",
    oracleRecords: satelliteRecord?.user?.aggregator_oracle_records || [],
    description: satelliteRecord?.description || "",
    website: satelliteRecord?.website || "",
    participation: 0,
    image: satelliteRecord?.image || "",
    mvkBalance: calcWithoutPrecision(satelliteRecord?.user.mvk_balance),
    sMvkBalance: calcWithoutPrecision(satelliteRecord?.user.smvk_balance),
    name: satelliteRecord?.name || "",
    // satelliteFee: parseFloat(satelliteRecord?.fee || "0") / 100, - not exist
    satelliteFee: 0,
    status: satelliteRecord?.status,
    totalDelegatedAmount: calcWithoutPrecision(totalDelegatedAmount),
    // unregisteredDateTime: new Date(satelliteRecord?.unregistered_datetime), not exist
    unregisteredDateTime: new Date(0),
    proposalVotingHistory,
    financialRequestsVotes,
    emergencyGovernanceVotes,
  };

  return newSatelliteRecord;
}
