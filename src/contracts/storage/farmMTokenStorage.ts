import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder";
import { BigNumber } from "bignumber.js";

import { bob } from '../scripts/sandbox/accounts'
import { farmMTokenStorageType } from "./storageTypes/farmMTokenStorageType";

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
    fa2 : ""
};
const lpToken = {
    tokenAddress: "",
    tokenId: lpTokenId,
    tokenStandard: lpTokenStandard,
    tokenBalance: new BigNumber(0)
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: "MAVEN USDT.e-USDC.e Farm",
        description: "Mavryk Farm Contract for USDT.e-USDC.e",
        version: "v1.0.0",
        liquidityPairToken: {
            tokenAddress: ["KT1CDeAxaiqbA5aMkPMmqqYXxqgfFwocJHza"],
            origin: ["Mavryk Finance"],
            symbol: ["MLP"],
            thumbnailUri: "https://infura-ipfs.io/ipfs/QmaazYGXFxbLvdVBUkxkprsZuBpQeraMWyUkU1gGsigiYm",
            decimals: 15,
            token0: {
                symbol: ["USDT.e"],
                tokenAddress: ["KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b"],
                thumbnailUri: "https://infura-ipfs.io/ipfs/QmdQ4R6TtBe75wSVEsLfRDtAn36Bv2zLAHyVe1cuLYeyfK"
            },
            token1: {
                symbol: ["USDC.e"],
                tokenAddress: ["KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9"],
                thumbnailUri: "https://www.plentydefi.com/static/media/usdc_icon.771d659c.svg"
            }
        },
        authors: ["MAVEN Dev Team <info@mavryk.io>"]
        }),
        'ascii',
    ).toString('hex'),
})

export const farmMTokenStorage: farmMTokenStorageType = {
    admin                     : bob.pkh,
    mvnTokenAddress           : "",
    governanceAddress         : "",
    name                      : "farm",
    metadata                  : metadata,
    config                    : {
                                    lpToken                  : lpToken,
                                    loanToken                : "nil",
                                    infinite                 : false,
                                    forceRewardFromTransfer  : false,
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
    minBlockTimeSnapshot      : new BigNumber(0),

    lambdaLedger              : MichelsonMap.fromLiteral({})
};