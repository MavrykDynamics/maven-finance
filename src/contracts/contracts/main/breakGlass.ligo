// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// BreakGlass Types
#include "../partials/types/breakGlassTypes.ligo"

type breakGlassAction is 
    | BreakGlass of (unit)
    
    | SetAdmin of (address)
    | UpdateConfig of breakGlassUpdateConfigParamsType    

    // glass broken not required (updates through Governance DAO)
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams
    
    // Internal control of council members
    | AddCouncilMember of address
    | RemoveCouncilMember of address
    | ChangeCouncilMember of (address * address)
    
    // glass broken required
    | SetSingleContractAdmin of (address * address)   // set admin for single contract
    | SetAllContractsAdmin of (address)               // set admin for single contract
    | PauseAllEntrypoints of (unit)             
    | UnpauseAllEntrypoints of (unit)
    | RemoveBreakGlassControl of (unit)

    | SignAction of signActionType
    | FlushAction of flushActionType

const noOperations : list (operation) = nil;
type return is list (operation) * breakGlassStorage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : breakGlassStorage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsCouncilMember(var s : breakGlassStorage) : unit is
    if Set.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith("Only council members can call this entrypoint.");

function checkSenderIsEmergencyGovernanceContract(var s : breakGlassStorage) : unit is
block{
  const emergencyGovernanceAddress : address = case s.whitelistContracts["emergencyGovernance"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Emergency Governance Contract is not found.")
  ];
  if (Tezos.sender = emergencyGovernanceAddress) then skip
    else failwith("Error. Only the Emergency Governance Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
      else failwith("This entrypoint should not receive any tez.");

function checkGlassIsBroken(var s : breakGlassStorage) : unit is
    if s.glassBroken = True then unit
      else failwith("Error. Glass has not been broken");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: breakGlassStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: breakGlassStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

(* Transfer Entrypoint *)
function mergeOperations(const first: list (operation); const second: list (operation)) : list (operation) is 
  List.fold( 
    function(const operations: list(operation); const operation: operation): list(operation) is operation # operations,
    first,
    second
  )
// admin helper functions end ---------------------------------------------------------

// helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith("setAdmin entrypoint in Contract Address not found") : contract(address))
  ];

function breakGlass(var s : breakGlassStorage) : return is 
block {
    // Steps Overview:
    // 1. set contract admins to breakglass address - should be done in emergency governance?
    // 2. send pause all operations to main contracts

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);
    s.glassBroken := True; // break glass to give council members access to protected entrypoints

} with (noOperations, s)

(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : breakGlassStorage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    s.admin := newAdminAddress;

} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorage) : return is 
block {
  checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : breakGlassUpdateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : breakGlassUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
    ConfigThreshold (_v)                  -> if updateConfigNewValue > Set.cardinal(s.councilMembers) then failwith("Error. This config value cannot exceed the amount of members in the council") else s.config.threshold                 := updateConfigNewValue
  | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
  ];

} with (noOperations, s)

function addCouncilMember(const councilMemberAddress : address; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    // Check if new council member is already in the council
    if Set.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is already in the council")
    else skip;

    const addressMap : addressMapType     = map [
        ("councilMemberAddress" : string) -> councilMemberAddress;
    ];
    const emptyNatMap : natMapType        = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "addCouncilMember";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = addressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    // Check if council member is in the council
    if not Set.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is not in the council")
    else skip;

    // Check if removing the council member won't impact the threshold
    if (abs(Set.cardinal(s.councilMembers) - 1n)) < s.config.threshold then failwith("Error. Removing a council member will have an impact on the threshold. Try to adjust the threshold first.")
    else skip;

    const addressMap : addressMapType     = map [
        ("councilMemberAddress"         : string) -> councilMemberAddress;
    ];
    const emptyNatMap : natMapType        = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "removeCouncilMember";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = addressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function changeCouncilMember(const oldCouncilMemberAddress : address; const newCouncilMemberAddress : address; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    // Check if new council member is already in the council
    if Set.mem(newCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided new council member is already in the council")
    else skip;

    // Check if old council member is in the council
    if not Set.mem(oldCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided old council member is not in the council")
    else skip;

    const addressMap : addressMapType     = map [
        ("oldCouncilMemberAddress"         : string) -> oldCouncilMemberAddress;
        ("newCouncilMemberAddress"         : string) -> newCouncilMemberAddress;
    ];
    const emptyNatMap : natMapType        = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "changeCouncilMember";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = addressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function flushAction(const actionId: flushActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    // Check if actionID exist
    const actionToFlush: actionRecordType = case Big_map.find_opt(actionId, s.actionsLedger) of [
        Some (_action) -> _action
    |   None -> failwith("Error. There is no action linked to this actionId")
    ];

    // Check if action was previously flushed or executed
    if actionToFlush.executed then failwith("Error. This action was executed, it cannot be flushed")
    else skip;

    if actionToFlush.status = "FLUSHED" then failwith("Error. This action was flushed, it cannot be flushed again")
    else skip;

    const emptyAddressMap  : addressMapType      = map [];
    const natMap           : natMapType          = map [
        ("actionId" : string) -> actionId;
    ];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "flushAction";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = emptyAddressMap;
        natMap                = natMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function pauseAllEntrypoints(var s : breakGlassStorage) : return is
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);

    const emptyAddressMap  : addressMapType      = map [];
    const emptyNatMap      : natMapType          = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "pauseAllEntrypoints";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = emptyAddressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function unpauseAllEntrypoints(var s : breakGlassStorage) : return is
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);

    const emptyAddressMap  : addressMapType      = map [];
    const emptyNatMap      : natMapType          = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "unpauseAllEntrypoints";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = emptyAddressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function setSingleContractAdmin(const newAdminAddress : address; const targetContractAddress : address; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);

    // Check if the provided contract has a setAdmin entrypoint
    const checkEntrypoint: contract(address)    = setAdminInContract(targetContractAddress);

    const addressMap   : addressMapType      = map [
        ("newAdminAddress" : string) -> newAdminAddress;
        ("targetContractAddress" : string) -> targetContractAddress;
    ];
    const emptyNatMap  : natMapType          = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "setSingleContractAdmin";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = addressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)

function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);

    const addressMap   : addressMapType      = map [
        ("newAdminAddress" : string) -> newAdminAddress;
    ];
    const emptyNatMap  : natMapType          = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "setAllContractsAdmin";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = addressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)


function removeBreakGlassControl(var s : breakGlassStorage) : return is 
block {


    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);

    const emptyAddressMap  : addressMapType      = map [];
    const emptyNatMap      : natMapType          = map [];

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "removeBreakGlassControl";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        addressMap            = emptyAddressMap;
        natMap                = emptyNatMap;

        startDateTime         = Tezos.now;
        startLevel            = Tezos.level;             
        executedDateTime      = Tezos.now;
        executedLevel         = Tezos.level;
        expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (noOperations, s)


function signAction(const actionId: nat; var s : breakGlassStorage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    var _actionRecord : actionRecordType := case s.actionsLedger[actionId] of [
        | Some(_record) -> _record
        | None -> failwith("Error. Break Glass action record not found.")
    ];

    // check if break glass action has been flushed
    if _actionRecord.status = "FLUSHED" then failwith("Error. Break Glass action has been flushed") else skip;

    if Tezos.now > _actionRecord.expirationDateTime then failwith("Error. Break Glass action has expired") else skip;

    // check if signer already signed
    if Set.mem(Tezos.sender, _actionRecord.signers) then failwith("Error. Sender has already signed this break glass action") else skip;

    // update signers and signersCount for break glass action record
    var signersCount : nat             := _actionRecord.signersCount + 1n;
    _actionRecord.signersCount         := signersCount;
    _actionRecord.signers              := Set.add(Tezos.sender, _actionRecord.signers);
    s.actionsLedger[actionId]          := _actionRecord;

    const actionType : string = _actionRecord.actionType;

    var operations : list(operation) := nil;

    // check if threshold has been reached
    if signersCount >= s.config.threshold and not _actionRecord.executed then block {
        
        // --------------------------------------
        // execute action based on action types
        // --------------------------------------

        // flush action type
        if actionType = "flushAction" then block {

            // fetch params begin ---
            const flushedActionId : nat = case _actionRecord.natMap["actionId"] of [
                Some(_nat) -> _nat
                | None -> failwith("Error. ActionId not found.")
            ];
            // fetch params end ---

            var flushedActionRecord : actionRecordType := case s.actionsLedger[flushedActionId] of [     
                Some(_record) -> _record
                | None -> failwith("Error. Action not found")
            ];

            // Check if action was previously flushed or executed
            if flushedActionRecord.executed then failwith("Error. This action was executed, it cannot be flushed")
            else skip;

            if flushedActionRecord.status = "FLUSHED" then failwith("Error. This action was flushed, it cannot be flushed again")
            else skip;

            flushedActionRecord.status := "FLUSHED";
            s.actionsLedger[flushedActionId] := flushedActionRecord;

        } else skip;



        // addCouncilMember action type
        if actionType = "addCouncilMember" then block {

            // fetch params begin ---
            const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of [
                Some(_address) -> _address
                | None -> failwith("Error. CouncilMemberAddress not found.")
            ];
            // fetch params end ---

            // Check if new council member is already in the council
            if Set.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is already in the council")
            else s.councilMembers := Set.add(councilMemberAddress, s.councilMembers);
        } else skip;



        // removeCouncilMember action type
        if actionType = "removeCouncilMember" then block {
            // fetch params begin ---
            const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of [
                Some(_address) -> _address
                | None -> failwith("Error. CouncilMemberAddress not found.")
            ];
            // fetch params end ---

            // Check if council member is in the council
            if not Set.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is not in the council")
            else skip;

            // Check if removing the council member won't impact the threshold
            if (abs(Set.cardinal(s.councilMembers) - 1n)) < s.config.threshold then failwith("Error. Removing a council member will have an impact on the threshold. Try to adjust the threshold first.")
            else skip;

            s.councilMembers := Set.remove(councilMemberAddress, s.councilMembers);
        } else skip;



        // changeCouncilMember action type
        if actionType = "changeCouncilMember" then block {

            // fetch params begin ---
            const oldCouncilMemberAddress : address = case _actionRecord.addressMap["oldCouncilMemberAddress"] of [
                Some(_address) -> _address
                | None -> failwith("Error. OldCouncilMemberAddress not found.")
            ];

            const newCouncilMemberAddress : address = case _actionRecord.addressMap["newCouncilMemberAddress"] of [
                Some(_address) -> _address
                | None -> failwith("Error. NewCouncilMemberAddress not found.")
            ];
            // fetch params end ---

            // Check if new council member is already in the council
            if Set.mem(newCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided new council member is already in the council")
            else skip;

            // Check if old council member is in the council
            if not Set.mem(oldCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided old council member is not in the council")
            else skip;

            s.councilMembers := Set.add(newCouncilMemberAddress, s.councilMembers);
            s.councilMembers := Set.remove(oldCouncilMemberAddress, s.councilMembers);
        } else skip;



        // pauseAllEntrypoints action type
        if actionType = "pauseAllEntrypoints" then block {

            checkGlassIsBroken(s);          // check that glass is broken

            for _contractName -> contractAddress in map s.generalContracts block {
                case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                    Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                |   None -> skip
                ];
            };      
        } else skip;



        // unpauseAllEntrypoints action type
        if actionType = "unpauseAllEntrypoints" then block {

            checkGlassIsBroken(s);          // check that glass is broken

            for _contractName -> contractAddress in map s.generalContracts block {
                case (Tezos.get_entrypoint_opt("%unpauseAll", contractAddress) : option(contract(unit))) of [
                    Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                |   None -> skip
                ];
            };            
        } else skip;



        // setSingleContractAdmin action type
        if actionType = "setSingleContractAdmin" then block {

            checkGlassIsBroken(s);          // check that glass is broken

            // fetch params begin ---
            const newAdminAddress : address = case _actionRecord.addressMap["newAdminAddress"] of [
                Some(_address) -> _address
                | None -> failwith("Error. NewAdminAddress not found.")
            ];

            const targetContractAddress : address = case _actionRecord.addressMap["targetContractAddress"] of [
                Some(_address) -> _address
                | None -> failwith("Error. TargetContractAddress not found.")
            ];
            // fetch params end ---

            const setSingleContractAdminOperation : operation = Tezos.transaction(
                newAdminAddress, 
                0tez, 
                setAdminInContract(targetContractAddress)
            );
            operations := setSingleContractAdminOperation # operations;
        } else skip;



        // setAllContractsAdmin action type
        if actionType = "setAllContractsAdmin" then block {

            checkGlassIsBroken(s);          // check that glass is broken

            // fetch params begin ---
            const newAdminAddress : address = case _actionRecord.addressMap["newAdminAddress"] of [
                Some(_address) -> _address
            |   None -> failwith("Error. NewAdminAddress not found.")
            ];
            // fetch params end ---

            // Set self as contract admin
            s.admin := newAdminAddress;

            // Set all contracts in generalContracts map to given address
            for _contractName -> contractAddress in map s.generalContracts block {
                case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
                    Some(contr) -> operations := Tezos.transaction(newAdminAddress, 0tez, contr) # operations
                |   None -> skip
                ];
            } 
        } else skip;



        // removeBreakGlassControl action type
        if actionType = "removeBreakGlassControl" then block {
            // remove break glass control on contract
            // ensure settings (entrypoints unpaused, admin reset to governance dao) has been done
            checkGlassIsBroken(s);          // check that glass is broken

            // Reset all contracts admin to governance contract
            const governanceAddress : address = case s.generalContracts["governance"] of [
                Some(_address) -> _address
                | None -> failwith("Error. Governance Contract is not found.")
            ];
            s.admin := governanceAddress;

            for _contractName -> contractAddress in map s.generalContracts block {
                case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
                    Some(contr) -> operations := Tezos.transaction(governanceAddress, 0tez, contr) # operations
                |   None -> skip
                ];
            };

            // Reset glassBroken
            s.glassBroken := False;
        } else skip;

            
        // update break glass action record status
        _actionRecord.status              := "EXECUTED";
        _actionRecord.executed            := True;
        _actionRecord.executedDateTime    := Tezos.now;
        _actionRecord.executedLevel       := Tezos.level;
        
        // save break glass action record
        s.actionsLedger[actionId]         := _actionRecord;

    } else skip;

} with (operations, s)

function main (const action : breakGlassAction; const s : breakGlassStorage) : return is 
    block {
        checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    } with(
        case action of [
            | BreakGlass(_parameters) -> breakGlass(s)

            | SetAdmin(parameters) -> setAdmin(parameters, s)  
            | UpdateConfig(parameters) -> updateConfig(parameters, s)

            // glass broken not required
            | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
            | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

            // Internal control of council members
            | AddCouncilMember(parameters) -> addCouncilMember(parameters, s)
            | RemoveCouncilMember(parameters) -> removeCouncilMember(parameters, s)
            | ChangeCouncilMember(parameters) -> changeCouncilMember(parameters.0, parameters.1, s)
            
            // glass broken required
            | SetSingleContractAdmin(parameters) -> setSingleContractAdmin(parameters.0, parameters.1, s)
            | SetAllContractsAdmin(parameters) -> setAllContractsAdmin(parameters, s)
            | PauseAllEntrypoints(_parameters) -> pauseAllEntrypoints(s)
            | UnpauseAllEntrypoints(_parameters) -> unpauseAllEntrypoints(s)
            | RemoveBreakGlassControl(_parameters) -> removeBreakGlassControl(s)

            | SignAction(parameters) -> signAction(parameters, s)
            | FlushAction(parameters) -> flushAction(parameters, s)
        ]
    )