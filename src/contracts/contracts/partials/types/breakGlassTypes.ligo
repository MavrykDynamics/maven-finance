type breakGlassConfigType is [@layout:comb] record [
    threshold                       : nat;    // min number of council members who need to agree on action
    actionExpiryDays                : nat;    // action expiry in number of days

    councilMemberNameMaxLength      : nat;
    councilMemberWebsiteMaxLength   : nat;
    councilMemberImageMaxLength     : nat;
]

type councilMemberInfoType is [@layout:comb] record [
    name          : string;
    website       : string;
    image         : string;
]
type councilMembersType is map(address, councilMemberInfoType)
type signersType is set(address)

type councilAddMemberType is [@layout:comb] record [
    memberAddress       : address;
    memberName          : string;
    memberWebsite       : string;
    memberImage         : string;
]

type councilChangeMemberType is [@layout:comb] record [
    oldCouncilMemberAddress           : address;
    newCouncilMemberAddress           : address;
    newCouncilMemberName              : string;
    newCouncilMemberWebsite           : string;
    newCouncilMemberImage             : string;
]

type breakGlassUpdateConfigNewValueType is nat
type breakGlassUpdateConfigActionType is 
  ConfigThreshold               of unit
| ConfigActionExpiryDays        of unit
| ConfigCouncilNameMaxLength    of unit
| ConfigCouncilWebsiteMaxLength of unit
| ConfigCouncilImageMaxLength   of unit
type breakGlassUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : breakGlassUpdateConfigNewValueType; 
  updateConfigAction    : breakGlassUpdateConfigActionType;
]

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type metadataType is big_map (string, bytes);

type actionRecordType is record [
    
    initiator                  : address;          // address of action initiator
    status                     : string;           // PENDING / FLUSHED / EXECUTED / EXPIRED
    actionType                 : string;           // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, removeBreakGlassControl
    executed                   : bool;             // boolean of whether action has been executed

    signers                    : signersType;      // set of signers
    signersCount               : nat;              // total number of signers

    addressMap                 : addressMapType;
    stringMap                  : stringMapType;
    natMap                     : natMapType;

    startDateTime              : timestamp;       // timestamp of when action was initiated
    startLevel                 : nat;             // block level of when action was initiated           
    executedDateTime           : timestamp;       // will follow startDateTime and be updated when executed
    executedLevel              : nat;             // will follow startLevel and be updated when executed
    expirationDateTime         : timestamp;       // timestamp of when action will expire
    
]
type actionsLedgerType is big_map(nat, actionRecordType)

type signActionType is (nat)
type flushActionType is (nat)

type setSingleContractAdminType is [@layout:comb] record [
    newAdminAddress        : address;
    targetContractAddress  : address;
]

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type whitelistDevelopersType is set(address)

type breakGlassLambdaActionType is 

    // Break Glass
| LambdaBreakGlass                    of (unit)

    // Housekeeping Entrypoints - Glass Broken Not Required
| LambdaSetAdmin                      of (address)
| LambdaSetGovernance                 of (address)
| LambdaUpdateMetadata                of updateMetadataType
| LambdaUpdateConfig                  of breakGlassUpdateConfigParamsType    
| LambdaUpdateWhitelistContracts      of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts        of updateGeneralContractsParams
| LambdaMistakenTransfer              of transferActionType
| LambdaUpdateCouncilMemberInfo       of councilMemberInfoType

    // Internal Control of Council Members
| LambdaAddCouncilMember              of councilAddMemberType
| LambdaRemoveCouncilMember           of address
| LambdaChangeCouncilMember           of councilChangeMemberType

    // Glass Broken Required
| LambdaPropagateBreakGlass           of (unit)
| LambdaSetSingleContractAdmin        of setSingleContractAdminType
| LambdaSetAllContractsAdmin          of (address)               
| LambdaPauseAllEntrypoints           of (unit)             
| LambdaUnpauseAllEntrypoints         of (unit)
| LambdaRemoveBreakGlassControl       of (unit)

    // Council Signing of Actions
| LambdaFlushAction                   of flushActionType
| LambdaSignAction                    of signActionType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type breakGlassStorage is [@layout:comb] record [
    admin                       : address;               
    mvkTokenAddress             : address;
    governanceAddress           : address;
    metadata                    : metadataType;
    
    config                      : breakGlassConfigType;
    glassBroken                 : bool;
    councilMembers              : councilMembersType;        // set of council member addresses

    whitelistContracts          : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts            : generalContractsType;      // map of all contract addresses (e.g. doorman, delegation, vesting)
    
    actionsLedger               : actionsLedgerType;         // record of past actions taken by council members
    actionCounter               : nat;

    lambdaLedger                : lambdaLedgerType;
]
