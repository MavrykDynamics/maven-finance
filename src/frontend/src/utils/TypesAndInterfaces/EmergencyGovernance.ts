import { MichelsonMap } from '@taquito/taquito'

export interface EmergencyGovernanceStorage {
  admin: string
  config: {
    voteDuration: number
    minStakedMvkPercentageForTrigger: number
    requiredFee: number
  }
  generalContracts: MichelsonMap<string, unknown>
  emergencyGovernanceLedger: MichelsonMap<string, unknown>
  tempMvkTotalSupply: number
  currentEmergencyGovernanceId: number
  nextEmergencyGovernanceProposalId: number
}
