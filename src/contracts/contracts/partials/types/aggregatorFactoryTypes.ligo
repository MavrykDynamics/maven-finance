type setAdminParams is address;
type metadataType is big_map (string, bytes);
type lambdaLedgerType is map(string, bytes)

type trackedAggregatorsType is map (string * string, address);
type trackedSatelliteType is set (address);

type aggregatorFactoryBreakGlassConfigType is [@layout:comb] record [
    createAggregatorIsPaused     : bool;
    trackAggregatorIsPaused      : bool;
    untrackAggregatorIsPaused    : bool;
]

type aggregatorMetadataType is [@layout:comb] record[
    name                     : string;
    description              : string;
    version                  : string;
    authors                  : string;
]

type createAggregatorParamsType is string * string * [@layout:comb] record[
  oracleAddresses: oracleAddressesType;
  aggregatorConfig: aggregatorConfigType;
  admin: adminType;
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

type aggregatorFactoryLambdaActionType is 
    
    // Housekeeping Lambdas
  | LambdaSetAdmin                    of (address)
  | LambdaSetGovernance               of (address)
  | LambdaUpdateMetadata              of updateMetadataType

      // Pause / Break Glass Entrypoints
  | LambdaPauseAll                    of (unit)
  | LambdaUnpauseAll                  of (unit)
  | LambdaTogglePauseCreateAgg        of (unit)
  | LambdaTogglePauseTrackAgg         of (unit)
  | LambdaTogglePauseUntrackAgg       of (unit)

    // Aggregator Factory Lambdas
  | LambdaCreateAggregator            of createAggregatorParamsType
  | LambdaAddSatellite                of (address)
  | LambdaBanSatellite                of (address)
  | LambdaUpdateAggregatorConfig      of updateAggregatorConfigParamsType
  | LambdaUpdateAggregatorAdmin       of updateAggregatorAdminParamsType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type aggregatorFactoryStorage is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    breakGlassConfig        : aggregatorFactoryBreakGlassConfigType;

    mvkTokenAddress         : address;
    delegationAddress       : address;
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;
    
    trackedAggregators      : trackedAggregatorsType;
    trackedSatellites       : trackedSatelliteType;

    lambdaLedger            : lambdaLedgerType;
    aggregatorLambdaLedger  : lambdaLedgerType;
]