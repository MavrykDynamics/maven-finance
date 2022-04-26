import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type governanceStorageType = {
  admin: string;
  mvkTokenAddress: string;
  governanceProxyAddress: string;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;

  config: {};

  whitelistContracts      : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistTokenContracts : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts        : MichelsonMap<MichelsonMapKey, unknown>;

  proposalLedger          : MichelsonMap<MichelsonMapKey, unknown>;
  snapshotLedger          : MichelsonMap<MichelsonMapKey, unknown>;

  // startLevel              : BigNumber;
  nextProposalId          : BigNumber;
  cycleCounter            : BigNumber;

  currentRound                      : any;
  currentBlocksPerProposalRound     : BigNumber;
  currentBlocksPerVotingRound       : BigNumber;
  currentBlocksPerTimelockRound     : BigNumber;
  currentRoundStartLevel            : BigNumber;
  currentRoundEndLevel              : BigNumber;
  currentCycleEndLevel              : BigNumber;
  currentRoundProposals             : MichelsonMap<MichelsonMapKey, unknown>;
  currentRoundProposers             : MichelsonMap<MichelsonMapKey, unknown>;
  currentRoundVotes                 : MichelsonMap<MichelsonMapKey, unknown>;
  currentCycleVotersReward          : BigNumber;

  currentRoundHighestVotedProposalId : BigNumber;
  timelockProposalId                 : BigNumber;

  snapshotMvkTotalSupply             : BigNumber;
  snapshotStakedMvkTotalSupply       : BigNumber;

  proxyLambdaLedger                  : MichelsonMap<MichelsonMapKey, unknown>;
  lambdaLedger                       : MichelsonMap<MichelsonMapKey, unknown>;

  financialRequestLedger             : MichelsonMap<MichelsonMapKey, unknown>;
  financialRequestSnapshotLedger     : MichelsonMap<MichelsonMapKey, unknown>;
  financialRequestCounter            : BigNumber;
  
};
