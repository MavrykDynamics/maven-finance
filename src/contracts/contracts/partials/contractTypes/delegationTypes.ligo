// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type satelliteRewardsType is [@layout:comb] record [
    unpaid                                  : nat;
    paid                                    : nat;
    participationRewardsPerShare            : nat;
    satelliteAccumulatedRewardsPerShare     : nat;      // 0n if delegate
    satelliteReferenceAddress               : address;
    referenceGovernanceCycleId              : nat;      // governance cycle id reference
    tracked                                 : bool;     // if rewards have started to be tracked
];
type satelliteRewardsLedgerType is big_map (address, satelliteRewardsType)

// record for users delegating to satellites 
type delegateRecordType is [@layout:comb] record [
    satelliteAddress                : address;
    satelliteRegisteredDateTime     : timestamp;
    delegatedDateTime               : timestamp;
    delegatedStakedMvkBalance       : nat;
]
type delegateLedgerType is big_map (address, delegateRecordType)

type satelliteRecordType is [@layout:comb] record [
    status                : string;     // ACTIVE / INACTIVE / SUSPENDED / BANNED
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    website               : string;     // satellite website if it has one
    
    registeredDateTime    : timestamp;  

    oraclePublicKey       : key;        // oracle public key
    oraclePeerId          : string;     // oracle peer id
]
type satelliteLedgerType is big_map (address, satelliteRecordType)

type satelliteSnapshotRecordType is [@layout:comb] record [
    totalStakedMvkBalance     : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
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
    
    delegateToSatelliteIsPaused         : bool; 
    undelegateFromSatelliteIsPaused     : bool;

    registerAsSatelliteIsPaused         : bool;
    unregisterAsSatelliteIsPaused       : bool;

    updateSatelliteRecordIsPaused       : bool;
    distributeRewardIsPaused            : bool;
    takeSatellitesSnapshotPaused        : bool;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type delegationUpdateConfigNewValueType is nat
type delegationUpdateConfigActionType is 
        ConfigMinimumStakedMvkBalance of unit
    |   ConfigDelegationRatio         of unit
    |   ConfigMaxSatellites           of unit
    |   ConfigSatNameMaxLength        of unit
    |   ConfigSatDescMaxLength        of unit
    |   ConfigSatImageMaxLength       of unit
    |   ConfigSatWebsiteMaxLength     of unit

type delegationUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : delegationUpdateConfigNewValueType; 
    updateConfigAction      : delegationUpdateConfigActionType;
]

type delegateToSatelliteType is [@layout:comb] record [
    userAddress             : address;
    satelliteAddress        : address;
]

type distributeRewardStakedMvkType is [@layout:comb] record [
    eligibleSatellites      : set(address);
    totalStakedMvkReward    : nat;
]

type takeSatellitesSnapshotType is set(address)

type updateSatelliteStatusParamsType is [@layout:comb] record [
    satelliteAddress        : address;
    newStatus               : string;
]

type registerAsSatelliteParamsType is [@layout:comb] record [
    name                    : string;
    description             : string;
    image                   : string;
    website                 : string;
    satelliteFee            : nat;

    oraclePublicKey         : option(key);        
    oraclePeerId            : option(string);     
]


type updateSatelliteRecordType is [@layout:comb] record [
    name                    : string;
    description             : string;
    image                   : string;
    website                 : string;
    satelliteFee            : nat;

    oraclePublicKey         : option(key);        
    oraclePeerId            : option(string);     
]

type delegationPausableEntrypointType is
        DelegateToSatellite             of bool
    |   UndelegateFromSatellite         of bool
    |   RegisterAsSatellite             of bool
    |   UnregisterAsSatellite           of bool
    |   UpdateSatelliteRecord           of bool
    |   DistributeReward                of bool
    |   TakeSatellitesSnapshot          of bool

type delegationTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : delegationPausableEntrypointType;
    empty             : unit
];

type onStakeChangeType is set((address * nat)) // 0: user address, 1: reference smvk balance


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type delegationLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                              of address
    |   LambdaSetGovernance                         of (address)
    |   LambdaUpdateMetadata                        of updateMetadataType
    |   LambdaUpdateConfig                          of delegationUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts              of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts                of updateGeneralContractsType
    |   LambdaMistakenTransfer                      of transferActionType

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                              of (unit)
    |   LambdaUnpauseAll                            of (unit)
    |   LambdaTogglePauseEntrypoint                 of delegationTogglePauseEntrypointType

        // Delegation Lambdas
    |   LambdaDelegateToSatellite                   of delegateToSatelliteType
    |   LambdaUndelegateFromSatellite               of (address)

        // Satellite Lambdas
    |   LambdaRegisterAsSatellite                   of registerAsSatelliteParamsType
    |   LambdaUnregisterAsSatellite                 of (address)
    |   LambdaUpdateSatelliteRecord                 of updateSatelliteRecordType
    |   LambdaDistributeReward                      of distributeRewardStakedMvkType
    |   LambdaTakeSatelliteSnapshot                 of takeSatellitesSnapshotType

        // General Lambdas
    |   LambdaOnStakeChange                         of onStakeChangeType
    |   LambdaUpdateSatelliteStatus                 of updateSatelliteStatusParamsType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type delegationStorageType is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    config                  : delegationConfigType;

    mvkTokenAddress         : address;
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;

    breakGlassConfig        : delegationBreakGlassConfigType;
    delegateLedger          : delegateLedgerType;
    satelliteLedger         : satelliteLedgerType;
    satelliteCounter        : nat;
    satelliteRewardsLedger  : satelliteRewardsLedgerType;

    lambdaLedger            : lambdaLedgerType;   
]
