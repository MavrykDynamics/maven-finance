import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

import { bob } from '../scripts/sandbox/accounts'
import { MVN, zeroAddress } from '../test/helpers/Utils'
import { governanceStorageType } from './storageTypes/governanceStorageType'

const config = {
    successReward                       : MVN(10),
    cycleVotersReward                   : MVN(100),

    minProposalRoundVotePercentage      : 1000,

    minQuorumPercentage                 : 1000,
    minYayVotePercentage                : 5100,

    proposalSubmissionFeeMutez          : 1000000, // 1 tez
    maxProposalsPerSatellite            : 20,

    newBlockTimeLevel                   : 0,

    blocksPerProposalRound              : 14400,
    blocksPerVotingRound                : 14400,
    blocksPerTimelockRound              : 5760,

    proposalDataTitleMaxLength          : 400,
    proposalTitleMaxLength              : 100,
    proposalDescriptionMaxLength        : 400,
    proposalInvoiceMaxLength            : 400,
    proposalSourceCodeMaxLength         : 400
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Governance Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <contact@mavenfinance.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const governanceStorage: governanceStorageType = {
  
    admin                   : bob.pkh,
    mvnTokenAddress         : "",
    governanceProxyAddress  : zeroAddress,
    metadata                : metadata,
    config                  : config,
    
    whitelistDevelopers     : [],
    whitelistContracts      : MichelsonMap.fromLiteral({}),
    generalContracts        : MichelsonMap.fromLiteral({}),

    proposalLedger                      : MichelsonMap.fromLiteral({}),
    proposalVoters                      : MichelsonMap.fromLiteral({}),
    proposalRewards                     : MichelsonMap.fromLiteral({}),
    stakedMvnSnapshotLedger             : MichelsonMap.fromLiteral({}),
    snapshotLedger                      : MichelsonMap.fromLiteral({}),
    satelliteLastSnapshotLedger         : MichelsonMap.fromLiteral({}),

    nextProposalId          : new BigNumber(1),
    cycleId                 : new BigNumber(0),

    currentCycleInfo        : {
        round                     : { proposal: null },
        blocksPerProposalRound    : new BigNumber(0),
        blocksPerVotingRound      : new BigNumber(0),
        blocksPerTimelockRound    : new BigNumber(0),
        roundStartLevel           : new BigNumber(0),
        roundEndLevel             : new BigNumber(0),
        cycleEndLevel             : new BigNumber(0),
        cycleTotalVotersReward    : new BigNumber(0),
        minQuorumStakedMvnTotal   : new BigNumber(0)
    },

    cycleProposals                     : MichelsonMap.fromLiteral({}),
    cycleProposers                     : MichelsonMap.fromLiteral({}),
    roundVotes                         : MichelsonMap.fromLiteral({}),

    cycleHighestVotedProposalId        : new BigNumber(0),
    timelockProposalId                 : new BigNumber(0),

    lambdaLedger                       : MichelsonMap.fromLiteral({})
};