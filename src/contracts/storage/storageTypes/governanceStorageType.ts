import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"

export type governanceStorageType = {
    admin: string;
    mvnTokenAddress: string;
    governanceProxyAddress: string;
    metadata: MichelsonMap<MichelsonMapKey, unknown>;

    config: {};

    whitelistDevelopers             : Array<string>;
    whitelistContracts              : MichelsonMap<MichelsonMapKey, unknown>
    generalContracts                : MichelsonMap<MichelsonMapKey, unknown>;

    proposalLedger                  : MichelsonMap<MichelsonMapKey, unknown>;
    proposalVoters                  : MichelsonMap<MichelsonMapKey, unknown>;
    proposalRewards                 : MichelsonMap<MichelsonMapKey, unknown>;
    stakedMvnSnapshotLedger         : MichelsonMap<MichelsonMapKey, unknown>;
    snapshotLedger                  : MichelsonMap<MichelsonMapKey, unknown>;
    satelliteLastSnapshotLedger     : MichelsonMap<MichelsonMapKey, unknown>;

    // startLevel              : BigNumber;
    nextProposalId          : BigNumber;
    cycleId            : BigNumber;

    currentCycleInfo        : {
        round                      : any;
        blocksPerProposalRound     : BigNumber;
        blocksPerVotingRound       : BigNumber;
        blocksPerTimelockRound     : BigNumber;
        roundStartLevel            : BigNumber;
        roundEndLevel              : BigNumber;
        cycleEndLevel              : BigNumber;
        cycleTotalVotersReward     : BigNumber;
        minQuorumStakedMvnTotal    : BigNumber;
    };

    cycleProposals                     : MichelsonMap<MichelsonMapKey, unknown>;
    cycleProposers                     : MichelsonMap<MichelsonMapKey, unknown>;
    roundVotes                         : MichelsonMap<MichelsonMapKey, unknown>;

    cycleHighestVotedProposalId        : BigNumber;
    timelockProposalId                 : BigNumber;

    lambdaLedger                       : MichelsonMap<MichelsonMapKey, unknown>;
  
};