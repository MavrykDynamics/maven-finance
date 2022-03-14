// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type councilMembersType is set(address)

// todo: consideration: include a signature hash of signer for added security?

type signersType is set(address)

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

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
    
    // address_param_1            : address;
    // address_param_2            : address;
    // address_param_3            : address;
    // nat_param_1                : nat;
    // nat_param_2                : nat;
    // nat_param_3                : nat;
    // string_param_1             : string;
    // string_param_2             : string;
    // string_param_3             : string;
    
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

type configType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDays            : nat;                 // action expiry in number of days 
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

type councilActionAddVesteeType is  [@layout:comb] record [ 
    vesteeAddress               : address;
    totalAllocatedAmount        : nat;
    cliffInMonths               : nat;
    vestingInMonths             : nat;
] 
type councilActionUpdateVesteeType is [@layout:comb] record [ 
    vesteeAddress               : address;
    newTotalAllocatedAmount     : nat;
    newCliffInMonths            : nat;
    newVestingInMonths          : nat;
] 

type flushActionType is (nat)

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigThreshold of unit
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
    | SetAdmin of address
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


////
// TRANSFER FUNCTIONS
///
function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: fa2TransferType = list[
            record[
                from_ = from_;
                txs = list[
                    record[
                        to_      = to_;
                        token_id = tokenId;
                        amount   = tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(fa2TransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of
            Some (c) -> c
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        end;
} with (Tezos.transaction(transferParams, 0tez, tokenContract))


////
// Housekeeping Entrypoints
///

(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
    ConfigThreshold (_v)                  -> s.config.threshold                 := updateConfigNewValue
  | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
  end;

} with (noOperations, s)

////
// Council Action Entrypoints
///

function councilActionAddMember(const newCouncilMemberAddress : address ; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const addressMap          : addressMapType     = map [
            ("councilMemberAddress" : string) -> newCouncilMemberAddress
        ];
    const emptyStringMap      : stringMapType      = map [];
    const emptyNatMap         : natMapType         = map [];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "addCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap          : addressMapType     = map [
            ("councilMemberAddress" : string) -> councilMemberAddress
        ];
    const emptyStringMap      : stringMapType      = map [];
    const emptyNatMap         : natMapType         = map [];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "removeCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap          : addressMapType     = map [
            ("oldCouncilMemberAddress" : string) -> oldCouncilMemberAddress;
            ("newCouncilMemberAddress" : string) -> newCouncilMemberAddress;
        ];
    const emptyStringMap      : stringMapType      = map [];
    const emptyNatMap         : natMapType         = map [];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "changeCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("receiverAddress"       : string) -> councilActionTransferParams.receiverAddress;
        ("tokenContractAddress"  : string) -> councilActionTransferParams.tokenContractAddress;
    ];
    const stringMap : stringMapType      = map [
        ("tokenType"             : string) -> councilActionTransferParams.tokenType; 
    ];
    const natMap : natMapType         = map [
        ("tokenAmount"           : string) -> councilActionTransferParams.tokenAmount;
        ("tokenId"               : string) -> councilActionTransferParams.tokenId;
    ];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "transfer";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = stringMap;
        natMap                = natMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("vesteeAddress"         : string) -> addVestee.vesteeAddress;
    ];
    const emptyStringMap : stringMapType = map [];
    const natMap : natMapType            = map [
        ("totalAllocatedAmount"  : string) -> addVestee.totalAllocatedAmount;
        ("cliffInMonths"         : string) -> addVestee.cliffInMonths;
        ("vestingInMonths"       : string) -> addVestee.vestingInMonths;
    ];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "addVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = natMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("vesteeAddress"         : string) -> vesteeAddress;
    ];
    const emptyStringMap : stringMapType  = map [];
    const emptyNatMap : natMapType        = map [];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "removeVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("vesteeAddress"         : string) -> updateVestee.vesteeAddress;
    ];
    const emptyStringMap : stringMapType = map [];
    const natMap : natMapType            = map [
        ("newTotalAllocatedAmount"  : string) -> updateVestee.newTotalAllocatedAmount;
        ("newCliffInMonths"         : string) -> updateVestee.newCliffInMonths;
        ("newVestingInMonths"       : string) -> updateVestee.newVestingInMonths;
    ];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "updateVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = natMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("vesteeAddress"         : string) -> vesteeAddress;
    ];
    const emptyStringMap : stringMapType  = map [];
    const emptyNatMap : natMapType        = map [];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "toggleVesteeLock";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = emptyStringMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("treasuryAddress"       : string) -> councilActionRequestTokensParams.treasuryAddress;
        ("tokenContractAddress"  : string) -> councilActionRequestTokensParams.tokenContractAddress;
    ];
    const stringMap : stringMapType      = map [
        ("tokenName"             : string) -> councilActionRequestTokensParams.tokenName; 
        ("purpose"               : string) -> councilActionRequestTokensParams.purpose;        
        ("tokenType"             : string) -> councilActionRequestTokensParams.tokenType;  
    ];
    const natMap : natMapType         = map [
        ("tokenAmount"           : string) -> councilActionRequestTokensParams.tokenAmount;
        ("tokenId"               : string) -> councilActionRequestTokensParams.tokenId;
    ];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "requestTokens";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = stringMap;
        natMap                = natMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
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

    const addressMap : addressMapType     = map [
        ("treasuryAddress"       : string) -> councilActionRequestMintParams.treasuryAddress;
    ];
    const stringMap : stringMapType      = map [
        ("purpose"               : string) -> councilActionRequestMintParams.purpose; 
        ("tokenType"             : string) -> "FA2";  
    ];
    const natMap : natMapType         = map [
        ("tokenAmount"           : string) -> councilActionRequestMintParams.tokenAmount;
        ("tokenId"               : string) -> councilActionRequestMintParams.tokenId;
    ];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "requestMint";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = stringMap;
        natMap                = natMap;     

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)


function flushAction(const actionId: flushActionType; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new council action record, set the sender as a signer of the action
    // 3. Increment action counter
    
    checkSenderIsCouncilMember(s);

    const emptyAddressMap  : addressMapType     = map [];
    const emptyStringMap   : stringMapType      = map [];
    const natMap           : natMapType         = map [
        ("actionId" : string) -> actionId;
    ];

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "flushAction";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = emptyAddressMap;
        stringMap             = emptyStringMap;
        natMap                = natMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

// function signAction(const actionId: nat; const voteType: nat; var s : storage) : return is 
function signAction(const actionId: nat; var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    var _councilActionRecord : councilActionRecordType := case s.councilActionsLedger[actionId] of        
        Some(_record) -> _record
        | None -> failwith("Error. Council Action not found")
    end;

    // check if council action has been flushed
    if _councilActionRecord.status = "FLUSHED" then failwith("Error. Council action has been flushed") else skip;

    // check if council action has expired (status check, and block level + timestamp check)
    if _councilActionRecord.status = "Expired" then failwith("Error. Council action has expired") else skip;

    var isExpired : bool := False;
    if Tezos.now > _councilActionRecord.expirationDateTime then isExpired := True else isExpired := False;

    if isExpired = True then block {
        _councilActionRecord.status       := "EXPIRED";
         s.councilActionsLedger[actionId] := _councilActionRecord;
        failwith("Error. Council action has expired.");
    } else skip;

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

        // flush action type
        if actionType = "flushAction" then block {

            // fetch params begin ---
            const flushedCouncilActionId : nat = case _councilActionRecord.natMap["actionId"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. ActionId not found.")
            end;
            // fetch params end ---

            var flushedCouncilActionRecord : councilActionRecordType := case s.councilActionsLedger[flushedCouncilActionId] of        
                Some(_record) -> _record
                | None -> failwith("Error. Council Action not found")
            end;

            flushedCouncilActionRecord.status := "FLUSHED";
            s.councilActionsLedger[flushedCouncilActionId] := flushedCouncilActionRecord;

        } else skip;



        // addVestee action type
        if actionType = "addVestee" then block {

            // fetch params begin ---
            const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. VesteeAddress not found.")
            end;

            const totalAllocatedAmount : nat = case _councilActionRecord.natMap["totalAllocatedAmount"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TotalAllocatedAmount not found.")
            end;

            const cliffInMonths : nat = case _councilActionRecord.natMap["cliffInMonths"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. CliffInMonths not found.")
            end;

            const vestingInMonths : nat = case _councilActionRecord.natMap["vestingInMonths"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. VestingInMonths not found.")
            end;
            // fetch params end ---

            const addVesteeParams : councilActionAddVesteeType = record [
                vesteeAddress           = vesteeAddress;
                totalAllocatedAmount    = totalAllocatedAmount;
                cliffInMonths           = cliffInMonths;
                vestingInMonths         = vestingInMonths;
            ];

            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const addVesteeOperation : operation = Tezos.transaction(
                addVesteeParams,
                0tez, 
                sendAddVesteeParams(vestingAddress)
            );
            
            operations := addVesteeOperation # operations;

        } else skip;



        // addVestee action type
        if actionType = "removeVestee" then block {

            // fetch params begin ---
            const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. VesteeAddress not found.")
            end;
            // fetch params end ---


            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const removeVesteeOperation : operation = Tezos.transaction(
                vesteeAddress,
                0tez, 
                sendRemoveVesteeParams(vestingAddress)
            );
            
            operations := removeVesteeOperation # operations;

        } else skip;



        // updateVestee action type
        if actionType = "updateVestee" then block {

            // fetch params begin ---
            const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. VesteeAddress not found.")
            end;

            const newTotalAllocatedAmount : nat = case _councilActionRecord.natMap["newTotalAllocatedAmount"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. NewTotalAllocatedAmount not found.")
            end;

            const newCliffInMonths : nat = case _councilActionRecord.natMap["newCliffInMonths"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. NewCliffInMonths not found.")
            end;

            const newVestingInMonths : nat = case _councilActionRecord.natMap["newVestingInMonths"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. NewVestingInMonths not found.")
            end;
            // fetch params end ---

            const updateVesteeParams : councilActionUpdateVesteeType = record [
                vesteeAddress               = vesteeAddress;
                newTotalAllocatedAmount     = newTotalAllocatedAmount;
                newCliffInMonths            = newCliffInMonths;
                newVestingInMonths          = newVestingInMonths;
            ];

            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const updateVesteeOperation : operation = Tezos.transaction(
                updateVesteeParams,
                0tez, 
                sendUpdateVesteeParams(vestingAddress)
            );

            operations := updateVesteeOperation # operations;
            
        } else skip;    



        // updateVestee action type
        if actionType = "toggleVesteeLock" then block {

            // fetch params begin ---
            const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. VesteeAddress not found.")
            end;
            // fetch end begin ---

            var vestingAddress : address := case s.generalContracts["vesting"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Vesting Contract Address not found")
            end;

            const toggleVesteeLockOperation : operation = Tezos.transaction(
                vesteeAddress,
                0tez, 
                sendToggleVesteeLockParams(vestingAddress)
            );

            operations := toggleVesteeLockOperation # operations;
            
        } else skip;    



        // addCouncilMember action type
        if actionType = "addCouncilMember" then block {

            // fetch params begin ---
            const councilMemberAddress : address = case _councilActionRecord.addressMap["councilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. CouncilMemberAddress not found.")
            end;
            // fetch params end ---

            s.councilMembers := Set.add(councilMemberAddress, s.councilMembers);
        } else skip;



        // removeCouncilMember action type
        if actionType = "removeCouncilMember" then block {

            // fetch params begin ---
            const councilMemberAddress : address = case _councilActionRecord.addressMap["councilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. CouncilMemberAddress not found.")
            end;
            // fetch params end ---

            s.councilMembers := Set.remove(councilMemberAddress, s.councilMembers);
        } else skip;



        // changeCouncilMember action type
        if actionType = "changeCouncilMember" then block {

            // fetch params begin ---
            const oldCouncilMemberAddress : address = case _councilActionRecord.addressMap["oldCouncilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. OldCouncilMemberAddress not found.")
            end;

            const newCouncilMemberAddress : address = case _councilActionRecord.addressMap["newCouncilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. NewCouncilMemberAddress not found.")
            end;
            // fetch params end ---


            s.councilMembers := Set.add(newCouncilMemberAddress, s.councilMembers);
            s.councilMembers := Set.remove(oldCouncilMemberAddress, s.councilMembers);
        } else skip;



        // transfer action type
        if actionType = "transfer" then block {

            // fetch params begin ---
            const receiverAddress : address = case _councilActionRecord.addressMap["receiverAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. ReceiverAddress not found.")
            end;

            const tokenContractAddress : address = case _councilActionRecord.addressMap["tokenContractAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. TokenContractAddress not found.")
            end;

            const tokenType : string = case _councilActionRecord.stringMap["tokenType"] of
                Some(_string) -> _string
                | None -> failwith("Error. TokenType not found.")
            end;

            const tokenAmount : nat = case _councilActionRecord.natMap["tokenAmount"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TokenAmount not found.")
            end;

            const tokenId : nat = case _councilActionRecord.natMap["tokenId"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TokenId not found.")
            end;
            // fetch params end ---


            const from_  : address   = Tezos.self_address;
            const to_    : address   = receiverAddress;
            const amt    : nat       = tokenAmount;
            
            // ---- set token type ----
            var _tokenTransferType : tokenType := Tez;

            if  tokenType = "XTZ" then block {
              _tokenTransferType      := Tez; 
            } else skip;

            if  tokenType = "FA12" then block {
              _tokenTransferType      := Fa12(tokenContractAddress); 
            } else skip;

            if  tokenType = "FA2" then block {
              _tokenTransferType      := Fa2(record [
                tokenContractAddress   = tokenContractAddress;
                tokenId                = tokenId;
              ]); 
            } else skip;
            // --- --- ---

            const transferTokenOperation : operation = case _tokenTransferType of 
                | Tez         -> transferTez((get_contract(to_) : contract(unit)), amt)
                | Fa12(token) -> transferFa12Token(from_, to_, amt, token)
                | Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
            end;

            operations := transferTokenOperation # operations;

        } else skip;

        // requestTokens action type
        if actionType = "requestTokens" then block {

            // fetch params begin ---
            const treasuryAddress : address = case _councilActionRecord.addressMap["treasuryAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. TreasuryAddress not found.")
            end;

            const tokenContractAddress : address = case _councilActionRecord.addressMap["tokenContractAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. TokenContractAddress not found.")
            end;

            const tokenType : string = case _councilActionRecord.stringMap["tokenType"] of
                Some(_string) -> _string
                | None -> failwith("Error. TokenType not found.")
            end;

            const tokenName : string = case _councilActionRecord.stringMap["tokenName"] of
                Some(_string) -> _string
                | None -> failwith("Error. TokenName not found.")
            end;

            const purpose : string = case _councilActionRecord.stringMap["purpose"] of
                Some(_string) -> _string
                | None -> failwith("Error. Purpose not found.")
            end;

            const tokenAmount : nat = case _councilActionRecord.natMap["tokenAmount"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TokenAmount not found.")
            end;

            const tokenId : nat = case _councilActionRecord.natMap["tokenId"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TokenId not found.")
            end;
            // fetch params end ---


            const requestTokensParams : councilActionRequestTokensType = record[
                treasuryAddress       = treasuryAddress;
                tokenContractAddress  = tokenContractAddress;
                tokenName             = tokenName;
                tokenAmount           = tokenAmount;
                tokenType             = tokenType;
                tokenId               = tokenId;
                purpose               = purpose;
            ];

            var governanceAddress : address := case s.generalContracts["governance"] of 
                Some(_address) -> _address
                | None -> failwith("Error. Governance Contract Address not found")
            end;

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


            // fetch params begin ---
            const treasuryAddress : address = case _councilActionRecord.addressMap["treasuryAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. TreasuryAddress not found.")
            end;

            const tokenType : string = case _councilActionRecord.stringMap["tokenType"] of
                Some(_string) -> _string
                | None -> failwith("Error. TokenType not found.")
            end;

            const purpose : string = case _councilActionRecord.stringMap["purpose"] of
                Some(_string) -> _string
                | None -> failwith("Error. Purpose not found.")
            end;

            const tokenAmount : nat = case _councilActionRecord.natMap["tokenAmount"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TokenAmount not found.")
            end;

            const tokenId : nat = case _councilActionRecord.natMap["tokenId"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. TokenId not found.")
            end;
            // fetch params end ---


            const requestMintParams : councilActionRequestMintType = record[
                tokenAmount      = tokenAmount;
                tokenType        = tokenType;
                tokenId          = tokenId;
                treasuryAddress  = treasuryAddress;
                purpose          = purpose;
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
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        // Council actions for vesting
        | CouncilActionAddVestee(parameters) -> councilActionAddVestee(parameters, s)
        | CouncilActionRemoveVestee(parameters) -> councilActionRemoveVestee(parameters, s)
        | CouncilActionUpdateVestee(parameters) -> councilActionUpdateVestee(parameters, s)
        | CouncilActionToggleVesteeLock(parameters) -> councilActionToggleVesteeLock(parameters, s)
        
        // Council actions for internal control
        | CouncilActionAddMember(parameters) -> councilActionAddMember(parameters, s)
        | CouncilActionRemoveMember(parameters) -> councilActionRemoveMember(parameters, s)
        | CouncilActionChangeMember(parameters) -> councilActionChangeMember(parameters.0, parameters.1, s)
        | CouncilActionTransfer(parameters) -> councilActionTransfer(parameters, s)
        
        // Council actions to Governance DAO and Treasury
        | CouncilActionRequestTokens(parameters) -> councilActionRequestTokens(parameters, s)
        | CouncilActionRequestMint(parameters) -> councilActionRequestMint(parameters, s)

        | SignAction(parameters) -> signAction(parameters, s)
        | FlushAction(parameters) -> flushAction(parameters, s)
    end