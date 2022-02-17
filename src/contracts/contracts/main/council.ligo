// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type councilMembersType is set(address)

// todo: consideration: include a signature hash of signer for added security?

type signersType is set(address)

type councilActionRecordType is record [

    initiator                  : address;          // address of action initiator
    actionType                 : string;           // addVestee / updateVestee / toggleVesteeLock / addCouncilMember / removeCouncilMember / requestTokens / requestMint
    signers                    : signersType;      // set of signers

    status                     : string;           // PENDING / FLUSHED / EXECUTED / EXPIRED
    signersCount               : nat;              // total number of signers
    executed                   : bool;             // boolean of whether action has been executed

    // ----------------------------------
    // use placeholders for params if not in use for action type
    // - using snake_case instead of camelCase for better readability (address_param_1 vs addressParam1)
    // ----------------------------------
    address_param_1            : address;
    address_param_2            : address;
    address_param_3            : address;
    nat_param_1                : nat;
    nat_param_2                : nat;
    nat_param_3                : nat;
    string_param_1             : string;
    string_param_2             : string;
    string_param_3             : string;
    // ----------------------------------

    startDateTime              : timestamp;       // timestamp of when action was initiated
    startLevel                 : nat;             // block level of when action was initiated           
    executedDateTime           : timestamp;       // will follow startDateTime and be updated when executed
    executedLevel              : nat;             // will follow startLevel and be updated when executed
    expirationDateTime         : timestamp;       // timestamp of when action will expire
    expirationBlockLevel       : nat;             // block level of when action will expire
]


type councilActionsLedgerType is big_map(nat, councilActionRecordType)

type configType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryBlockLevels     : nat;                 // action expiry in block levels
    actionExpiryDays            : nat;                 // action expirt in number of days 
]

type storage is record [
    admin                       : address;
    config                      : configType;
    councilMembers              : councilMembersType;  // set of council member addresses
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;

    councilActionsLedger        : councilActionsLedgerType; 

    thresholdSigners            : nat; 
    actionCounter               : nat;

    tempString                  : string;
]

type councilActionAddVesteeType is (address * nat * nat * nat) // vestee address, total allocated amount, cliff in months, vesting in months
type councilActionUpdateVesteeType is (address * nat * nat * nat) // vestee address, new total allocated amount, new cliff in months, new vesting in months

type signActionType is (nat * nat) // councilActionId, voteType to be decided and confirmed: on frontend, set 1 as APPROVE, 0 as REJECT 
type flushActionType is (nat)

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigThreshold of unit
| ConfigActionExpiryBlockLevels of unit
| ConfigActionExpiryDays of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : updateConfigNewValueType; 
  updateConfigAction    : updateConfigActionType;
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
    tokenType        : string;   // "XTZ", "FA12", "FA2"
    tokenId          : nat;        
    purpose          : string;   // financial request purpose
]

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  token                   : address;
  id                      : nat;
]
type tokenType       is
| Tez                     of tezType         // unit
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ token : address; id : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

type councilActionTransferType is [@layout:comb] record [
    receiverAddress       : address;       // receiver address
    tokenContractAddress  : address;       // token contract address
    tokenAmount           : nat;           // token amount requested
    tokenType             : string;        // "XTZ", "FA12", "FA2"
    tokenId               : nat;        
]


type councilAction is 
    | Default of unit
    | UpdateConfig of updateConfigParamsType    

    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams

    // Council actions for vesting
    | CouncilActionAddVestee of councilActionAddVesteeType
    | CouncilActionRemoveVestee of address
    | CouncilActionUpdateVestee of councilActionUpdateVesteeType
    | CouncilActionToggleVesteeLock of address
    
    // Council actions for internal control
    | CouncilActionAddMember of address
    | CouncilActionRemoveMember of address
    | CouncilActionChangeMember of (address * address)
    | CouncilActionTransfer of councilActionTransferType

    // Council actions to Governance DAO and Treasury
    | CouncilActionRequestTokens of councilActionRequestTokensType
    | CouncilActionRequestMint of councilActionRequestMintType

    | SignAction of nat                
    | FlushAction of flushActionType

    // todo:
    // transfer -> entrypoint

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// consideration: may need a lambda function to be able to send calls to future unspecified entrypoints if needed

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsCouncilMember(var s : storage) : unit is
    if Set.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith("Only council members can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

function sendAddVesteeParams(const contractAddress : address) : contract(councilActionAddVesteeType) is
  case (Tezos.get_entrypoint_opt(
      "%addVestee",
      contractAddress) : option(contract(councilActionAddVesteeType))) of
    Some(contr) -> contr
  | None -> (failwith("addVestee entrypoint in Vesting Contract not found") : contract(councilActionAddVesteeType))
end;

function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%removeVestee",
      contractAddress) : option(contract(address))) of
    Some(contr) -> contr
  | None -> (failwith("removeVestee entrypoint in Vesting Contract not found") : contract(address))
end;

function sendUpdateVesteeParams(const contractAddress : address) : contract(councilActionUpdateVesteeType) is
case (Tezos.get_entrypoint_opt(
    "%updateVestee",
    contractAddress) : option(contract(councilActionUpdateVesteeType))) of
Some(contr) -> contr
| None -> (failwith("updateVestee entrypoint in Vesting Contract not found") : contract(councilActionUpdateVesteeType))
end;

function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
    "%toggleVesteeLock",
    contractAddress) : option(contract(address))) of
Some(contr) -> contr
| None -> (failwith("toggleVesteeLock entrypoint in Vesting Contract not found") : contract(address))
end;

function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
  case (Tezos.get_entrypoint_opt(
      "%requestTokens",
      contractAddress) : option(contract(councilActionRequestTokensType))) of
    Some(contr) -> contr
  | None -> (failwith("requestTokens entrypoint in Governance Contract not found") : contract(councilActionRequestTokensType))
end;

function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
  case (Tezos.get_entrypoint_opt(
      "%requestMint",
      contractAddress) : option(contract(councilActionRequestMintType))) of
    Some(contr) -> contr
  | None -> (failwith("requestMint entrypoint in Governance Contract not found") : contract(councilActionRequestMintType))
end;


(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  // checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
    ConfigThreshold (_v)                  -> s.config.threshold                 := updateConfigNewValue
  | ConfigActionExpiryBlockLevels (_v)    -> s.config.actionExpiryBlockLevels   := updateConfigNewValue
  | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
  end;

} with (noOperations, s)

function councilActionAddMember(const newCouncilMemberAddress : address ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "addCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = newCouncilMemberAddress;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        address_param_3       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionRemoveMember(const councilMemberAddress : address ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
    // const noToken : requestTokenType = NoToken;

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "removeCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = councilMemberAddress;
        address_param_2       = zeroAddress;            // extra slot for address if needed
        address_param_3       = zeroAddress;            // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";                // extra slot for string if needed
        string_param_2        = "EMPTY";                // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionChangeMember(const oldCouncilMemberAddress : address ; const newCouncilMemberAddress : address ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "changeCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = oldCouncilMemberAddress;
        address_param_2       = newCouncilMemberAddress; 
        address_param_3       = zeroAddress;              // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";                // extra slot for string if needed
        string_param_2        = "EMPTY";                // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "transfer";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = councilActionTransferParams.receiverAddress;
        address_param_2       = councilActionTransferParams.tokenContractAddress; 
        address_param_3       = zeroAddress;             // extra slot for address if needed
        nat_param_1           = councilActionTransferParams.tokenAmount;
        nat_param_2           = councilActionTransferParams.tokenId;
        nat_param_3           = 0n;
        string_param_1        = councilActionTransferParams.tokenType; 
        string_param_2        = "EMPTY";                // extra slot for string if needed
        string_param_3        = "EMPTY";                // extra slot for string if needed

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)


function councilActionAddVestee(const addVestee : councilActionAddVesteeType ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
    // const noToken : requestTokenType = NoToken;

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "addVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = addVestee.0;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        address_param_3       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = addVestee.1;
        nat_param_2           = addVestee.2;
        nat_param_3           = addVestee.3;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed
        // token_type_param      = noToken;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionRemoveVestee(const vesteeAddress : address ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
    // const noToken : requestTokenType = NoToken;

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "removeVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = vesteeAddress;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        address_param_3       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed
        // token_type_param      = noToken;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionUpdateVestee(const updateVestee : councilActionUpdateVesteeType; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter
    
    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
    // const noToken : requestTokenType = NoToken;

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "updateVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = updateVestee.0;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        address_param_3       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = updateVestee.1;
        nat_param_2           = updateVestee.2;
        nat_param_3           = updateVestee.3;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed
        // token_type_param      = noToken;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
    // const noToken : requestTokenType = NoToken;

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "toggleVesteeLock";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = vesteeAddress;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        address_param_3       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed
        string_param_3        = "EMPTY";         // extra slot for string if needed
        // token_type_param      = noToken;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "requestTokens";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = councilActionRequestTokensParams.treasuryAddress;
        address_param_2       = councilActionRequestTokensParams.tokenContractAddress;    
        address_param_3       = zeroAddress;    
        nat_param_1           = councilActionRequestTokensParams.tokenAmount;
        nat_param_2           = councilActionRequestTokensParams.tokenId;
        nat_param_3           = 0n;
        string_param_1        = councilActionRequestTokensParams.tokenName; 
        string_param_2        = councilActionRequestTokensParams.purpose;        
        string_param_3        = councilActionRequestTokensParams.tokenType;  
        // token_type_param      = councilActionRequestTokensParams.tokenType;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : storage) : return is 
block {
    
    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "requestMint";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = councilActionRequestMintParams.treasuryAddress;
        address_param_2       = zeroAddress;    
        address_param_3       = zeroAddress;    
        nat_param_1           = councilActionRequestMintParams.tokenAmount;
        nat_param_2           = councilActionRequestMintParams.tokenId;
        nat_param_3           = 0n;
        string_param_1        = councilActionRequestMintParams.purpose; 
        string_param_2        = "FA2";
        string_param_3        = "EMPTY";        
        // token_type_param      = councilActionRequestMintParams.tokenType;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
        expirationBlockLevel  = Tezos.level + s.config.actionExpiryBlockLevels;
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)


function flushAction(const _actionId: nat; var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    skip

} with (noOperations, s)

// function signAction(const actionId: nat; const voteType: nat; var s : storage) : return is 
function signAction(const actionId: nat; var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    var _councilActionRecord : councilActionRecordType := case s.councilActionsLedger[actionId] of        
        Some(_record) -> _record
        | None -> failwith("Error. Council Action not found")
    end;

    // update signers and signersCount for council action record
    var signersCount : nat             := _councilActionRecord.signersCount + 1n;
    _councilActionRecord.signersCount  := signersCount;
    _councilActionRecord.signers       := Set.add(Tezos.sender, _councilActionRecord.signers);
    s.councilActionsLedger[actionId]   := _councilActionRecord;

    const actionType : string = _councilActionRecord.actionType;

    var operations : list(operation) := nil;

    s.tempString := actionType;

    // check if threshold has been reached
    if signersCount = s.config.threshold then block {
        
        // --------------------------------------
        // execute action based on action types
        // --------------------------------------

        // addVestee action type
        if actionType = "addVestee" then block {

            // send operation to vesting contract to add a new vestee
            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const addVesteeParams : councilActionAddVesteeType = (
                _councilActionRecord.address_param_1,
                _councilActionRecord.nat_param_1,
                _councilActionRecord.nat_param_2,
                _councilActionRecord.nat_param_3
            );

            const addVesteeOperation : operation = Tezos.transaction(
                addVesteeParams,
                0tez, 
                sendAddVesteeParams(vestingAddress)
            );
            
            operations := addVesteeOperation # operations;

        } else skip;

        // addVestee action type
        if actionType = "removeVestee" then block {

            // send operation to vesting contract to add a new vestee
            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const removeVesteeOperation : operation = Tezos.transaction(
                _councilActionRecord.address_param_1,
                0tez, 
                sendRemoveVesteeParams(vestingAddress)
            );
            
            operations := removeVesteeOperation # operations;

        } else skip;

        // updateVestee action type
        if actionType = "updateVestee" then block {
            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const updateVesteeParams : councilActionUpdateVesteeType = (
                _councilActionRecord.address_param_1,
                _councilActionRecord.nat_param_1,
                _councilActionRecord.nat_param_2,
                _councilActionRecord.nat_param_3
            );

            const updateVesteeOperation : operation = Tezos.transaction(
                updateVesteeParams,
                0tez, 
                sendUpdateVesteeParams(vestingAddress)
            );

            operations := updateVesteeOperation # operations;
            
        } else skip;    

        // updateVestee action type
        if actionType = "toggleVesteeLock" then block {
            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const toggleVesteeLockOperation : operation = Tezos.transaction(
                _councilActionRecord.address_param_1,
                0tez, 
                sendToggleVesteeLockParams(vestingAddress)
            );

            operations := toggleVesteeLockOperation # operations;
            
        } else skip;    

        // addCouncilMember action type
        if actionType = "addCouncilMember" then block {
            s.councilMembers := Set.add(_councilActionRecord.address_param_1, s.councilMembers);
        } else skip;

        // removeCouncilMember action type
        if actionType = "removeCouncilMember" then block {
            s.councilMembers := Set.remove(_councilActionRecord.address_param_1, s.councilMembers);
        } else skip;

        // changeCouncilMember action type
        if actionType = "changeCouncilMember" then block {
            s.councilMembers := Set.add(_councilActionRecord.address_param_2, s.councilMembers);
            s.councilMembers := Set.remove(_councilActionRecord.address_param_1, s.councilMembers);
        } else skip;

        // type councilActionTransferType is [@layout:comb] record [
        //     receiverAddress       : address;       // receiver address
        //     tokenContractAddress  : address;       // token contract address
        //     tokenAmount           : nat;           // token amount requested
        //     tokenType             : string;        // "XTZ", "FA12", "FA2"
        //     tokenId               : nat;        
        // ]
        if actionType = "transfer" then block {

            const from_  : address   = Tezos.self_address;
            const to_    : address   = _councilActionRecord.address_param_1;
            const amt    : nat       = _councilActionRecord.nat_param_1;
            
            // ---- set token type ----
            var _tokenTransferType : tokenType := Tez;

            if  _councilActionRecord.string_param_1 = "XTZ" then block {
              _tokenTransferType := Tez; 
            } else skip;

            if  _councilActionRecord.string_param_1 = "FA12" then block {
              _tokenTransferType := Fa12(_councilActionRecord.address_param_2); 
            } else skip;

            if  _councilActionRecord.string_param_1 = "FA2" then block {
              _tokenTransferType := Fa2(record [
                token = _councilActionRecord.address_param_2;
                id    = _councilActionRecord.nat_param_2;
              ]); 
            } else skip;
            // --- --- ---

            // const councilTransferOperation : operation = case _tokenTransferType of 
            //     | Tez         -> transfer_tez((get_contract(to_) : contract(unit)), amt)
            //     | Fa12(token) -> block{
            //             const transferOperation : operation = transfer_fa12(from_, to_, amt, token);
            //         } with transferOperation
            //     | Fa2(token)  -> block {
            //             const transferOperation : operation = transfer_fa2(from_, to_, amt, token.token, token.id);
            //         } with transferOperation
            // end;

            // operations := councilTransferOperation # operations;

        } else skip;

        // requestTokens action type
        if actionType = "requestTokens" then block {
            
            var governanceAddress : address := case s.generalContracts["governance"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Governance Contract Address not found")
            end;

            const requestTokensParams : councilActionRequestTokensType = record[
                treasuryAddress       = _councilActionRecord.address_param_1;
                tokenContractAddress  = _councilActionRecord.address_param_2;
                tokenName             = _councilActionRecord.string_param_1;
                tokenAmount           = _councilActionRecord.nat_param_1;
                tokenType             = _councilActionRecord.string_param_3;
                tokenId               = _councilActionRecord.nat_param_2;
                purpose               = _councilActionRecord.string_param_2;
            ];

            const requestTokensOperation : operation = Tezos.transaction(
                requestTokensParams,
                0tez, 
                sendRequestTokensParams(governanceAddress)
            );

            operations := requestTokensOperation # operations;
        } else skip;

        // requestMint action type
        if actionType = "requestMint" then block {
            
            var governanceAddress : address := case s.generalContracts["governance"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Governance Contract Address not found")
            end;

            const requestMintParams : councilActionRequestMintType = record[
                tokenAmount      = _councilActionRecord.nat_param_1;
                tokenType        = _councilActionRecord.string_param_2;
                tokenId          = _councilActionRecord.nat_param_2;
                treasuryAddress  = _councilActionRecord.address_param_1;
                purpose          = _councilActionRecord.string_param_1;
            ];

            const requestMintOperation : operation = Tezos.transaction(
                requestMintParams,
                0tez, 
                sendRequestMintParams(governanceAddress)
            );

            operations := requestMintOperation # operations;
        } else skip;

        // update council action record status
        _councilActionRecord.status              := "EXECUTED";
        _councilActionRecord.executed            := True;
        _councilActionRecord.executedDateTime    := Tezos.now;
        _councilActionRecord.executedLevel       := Tezos.level;
        
        // save council action record
        s.councilActionsLedger[actionId]         := _councilActionRecord;

    } else skip;

} with (operations, s)

function main (const action : councilAction; const s : storage) : return is 
    case action of
        | Default(_params) -> ((nil : list(operation)), s)
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        | CouncilActionAddVestee(parameters) -> councilActionAddVestee(parameters, s)
        | CouncilActionRemoveVestee(parameters) -> councilActionRemoveVestee(parameters, s)
        | CouncilActionUpdateVestee(parameters) -> councilActionUpdateVestee(parameters, s)
        | CouncilActionToggleVesteeLock(parameters) -> councilActionToggleVesteeLock(parameters, s)
        
        | CouncilActionAddMember(parameters) -> councilActionAddMember(parameters, s)
        | CouncilActionRemoveMember(parameters) -> councilActionRemoveMember(parameters, s)
        | CouncilActionChangeMember(parameters) -> councilActionChangeMember(parameters.0, parameters.1, s)
        | CouncilActionTransfer(parameters) -> councilActionTransfer(parameters, s)
        
        | CouncilActionRequestTokens(parameters) -> councilActionRequestTokens(parameters, s)
        | CouncilActionRequestMint(parameters) -> councilActionRequestMint(parameters, s)

        | SignAction(parameters) -> signAction(parameters, s)
        | FlushAction(parameters) -> flushAction(parameters, s)
    end