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
    totalStakedMvnVotes              : nat;              
    stakedMvnPercentageRequired      : nat;              // capture state of min required staked MVN vote percentage (e.g. 5% - as min required votes may change over time)
    stakedMvnRequiredForBreakGlass   : nat;              // capture state of min staked MVN vote required
    
    startDateTime                    : timestamp;
    startLevel                       : nat;              // block level of submission, used to order proposals
    executedDateTime                 : option(timestamp);
    executedLevel                    : option(nat);
    expirationDateTime               : timestamp;
]

type emergencyGovernanceVotersType is big_map(voterIdentifierType, (nat * timestamp)) // mvn amount, timestamp
type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type emergencyConfigType is record [
    decimals                          : nat;        // decimals used for percentages
    durationInMinutes                 : nat;        // duration of emergency governance before expiry
    requiredFeeMutez                  : mav;        // fee for triggering emergency control - e.g. 100 tez -> change to MVN 
    stakedMvnPercentageRequired       : nat;        // minimum staked MVN percentage amount required to activate break glass 
    minStakedMvnRequiredToVote        : nat;        // minimum staked MVN balance of user required to vote for emergency governance
    minStakedMvnRequiredToTrigger     : nat;        // minimum staked MVN balance of user to trigger emergency governance

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
    |   ConfigStakedMvnPercentRequired  of unit
    |   ConfigMinStakedMvnForVoting     of unit
    |   ConfigMinStakedMvnToTrigger     of unit
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

    mvnTokenAddress                     : address;
    governanceAddress                   : address;
    
    whitelistContracts                  : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts                    : generalContractsType;

    emergencyGovernanceLedger           : emergencyGovernanceLedgerType;
    emergencyGovernanceVoters           : emergencyGovernanceVotersType;
    
    currentEmergencyGovernanceId        : nat;
    nextEmergencyGovernanceId           : nat;

    lambdaLedger                        : lambdaLedgerType;
]
