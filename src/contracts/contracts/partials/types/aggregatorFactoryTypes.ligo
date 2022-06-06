type setAdminParams is address;
type metadataType is big_map (string, bytes);
type lambdaLedgerType is map(string, bytes)

type trackedAggregatorsType is map (string * string, address)

type trackAggregatorParamsType is [@layout:comb] record [
  pairFirst           : string;
  pairSecond          : string;
  aggregatorAddress   : address;
]

type untrackAggregatorParamsType is [@layout:comb] record [
  pairFirst           : string;
  pairSecond          : string;
]


// rewards type
type distributeRewardStakedMvkType is [@layout:comb] record [
    eligibleSatellites    : set(address);
    totalStakedMvkReward  : nat;
]
type distributeRewardXtzType is [@layout:comb] record [
    recipient             : address;
    reward                : nat;
]

type aggregatorFactoryBreakGlassConfigType is [@layout:comb] record [
    createAggregatorIsPaused     : bool;
    trackAggregatorIsPaused      : bool;
    untrackAggregatorIsPaused    : bool;
    distributeRewardXtzIsPaused  : bool;
    distributeRewardMvkIsPaused  : bool;
]

type aggregatorMetadataType is [@layout:comb] record[
    name                     : string;
    description              : string;
    version                  : string;
    authors                  : string;
]

type createAggregatorParamsType is string * string * [@layout:comb] record[
  oracleAddresses   : oracleAddressesType;
  aggregatorConfig  : aggregatorConfigType;
  admin             : adminType;
];

type createAggregatorFuncType is (option(key_hash) * tez * aggregatorStorage) -> (operation * address);
const createAggregatorFunc: createAggregatorFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../../compiled/aggregator.tz"
        ;
          PAIR } |}
: createAggregatorFuncType)];

type updateAggregatorConfigParamsType is [@layout:comb] record [
  satelliteAddress: address;
  aggregatorConfig: aggregatorConfigType;
];

type updateAggregatorAdminParamsType is [@layout:comb] record [
  satelliteAddress: address;
  adminAddress: address;
];

type registerAggregatorActionType is [@layout:comb] record [
  aggregatorPair                : string * string;        // e.g. BTC-USD  
  aggregatorAddress             : address; 
]

type aggregatorFactoryLambdaActionType is 
    
    // Housekeeping Lambdas
  | LambdaSetAdmin                      of (address)
  | LambdaSetGovernance                 of (address)
  | LambdaUpdateMetadata                of updateMetadataType
  | LambdaUpdateWhitelistContracts      of updateWhitelistContractsParams
  | LambdaUpdateGeneralContracts        of updateGeneralContractsParams

      // Pause / Break Glass Entrypoints
  | LambdaPauseAll                      of (unit)
  | LambdaUnpauseAll                    of (unit)
  | LambdaTogglePauseCreateAgg          of (unit)
  | LambdaTogglePauseTrackAgg           of (unit)
  | LambdaTogglePauseUntrackAgg         of (unit)
  | LambdaTogglePauseDisRewardXtz       of (unit)
  | LambdaTogglePauseDisRewardSMvk      of (unit)

    // Aggregator Factory Lambdas
  | LambdaCreateAggregator              of createAggregatorParamsType
  | LambdaTrackAggregator               of trackAggregatorParamsType
  | LambdaUntrackAggregator             of untrackAggregatorParamsType

    // Aggregator Lambdas
  | LambdaDistributeRewardXtz           of distributeRewardXtzType
  | LambdaDistributeRewardStakedMvk     of distributeRewardStakedMvkType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type aggregatorFactoryStorage is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    breakGlassConfig        : aggregatorFactoryBreakGlassConfigType;

    mvkTokenAddress         : address;
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;
    
    trackedAggregators      : trackedAggregatorsType;

    lambdaLedger            : lambdaLedgerType;
    aggregatorLambdaLedger  : lambdaLedgerType;
]