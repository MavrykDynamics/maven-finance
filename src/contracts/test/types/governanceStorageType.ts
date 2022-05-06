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
  whitelistDevelopers     : Array<string>;
  generalContracts        : MichelsonMap<MichelsonMapKey, unknown>;

  proposalLedger          : MichelsonMap<MichelsonMapKey, unknown>;
  snapshotLedger          : MichelsonMap<MichelsonMapKey, unknown>;

  // startLevel              : BigNumber;
  nextProposalId          : BigNumber;
  cycleCounter            : BigNumber;

  currentCycleInfo        : {
    round                      : any;
    blocksPerProposalRound     : BigNumber;
    blocksPerVotingRound       : BigNumber;
    blocksPerTimelockRound     : BigNumber;
    roundStartLevel            : BigNumber;
    roundEndLevel              : BigNumber;
    cycleEndLevel              : BigNumber;
    roundProposals             : MichelsonMap<MichelsonMapKey, unknown>;
    roundProposers             : MichelsonMap<MichelsonMapKey, unknown>;
    roundVotes                 : MichelsonMap<MichelsonMapKey, unknown>;
    cycleTotalVotersReward     : BigNumber;
  };

  currentRoundHighestVotedProposalId : BigNumber;
  timelockProposalId                 : BigNumber;

  snapshotMvkTotalSupply             : BigNumber;
  snapshotStakedMvkTotalSupply       : BigNumber;

  lambdaLedger                       : MichelsonMap<MichelsonMapKey, unknown>;

  financialRequestLedger             : MichelsonMap<MichelsonMapKey, unknown>;
  financialRequestSnapshotLedger     : MichelsonMap<MichelsonMapKey, unknown>;
  financialRequestCounter            : BigNumber;
  
};
