type voteType is (nat * timestamp)              // mvk amount, timestamp
type voterMapType is map (address, voteType)
type emergencyGovernanceRecordType is [@layout:comb] record [
    proposerAddress                  : address;
    executed                         : bool;
    dropped                          : bool;

    title                            : string;
    description                      : string;   
    voters                           : voterMapType; 
    totalStakedMvkVotes              : nat;              
    stakedMvkPercentageRequired      : nat;              // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
    stakedMvkRequiredForBreakGlass   : nat;              // capture state of min staked MVK vote required
    
    startDateTime                    : timestamp;
    startLevel                       : nat;              // block level of submission, used to order proposals
    executedDateTime                 : timestamp;        // will follow startDateTime and be updated when executed
    executedLevel                    : nat;              // will follow startLevel and be updated when executed
    expirationDateTime               : timestamp;
]

type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type emergencyConfigType is record [
    decimals                          : nat;   // decimals used for percentages
    voteExpiryDays                    : nat;   // track time by tezos blocks - e.g. 2 days 
    requiredFeeMutez                  : tez;   // fee for triggering emergency control - e.g. 100 tez -> change to MVK 
    stakedMvkPercentageRequired       : nat;   // minimum staked MVK percentage amount required to activate break glass 
    minStakedMvkRequiredToVote        : nat;   // minimum staked MVK balance of user required to vote for emergency governance
    minStakedMvkRequiredToTrigger     : nat;   // minimum staked MVK balance of user to trigger emergency governance

    proposalTitleMaxLength            : nat;
    proposalDescMaxLength             : nat;
]

type emergencyUpdateConfigNewValueType is nat
type emergencyUpdateConfigActionType is 
  ConfigVoteExpiryDays            of unit
| ConfigRequiredFeeMutez          of unit
| ConfigStakedMvkPercentRequired  of unit
| ConfigMinStakedMvkForVoting     of unit
| ConfigMinStakedMvkForTrigger    of unit
| ConfigProposalTitleMaxLength    of unit
| ConfigProposalDescMaxLength     of unit
type emergencyUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : emergencyUpdateConfigNewValueType; 
  updateConfigAction    : emergencyUpdateConfigActionType;
]

type triggerEmergencyControlType is [@layout:comb] record[
  title        : string;
  description  : string;
]

type metadata is big_map (string, bytes);

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type emergencyGovernanceLambdaActionType is 

  // Housekeeping Entrypoints
| LambdaSetAdmin                  of (address)
| LambdaSetGovernance             of (address)
| LambdaUpdateMetadata            of updateMetadataType
| LambdaUpdateConfig              of emergencyUpdateConfigParamsType    
| LambdaUpdateGeneralContracts    of updateGeneralContractsParams
| LambdaUpdateWhitelistContracts  of updateWhitelistContractsParams

  // Emergency Governance Entrypoints
| LambdaTriggerEmergencyControl   of triggerEmergencyControlType
| LambdaVoteForEmergencyControl   of (unit)
| LambdaDropEmergencyGovernance   of (unit)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type emergencyGovernanceStorage is [@layout:comb] record [
    admin                               : address;
    mvkTokenAddress                     : address;
    governanceAddress                   : address;
    metadata                            : metadata;
    config                              : emergencyConfigType;
    
    whitelistContracts                  : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts                    : generalContractsType;

    emergencyGovernanceLedger           : emergencyGovernanceLedgerType; 
    
    currentEmergencyGovernanceId        : nat;
    nextEmergencyGovernanceId           : nat;

    lambdaLedger                        : lambdaLedgerType;
]
