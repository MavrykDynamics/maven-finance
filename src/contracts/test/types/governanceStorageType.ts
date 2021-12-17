import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type governanceStorageType = {
  
  admin: string;
  config: {};

  contractAddresses : MichelsonMap<MichelsonMapKey, unknown>;

  proposalLedger: MichelsonMap<MichelsonMapKey, unknown>;
  snapshotLedger: MichelsonMap<MichelsonMapKey, unknown>;
  activeSatellitesMap: MichelsonMap<MichelsonMapKey, unknown>;

  startLevel: BigNumber;
  nextProposalId: BigNumber;

  currentRound: string;
  currentRoundStartLevel: BigNumber;
  currentRoundEndLevel : BigNumber;
  currentCycleEndLevel : BigNumber;
  currentRoundProposals : MichelsonMap<MichelsonMapKey, unknown>;
  currentRoundVotes     : MichelsonMap<MichelsonMapKey, unknown>;

  currentRoundHighestVotedProposalId: BigNumber;
  currentRoundTimelockProposalId: BigNumber;
  
  delegationAddress: string;
  mvkTokenAddress: string;
  emergencyGovernanceAddress: string; 

  snapshotMvkTotalSupply: BigNumber;
  tempFlag :BigNumber;
};
