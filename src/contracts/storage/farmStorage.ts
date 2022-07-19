import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

import { bob } from '../scripts/sandbox/accounts'
import { farmStorageType } from "../test/types/farmStorageType";

const totalBlocks = new BigNumber(0);
const currentRewardPerBlock = new BigNumber(0);
const totalRewards = new BigNumber(0);
const plannedRewards = {
    totalBlocks: totalBlocks, // 1hour with a block_time of 5seconds
    currentRewardPerBlock: currentRewardPerBlock,
    totalRewards: totalRewards
}

const paid = new BigNumber(0);
const unpaid = new BigNumber(0);
const claimedRewards = {
    paid: paid,
    unpaid: unpaid
}

const lpTokenId = new BigNumber(0);
const lpTokenStandard = {
    fa12: ""
};
const lpToken = {
    tokenAddress: "",
    tokenId: lpTokenId,
    tokenStandard: lpTokenStandard,
    tokenBalance: new BigNumber(0)
}
const tokenPair = {
    token0Address: "",
    token1Address: ""
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK PLENTY-USDTz Farm',
        description: 'MAVRYK Farm Contract',
        version: 'v1.0.0',
        liquidityPairToken: {
            tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
            origin: ['Plenty'],
            token0: {
            symbol: ['PLENTY'],
            tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
            },
            token1: {
            symbol: ['USDtz'],
            tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
            }
        },
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const farmStorage: farmStorageType = {
    admin                     : bob.pkh,
    mvkTokenAddress           : "",
    governanceAddress         : "",
    name                      : "farm",
    metadata                  : metadata,
    config                    : {
                                    lpToken                  : lpToken,
                                    tokenPair                : tokenPair,
                                    infinite                 : false,
                                    forceRewardFromTransfer  : false,
                                    blocksPerMinute          : new BigNumber(2),
                                    plannedRewards           : plannedRewards,
                                },
    
    generalContracts          : MichelsonMap.fromLiteral({}),
    whitelistContracts        : MichelsonMap.fromLiteral({}),

    breakGlassConfig          : {
                                    depositIsPaused  : false,
                                    withdrawIsPaused : false,
                                    claimIsPaused    : false
                                },

    lastBlockUpdate           : new BigNumber(0),
    accumulatedRewardsPerShare    : new BigNumber(0),
    claimedRewards            : claimedRewards,
    depositorLedger           : MichelsonMap.fromLiteral({}),
    open                      : false,
    init                      : false,
    initBlock                 : new BigNumber(0),

    lambdaLedger              : MichelsonMap.fromLiteral({})
};