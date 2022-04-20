type onStakeChangeParams is (address)


// record for users choosing satellites 
type delegateRecordType is [@layout:comb] record [
    satelliteAddress      : address;
    delegatedDateTime     : timestamp;
    delegatedSMvkBalance  : nat;
]
type delegateLedgerType is big_map (address, delegateRecordType)

// type newSatelliteRecordType is (string * string * string * nat) // name, description, image, satellite fee
// type updateSatelliteRecordParams is (string * string * string * nat)

type newSatelliteRecordType is [@layout:comb] record [
    name                  : string;
    description           : string;
    image                 : string;
    satelliteFee          : nat;
]

type updateSatelliteRecordType is [@layout:comb] record [
    name                  : string;
    description           : string;
    image                 : string;
    satelliteFee          : nat;
]

// record for satellites
type satelliteRecordType is [@layout:comb] record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    
    registeredDateTime    : timestamp;  
]
type satelliteLedgerType is map (address, satelliteRecordType)

type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]

type delegationConfigType is [@layout:comb] record [
    minimumStakedMvkBalance   : nat;   // minimumStakedMvkBalance - minimum amount of staked MVK required to register as delegate (in muMVK)
    delegationRatio           : nat;   // delegationRatio (tbd) -   percentage to determine if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated    
    maxSatellites             : nat;   // 100 -> prevent any gaming of system with mass registration of satellites - can be changed through governance
]

type delegationBreakGlassConfigType is record [
    
    delegateToSatelliteIsPaused      : bool; 
    undelegateFromSatelliteIsPaused  : bool;

    registerAsSatelliteIsPaused      : bool;
    unregisterAsSatelliteIsPaused    : bool;

    updateSatelliteRecordIsPaused    : bool;
]

type delegationUpdateConfigNewValueType is nat
type delegationUpdateConfigActionType is 
  ConfigMinimumStakedMvkBalance of unit
| ConfigDelegationRatio         of unit
| ConfigMaxSatellites           of unit
type delegationUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: delegationUpdateConfigNewValueType; 
  updateConfigAction: delegationUpdateConfigActionType;
]

type metadata is big_map (string, bytes);

type setLambdaType is [@layout:comb] record [
      name                  : string;
      func_bytes            : bytes;
]
type lambdaLedgerType is big_map(string, bytes)

type delegationLambdaActionType is 
  LambdaSetAdmin                              of address
| LambdaUpdateMetadata                        of (string * bytes)
| LambdaUpdateConfig                          of delegationUpdateConfigParamsType
| LambdaUpdateWhitelistContracts              of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts                of updateGeneralContractsParams
| LambdaPauseAll                              of (unit)
| LambdaUnpauseAll                            of (unit)
| LambdaPauseDelegateToSatellite              of (unit)
| LambdaPauseUndelegateSatellite              of (unit)
| LambdaPauseRegisterSatellite                of (unit)
| LambdaPauseUnregisterSatellite              of (unit)
| LambdaPauseUpdateSatellite                  of (unit)
| LambdaDelegateToSatellite                   of (address)
| LambdaUndelegateFromSatellite               of (unit)
| LambdaRegisterAsSatellite                   of newSatelliteRecordType
| LambdaUnregisterAsSatellite                 of (unit)
| LambdaUpdateSatelliteRecord                 of updateSatelliteRecordType
| LambdaOnStakeChange                         of onStakeChangeParams

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type delegationStorage is [@layout:comb] record [
    admin                : address;
    mvkTokenAddress      : address;
    metadata             : metadata;
    
    config               : delegationConfigType;

    whitelistContracts   : whitelistContractsType;      
    generalContracts     : generalContractsType;

    breakGlassConfig     : delegationBreakGlassConfigType;
    delegateLedger       : delegateLedgerType;
    satelliteLedger      : satelliteLedgerType;

    lambdaLedger         : lambdaLedgerType;   
]
