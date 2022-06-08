type adminType is address;
type maintainerType is address;

type metadataType is big_map (string, bytes);

type observationCommitsType      is map (address, bytes);
type observationRevealsType      is map (address, nat);

type pivotedObservationsType     is map (nat, nat);
type oracleAddressesType         is map (address, bool);
type oracleRewardStakedMvkType   is map (address, nat);
type oracleRewardXtzType         is map (address, nat);

// rewards type
type distributeRewardMvkType is [@layout:comb] record [
    eligibleSatellites          : set(address);
    totalStakedMvkReward        : nat;
]
type distributeRewardXtzType is [@layout:comb] record [
    recipient                   : address;
    reward                      : nat;
]

type deviationTriggerInfosType is  [@layout:comb] record [
    oracleAddress               : address;
    amount                      : tez;
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

type aggregatorConfigType is [@layout:comb] record [
    nameMaxLength                       : nat;
    decimals                            : nat;
    numberBlocksDelay                   : nat;

    minimalTezosAmountDeviationTrigger  : nat;
    perThousandDeviationTrigger         : nat;
    percentOracleThreshold              : nat;
    
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

type setAdminParams                     is address;
type withdrawRewardXtzParams            is address;
type withdrawRewardStakedMvkParams      is address;

type isWhiteListedContractParams        is address;
type addOracleParams                    is address;
type removeOracleParams                 is address;

type requestRateUpdateParams            is unit;
type requestRateUpdateDeviationParams   is setObservationCommitType;
type setObservationCommitParams         is setObservationCommitType;
type setObservationRevealParams         is setObservationRevealType;

(* updateConfig entrypoint inputs *)
type aggregatorUpdateConfigNewValueType is nat
type aggregatorUpdateConfigActionType is 
  ConfigNameMaxLength             of unit
| ConfigDecimals                  of unit
| ConfigNumberBlocksDelay         of unit

| ConfigMinTezosAmountDevTrigger  of unit
| ConfigPerThousandDevTrigger     of unit
| ConfigPercentOracleThreshold    of unit

| ConfigDeviationRewardAmountXtz  of unit
| ConfigRewardAmountStakedMvk     of unit
| ConfigRewardAmountXtz           of unit

type aggregatorUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : aggregatorUpdateConfigNewValueType; 
  updateConfigAction    : aggregatorUpdateConfigActionType;
]


type transferDestination is [@layout:comb] record[
  to_       : address;
  token_id  : nat;
  amount    : nat;
];

type transfer is [@layout:comb] record[
  from_     : address;
  txs       : list(transferDestination);
];

type newTransferType is list(transfer);
type satelliteRecordType is [@layout:comb] record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    website               : string;     // satellite website if it has one
    
    registeredDateTime    : timestamp;  
]

type updateMetadataType is [@layout:comb] record [
    metadataKey           : string;
    metadataHash          : bytes; 
]

type setLambdaType is [@layout:comb] record [
    name                  : string;
    func_bytes            : bytes;
]
type lambdaLedgerType is map(string, bytes)

type aggregatorLambdaActionType is 

    // Housekeeping Entrypoints
  | LambdaSetAdmin                      of setAdminParams
  | LambdaSetGovernance                 of (address)
  | LambdaSetMaintainer                 of (address)
  | LambdaUpdateMetadata                of updateMetadataType
  | LambdaUpdateConfig                  of aggregatorUpdateConfigParamsType
  | LambdaUpdateWhitelistContracts      of updateWhitelistContractsParams
  | LambdaUpdateGeneralContracts        of updateGeneralContractsParams

    // Oracle Admin Entrypoints
  | LambdaAddOracle                     of addOracleParams
  | LambdaRemoveOracle                  of address

    // Pause / Break Glass Entrypoints
  | LambdaPauseAll                      of (unit)
  | LambdaUnpauseAll                    of (unit)
  | LambdaTogglePauseReqRateUpd         of (unit)
  | LambdaTogglePauseReqRateUpdDev      of (unit)
  | LambdaTogglePauseSetObsCommit       of (unit)
  | LambdaTogglePauseSetObsReveal       of (unit)
  | LambdaTogglePauseRewardXtz          of (unit)
  | LambdaTogglePauseRewardSMvk         of (unit)

    // Oracle Entrypoints
  | LambdaRequestRateUpdate             of requestRateUpdateParams
  | LambdaRequestRateUpdDeviation       of requestRateUpdateDeviationParams
  | LambdaSetObservationCommit          of setObservationCommitParams
  | LambdaSetObservationReveal          of setObservationRevealParams
  
    // Reward Entrypoints
  | LambdaWithdrawRewardXtz             of withdrawRewardXtzParams
  | LambdaWithdrawRewardStakedMvk       of withdrawRewardStakedMvkParams

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type aggregatorStorage is [@layout:comb] record [
    
    admin                     : adminType;
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

    oracleRewardStakedMvk     : oracleRewardStakedMvkType;
    oracleRewardXtz           : oracleRewardXtzType;
    
    lambdaLedger              : lambdaLedgerType;
];
