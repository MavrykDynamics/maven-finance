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
    approvalPercentage                  : nat;  // threshold for satellite governance to be approved: 67% of total staked MVN supply
    satelliteActionDurationInDays       : nat;  // duration of satellite governance before expiry
    governancePurposeMaxLength          : nat;
    maxActionsPerSatellite              : nat;
]

type governanceSatelliteActionRecordType is [@layout:comb] record [
    initiator                          : address;
    status                             : bool;     // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                           : bool;     // false on creation; set to true when financial request is executed successfully
    
    governanceType                     : string;   // "SUSPEND", "BAN", "RESTORE", "REMOVE_ALL_SATELLITE_ORACLES", "ADD_ORACLE_TO_AGGREGATOR", "REMOVE_ORACLE_IN_AGGREGATOR", "TOGGLE_PAUSE_AGGREGATOR"
    governancePurpose                  : string;

    dataMap                            : dataMapType;

    yayVoteStakedMvnTotal              : nat;
    nayVoteStakedMvnTotal              : nat;
    passVoteStakedMvnTotal             : nat;

    governanceCycleId                  : nat;
    snapshotStakedMvnTotalSupply       : nat;
    stakedMvnPercentageForApproval     : nat; 
    stakedMvnRequiredForApproval       : nat; 

    startDateTime                      : timestamp;           
    expiryDateTime                     : timestamp;
    executedDateTime                   : option(timestamp);
]
type governanceSatelliteActionLedgerType is big_map (actionIdType, governanceSatelliteActionRecordType);


type subscribedAggregatorsType is map(address, timestamp)
type satelliteAggregatorLedgerType is big_map(address, subscribedAggregatorsType) // map of aggregators that satellite oracle is providing service for


type satelliteActionsType is big_map((nat * address), set(actionIdType)); // key: (governance cycle id * satellite address)

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type governanceSatelliteUpdateConfigNewValueType is nat
type governanceSatelliteUpdateConfigActionType is 
        ConfigApprovalPercentage          of unit
    |   ConfigActionDurationInDays        of unit
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
    dropActionId                : actionIdType;
]

type voteForActionType is [@layout:comb] record [
    actionId                    : actionIdType;
    vote                        : voteType;
]

type setAggregatorReferenceType is [@layout:comb] record [
    aggregatorAddress       : address;
    oldName                 : string;
    newName                 : string;
]

type togglePauseAggregatorVariantType is
        PauseAll        of unit
    |   UnpauseAll      of unit

type togglePauseAggregatorActionType is [@layout:comb] record [
    aggregatorAddress           : address;
    purpose                     : string;
    status                      : togglePauseAggregatorVariantType;
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
    |   LambdaSetAggregatorReference        of setAggregatorReferenceType
    |   LambdaTogglePauseAggregator         of togglePauseAggregatorActionType

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

    mvnTokenAddress                         : address;
    governanceAddress                       : address; 

    whitelistContracts                      : whitelistContractsType;      
    generalContracts                        : generalContractsType;
    
    // governance satellite storage 
    governanceSatelliteActionLedger         : governanceSatelliteActionLedgerType;
    governanceSatelliteCounter              : nat;
    governanceSatelliteVoters               : votersType;

    // spam check
    satelliteActions                        : satelliteActionsType;

    // satellites (oracles) and aggregators
    satelliteAggregatorLedger               : satelliteAggregatorLedgerType;
    aggregatorLedger                        : big_map(string, address);

    // lambda storage
    lambdaLedger                            : lambdaLedgerType; 
            
]
