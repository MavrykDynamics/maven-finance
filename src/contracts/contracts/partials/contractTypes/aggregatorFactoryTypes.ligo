// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type trackedAggregatorsType is map (string * string, address)

type aggregatorFactoryConfigType is [@layout:comb] record [
    aggregatorNameMaxLength   : nat;
    empty                     : unit;
]

type aggregatorFactoryBreakGlassConfigType is [@layout:comb] record [
    createAggregatorIsPaused            : bool;
    trackAggregatorIsPaused             : bool;
    untrackAggregatorIsPaused           : bool;
    distributeRewardXtzIsPaused         : bool;
    distributeRewardStakedMvkIsPaused   : bool;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type createAggregatorParamsType is string * string * [@layout:comb] record[
    name                    : string;
    addToGeneralContracts   : bool;

    oracleAddresses         : oracleAddressesType;
    
    aggregatorConfig        : aggregatorConfigType;
    maintainer              : address;
    metadata                : bytes;
];


type registerAggregatorActionType is [@layout:comb] record [
    aggregatorPair          : string * string;        // e.g. BTC * USD  
    aggregatorAddress       : address; 
]


type trackAggregatorParamsType is [@layout:comb] record [
    pairFirst             : string;
    pairSecond            : string;
    aggregatorAddress     : address;
]


type untrackAggregatorParamsType is [@layout:comb] record [
    pairFirst             : string;
    pairSecond            : string;
]


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
    |   DistributeRewardXtz         of bool
    |   DistributeRewardStakedMvk   of bool

type aggregatorFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint      : aggregatorFactoryPausableEntrypointType;
    empty                 : unit
];


type distributeRewardXtzType is [@layout:comb] record [
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
    |   LambdaTrackAggregator               of trackAggregatorParamsType
    |   LambdaUntrackAggregator             of untrackAggregatorParamsType

        // Aggregator Lambdas
    |   LambdaDistributeRewardXtz           of distributeRewardXtzType
    |   LambdaDistributeRewardStakedMvk     of distributeRewardStakedMvkType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type aggregatorFactoryStorageType is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    config                  : aggregatorFactoryConfigType;

    mvkTokenAddress         : address;
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;

    breakGlassConfig        : aggregatorFactoryBreakGlassConfigType;
    
    trackedAggregators      : trackedAggregatorsType;

    lambdaLedger            : lambdaLedgerType;
    aggregatorLambdaLedger  : lambdaLedgerType;
]