// ------------------------------------------------------------------------------
// Required Partial Types
// ------------------------------------------------------------------------------


// Council Types
#include "../shared/councilMemberTypes.ligo"

// Vote Types
#include "../shared/voteTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type breakGlassConfigType is [@layout:comb] record [
    threshold                       : nat;    // min number of council members who need to agree on action
    actionExpiryDays                : nat;    // action expiry in number of days

    councilMemberNameMaxLength      : nat;
    councilMemberWebsiteMaxLength   : nat;
    councilMemberImageMaxLength     : nat;
]

type breakGlassActionRecordType is record [
    
    initiator                       : address;          // address of action initiator
    status                          : string;           // PENDING / FLUSHED / EXECUTED / EXPIRED
    actionType                      : string;           // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, removeBreakGlassControl
    executed                        : bool;             // boolean of whether action has been executed

    signers                         : signersType;      // set of signers
    signersCount                    : nat;              // total number of signers

    addressMap                      : addressMapType;
    stringMap                       : stringMapType;
    natMap                          : natMapType;

    startDateTime                   : timestamp;       // timestamp of when action was initiated
    startLevel                      : nat;             // block level of when action was initiated           
    executedDateTime                : timestamp;       // will follow startDateTime and be updated when executed
    executedLevel                   : nat;             // will follow startLevel and be updated when executed
    expirationDateTime              : timestamp;       // timestamp of when action will expire
    
]
type breakGlassActionsLedgerType is big_map(nat, breakGlassActionRecordType)


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type breakGlassUpdateConfigNewValueType is nat
type breakGlassUpdateConfigActionType is 
        ConfigThreshold               of unit
    |   ConfigActionExpiryDays        of unit
    |   ConfigCouncilNameMaxLength    of unit
    |   ConfigCouncilWebsiteMaxLength of unit
    |   ConfigCouncilImageMaxLength   of unit

type breakGlassUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : breakGlassUpdateConfigNewValueType; 
    updateConfigAction    : breakGlassUpdateConfigActionType;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type breakGlassLambdaActionType is 

        // Break Glass
    |   LambdaBreakGlass                    of (unit)

        // Housekeeping Entrypoints - Glass Broken Not Required
    |   LambdaSetAdmin                      of (address)
    |   LambdaSetGovernance                 of (address)
    |   LambdaUpdateMetadata                of updateMetadataType
    |   LambdaUpdateConfig                  of breakGlassUpdateConfigParamsType    
    |   LambdaUpdateWhitelistContracts      of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts        of updateGeneralContractsType
    |   LambdaMistakenTransfer              of transferActionType
    |   LambdaUpdateCouncilMemberInfo       of councilMemberInfoType

        // Internal Control of Council Members
    |   LambdaAddCouncilMember              of councilActionAddMemberType
    |   LambdaRemoveCouncilMember           of address
    |   LambdaChangeCouncilMember           of councilActionChangeMemberType

        // Glass Broken Required
    |   LambdaPropagateBreakGlass           of (unit)
    |   LambdaSetSingleContractAdmin        of setContractAdminType
    |   LambdaSetAllContractsAdmin          of (address)               
    |   LambdaPauseAllEntrypoints           of (unit)             
    |   LambdaUnpauseAllEntrypoints         of (unit)
    |   LambdaRemoveBreakGlassControl       of (unit)

        // Council Signing of Actions
    |   LambdaFlushAction                   of actionIdType
    |   LambdaSignAction                    of actionIdType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type breakGlassStorageType is [@layout:comb] record [
    admin                       : address;               
    metadata                    : metadataType;
    config                      : breakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;

    whitelistContracts          : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts            : generalContractsType;      // map of all contract addresses (e.g. doorman, delegation, vesting)

    glassBroken                 : bool;
    councilMembers              : councilMembersType;        // set of council member addresses
    
    actionsLedger               : breakGlassActionsLedgerType;         // record of past actions taken by council members
    actionCounter               : nat;

    lambdaLedger                : lambdaLedgerType;
]
