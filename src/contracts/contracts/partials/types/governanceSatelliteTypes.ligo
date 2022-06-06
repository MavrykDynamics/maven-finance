type counterIdType is nat
type metadataType is big_map (string, bytes)
type lambdaLedgerType is map(string, bytes)

// ------------------------------------------------------------------------------
// Satellite Types
// ------------------------------------------------------------------------------


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


// ------------------------------------------------------------------------------
// Config Types
// ------------------------------------------------------------------------------


type governanceSatelliteConfigType is [@layout:comb] record [
    governanceSatelliteApprovalPercentage  : nat;  // threshold for satellite governance to be approved: 67% of total staked MVK supply
    governanceSatelliteDurationInDays      : nat;  // duration of satellite governance before expiry
    governancePurposeMaxLength             : nat;
    votingPowerRatio                       : nat;  // votingPowerRatio (e.g. 10% -> 10_000) - percentage to determine satellie's max voting power and if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated - similar to self-bond percentage in tezos
]

// ------------------------------------------------------------------------------
// Governance Satellite Record Types
// ------------------------------------------------------------------------------

type governanceSatelliteVoteChoiceType is 
  Yay    of unit
| Nay    of unit
| Pass   of unit

type governanceSatelliteVoteType is [@layout:comb] record [
  vote              : governanceSatelliteVoteChoiceType;
  totalVotingPower  : nat; 
  timeVoted         : timestamp;
] 

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type governanceSatelliteVotersMapType is map (address, governanceSatelliteVoteType)

type governanceSatelliteActionRecordType is [@layout:comb] record [
    initiator                          : address;
    status                             : bool;                  // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                           : bool;                  // false on creation; set to true when financial request is executed successfully
    
    governanceType                     : string;                // "SUSPEND", "UNSUSPEND", "BAN", "UNBAN", "REMOVE_ALL_SATELLITE_ORACLES", "ADD_ORACLE_TO_AGGREGATOR", "REMOVE_ORACLE_IN_AGGREGATOR", "UPDATE_AGGREGATOR_STATUS"
    governancePurpose                  : string;
    voters                             : governanceSatelliteVotersMapType; 

    addressMap                         : addressMapType;
    stringMap                          : stringMapType;
    natMap                             : natMapType;

    yayVoteTotal                       : nat;
    nayVoteTotal                       : nat;
    passVoteTotal                      : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    startDateTime                      : timestamp;           
    expiryDateTime                     : timestamp;               
]
type governanceSatelliteActionLedgerType is big_map (nat, governanceSatelliteActionRecordType);


type oracleAggregatorPairRecord is [@layout:comb] record [
  aggregatorPair     : (string * string);   // e.g. BTC-USD
  aggregatorAddress  : address; 
  startDateTime      : timestamp;   
]
type aggregatorPairsMapType is map(address, oracleAggregatorPairRecord)
type satelliteOracleRecordType is [@layout:comb] record [
  aggregatorsSubscribed  : nat;                       // total number of aggregators that satellite is providing data for
  aggregatorPairs        : aggregatorPairsMapType;    // map of aggregators that satellite oracle is providing service for
]
type satelliteOracleLedgerType is big_map(address, satelliteOracleRecordType)


type aggregatorRecordType is [@layout:comb] record [
  aggregatorPair     : (string * string);   // e.g. BTC , USD
  status             : string;              // ACTIVE / INACTIVE
  createdTimestamp   : timestamp; 
  oracles            : set(address);
]
type aggregatorLedgerType is big_map(address, aggregatorRecordType)

// ------------------------------------------------------------------------------
// Snapshot Types
// ------------------------------------------------------------------------------

type governanceSatelliteSnapshotRecordType is [@layout:comb] record [
    totalStakedMvkBalance     : nat;      // log of satellite's total staked mvk balance for this counter
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
]
type governanceSatelliteSnapshotMapType is map (address, governanceSatelliteSnapshotRecordType)
type governanceSatelliteSnapshotLedgerType is big_map (counterIdType, governanceSatelliteSnapshotMapType);

type actionSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    actionId              : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]


// ------------------------------------------------------------------------------
// Action Parameter Types
// ------------------------------------------------------------------------------

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type governanceSatelliteUpdateConfigNewValueType is nat
type governanceSatelliteUpdateConfigActionType is 
  ConfigApprovalPercentage          of unit
| ConfigSatelliteDurationInDays     of unit
| ConfigPurposeMaxLength            of unit
| ConfigVotingPowerRatio            of unit

type governanceSatelliteUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : governanceSatelliteUpdateConfigNewValueType; 
  updateConfigAction    : governanceSatelliteUpdateConfigActionType;
]


type suspendSatelliteActionType is [@layout:comb] record [
    satelliteToBeSuspended      : address;
    purpose                     : string;
]

type unsuspendSatelliteActionType is [@layout:comb] record [
    satelliteToBeUnsuspended    : address;
    purpose                     : string;
]

type banSatelliteActionType is [@layout:comb] record [
    satelliteToBeBanned         : address;
    purpose                     : string;
]

type unbanSatelliteActionType is [@layout:comb] record [
    satelliteToBeUnbanned       : address;
    purpose                     : string;
]

type removeAllSatelliteOraclesActionType is [@layout:comb] record [
    satelliteAddress            : address;
    purpose                     : string;
]

type addOracleToAggregatorActionType is [@layout:comb] record [
    oracleAddress               : address;
    aggregatorAddress           : address;
    purpose                     : string;
]

type removeOracleInAggregatorActionType is [@layout:comb] record [
    oracleAddress               : address;
    aggregatorAddress           : address;
    purpose                     : string;
]


type dropActionType is [@layout:comb] record [
    dropActionId                : nat;
]

type voteForActionType is [@layout:comb] record [
    actionId                    : nat;
    vote                        : governanceSatelliteVoteChoiceType;
]

type registerAggregatorActionType is [@layout:comb] record [
  aggregatorPair                : string * string;        // e.g. BTC-USD  
  aggregatorAddress             : address; 
]

type updateAggregatorStatusActionType is [@layout:comb] record [
  aggregatorAddress             : address;      
  status                        : string;
  purpose                       : string;
]

type updateSatelliteStatusParamsType is [@layout:comb] record [
    satelliteAddress        : address;
    newStatus               : string;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type governanceSatelliteLambdaActionType is 

  // Housekeeping Lambdas
| LambdaSetAdmin                      of address
| LambdaSetGovernance                 of address
| LambdaUpdateMetadata                of updateMetadataType
| LambdaUpdateConfig                  of governanceSatelliteUpdateConfigParamsType
| LambdaUpdateWhitelistContracts      of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts        of updateGeneralContractsParams

  // Satellite Governance
| LambdaSuspendSatellite              of suspendSatelliteActionType
| LambdaUnsuspendSatellite            of unsuspendSatelliteActionType
| LambdaBanSatellite                  of banSatelliteActionType
| LambdaUnbanSatellite                of unbanSatelliteActionType

  // Satellite Oracle Governance
| LambdaRemoveAllSatelliteOracles     of removeAllSatelliteOraclesActionType
| LambdaAddOracleToAggregator         of addOracleToAggregatorActionType
| LambdaRemoveOracleInAggregator      of removeOracleInAggregatorActionType

  // Aggregator Governance
| LambdaRegisterAggregator            of registerAggregatorActionType     // callback from aggregator factory in creating aggregator contract
| LambdaUpdateAggregatorStatus        of updateAggregatorStatusActionType

  // Governance Actions
| LambdaVoteForAction                 of voteForActionType
| LambdaDropAction                    of dropActionType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceSatelliteStorage is record [
    admin                                   : address;
    metadata                                : metadataType;
    config                                  : governanceSatelliteConfigType;

    mvkTokenAddress                         : address;
    governanceAddress                       : address; 

    whitelistContracts                      : whitelistContractsType;      
    generalContracts                        : generalContractsType;
    
    // governance satellite storage 
    governanceSatelliteActionLedger         : governanceSatelliteActionLedgerType;
    governanceSatelliteSnapshotLedger       : governanceSatelliteSnapshotLedgerType;
    governanceSatelliteCounter              : nat;

    // satellite oracles and aggregators
    satelliteOracleLedger                   : satelliteOracleLedgerType;
    aggregatorLedger                        : aggregatorLedgerType;

    // lambda storage
    lambdaLedger                            : lambdaLedgerType;             
]