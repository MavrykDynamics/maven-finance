import { GET_GOVERNANCE_STORAGE } from 'pages/Governance/Governance.actions'
import { MichelsonMap } from '@taquito/taquito'

interface GovernanceConfig {
  successReward: number
  minQuorumPercentage: number
  minQuorumMvkTotal: number
  votingPowerRatio: number
  proposalSubmissionFee: number // 10 tez
  minimumStakeReqPercentage: number // 0.01% for testing: change to 10,000 later -> 10%
  maxProposalsPerDelegate: number
  newBlockTimeLevel: number
  newBlocksPerMinute: number
  blocksPerMinute: number
  blocksPerProposalRound: number
  blocksPerVotingRound: number
  blocksPerTimelockRound: number
}
export interface GovernanceStorage {
  admin: string
  config: GovernanceConfig
  whitelistContracts: MichelsonMap<string, unknown>
  whitelistTokenContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  proposalLedger: MichelsonMap<string, unknown>
  snapshotLedger: MichelsonMap<string, unknown>
  activeSatellitesMap: MichelsonMap<string, unknown>
  startLevel: number
  nextProposalId: number
  currentCycleInfo.round: string
  currentCycleInfo.roundStartLevel: number
  currentCycleInfo.roundEndLevel: number
  currentCycleInfo.cycleEndLevel: number
  currentCycleInfo.roundProposals: MichelsonMap<string, unknown>
  currentCycleInfo.roundVotes: MichelsonMap<string, unknown>
  currentRoundHighestVotedProposalId: number
  timelockProposalId: number
  snapshotMvkTotalSupply: number
  governanceLambdaLedger: MichelsonMap<string, unknown>
  financialRequestLedger: MichelsonMap<string, unknown>
  financialRequestCounter: number
}
export interface GovernanceState {
  governanceStorage: GovernanceStorage | any
}

const governanceDefaultState: GovernanceState = {
  governanceStorage: {},
}

export function governance(state = governanceDefaultState, action: any): GovernanceState {
  switch (action.type) {
    case GET_GOVERNANCE_STORAGE:
      return {
        governanceStorage: action.governanceStorage,
      }
    default:
      return state
  }
}
