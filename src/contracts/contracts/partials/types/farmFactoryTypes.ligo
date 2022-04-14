////
// COMMON TYPES
////
type delegator is address
type tokenBalance is nat
type metadata is big_map (string, bytes);

////
// MICHELSON FARM TYPES
////
type farmPlannedRewards is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: tokenBalance;
]

type farmLpToken is [@layout:comb] record [
    tokenAddress   : address;
    tokenId        : nat;
    tokenStandard  : lpStandard;
]

type farmToken is [@layout:comb] record [
    symbol: string;
    tokenAddress: address;
]

type farmTokenPair is [@layout:comb] record [
    token0: farmToken;
    token1: farmToken;
]

type farmStorageType is [@layout:comb] record[
    forceRewardFromTransfer : bool;
    infinite                : bool;
    plannedRewards          : farmPlannedRewards;
    lpTokenOrigin           : string;
    tokenPair               : farmTokenPair;
    lpToken                 : farmLpToken;
]

type farmMetadataType is record[
    name                    : string;
    description             : string;
    version                 : string;
    liquidityPairToken      : record[
        tokenAddress        : address;
        origin              : string;
        token0              : farmToken;
        token1              : farmToken;
    ];
    authors                 : string;
]

type createFarmFuncType is (option(key_hash) * tez * farmStorage) -> (operation * address)
const createFarmFunc: createFarmFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../../compiled/farm.tz"
        ;
          PAIR } |}
: createFarmFuncType)];

type initFarmParamsType is record[
    totalBlocks: nat;
    currentRewardPerBlock: nat;
]

type farmFactoryBreakGlassConfigType is record [
    createFarmIsPaused     : bool;
    trackFarmIsPaused      : bool;
    untrackFarmIsPaused    : bool;
]

type farmFactoryConfigType is record [
    blocksPerMinute        : nat;
]

////
// STORAGE
////

type farmFactoryStorage is [@layout:comb] record[
    admin                  : address;
    mvkTokenAddress        : address;
    metadata               : metadata;

    config                 : farmFactoryConfigType;

    whitelistContracts     : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts       : generalContractsType;

    breakGlassConfig       : farmFactoryBreakGlassConfigType;

    trackedFarms           : set(address);
]