type counterIdType is nat
type metadataType is big_map (string, bytes)
type lambdaLedgerType is map(string, bytes)

// ------------------------------------------------------------------------------
// Satellite Types
// ------------------------------------------------------------------------------


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


// ------------------------------------------------------------------------------
// Config Types
// ------------------------------------------------------------------------------


type governanceSatelliteConfigType is [@layout:comb] record [
    governanceSatelliteApprovalPercentage  : nat;  // threshold for satellite governance to be approved: 67% of total staked MVK supply
    governanceSatelliteDurationInDays      : nat;  // duration of satellite governance before expiry
    governancePurposeMaxLength             : nat;
    votingPowerRatio                       : nat;  // todo: use view to get votingPowerRatio from governance contract
]

// ------------------------------------------------------------------------------
// Governance Satellite Record Types
// ------------------------------------------------------------------------------

type governanceSatelliteVoteChoiceType is 
  Approve of unit
| Disapprove of unit

type governanceSatelliteVoteType is [@layout:comb] record [
  vote              : governanceSatelliteVoteChoiceType;
  totalVotingPower  : nat; 
  timeVoted         : timestamp;
] 

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type governanceSatelliteVotersMapType is map (address, governanceSatelliteVoteType)

type governanceSatelliteRecordType is [@layout:comb] record [
    initiator                          : address;
    status                             : bool;                  // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                           : bool;                  // false on creation; set to true when financial request is executed successfully
    
    governanceType                     : string;                // "MINT" or "TRANSFER"
    governancePurpose                  : string;
    voters                             : governanceSatelliteVotersMapType; 

    addressMap                         : addressMapType;
    stringMap                          : stringMapType;
    natMap                             : natMapType;

    approveVoteTotal                   : nat;
    disapproveVoteTotal                : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    startDateTime                      : timestamp;           
    expiryDateTime                     : timestamp;               
]
type governanceSatelliteLedgerType is big_map (nat, governanceSatelliteRecordType);


// ------------------------------------------------------------------------------
// Snapshot Types
// ------------------------------------------------------------------------------


type governanceSatelliteSnapshotRecordType is [@layout:comb] record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this counter
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
    dropActionId      : nat;
    purpose           : string;
]


type voteForActionType is [@layout:comb] record [
    actionId         : nat;
    vote             : governanceSatelliteVoteChoiceType;
    purpose          : string;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type governanceSatelliteLambdaActionType is 

  // Housekeeping Lambdas
| LambdaSetAdmin                      of address
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
    governanceProxyAddress                  : address; 

    whitelistContracts                      : whitelistContractsType;      
    generalContracts                        : generalContractsType;
    
    // governance satellite storage 
    governanceSatelliteLedger               : governanceSatelliteLedgerType;
    governanceSatelliteSnapshotLedger       : governanceSatelliteSnapshotLedgerType;
    governanceSatelliteCounter              : nat;

    snapshotStakedMvkTotalSupply            : nat;             

    // lambda storage
    lambdaLedger                            : lambdaLedgerType;             
]