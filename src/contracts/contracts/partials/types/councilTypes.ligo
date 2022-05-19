type signersType is set(address)

type metadataType is big_map (string, bytes);

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type councilActionRecordType is [@layout:comb] record [

    initiator                  : address;          // address of action initiator
    actionType                 : string;           // addVestee / updateVestee / toggleVesteeLock / addCouncilMember / removeCouncilMember / requestTokens / requestMint
    signers                    : signersType;      // set of signers

    status                     : string;           // PENDING / FLUSHED / EXECUTED 
    signersCount               : nat;              // total number of signers
    executed                   : bool;             // boolean of whether action has been executed

    addressMap                 : addressMapType;
    stringMap                  : stringMapType;
    natMap                     : natMapType;
    keyHash                    : option(key_hash);

    startDateTime              : timestamp;        // timestamp of when action was initiated
    startLevel                 : nat;              // block level of when action was initiated           
    executedDateTime           : timestamp;        // will follow startDateTime and be updated when executed
    executedLevel              : nat;              // will follow startLevel and be updated when executed
    expirationDateTime         : timestamp;        // timestamp of when action will expire
]

type councilActionsLedgerType is big_map(nat, councilActionRecordType)

type councilConfigType is [@layout:comb] record [
    threshold                       : nat;                 // min number of council members who need to agree on action
    actionExpiryDays                : nat;                 // action expiry in number of days 
    
    councilMemberNameMaxLength      : nat;
    councilMemberWebsiteMaxLength   : nat;
    councilMemberImageMaxLength     : nat;
    requestTokenNameMaxLength       : nat;
    requestPurposeMaxLength         : nat;
]

type councilActionUpdateBlocksPerMinType is  [@layout:comb] record [ 
    contractAddress             : address;
    newBlocksPerMinute          : nat;
] 

type flushActionType is (nat)
type signActionType is (nat)

type councilUpdateConfigNewValueType is nat
type councilUpdateConfigActionType is 
  ConfigThreshold                       of unit
| ConfigActionExpiryDays                of unit
| ConfigCouncilNameMaxLength            of unit
| ConfigCouncilWebsiteMaxLength         of unit
| ConfigCouncilImageMaxLength           of unit
| ConfigRequestTokenNameMaxLength       of unit
| ConfigRequestPurposeMaxLength         of unit
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

type councilActionTransferType is [@layout:comb] record [
    receiverAddress       : address;       // receiver address
    tokenContractAddress  : address;       // token contract address
    tokenAmount           : nat;           // token amount requested
    tokenType             : string;        // "XTZ", "FA12", "FA2"
    tokenId               : nat;  
    purpose               : string;           
]

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

type councilMembersType is map(address, councilMemberInfoType)

type setBakerType is option(key_hash)
type councilActionSetContractBakerType is [@layout:comb] record [
    targetContractAddress  : address;
    keyHash                : option(key_hash);
]

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type setLambdaType is [@layout:comb] record [
      name                  : string;
      func_bytes            : bytes;
]
type lambdaLedgerType is map(string, bytes)

type addVesteeType is [@layout:comb] record [
    vesteeAddress           : address;
    totalAllocatedAmount    : nat;
    cliffInMonths           : nat;
    vestingInMonths         : nat;
]

type updateVesteeType is [@layout:comb] record [
    vesteeAddress              : address;
    newTotalAllocatedAmount    : nat;
    newCliffInMonths           : nat;
    newVestingInMonths         : nat;
]

// Council Methods to Lambda Action Type
type councilLambdaActionType is 

    // Housekeeping Lambdas
    LambdaSetAdmin                              of address
  | LambdaSetGovernance                         of address
  | LambdaUpdateMetadata                        of updateMetadataType
  | LambdaUpdateConfig                          of councilUpdateConfigParamsType
  | LambdaUpdateWhitelistContracts              of updateWhitelistContractsParams
  | LambdaUpdateGeneralContracts                of updateGeneralContractsParams
  | LambdaUpdateCouncilMemberInfo               of councilMemberInfoType

    // Council Actions for Internal Control
  | LambdaCouncilActionAddMember                of councilActionAddMemberType
  | LambdaCouncilActionRemoveMember             of address
  | LambdaCouncilActionChangeMember             of councilActionChangeMemberType
  | LambdaCouncilActionSetBaker                 of setBakerType

    // Council Actions for Contracts
  | LambdaCouncilUpdateBlocksPerMin             of councilActionUpdateBlocksPerMinType

    // Council Actions for Vesting
  | LambdaCouncilActionAddVestee                of addVesteeType
  | LambdaCouncilActionRemoveVestee             of address
  | LambdaCouncilActionUpdateVestee             of updateVesteeType
  | LambdaCouncilToggleVesteeLock               of address

    // Council Actions for Financial Governance
  | LambdaCouncilActionTransfer                 of councilActionTransferType
  | LambdaCouncilRequestTokens                  of councilActionRequestTokensType
  | LambdaCouncilRequestMint                    of councilActionRequestMintType
  | LambdaCouncilSetContractBaker               of councilActionSetContractBakerType
  | LambdaCouncilDropFinancialReq               of nat

    // Council Signing of Actions
  | LambdaFlushAction                           of flushActionType
  | LambdaSignAction                            of signActionType 

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type councilStorage is [@layout:comb] record [
    admin                       : address;
    mvkTokenAddress             : address;
    governanceAddress           : address;
    metadata                    : metadataType;

    config                      : councilConfigType;
    councilMembers              : councilMembersType;  
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;

    councilActionsLedger        : councilActionsLedgerType; 
    actionCounter               : nat;

    lambdaLedger                : lambdaLedgerType;
]
