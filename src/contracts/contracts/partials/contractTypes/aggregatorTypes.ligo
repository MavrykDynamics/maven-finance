// ------------------------------------------------------------------------------
// Contract Specific Action Parameter types
// ------------------------------------------------------------------------------

type pivotedObservationsType     is map (nat, nat);

type deviationTriggerInfosType is  [@layout:comb] record [
    oracleAddress               : address;
    roundPrice                  : nat;
];

type lastCompletedRoundPriceType is  [@layout:comb] record [
    round                       : nat;
    price                       : nat;
    percentOracleResponse       : nat;
    priceDateTime               : timestamp;  
];

type lastCompletedRoundPriceReturnType is  [@layout:comb] record [
    round                       : nat;
    price                       : nat;
    percentOracleResponse       : nat;
    decimals                    : nat;
    priceDateTime               : timestamp;  
];

type setObservationCommitType is  [@layout:comb] record [
    roundId       : nat;
    sign          : bytes;
];

type setObservationRevealType is  [@layout:comb] record [
    roundId       : nat;
    priceSalted   : nat * string * address;
];

type withdrawRewardXtzType            is address;
type withdrawRewardStakedMvkType      is address;

type addOracleType                    is address;
type removeOracleType                 is address;

type requestRateUpdateType            is unit;
type requestRateUpdateDeviationType   is setObservationCommitType;
type setObservationCommitType         is setObservationCommitType;
type setObservationRevealType         is setObservationRevealType;

(* updateConfig entrypoint inputs *)
type aggregatorUpdateConfigNewValueType is nat
type aggregatorUpdateConfigActionType is 
  ConfigDecimals                      of unit
| ConfigNumberBlocksDelay             of unit

| ConfigDevTriggerBanDuration         of unit
| ConfigPerThousandDevTrigger         of unit
| ConfigPercentOracleThreshold        of unit

| ConfigRequestRateDevDepositFee      of unit

| ConfigDeviationRewardStakedMvk      of unit
| ConfigDeviationRewardAmountXtz      of unit
| ConfigRewardAmountStakedMvk         of unit
| ConfigRewardAmountXtz               of unit

type aggregatorUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : aggregatorUpdateConfigNewValueType; 
  updateConfigAction    : aggregatorUpdateConfigActionType;
]

type aggregatorPausableEntrypointType is
  RequestRateUpdate             of bool
| RequestRateUpdateDeviation    of bool
| SetObservationCommit          of bool
| SetObservationReveal          of bool
| WithdrawRewardXtz             of bool
| WithdrawRewardStakedMvk       of bool

type aggregatorTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : aggregatorPausableEntrypointType;
    empty             : unit
];

// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type observationCommitsType      is map (address, bytes);
type observationRevealsType      is map (address, nat);
type deviationTriggerBanType     is map (address, timestamp);

type oracleAddressesType         is map (address, bool);
type oracleRewardStakedMvkType   is map (address, nat);
type oracleRewardXtzType         is map (address, nat);

type aggregatorConfigType is [@layout:comb] record [
    decimals                            : nat;
    numberBlocksDelay                   : nat;

    deviationTriggerBanDuration         : nat;
    perThousandDeviationTrigger         : nat;
    percentOracleThreshold              : nat;

    requestRateDeviationDepositFee      : nat;

    deviationRewardStakedMvk            : nat;
    deviationRewardAmountXtz            : nat;
    rewardAmountStakedMvk               : nat;
    rewardAmountXtz                     : nat;
];

type aggregatorBreakGlassConfigType is [@layout:comb] record [
    requestRateUpdateIsPaused           : bool;
    requestRateUpdateDeviationIsPaused  : bool;
    setObservationCommitIsPaused        : bool;
    setObservationRevealIsPaused        : bool;
    withdrawRewardXtzIsPaused           : bool;
    withdrawRewardStakedMvkIsPaused     : bool;
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------

type aggregatorLambdaActionType is 

    // Housekeeping Entrypoints
  | LambdaSetAdmin                      of (address)
  | LambdaSetGovernance                 of (address)
  | LambdaSetMaintainer                 of (address)
  | LambdaSetName                       of (string)
  | LambdaUpdateMetadata                of updateMetadataType
  | LambdaUpdateConfig                  of aggregatorUpdateConfigParamsType
  | LambdaUpdateWhitelistContracts      of updateWhitelistContractsType
  | LambdaUpdateGeneralContracts        of updateGeneralContractsType

    // Oracle Admin Entrypoints
  | LambdaAddOracle                     of addOracleType
  | LambdaRemoveOracle                  of removeOracleType

    // Pause / Break Glass Entrypoints
  | LambdaPauseAll                      of (unit)
  | LambdaUnpauseAll                    of (unit)
  | LambdaTogglePauseEntrypoint         of aggregatorTogglePauseEntrypointType

    // Oracle Entrypoints
  | LambdaRequestRateUpdate             of requestRateUpdateType
  | LambdaRequestRateUpdDeviation       of requestRateUpdateDeviationType
  | LambdaSetObservationCommit          of setObservationCommitType
  | LambdaSetObservationReveal          of setObservationRevealType
  
    // Reward Entrypoints
  | LambdaWithdrawRewardXtz             of withdrawRewardXtzType
  | LambdaWithdrawRewardStakedMvk       of withdrawRewardStakedMvkType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type aggregatorStorageType is [@layout:comb] record [
    
    admin                     : address;
    metadata                  : metadataType;
    name                      : string;
    config                    : aggregatorConfigType;
    breakGlassConfig          : aggregatorBreakGlassConfigType;

    maintainer                : address;
    mvkTokenAddress           : address;
    governanceAddress         : address;

    whitelistContracts        : whitelistContractsType;      
    generalContracts          : generalContractsType;

    round                     : nat;
    roundStart                : timestamp;
    switchBlock               : nat;

    oracleAddresses           : oracleAddressesType;
    
    deviationTriggerInfos     : deviationTriggerInfosType;
    lastCompletedRoundPrice   : lastCompletedRoundPriceType;

    observationCommits        : observationCommitsType;
    observationReveals        : observationRevealsType;
    deviationTriggerBan       : deviationTriggerBanType;

    oracleRewardStakedMvk     : oracleRewardStakedMvkType;
    oracleRewardXtz           : oracleRewardXtzType;
    
    lambdaLedger              : lambdaLedgerType;
];
