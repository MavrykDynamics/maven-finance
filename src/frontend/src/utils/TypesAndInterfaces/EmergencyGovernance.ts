export interface EmergencyGovProposalVoter {
  emergencyGovernanceRecordId: number
  id: number
  sMvkAmount: number
  timestamp: Date
  voterId: string
}

export interface EmergencyGovernanceProposalRecord {
  description: string
  dropped: string
  emergencyGovernanceId: number
  executed: boolean
  executedTimestamp: Date
  expirationTimestamp: Date
  id: number
  proposerId: string
  sMvkPercentageRequired: number
  sMvkRequiredForTrigger: number
  startTimestamp: Date
  status: boolean
  title: string
  voters: EmergencyGovProposalVoter[]
}

export interface EmergencyGovernanceStorage {
  address: string
  admin?: string
  config: {
    voteExpiryDays: number
    minStakedMvkRequiredToTrigger: number
    minStakedMvkRequiredToVote: number
    requiredFeeMutez: number
    sMvkPercentageRequired: number
    proposalTitleMaxLength: number
    proposalDescMaxLength: number
    decimals: number
  }
  emergencyGovernanceLedger: EmergencyGovernanceProposalRecord[]
  currentEmergencyGovernanceRecordId: number
  nextEmergencyGovernanceRecordId: number
}
