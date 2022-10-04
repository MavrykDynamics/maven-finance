// ------------------------------------------------------------------------------
// Required Partial Types
// ------------------------------------------------------------------------------


// Council Types
#include "../shared/councilActionTypes.ligo"

// Vote Types
#include "../shared/voteTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type governanceSatelliteConfigType is [@layout:comb] record [
    governanceSatelliteApprovalPercentage  : nat;  // threshold for satellite governance to be approved: 67% of total staked MVK supply
    governanceSatelliteDurationInDays      : nat;  // duration of satellite governance before expiry
    governancePurposeMaxLength             : nat;
    maxActionsPerSatellite                 : nat;
]

type governanceSatelliteActionRecordType is [@layout:comb] record [
    initiator                          : address;
    status                             : bool;     // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                           : bool;     // false on creation; set to true when financial request is executed successfully
    
    governanceType                     : string;   // "SUSPEND", "BAN", "RESTORE", "REMOVE_ALL_SATELLITE_ORACLES", "ADD_ORACLE_TO_AGGREGATOR", "REMOVE_ORACLE_IN_AGGREGATOR", "UPDATE_AGGREGATOR_STATUS"
    governancePurpose                  : string;
    voters                             : set(address);

    dataMap                            : dataMapType;

    yayVoteStakedMvkTotal              : nat;
    nayVoteStakedMvkTotal              : nat;
    passVoteStakedMvkTotal             : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    startDateTime                      : timestamp;           
    expiryDateTime                     : timestamp;               
]
type governanceSatelliteActionLedgerType is big_map (actionIdType, governanceSatelliteActionRecordType);


type oracleAggregatorPairRecordType is [@layout:comb] record [
    aggregatorPair     : (string * string);   // e.g. BTC-USD
    aggregatorAddress  : address; 
    startDateTime      : timestamp;   
]
type aggregatorPairsMapType is map(address, oracleAggregatorPairRecordType)
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


type actionsInitiatorsType is big_map(address, set(actionIdType));

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type governanceSatelliteUpdateConfigNewValueType is nat
type governanceSatelliteUpdateConfigActionType is 
        ConfigApprovalPercentage          of unit
    |   ConfigSatelliteDurationInDays     of unit
    |   ConfigPurposeMaxLength            of unit
    |   ConfigMaxActionsPerSatellite      of unit

type governanceSatelliteUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : governanceSatelliteUpdateConfigNewValueType; 
    updateConfigAction    : governanceSatelliteUpdateConfigActionType;
]


type suspendSatelliteActionType is [@layout:comb] record [
    satelliteToBeSuspended      : address;
    purpose                     : string;
]

type banSatelliteActionType is [@layout:comb] record [
    satelliteToBeBanned         : address;
    purpose                     : string;
]

type restoreSatelliteActionType is [@layout:comb] record [
    satelliteToBeRestored       : address;
    oraclePublicKey             : key;
    oraclePeerId                : string;
    purpose                     : string;
]

type removeAllSatelliteOraclesActionType is [@layout:comb] record [
    satelliteAddress            : address;
    purpose                     : string;
]

type addOracleToAggregatorActionType is [@layout:comb] record [
    oracleAddress               : address;
    oraclePublicKey             : key;
    oraclePeerId                : string;
    aggregatorAddress           : address;
    purpose                     : string;
]

type removeOracleInAggregatorActionType is [@layout:comb] record [
    oracleAddress               : address;
    aggregatorAddress           : address;
    purpose                     : string;
]


type dropActionType is [@layout:comb] record [
    dropActionId                : actionIdType;
]

type voteForActionType is [@layout:comb] record [
    actionId                    : actionIdType;
    vote                        : voteType;
]

type registerAggregatorActionType is [@layout:comb] record [
    aggregatorPair              : string * string;        // e.g. BTC-USD  
    aggregatorAddress           : address; 
]

type updateAggregatorStatusActionType is [@layout:comb] record [
    aggregatorAddress           : address;      
    status                      : string;
    purpose                     : string;
]

type updateSatelliteStatusParamsType is [@layout:comb] record [
    satelliteAddress            : address;
    newStatus                   : string;
]

type fixMistakenTransferParamsType is [@layout:comb] record [
    targetContractAddress   : address;
    purpose                 : string;
    transferList            : transferActionType;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type governanceSatelliteLambdaActionType is 

        // Housekeeping Lambdas
    |   LambdaSetAdmin                      of address
    |   LambdaSetGovernance                 of address
    |   LambdaUpdateMetadata                of updateMetadataType
    |   LambdaUpdateConfig                  of governanceSatelliteUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts      of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts        of updateGeneralContractsType
    |   LambdaMistakenTransfer              of transferActionType

        // Satellite Governance
    |   LambdaSuspendSatellite              of suspendSatelliteActionType
    |   LambdaBanSatellite                  of banSatelliteActionType
    |   LambdaRestoreSatellite              of restoreSatelliteActionType

        // Satellite Oracle Governance
    |   LambdaRemoveAllSatelliteOracles     of removeAllSatelliteOraclesActionType
    |   LambdaAddOracleToAggregator         of addOracleToAggregatorActionType
    |   LambdaRemoveOracleInAggregator      of removeOracleInAggregatorActionType

        // Aggregator Governance
    |   LambdaRegisterAggregator            of registerAggregatorActionType     // callback from aggregator factory in creating aggregator contract
    |   LambdaUpdateAggregatorStatus        of updateAggregatorStatusActionType

        // Mistaken Transfer Governance
    |   LambdaFixMistakenTransfer           of fixMistakenTransferParamsType

        // Governance Actions
    |   LambdaVoteForAction                 of voteForActionType
    |   LambdaDropAction                    of dropActionType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceSatelliteStorageType is record [

    admin                                   : address;
    metadata                                : metadataType;
    config                                  : governanceSatelliteConfigType;

    mvkTokenAddress                         : address;
    governanceAddress                       : address; 

    whitelistContracts                      : whitelistContractsType;      
    generalContracts                        : generalContractsType;
    
    // governance satellite storage 
    governanceSatelliteActionLedger         : governanceSatelliteActionLedgerType;
    governanceSatelliteCounter              : nat;
    governanceSatelliteVoters               : big_map((actionIdType*address), voteType);

    // spam check
    actionsInitiators                       : actionsInitiatorsType;

    // satellite oracles and aggregators
    satelliteOracleLedger                   : satelliteOracleLedgerType;
    aggregatorLedger                        : aggregatorLedgerType;

    // lambda storage
    lambdaLedger                            : lambdaLedgerType; 
            
]
