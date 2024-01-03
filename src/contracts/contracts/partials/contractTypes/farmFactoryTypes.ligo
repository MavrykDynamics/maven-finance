// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type farmFactoryBreakGlassConfigType is [@layout:comb] record [
    createFarmIsPaused          : bool;
    createFarmMTokenIsPaused    : bool;
    trackFarmIsPaused           : bool;
    untrackFarmIsPaused         : bool;
]


type farmFactoryConfigType is [@layout:comb] record [
    farmNameMaxLength       : nat;
    empty                   : unit;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type farmLpTokenType is [@layout:comb] record [
    tokenAddress             : address;
    tokenId                  : nat;
    tokenStandard            : lpStandardType;
]
type farmPlannedRewardsType is [@layout:comb] record[
    totalBlocks              : nat;
    currentRewardPerBlock    : tokenBalanceType;
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

type createFarmMTokenType is [@layout:comb] record[
    name                     : string;
    loanToken                : string;
    addToGeneralContracts    : bool;
    forceRewardFromTransfer  : bool;
    infinite                 : bool;
    plannedRewards           : farmPlannedRewardsType;
    metadata                 : bytes;
    lpToken                  : farmLpTokenType;
]


type farmFactoryUpdateConfigNewValueType is nat
type farmFactoryUpdateConfigActionType is 
        ConfigFarmNameMaxLength of unit
    |   Empty                   of unit

type farmFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : farmFactoryUpdateConfigNewValueType; 
    updateConfigAction      : farmFactoryUpdateConfigActionType;
]


type farmFactoryPausableEntrypointType is
        CreateFarm         of bool
    |   CreateFarmMToken   of bool
    |   UntrackFarm        of bool
    |   TrackFarm          of bool

type farmFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : farmFactoryPausableEntrypointType;
    empty             : unit
];

type farmTypeType is 
        Farm    of unit
    |   MFarm   of unit

type setFarmLambdaType is [@layout:comb] record [
    name                  : string;
    func_bytes            : bytes;
    farmType              : farmTypeType;
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type farmFactoryLambdaActionType is 

        // Housekeeping Entrypoints
        LambdaSetAdmin                    of (address)
    |   LambdaSetGovernance               of (address)
    |   LambdaUpdateMetadata              of updateMetadataType
    |   LambdaUpdateConfig                of farmFactoryUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts    of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts      of updateGeneralContractsType
    |   LambdaMistakenTransfer            of transferActionType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                    of (unit)
    |   LambdaUnpauseAll                  of (unit)
    |   LambdaTogglePauseEntrypoint       of farmFactoryTogglePauseEntrypointType

        // Farm Factory Entrypoints
    |   LambdaCreateFarm                  of createFarmType
    |   LambdaCreateFarmMToken            of createFarmMTokenType
    |   LambdaTrackFarm                   of (address)
    |   LambdaUntrackFarm                 of (address)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type farmFactoryStorageType is [@layout:comb] record[
    admin                  : address;
    metadata               : metadataType;
    config                 : farmFactoryConfigType;

    mvnTokenAddress        : address;
    governanceAddress      : address;

    whitelistContracts     : whitelistContractsType;      
    generalContracts       : generalContractsType;

    breakGlassConfig       : farmFactoryBreakGlassConfigType;

    trackedFarms           : set(address);

    lambdaLedger           : lambdaLedgerType;
    farmLambdaLedger       : lambdaLedgerType;
    mFarmLambdaLedger      : lambdaLedgerType;
]
