// ------------------------------------------------------------------------------
// Vote Types
// ------------------------------------------------------------------------------

type signersType is set(address)
type actionIdType is (nat)

type dataMapType      is map(string, bytes);

type voteType is 
        Yay     of unit
    |   Nay     of unit
    |   Pass    of unit

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
