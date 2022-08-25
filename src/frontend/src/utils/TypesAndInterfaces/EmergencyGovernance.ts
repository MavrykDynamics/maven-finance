import type { Emergency_Governance } from "../generated/graphqlTypes";

import { normalizeEmergencyGovernance } from "../../pages/EmergencyGovernance/EmergencyGovernance.helpers";

export interface EmergencyGovProposalVoter {
  emergencyGovernanceRecordId: number;
  id: number;
  sMvkAmount: number;
  timestamp: Date;
  voterId: string;
}

export interface EmergencyGovernanceProposalRecord {
  description: string;
  dropped: string;
  emergencyGovernanceId: number;
  executed: boolean;
  executedTimestamp: Date;
  expirationTimestamp: Date;
  id: number;
  proposerId: string;
  sMvkPercentageRequired: number;
  sMvkRequiredForTrigger: number;
  startTimestamp: Date;
  executedLevel: number;
  startLevel: number;
  totalsMvkVotes: number;
  title: string;
  voters: EmergencyGovProposalVoter[];
}

// export interface EmergencyGovernanceStorage {
//   address: string;
//   admin?: string;
//   config: {
//     voteExpiryDays: number;
//     minStakedMvkRequiredToTrigger: number;
//     minStakedMvkRequiredToVote: number;
//     requiredFeeMutez: number;
//     sMvkPercentageRequired: number;
//     proposalTitleMaxLength: number;
//     proposalDescMaxLength: number;
//     decimals: number;
//   };
//   emergencyGovernanceLedger: EmergencyGovernanceProposalRecord[];
//   currentEmergencyGovernanceRecordId: number;
//   nextEmergencyGovernanceRecordId: number;
// }

export type EmergencyGovernanceGraphQl = Omit<
  Emergency_Governance,
  "__typename"
>;

export type EmergencyGovernanceStorage = ReturnType<
  typeof normalizeEmergencyGovernance
>;
