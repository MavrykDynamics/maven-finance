type breakGlassConfigType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDays            : nat;                 // action expiry in number of days
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
  ConfigThreshold of unit
| ConfigActionExpiryDays of unit
type breakGlassUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : breakGlassUpdateConfigNewValueType; 
  updateConfigAction    : breakGlassUpdateConfigActionType;
]

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type metadata is big_map (string, bytes);

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

type breakGlassStorage is [@layout:comb] record [
    admin                       : address;               // for init of contract - needed?
    mvkTokenAddress             : address;
    metadata                    : metadata;
    
    config                      : breakGlassConfigType;
    glassBroken                 : bool;
    councilMembers              : councilMembersType;        // set of council member addresses
    developerAddress            : address;                   // developer address

    whitelistContracts          : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts            : generalContractsType;      // map of all contract addresses (e.g. doorman, delegation, vesting)
    
    actionsLedger               : actionsLedgerType;         // record of past actions taken by council members
    actionCounter               : nat;

    lambdaLedger                : lambdaLedgerType;
]
