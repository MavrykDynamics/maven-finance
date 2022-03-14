// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type configType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDays            : nat;                 // action expiry in number of days
]

type councilMembersType is set(address)
type signersType is set(address)

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigThreshold of unit
| ConfigActionExpiryDays of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : updateConfigNewValueType; 
  updateConfigAction    : updateConfigActionType;
]

type addressMapType   is map(string, address);
type natMapType       is map(string, nat);

type actionRecordType is record [
    
    initiator                  : address;          // address of action initiator
    status                     : string;           // PENDING / FLUSHED / EXECUTED / EXPIRED
    actionType                 : string;           // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, removeBreakGlassControl
    executed                   : bool;             // boolean of whether action has been executed

    signers                    : signersType;      // set of signers
    signersCount               : nat;              // total number of signers

    addressMap                 : addressMapType;
    natMap                     : natMapType;

    startDateTime              : timestamp;       // timestamp of when action was initiated
    startLevel                 : nat;             // block level of when action was initiated           
    executedDateTime           : timestamp;       // will follow startDateTime and be updated when executed
    executedLevel              : nat;             // will follow startLevel and be updated when executed
    expirationDateTime         : timestamp;       // timestamp of when action will expire
    
]
type actionsLedgerType is big_map(nat, actionRecordType)

type storage is record [
    admin                       : address;                   // for init of contract - needed?
    config                      : configType;
    glassBroken                 : bool;
    councilMembers              : councilMembersType;        // set of council member addresses
    developerAddress            : address;                   // developer address

    whitelistContracts          : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts            : generalContractsType;      // map of all contract addresses (e.g. doorman, delegation, vesting)
    
    actionsLedger               : actionsLedgerType;         // record of past actions taken by council members
    actionCounter               : nat;
]

type signActionType is (nat)
type flushActionType is (nat)

type breakGlassAction is 
    | BreakGlass of (unit)
    | UpdateConfig of updateConfigParamsType    

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
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsCouncilMember(var s : storage) : unit is
    if Set.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith("Only council members can call this entrypoint.");

function checkSenderIsEmergencyGovernanceContract(var s : storage) : unit is
block{
  const emergencyGovernanceAddress : address = case s.whitelistContracts["emergencyGovernance"] of
      Some(_address) -> _address
      | None -> failwith("Error. Emergency Governance Contract is not found.")
  end;
  if (Tezos.sender = emergencyGovernanceAddress) then skip
    else failwith("Error. Only the Emergency Governance Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
      else failwith("This entrypoint should not receive any tez.");

function checkGlassIsBroken(var s : storage) : unit is
    if s.glassBroken = True then unit
      else failwith("Error. Glass has not been broken");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

// helper function to pause all entrypoints in contract 
function pauseAllEntrypointsInContract(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%pauseAll",
      contractAddress) : option(contract(unit))) of
    Some(contr) -> contr
  | None -> (failwith("pauseAll entrypoint in Contract Address not found") : contract(unit))
  end;

// helper function to unpause all entrypoints in contract 
function unpauseAllEntrypointsInContract(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%unpauseAll",
      contractAddress) : option(contract(unit))) of
    Some(contr) -> contr
  | None -> (failwith("unpauseAll entrypoint in Contract Address not found") : contract(unit))
  end;

// helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of
    Some(contr) -> contr
  | None -> (failwith("setAdmin entrypoint in Contract Address not found") : contract(address))
  end;

function breakGlass(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. set contract admins to breakglass address - should be done in emergency governance?
    // 2. send pause all operations to main contracts

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);
    s.glassBroken := True; // break glass to give council members access to protected entrypoints

} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  // checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
    ConfigThreshold (_v)                  -> s.config.threshold                 := updateConfigNewValue
  | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
  end;

} with (noOperations, s)

function addCouncilMember(const councilMemberAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

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

function removeCouncilMember(const councilMemberAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

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

function changeCouncilMember(const oldCouncilMemberAddress : address; const newCouncilMemberAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

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

function flushAction(const actionId: flushActionType; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

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

function pauseAllEntrypoints(var s : storage) : return is
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

function unpauseAllEntrypoints(var s : storage) : return is
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

function setSingleContractAdmin(const newAdminAddress : address; const targetContractAddress : address; var s : storage) : return is 
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

function setAllContractsAdmin(const newAdminAddress : address; var s : storage) : return is 
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


function removeBreakGlassControl(var s : storage) : return is 
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


// function signAction(const actionId: nat; const voteType: nat; var s : storage) : return is 
function signAction(const actionId: nat; var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    var _actionRecord : actionRecordType := case s.actionsLedger[actionId] of
        | Some(_record) -> _record
        | None -> failwith("Error. Break Glass action record not found.")
    end;

    // check if break glass action has been flushed
    if _actionRecord.status = "FLUSHED" then failwith("Error. Break Glass action has been flushed") else skip;

    // check if break glass action has expired (status check, and block level + timestamp check)
    if _actionRecord.status = "Expired" then failwith("Error. Break Glass action has expired") else skip;

    var isExpired : bool := False;
    if Tezos.now > _actionRecord.expirationDateTime then isExpired := True else isExpired := False;

    if isExpired = True then block {
        _actionRecord.status       := "EXPIRED";
         s.actionsLedger[actionId] := _actionRecord;
        failwith("Error. Break Glass action has expired.");
    } else skip;

    // update signers and signersCount for break glass action record
    var signersCount : nat             := _actionRecord.signersCount + 1n;
    _actionRecord.signersCount         := signersCount;
    _actionRecord.signers              := Set.add(Tezos.sender, _actionRecord.signers);
    s.actionsLedger[actionId]          := _actionRecord;

    const actionType : string = _actionRecord.actionType;

    var operations : list(operation) := nil;

    // check if threshold has been reached
    if signersCount = s.config.threshold then block {
        
        // --------------------------------------
        // execute action based on action types
        // --------------------------------------

        // flush action type
        if actionType = "flushAction" then block {

            // fetch params begin ---
            const flushedActionId : nat = case _actionRecord.natMap["actionId"] of
                Some(_nat) -> _nat
                | None -> failwith("Error. ActionId not found.")
            end;
            // fetch params end ---

            var flushedActionRecord : actionRecordType := case s.actionsLedger[flushedActionId] of        
                Some(_record) -> _record
                | None -> failwith("Error. Action not found")
            end;

            flushedActionRecord.status := "FLUSHED";
            s.actionsLedger[flushedActionId] := flushedActionRecord;

        } else skip;



        // addCouncilMember action type
        if actionType = "addCouncilMember" then block {

            // fetch params begin ---
            const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. CouncilMemberAddress not found.")
            end;
            // fetch params end ---

            s.councilMembers := Set.add(councilMemberAddress, s.councilMembers);
        } else skip;



        // removeCouncilMember action type
        if actionType = "removeCouncilMember" then block {
            // fetch params begin ---
            const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. CouncilMemberAddress not found.")
            end;
            // fetch params end ---
            s.councilMembers := Set.remove(councilMemberAddress, s.councilMembers);
        } else skip;



        // changeCouncilMember action type
        if actionType = "changeCouncilMember" then block {

            // fetch params begin ---
            const oldCouncilMemberAddress : address = case _actionRecord.addressMap["oldCouncilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. OldCouncilMemberAddress not found.")
            end;

            const newCouncilMemberAddress : address = case _actionRecord.addressMap["newCouncilMemberAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. NewCouncilMemberAddress not found.")
            end;
            // fetch params end ---

            s.councilMembers := Set.add(newCouncilMemberAddress, s.councilMembers);
            s.councilMembers := Set.remove(oldCouncilMemberAddress, s.councilMembers);
        } else skip;



        // pauseAllEntrypoints action type
        if actionType = "pauseAllEntrypoints" then block {
            for _contractName -> contractAddress in map s.generalContracts block {
                const unpauseAllEntrypointsInContractOperation : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    unpauseAllEntrypointsInContract(contractAddress)
                );
                operations := unpauseAllEntrypointsInContractOperation # operations;
            };      
        } else skip;



        // unpauseAllEntrypoints action type
        if actionType = "unpauseAllEntrypoints" then block {
            for _contractName -> contractAddress in map s.generalContracts block {
                const unpauseAllEntrypointsInContractOperation : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    unpauseAllEntrypointsInContract(contractAddress)
                );
                operations := unpauseAllEntrypointsInContractOperation # operations;
            };            
        } else skip;



        // setSingleContractAdmin action type
        if actionType = "setSingleContractAdmin" then block {

            // fetch params begin ---
            const newAdminAddress : address = case _actionRecord.addressMap["newAdminAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. NewAdminAddress not found.")
            end;

            const targetContractAddress : address = case _actionRecord.addressMap["targetContractAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. TargetContractAddress not found.")
            end;
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

            // fetch params begin ---
            const newAdminAddress : address = case _actionRecord.addressMap["newAdminAddress"] of
                Some(_address) -> _address
                | None -> failwith("Error. NewAdminAddress not found.")
            end;
            // fetch params end ---


            for _contractName -> contractAddress in map s.generalContracts block {
                const setContractAdminOperation : operation = Tezos.transaction(
                    newAdminAddress, 
                    0tez, 
                    setAdminInContract(contractAddress)
                );
                operations := setContractAdminOperation # operations;
            } 
        } else skip;



        // removeBreakGlassControl action type
        if actionType = "removeBreakGlassControl" then block {
            // remove break glass control on contract
            // ensure settings (entrypoints unpaused, admin reset to governance dao) has been done
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

function main (const action : breakGlassAction; const s : storage) : return is 
    case action of
        | BreakGlass(_parameters) -> breakGlass(s)
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
    end