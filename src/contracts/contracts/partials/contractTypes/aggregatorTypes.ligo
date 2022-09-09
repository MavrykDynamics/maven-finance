// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type oracleInformationType is [@layout:comb] record [
       oraclePublicKey: key;
       oraclePeerId: string;
];
type oracleAddressesType         is map (address, oracleInformationType);
type oracleRewardStakedMvkType   is map (address, nat);
type oracleRewardXtzType         is map (address, nat);

type aggregatorConfigType is [@layout:comb] record [
    decimals                            : nat;
    alphaPercentPerThousand             : nat;

    percentOracleThreshold              : nat;
    heartBeatSeconds                    : nat;

    rewardAmountStakedMvk               : nat;
    rewardAmountXtz                     : nat;
];

type aggregatorBreakGlassConfigType is [@layout:comb] record [
    updateDataIsPaused                 : bool;
    withdrawRewardXtzIsPaused           : bool;
    withdrawRewardStakedMvkIsPaused     : bool;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type pivotedObservationsType     is map (nat, nat);


type lastCompletedPriceType is  [@layout:comb] record [
    round                       : nat;
    epoch                       : nat;
    price                       : nat;
    percentOracleResponse       : nat;
    priceDateTime               : timestamp;  
];

type lastCompletedPriceReturnType is  [@layout:comb] record [
    round                       : nat;
    epoch                       : nat;
    price                       : nat;
    percentOracleResponse       : nat;
    decimals                    : nat;
    priceDateTime               : timestamp;  
];

type oracleObservationType is [@layout:comb] record [
       price: nat;
       epoch: nat;
       round: nat;
       aggregatorAddress: address;
];

type updateDataType is   [@layout:comb] record [
  oracleObservations: map (address, oracleObservationType);
  signatures: map (address, signature);
];

type withdrawRewardXtzType            is address;
type withdrawRewardStakedMvkType      is address;

type addOracleType is   [@layout:comb] record [
        oracleAddress       : address;
        oracleInformation   : oracleInformationType;
];

type removeOracleType                 is address;

type updateDataType                  is updateDataType;

(* updateConfig entrypoint inputs *)
type aggregatorUpdateConfigNewValueType is nat
type aggregatorUpdateConfigActionType is 
        ConfigDecimals                      of unit
    |   ConfigAlphaPercentPerThousand       of unit

    |   ConfigPercentOracleThreshold        of unit
    |   ConfigHeartBeatSeconds              of unit

    |   ConfigRewardAmountStakedMvk         of unit
    |   ConfigRewardAmountXtz               of unit

type aggregatorUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : aggregatorUpdateConfigNewValueType; 
    updateConfigAction    : aggregatorUpdateConfigActionType;
]

type aggregatorPausableEntrypointType is
        UpdateData                   of bool
    |   WithdrawRewardXtz             of bool
    |   WithdrawRewardStakedMvk       of bool

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
    |   LambdaRemoveOracle                  of removeOracleType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                      of (unit)
    |   LambdaUnpauseAll                    of (unit)
    |   LambdaTogglePauseEntrypoint         of aggregatorTogglePauseEntrypointType

        // Oracle Entrypoint
    |   LambdaUpdateData                   of updateDataType
    
        // Reward Entrypoints
    |   LambdaWithdrawRewardXtz             of withdrawRewardXtzType
    |   LambdaWithdrawRewardStakedMvk       of withdrawRewardStakedMvkType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type aggregatorStorageType is [@layout:comb] record [
    
    admin                     : address;
    metadata                  : metadataType;
    name                      : string;
    config                    : aggregatorConfigType;
    breakGlassConfig          : aggregatorBreakGlassConfigType;

    mvkTokenAddress           : address;
    governanceAddress         : address;

    whitelistContracts        : whitelistContractsType;      
    generalContracts          : generalContractsType;

    oracleAddresses           : oracleAddressesType;
    
    lastCompletedPrice        : lastCompletedPriceType;

    oracleRewardStakedMvk     : oracleRewardStakedMvkType;
    oracleRewardXtz           : oracleRewardXtzType;
    
    lambdaLedger              : lambdaLedgerType;
];
