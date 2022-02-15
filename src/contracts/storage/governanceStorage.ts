import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice, bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { governanceStorageType } from "../test/types/governanceStorageType";

const config = {
    successReward             : 10000,
    minQuorumPercentage       : 1000,
    minQuorumMvkTotal         : 10000,

    votingPowerRatio          : 10000,
    proposalSubmissionFee     : 10000000, // 10 tez
    minimumStakeReqPercentage : 10,       // 0.01% for testing: change to 10,000 later -> 10%
    maxProposalsPerDelegate   : 20,

    newBlockTimeLevel         : 0,
    newBlocksPerMinute        : 0,
    blocksPerMinute           : 2,

    blocksPerProposalRound    : 14400,
    blocksPerVotingRound      : 14400,
    blocksPerTimelockRound    : 5760,

    financialRequestApprovalPercentage : 6700,
    financialRequestDurationInDays     : 3
}


export const governanceStorage: governanceStorageType = {
  
  admin                   : alice.pkh,
  config                  : config,
  
  whitelistContracts      : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts : MichelsonMap.fromLiteral({}),
  generalContracts        : MichelsonMap.fromLiteral({}),

  proposalLedger          : MichelsonMap.fromLiteral({}),
  snapshotLedger          : MichelsonMap.fromLiteral({}),
  activeSatellitesMap     : MichelsonMap.fromLiteral({}),

  startLevel              : new BigNumber(1),
  nextProposalId          : new BigNumber(1), 

  currentRound            : 'none',
  currentRoundStartLevel  : new BigNumber(1),
  currentRoundEndLevel    : new BigNumber(14401),
  currentCycleEndLevel    : new BigNumber(28801),
  currentRoundProposals   : MichelsonMap.fromLiteral({}),
  currentRoundVotes       : MichelsonMap.fromLiteral({}),

  currentRoundHighestVotedProposalId : new BigNumber(0),
  timelockProposalId                 : new BigNumber(0),
  
  snapshotMvkTotalSupply             : new BigNumber(1000000000),
  snapshotStakedMvkTotalSupply       : new BigNumber(0),

  governanceLambdaLedger             : MichelsonMap.fromLiteral({}),

  financialRequestLedger             : MichelsonMap.fromLiteral({}),
  financialRequestSnapshotLedger     : MichelsonMap.fromLiteral({}),
  financialRequestCounter            : new BigNumber(1),

  tempFlag : new BigNumber(0),

};
