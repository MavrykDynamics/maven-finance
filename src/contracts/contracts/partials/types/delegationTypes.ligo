type onStakeChangeParams is (address)


type satelliteRewards is [@layout:comb] record [
    unpaid                                  : nat;
    paid                                    : nat;
    participationRewardsPerShare            : nat;
    satelliteAccumulatedRewardsPerShare     : nat; // 0n if delegate
    satelliteReferenceAddress               : address;
];

// record for users choosing satellites 
type delegateRecordType is [@layout:comb] record [
    satelliteAddress                : address;
    delegatedDateTime               : timestamp;
    delegatedSMvkBalance            : nat;
]
type delegateLedgerType is big_map (address, delegateRecordType)

type newSatelliteRecordType is [@layout:comb] record [
    name                  : string;
    description           : string;
    image                 : string;
    website               : string;
    satelliteFee          : nat;
]

type updateSatelliteRecordType is [@layout:comb] record [
    name                  : string;
    description           : string;
    image                 : string;
    website               : string;
    satelliteFee          : nat;
]

// record for satellites
type satelliteRecordType is [@layout:comb] record [
    status                : string;     // ACTIVE / SUSPENDED / BANNED
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    website               : string;     // satellite website if it has one
    
    registeredDateTime    : timestamp;  
]
type satelliteLedgerType is map (address, satelliteRecordType)

type satelliteRewardsLedgerType is big_map (address, satelliteRewards)

type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]

type delegationConfigType is [@layout:comb] record [
    minimumStakedMvkBalance             : nat;   // minimumStakedMvkBalance - minimum amount of staked MVK required to register as delegate (in muMVK)
    delegationRatio                     : nat;   // delegationRatio (tbd) -   percentage to determine if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated    
    maxSatellites                       : nat;   // 100 -> prevent any gaming of system with mass registration of satellites - can be changed through governance
    
    satelliteNameMaxLength              : nat;
    satelliteDescriptionMaxLength       : nat;
    satelliteImageMaxLength             : nat;
    satelliteWebsiteMaxLength           : nat;
]

type delegationBreakGlassConfigType is record [
    
    delegateToSatelliteIsPaused      : bool; 
    undelegateFromSatelliteIsPaused  : bool;

    registerAsSatelliteIsPaused      : bool;
    unregisterAsSatelliteIsPaused    : bool;

    updateSatelliteRecordIsPaused    : bool;

    distributeRewardIsPaused         : bool;
]

type delegationUpdateConfigNewValueType is nat
type delegationUpdateConfigActionType is 
  ConfigMinimumStakedMvkBalance of unit
| ConfigDelegationRatio         of unit
| ConfigMaxSatellites           of unit
| ConfigSatNameMaxLength        of unit
| ConfigSatDescMaxLength        of unit
| ConfigSatImageMaxLength       of unit
| ConfigSatWebsiteMaxLength     of unit
type delegationUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: delegationUpdateConfigNewValueType; 
  updateConfigAction: delegationUpdateConfigActionType;
]

type metadata is big_map (string, bytes);

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes;
]

type delegateToSatelliteType is [@layout:comb] record [
    userAddress      : address;
    satelliteAddress : address;
]

type distributeRewardTypes is [@layout:comb] record [
    eligibleSatellites    : set(address);
    totalSMvkReward       : nat;
]

type updateSatelliteStatusParamsType is [@layout:comb] record [
    satelliteAddress        : address;
    newStatus               : string;
]

type setLambdaType is [@layout:comb] record [
      name                  : string;
      func_bytes            : bytes;
]
type lambdaLedgerType is map(string, bytes)

type delegationLambdaActionType is 

  // Housekeeping Lambdas
  LambdaSetAdmin                              of address
| LambdaSetGovernance                         of (address)
| LambdaUpdateMetadata                        of updateMetadataType
| LambdaUpdateConfig                          of delegationUpdateConfigParamsType
| LambdaUpdateWhitelistContracts              of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts                of updateGeneralContractsParams

  // Pause / Break Glass Lambdas
| LambdaPauseAll                              of (unit)
| LambdaUnpauseAll                            of (unit)
| LambdaPauseDelegateToSatellite              of (unit)
| LambdaPauseUndelegateSatellite              of (unit)
| LambdaPauseRegisterSatellite                of (unit)
| LambdaPauseUnregisterSatellite              of (unit)
| LambdaPauseUpdateSatellite                  of (unit)
| LambdaPauseDistributeReward                 of (unit)

  // Delegation Lambdas
| LambdaDelegateToSatellite                   of delegateToSatelliteType
| LambdaUndelegateFromSatellite               of (address)

  // Satellite Lambdas
| LambdaRegisterAsSatellite                   of newSatelliteRecordType
| LambdaUnregisterAsSatellite                 of (address)
| LambdaUpdateSatelliteRecord                 of updateSatelliteRecordType
| LambdaDistributeReward                      of distributeRewardTypes

  // General Lambdas
| LambdaOnStakeChange                         of onStakeChangeParams
| LambdaUpdateSatelliteStatus                 of updateSatelliteStatusParamsType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------
type distributeRewardsTypes is [@layout:comb] record [
    eligibleSatellites    : set(address);
    totalSMvkReward       : nat;
]

type delegationStorage is [@layout:comb] record [
    admin                   : address;
    metadata                : metadata;
    config                  : delegationConfigType;

    mvkTokenAddress         : address;
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;

    breakGlassConfig        : delegationBreakGlassConfigType;
    delegateLedger          : delegateLedgerType;
    satelliteLedger         : satelliteLedgerType;
    satelliteRewardsLedger  : satelliteRewardsLedgerType;

    lambdaLedger            : lambdaLedgerType;   
]
