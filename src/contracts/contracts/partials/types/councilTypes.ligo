type councilMembersType is set(address)

// todo: consideration: include a signature hash of signer for added security?

type signersType is set(address)

type metadata is big_map (string, bytes);

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type councilActionRecordType is record [

    initiator                  : address;          // address of action initiator
    actionType                 : string;           // addVestee / updateVestee / toggleVesteeLock / addCouncilMember / removeCouncilMember / requestTokens / requestMint
    signers                    : signersType;      // set of signers

    status                     : string;           // PENDING / FLUSHED / EXECUTED 
    signersCount               : nat;              // total number of signers
    executed                   : bool;             // boolean of whether action has been executed

    // ----------------------------------
    // use placeholders for params if not in use for action type
    // - using snake_case instead of camelCase for better readability (address_param_1 vs addressParam1)
    // ----------------------------------
    
    addressMap                 : addressMapType;
    stringMap                  : stringMapType;
    natMap                     : natMapType;

    // ----------------------------------

    startDateTime              : timestamp;       // timestamp of when action was initiated
    startLevel                 : nat;             // block level of when action was initiated           
    executedDateTime           : timestamp;       // will follow startDateTime and be updated when executed
    executedLevel              : nat;             // will follow startLevel and be updated when executed
    expirationDateTime         : timestamp;       // timestamp of when action will expire
]


type councilActionsLedgerType is big_map(nat, councilActionRecordType)

type councilConfigType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDays            : nat;                 // action expiry in number of days 
    // todo: strings, nats validation length
]


type councilActionUpdateBlocksPerMinType is  [@layout:comb] record [ 
    contractAddress             : address;
    newBlocksPerMinute          : nat;
] 

type flushActionType is (nat)

type councilUpdateConfigNewValueType is nat
type councilUpdateConfigActionType is 
  ConfigThreshold of unit
| ConfigActionExpiryDays of unit
type councilUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : councilUpdateConfigNewValueType; 
  updateConfigAction    : councilUpdateConfigActionType;
]

type councilActionRequestTokensType is [@layout:comb] record [
    treasuryAddress       : address;       // treasury address
    tokenContractAddress  : address;       // token contract address
    tokenName             : string;        // token name 
    tokenAmount           : nat;           // token amount requested
    tokenType             : string;        // "XTZ", "FA12", "FA2"
    tokenId               : nat;        
    purpose               : string;        // financial request purpose
]

type councilActionRequestMintType is [@layout:comb] record [
    treasuryAddress  : address;  // treasury address
    tokenAmount      : nat;      // MVK token amount requested
    purpose          : string;   // financial request purpose
]

type tokenBalance is nat
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: nat;
  amount: tokenBalance;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type fa2TransferType is list(transfer)
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  tokenContractAddress     : address;
  tokenId                  : nat;
]
type tokenType       is
| Tez                     of tezType         // unit
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ token : address; id : nat; ]

type councilActionTransferType is [@layout:comb] record [
    receiverAddress       : address;       // receiver address
    tokenContractAddress  : address;       // token contract address
    tokenAmount           : nat;           // token amount requested
    tokenType             : string;        // "XTZ", "FA12", "FA2"
    tokenId               : nat;  
    purpose               : string;           
]

type councilActionChangeMemberType is [@layout:comb] record [
    oldCouncilMemberAddress           : address;
    newCouncilMemberAddress           : address;
]

type councilStorage is [@layout:comb] record [
    admin                       : address;
    mvkTokenAddress             : address;
    metadata                    : metadata;

    config                      : councilConfigType;
    councilMembers              : councilMembersType;  // set of council member addresses
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;

    councilActionsLedger        : councilActionsLedgerType; 
    actionCounter               : nat;
]
