// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type depositor is address
type tokenBalance is nat
type metadata is big_map (string, bytes);

// ------------------------------------------------------------------------------
// Farm Types
// ------------------------------------------------------------------------------

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

type createFarmType is [@layout:comb] record[
    name                    : string;
    addToGeneralContracts   : bool;
    forceRewardFromTransfer : bool;
    infinite                : bool;
    plannedRewards          : farmPlannedRewards;
    metadata                : bytes;
    lpToken                 : farmLpToken;
]

type farmMetadataType is record[
    name                     : string;
    description              : string;
    version                  : string;
    liquidityPairToken       : record[
        tokenAddress         : address;
        origin               : string;
        token0               : farmToken;
        token1               : farmToken;
    ];
    authors                  : string;
]

type farmFactoryBreakGlassConfigType is [@layout:comb] record [
    createFarmIsPaused      : bool;
    trackFarmIsPaused       : bool;
    untrackFarmIsPaused     : bool;
]

type farmFactoryConfigType is [@layout:comb] record [
    blocksPerMinute         : nat;
    _empty                  : unit;
] 

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type farmFactoryLambdaActionType is 

    // Housekeeping Entrypoints
    LambdaSetAdmin                    of (address)
|   LambdaSetGovernance               of (address)
|   LambdaUpdateMetadata              of updateMetadataType
|   LambdaUpdateWhitelistContracts    of updateWhitelistContractsParams
|   LambdaUpdateGeneralContracts      of updateGeneralContractsParams
|   LambdaUpdateBlocksPerMinute       of (nat)

    // Pause / Break Glass Entrypoints
|   LambdaPauseAll                    of (unit)
|   LambdaUnpauseAll                  of (unit)
|   LambdaTogglePauseCreateFarm       of (unit)
|   LambdaTogglePauseTrackFarm        of (unit)
|   LambdaTogglePauseUntrackFarm      of (unit)

    // Farm Factory Entrypoints
|   LambdaCreateFarm                  of createFarmType
|   LambdaTrackFarm                   of (address)
|   LambdaUntrackFarm                 of (address)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type farmFactoryStorage is [@layout:comb] record[
    admin                  : address;
    metadata               : metadata;
    mvkTokenAddress        : address;
    governanceAddress      : address;
    config                 : farmFactoryConfigType;
    breakGlassConfig       : farmFactoryBreakGlassConfigType;

    whitelistContracts     : whitelistContractsType;      
    generalContracts       : generalContractsType;

    trackedFarms           : set(address);

    lambdaLedger           : lambdaLedgerType;
    farmLambdaLedger       : lambdaLedgerType;
]