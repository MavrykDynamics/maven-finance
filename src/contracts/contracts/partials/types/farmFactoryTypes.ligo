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

type farmFactoryBreakGlassConfigType is [@layout:comb] record [
    createFarmIsPaused      : bool;
    trackFarmIsPaused       : bool;
    untrackFarmIsPaused     : bool;
]

type farmFactoryConfigType is [@layout:comb] record [
    blocksPerMinute         : nat;
    farmNameMaxLength       : nat;
] 

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type farmFactoryUpdateConfigNewValueType is nat
type farmFactoryUpdateConfigActionType is 
  ConfigFarmNameMaxLength of unit
| Empty                   of unit
type farmFactoryUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: farmFactoryUpdateConfigNewValueType; 
  updateConfigAction: farmFactoryUpdateConfigActionType;
]

type farmFactoryLambdaActionType is 

    // Housekeeping Entrypoints
    LambdaSetAdmin                    of (address)
|   LambdaSetGovernance               of (address)
|   LambdaUpdateMetadata              of updateMetadataType
|   LambdaUpdateConfig                of farmFactoryUpdateConfigParamsType
|   LambdaUpdateWhitelistContracts    of updateWhitelistContractsParams
|   LambdaUpdateGeneralContracts      of updateGeneralContractsParams
|   LambdaMistakenTransfer            of transferActionType
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