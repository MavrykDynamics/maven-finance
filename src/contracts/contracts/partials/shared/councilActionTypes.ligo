// ------------------------------------------------------------------------------
// Council Types
// ------------------------------------------------------------------------------

type councilActionAddMemberType is [@layout:comb] record [
    memberAddress       : address;
    memberName          : string;
    memberWebsite       : string;
    memberImage         : string;
]

type councilActionChangeMemberType is [@layout:comb] record [
    oldCouncilMemberAddress           : address;
    newCouncilMemberAddress           : address;
    newCouncilMemberName              : string;
    newCouncilMemberWebsite           : string;
    newCouncilMemberImage             : string;
]

type councilMemberInfoType is [@layout:comb] record [
    name          : string;
    website       : string;
    image         : string;
]
type councilMembersType is big_map(address, councilMemberInfoType)

type actionIdType is (nat)
type signersType is set(address)
type dataMapType is map(string, bytes);

type councilActionRecordType is [@layout:comb] record [

    initiator                       : address;          // address of action initiator
    actionType                      : string;           // addVestee / updateVestee / toggleVesteeLock / addCouncilMember / removeCouncilMember / requestTokens / requestMint
    signers                         : signersType;      // set of signers
    executed                        : bool;             // boolean of whether action has been executed

    status                          : string;           // PENDING / FLUSHED / EXECUTED 
    signersCount                    : nat;              // total number of signers

    dataMap                         : dataMapType;

    startDateTime                   : timestamp;        // timestamp of when action was initiated
    startLevel                      : nat;              // block level of when action was initiated           
    executedDateTime                : timestamp;        // will follow startDateTime and be updated when executed
    executedLevel                   : nat;              // will follow startLevel and be updated when executed
    expirationDateTime              : timestamp;        // timestamp of when action will expire
]

type councilActionsLedgerType is big_map(actionIdType, councilActionRecordType)
