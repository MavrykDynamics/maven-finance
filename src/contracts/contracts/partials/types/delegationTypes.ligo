type onStakeChangeParams is (address * nat * nat)
type updateSatelliteRecordParams is (string * string * string * nat)

// record for users choosing satellites 
type delegateRecordType is record [
    satelliteAddress     : address;
    delegatedDateTime    : timestamp;  
    // fee -> custom delegate fee for satellite
]
type delegateLedgerType is big_map (address, delegateRecordType)

// todo: add pointsystem

type newSatelliteRecordType is (string * string * string * nat) // name, description, image, satellite fee

// record for satellites
type satelliteRecordType is record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    
    registeredDateTime    : timestamp;  

    // bondSufficiency       : nat;        // bond sufficiency flag - set to 1 if satellite has enough bond; set to 0 if satellite has not enough bond (over-delegated) when checked on governance action    
]
type satelliteLedgerType is map (address, satelliteRecordType)

type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]

type delegationConfigType is record [
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
| ConfigDelegationRatio of unit
| ConfigMaxSatellites of unit
type delegationUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: delegationUpdateConfigNewValueType; 
  updateConfigAction: delegationUpdateConfigActionType;
]

type metadata is big_map (string, bytes);

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
]
