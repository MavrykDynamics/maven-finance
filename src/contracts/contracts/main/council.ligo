// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type councilMembersType is set(address)

// todo: consideration: include a signature hash of signer for added security?

type signersType is set(address)

type councilActionRecordType is record [

    initiator                  : address;          // address of action initiator
    actionType                 : string;           // addVestee / updateVestee / toggleTreasury
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
    nat_param_1                : nat;
    nat_param_2                : nat;
    nat_param_3                : nat;
    string_param_1             : string;
    string_param_2             : string;
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

type councilAction is 
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams

    | CouncilActionAddVestee of councilActionAddVesteeType
    | CouncilActionRemoveVestee of address
    | CouncilActionUpdateVestee of councilActionUpdateVesteeType
    | CouncilActionToggleVesteeLock of address
    // | councilActionToggleTreasuryWithdraw of unit
    | CouncilActionAddCouncilMember of address
    | CouncilActionRemoveMember of address

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

// function toggleTreasuryParams(const contractAddress : address) : contract(unit) is
// case (Tezos.get_entrypoint_opt(
//     "%toggleMintWithdraw",
//     contractAddress) : option(contract(unit))) of
// Some(contr) -> contr
// | None -> (failwith("toggleMintWithdraw entrypoint in Treasury Contract not found") : contract(unit))
// end;

function councilActionAddCouncilMember(const newCouncilMemberAddress : address ; var s : storage) : return is 
block {

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
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed

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

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "removeCouncilMember";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = councilMemberAddress;
        address_param_2       = zeroAddress;            // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";                // extra slot for string if needed
        string_param_2        = "EMPTY";                // extra slot for string if needed

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

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "addVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = addVestee.0;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = addVestee.1;
        nat_param_2           = addVestee.2;
        nat_param_3           = addVestee.3;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed

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

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "removeVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = vesteeAddress;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed

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
    
    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "updateVestee";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = updateVestee.0;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = updateVestee.1;
        nat_param_2           = updateVestee.2;
        nat_param_3           = updateVestee.3;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed

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

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.sender;
        actionType            = "toggleVesteeLock";
        signers               = set[Tezos.sender];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        address_param_1       = vesteeAddress;
        address_param_2       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;
        nat_param_3           = 0n;
        string_param_1        = "EMPTY";         // extra slot for string if needed
        string_param_2        = "EMPTY";         // extra slot for string if needed

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

function councilActionToggleTreasuryWithdraw(var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    skip

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

        // toggleTreasury action type
        // if actionType = "toggleTreasury" then block {
        //     var treasuryAddress : address := case s.generalContracts["treasuryAddress"] of 
        //         Some(_address) -> _address
        //         | None -> failwith("Error. Treasury Contract Address not found")
        //     end;

        //     const toggleTreasuryOperation : operation = Tezos.transaction(
        //         unit,
        //         0tez, 
        //         toggleTreasuryParams(treasuryAddress)
        //     );

        //     operations := toggleTreasuryOperation # operations;
            
        // } else skip;

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
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        | CouncilActionAddVestee(parameters) -> councilActionAddVestee(parameters, s)
        | CouncilActionRemoveVestee(parameters) -> councilActionRemoveVestee(parameters, s)
        | CouncilActionUpdateVestee(parameters) -> councilActionUpdateVestee(parameters, s)
        | CouncilActionToggleVesteeLock(parameters) -> councilActionToggleVesteeLock(parameters, s)
        // | CouncilActionToggleTreasuryWithdraw(_parameters) -> councilActionToggleTreasuryWithdraw(s)
        | CouncilActionAddCouncilMember(parameters) -> councilActionAddCouncilMember(parameters, s)
        | CouncilActionRemoveMember(parameters) -> councilActionRemoveMember(parameters, s)

        | SignAction(parameters) -> signAction(parameters, s)
        | FlushAction(parameters) -> flushAction(parameters, s)
    end