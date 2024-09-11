// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type oracleInformationType is [@layout:comb] record [
    oraclePublicKey  : key;
    oraclePeerId     : string;
];
type oracleLedgerType            is map (address, oracleInformationType);
type oracleRewardStakedMvnType   is big_map (address, nat);
type oracleRewardMvrkType         is big_map (address, nat);

type aggregatorConfigType is [@layout:comb] record [
    decimals                            : nat;
    alphaPercentPerThousand             : nat;

    percentOracleThreshold              : nat;
    heartbeatSeconds                    : nat;

    rewardAmountStakedMvn               : nat;
    rewardAmountMvrk                     : nat;
];

type aggregatorBreakGlassConfigType is [@layout:comb] record [
    updateDataIsPaused                  : bool;
    withdrawRewardMvrkIsPaused           : bool;
    withdrawRewardStakedMvnIsPaused     : bool;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type pivotedObservationsType     is map (nat, nat);

type lastCompletedDataType is  [@layout:comb] record [
    round                       : nat;
    epoch                       : nat;
    data                        : nat;
    percentOracleResponse       : nat;
    lastUpdatedAt               : timestamp;  
];

type lastCompletedDataReturnType is  [@layout:comb] record [
    round                       : nat;
    epoch                       : nat;
    data                        : nat;
    percentOracleResponse       : nat;
    decimals                    : nat;
    lastUpdatedAt               : timestamp;  
];

type oracleObservationSingleType is [@layout:comb] record [
    data                 : nat;
    epoch                : nat;
    round                : nat;
    aggregatorAddress    : address;
];

type oracleObservationsType is map (address, oracleObservationSingleType)

type updateDataType is   [@layout:comb] record [
    oracleObservations: oracleObservationsType;
    signatures: map (address, signature);
];

type withdrawRewardMvrkType            is address;
type withdrawRewardStakedMvnType      is address;

type addOracleType                    is address;

type removeOracleType                 is address;

(* updateConfig entrypoint inputs *)
type aggregatorUpdateConfigNewValueType is nat
type aggregatorUpdateConfigActionType is 
        ConfigDecimals                      of unit
    |   ConfigAlphaPercentPerThousand       of unit

    |   ConfigPercentOracleThreshold        of unit
    |   ConfigHeartbeatSeconds              of unit

    |   ConfigRewardAmountStakedMvn         of unit
    |   ConfigRewardAmountMvrk               of unit

type aggregatorUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : aggregatorUpdateConfigNewValueType; 
    updateConfigAction    : aggregatorUpdateConfigActionType;
]

type aggregatorPausableEntrypointType is
        UpdateData                    of bool
    |   WithdrawRewardMvrk             of bool
    |   WithdrawRewardStakedMvn       of bool

type aggregatorTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : aggregatorPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type aggregatorLambdaActionType is 

        // Housekeeping Entrypoints
    |   LambdaSetAdmin                      of (address)
    |   LambdaSetGovernance                 of (address)
    |   LambdaSetName                       of (string)
    |   LambdaUpdateMetadata                of updateMetadataType
    |   LambdaUpdateConfig                  of aggregatorUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts      of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts        of updateGeneralContractsType
    |   LambdaMistakenTransfer              of transferActionType

        // Oracle Admin Entrypoints
    |   LambdaAddOracle                     of addOracleType
    |   LambdaUpdateOracle                  of (unit)
    |   LambdaRemoveOracle                  of removeOracleType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                      of (unit)
    |   LambdaUnpauseAll                    of (unit)
    |   LambdaTogglePauseEntrypoint         of aggregatorTogglePauseEntrypointType

        // Oracle Entrypoint
    |   LambdaUpdateData                   of updateDataType
    
        // Reward Entrypoints
    |   LambdaWithdrawRewardMvrk             of withdrawRewardMvrkType
    |   LambdaWithdrawRewardStakedMvn       of withdrawRewardStakedMvnType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type aggregatorStorageType is [@layout:comb] record [
    
    admin                     : address;
    metadata                  : metadataType;
    name                      : string;
    config                    : aggregatorConfigType;
    breakGlassConfig          : aggregatorBreakGlassConfigType;

    mvnTokenAddress           : address;
    governanceAddress         : address;

    whitelistContracts        : whitelistContractsType;      
    generalContracts          : generalContractsType;

    oracleLedger              : oracleLedgerType;
    
    lastCompletedData         : lastCompletedDataType;

    oracleRewardStakedMvn     : oracleRewardStakedMvnType;
    oracleRewardMvrk           : oracleRewardMvrkType;
    
    lambdaLedger              : lambdaLedgerType;
];
