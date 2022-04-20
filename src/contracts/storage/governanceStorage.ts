import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { bob, alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { governanceStorageType } from '../test/types/governanceStorageType'

const config = {
    successReward             : 10000,

    minProposalRoundVotePercentage : 1000,
    minProposalRoundVotesRequired  : 10000,

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

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Governance Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

export const governanceStorage: governanceStorageType = {
  
  admin                   : bob.pkh,
  mvkTokenAddress         : "",
  metadata                : metadata,
  config                  : config,
  
  whitelistContracts      : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts : MichelsonMap.fromLiteral({}),
  generalContracts        : MichelsonMap.fromLiteral({}),

  proposalLedger          : MichelsonMap.fromLiteral({}),
  snapshotLedger          : MichelsonMap.fromLiteral({}),

  startLevel              : new BigNumber(1),
  nextProposalId          : new BigNumber(1),
  cycleCounter            : new BigNumber(1),

  currentRound            : { proposal: null },
  currentBlocksPerProposalRound :  new BigNumber(0),
  currentBlocksPerVotingRound   :  new BigNumber(0),
  currentBlocksPerTimelockRound :  new BigNumber(0),
  currentRoundStartLevel  : new BigNumber(0),
  currentRoundEndLevel    : new BigNumber(0),
  currentCycleEndLevel    : new BigNumber(0),
  currentRoundProposals   : MichelsonMap.fromLiteral({}),
  currentRoundProposers   : MichelsonMap.fromLiteral({}),
  currentRoundVotes       : MichelsonMap.fromLiteral({}),

  currentRoundHighestVotedProposalId : new BigNumber(0),
  timelockProposalId                 : new BigNumber(0),
  
  snapshotMvkTotalSupply             : new BigNumber(1000000000),
  snapshotStakedMvkTotalSupply       : new BigNumber(0),

  proxyLambdaLedger                  : MichelsonMap.fromLiteral({}),
  lambdaLedger                       : MichelsonMap.fromLiteral({}),

  financialRequestLedger             : MichelsonMap.fromLiteral({}),
  financialRequestSnapshotLedger     : MichelsonMap.fromLiteral({}),
  financialRequestCounter            : new BigNumber(1),

};
