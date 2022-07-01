// ------------------------------------------------------------------------------
// Farm Types
// ------------------------------------------------------------------------------

type farmPlannedRewardsType is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: tokenBalanceType;
]

type farmLpTokenType is [@layout:comb] record [
    tokenAddress   : address;
    tokenId        : nat;
    tokenStandard  : lpStandardType;
]

type createFarmType is [@layout:comb] record[
    name                     : string;
    addToGeneralContracts    : bool;
    forceRewardFromTransfer  : bool;
    infinite                 : bool;
    plannedRewards           : farmPlannedRewardsType;
    metadata                 : bytes;
    lpToken                  : farmLpTokenType;
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

type farmFactoryUpdateConfigNewValueType is nat
type farmFactoryUpdateConfigActionType is 
  ConfigFarmNameMaxLength of unit
| Empty                   of unit
type farmFactoryUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: farmFactoryUpdateConfigNewValueType; 
  updateConfigAction: farmFactoryUpdateConfigActionType;
]

type farmFactoryPausableEntrypointType is
  CreateFarm         of bool
| UntrackFarm        of bool
| TrackFarm          of bool

type farmFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : farmFactoryPausableEntrypointType;
    empty             : unit
];

type farmFactoryLambdaActionType is 

    // Housekeeping Entrypoints
    LambdaSetAdmin                    of (address)
|   LambdaSetGovernance               of (address)
|   LambdaUpdateMetadata              of updateMetadataType
|   LambdaUpdateConfig                of farmFactoryUpdateConfigParamsType
|   LambdaUpdateWhitelistContracts    of updateWhitelistContractsType
|   LambdaUpdateGeneralContracts      of updateGeneralContractsType
|   LambdaMistakenTransfer            of transferActionType
|   LambdaUpdateBlocksPerMinute       of (nat)

    // Pause / Break Glass Entrypoints
|   LambdaPauseAll                    of (unit)
|   LambdaUnpauseAll                  of (unit)
|   LambdaTogglePauseEntrypoint       of farmFactoryTogglePauseEntrypointType

    // Farm Factory Entrypoints
|   LambdaCreateFarm                  of createFarmType
|   LambdaTrackFarm                   of (address)
|   LambdaUntrackFarm                 of (address)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type farmFactoryStorageType is [@layout:comb] record[
    admin                  : address;
    metadata               : metadataType;
    config                 : farmFactoryConfigType;

    mvkTokenAddress        : address;
    governanceAddress      : address;

    whitelistContracts     : whitelistContractsType;      
    generalContracts       : generalContractsType;

    breakGlassConfig       : farmFactoryBreakGlassConfigType;

    trackedFarms           : set(address);

    lambdaLedger           : lambdaLedgerType;
    farmLambdaLedger       : lambdaLedgerType;
]