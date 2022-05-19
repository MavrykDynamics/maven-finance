import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { bob, alice } = require('../scripts/sandbox/accounts')

import { MVK, zeroAddress } from '../test/helpers/Utils'

import { governanceStorageType } from '../test/types/governanceStorageType'

const config = {
    successReward                       : MVK(10),
    cycleVotersReward                   : MVK(100),

    minProposalRoundVotePercentage      : 1000,
    minProposalRoundVotesRequired       : 10000,

    minQuorumPercentage                 : 1000,
    minQuorumMvkTotal                   : 10000,

    votingPowerRatio                    : 10000,
    proposalSubmissionFeeMutez          : 1000000, // 1 tez
    minimumStakeReqPercentage           : 10,       // 0.01% for testing: change to 10,000 later -> 10%
    maxProposalsPerDelegate             : 20,

    newBlockTimeLevel                   : 0,
    newBlocksPerMinute                  : 0,
    blocksPerMinute                     : 2,

    blocksPerProposalRound              : 14400,
    blocksPerVotingRound                : 14400,
    blocksPerTimelockRound              : 5760,

    proposalMetadataTitleMaxLength      : 400,
    proposalTitleMaxLength              : 400,
    proposalDescriptionMaxLength        : 400,
    proposalInvoiceMaxLength            : 400,
    proposalSourceCodeMaxLength         : 400
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
  governanceProxyAddress  : zeroAddress,
  metadata                : metadata,
  config                  : config,
  
  whitelistDevelopers     : [],
  generalContracts        : MichelsonMap.fromLiteral({}),

  proposalLedger          : MichelsonMap.fromLiteral({}),
  snapshotLedger          : MichelsonMap.fromLiteral({}),

  // startLevel              : new BigNumber(1),
  nextProposalId          : new BigNumber(1),
  cycleCounter            : new BigNumber(1),

  currentCycleInfo         : {
    round                     : { proposal: null },
    blocksPerProposalRound    :  new BigNumber(0),
    blocksPerVotingRound      :  new BigNumber(0),
    blocksPerTimelockRound    :  new BigNumber(0),
    roundStartLevel           : new BigNumber(0),
    roundEndLevel             : new BigNumber(0),
    cycleEndLevel             : new BigNumber(0),
    roundProposals            : MichelsonMap.fromLiteral({}),
    roundProposers            : MichelsonMap.fromLiteral({}),
    roundVotes                : MichelsonMap.fromLiteral({}),
    cycleTotalVotersReward    : new BigNumber(0),
  },

  currentRoundHighestVotedProposalId : new BigNumber(0),
  timelockProposalId                 : new BigNumber(0),
  
  snapshotMvkTotalSupply             : new BigNumber(1000000000),

  lambdaLedger                       : MichelsonMap.fromLiteral({})
};
