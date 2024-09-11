// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type aggregatorFactoryConfigType is [@layout:comb] record [
    aggregatorNameMaxLength   : nat;
    empty                     : unit;
]

type aggregatorFactoryBreakGlassConfigType is [@layout:comb] record [
    createAggregatorIsPaused            : bool;
    trackAggregatorIsPaused             : bool;
    untrackAggregatorIsPaused           : bool;
    distributeRewardMvrkIsPaused         : bool;
    distributeRewardStakedMvnIsPaused   : bool;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type oracleLedgerMapType is map (address, oracleInformationType);
type createAggregatorParamsType is [@layout:comb] record[
    name                    : string;
    addToGeneralContracts   : bool;

    oracleLedger            : oracleLedgerMapType;
    
    aggregatorConfig        : aggregatorConfigType;
    metadata                : bytes;
];



type aggregatorFactoryUpdateConfigNewValueType is nat
type aggregatorFactoryUpdateConfigActionType is 
    | ConfigAggregatorNameMaxLength   of unit
    | Empty                           of unit

type aggregatorFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : aggregatorFactoryUpdateConfigNewValueType; 
    updateConfigAction    : aggregatorFactoryUpdateConfigActionType;
]


type aggregatorFactoryPausableEntrypointType is
        CreateAggregator            of bool
    |   UntrackAggregator           of bool
    |   TrackAggregator             of bool
    |   DistributeRewardMvrk         of bool
    |   DistributeRewardStakedMvn   of bool

type aggregatorFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint      : aggregatorFactoryPausableEntrypointType;
    empty                 : unit
];


type distributeRewardMvrkType is [@layout:comb] record [
    recipient             : address;
    reward                : nat;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type aggregatorFactoryLambdaActionType is 
    
        // Housekeeping Lambdas
    |   LambdaSetAdmin                      of (address)
    |   LambdaSetGovernance                 of (address)
    |   LambdaUpdateMetadata                of updateMetadataType
    |   LambdaUpdateConfig                  of aggregatorFactoryUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts      of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts        of updateGeneralContractsType
    |   LambdaMistakenTransfer              of transferActionType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                      of (unit)
    |   LambdaUnpauseAll                    of (unit)
    |   LambdaTogglePauseEntrypoint         of aggregatorFactoryTogglePauseEntrypointType

        // Aggregator Factory Lambdas
    |   LambdaCreateAggregator              of createAggregatorParamsType
    |   LambdaTrackAggregator               of (address)
    |   LambdaUntrackAggregator             of (address)

        // Aggregator Lambdas
    |   LambdaDistributeRewardMvrk           of distributeRewardMvrkType
    |   LambdaDistributeRewardStakedMvn     of distributeRewardStakedMvnType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type aggregatorFactoryStorageType is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    config                  : aggregatorFactoryConfigType;

    mvnTokenAddress         : address;
    governanceAddress       : address;

    trackedAggregators      : set(address);
    breakGlassConfig        : aggregatorFactoryBreakGlassConfigType;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;

    lambdaLedger            : lambdaLedgerType;
    aggregatorLambdaLedger  : lambdaLedgerType;
]