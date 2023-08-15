// ------------------------------------------------------------------------------
// Required Partial Types
// ------------------------------------------------------------------------------


// Vote Types
#include "../shared/voteTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type emergencyGovernanceRecordType is [@layout:comb] record [
    proposerAddress                  : address;
    executed                         : bool;

    title                            : string;
    description                      : string;   
    totalStakedMvkVotes              : nat;              
    stakedMvkPercentageRequired      : nat;              // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
    stakedMvkRequiredForBreakGlass   : nat;              // capture state of min staked MVK vote required
    
    startDateTime                    : timestamp;
    startLevel                       : nat;              // block level of submission, used to order proposals
    executedDateTime                 : option(timestamp);
    executedLevel                    : option(nat);
    expirationDateTime               : timestamp;
]

type emergencyGovernanceVotersType is big_map(voterIdentifierType, (nat * timestamp)) // mvk amount, timestamp
type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type emergencyConfigType is record [
    decimals                          : nat;        // decimals used for percentages
    durationInMinutes                 : nat;        // duration of emergency governance before expiry
    requiredFeeMutez                  : tez;        // fee for triggering emergency control - e.g. 100 tez -> change to MVK 
    stakedMvkPercentageRequired       : nat;        // minimum staked MVK percentage amount required to activate break glass 
    minStakedMvkRequiredToVote        : nat;        // minimum staked MVK balance of user required to vote for emergency governance
    minStakedMvkRequiredToTrigger     : nat;        // minimum staked MVK balance of user to trigger emergency governance

    proposalTitleMaxLength            : nat;
    proposalDescMaxLength             : nat;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type emergencyUpdateConfigNewValueType is nat
type emergencyUpdateConfigActionType is 
        ConfigDurationInMinutes         of unit
    |   ConfigRequiredFeeMutez          of unit
    |   ConfigStakedMvkPercentRequired  of unit
    |   ConfigMinStakedMvkForVoting     of unit
    |   ConfigMinStakedMvkToTrigger     of unit
    |   ConfigProposalTitleMaxLength    of unit
    |   ConfigProposalDescMaxLength     of unit

type emergencyUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : emergencyUpdateConfigNewValueType; 
    updateConfigAction    : emergencyUpdateConfigActionType;
]

type triggerEmergencyControlType is [@layout:comb] record[
    title        : string;
    description  : string;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type emergencyGovernanceLambdaActionType is 

        // Housekeeping Entrypoints
    |   LambdaSetAdmin                  of (address)
    |   LambdaSetGovernance             of (address)
    |   LambdaUpdateMetadata            of updateMetadataType
    |   LambdaUpdateConfig              of emergencyUpdateConfigParamsType    
    |   LambdaUpdateWhitelistContracts  of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts    of updateGeneralContractsType
    |   LambdaMistakenTransfer          of transferActionType

        // Emergency Governance Entrypoints
    |   LambdaTriggerEmergencyControl   of triggerEmergencyControlType
    |   LambdaVoteForEmergencyControl   of (unit)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type emergencyGovernanceStorageType is [@layout:comb] record [
    admin                               : address;
    metadata                            : metadataType;
    config                              : emergencyConfigType;

    mvkTokenAddress                     : address;
    governanceAddress                   : address;
    
    whitelistContracts                  : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts                    : generalContractsType;

    emergencyGovernanceLedger           : emergencyGovernanceLedgerType;
    emergencyGovernanceVoters           : emergencyGovernanceVotersType;
    
    currentEmergencyGovernanceId        : nat;
    nextEmergencyGovernanceId           : nat;

    lambdaLedger                        : lambdaLedgerType;
]
