// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type configType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDuration        : nat;                 // action expiry duration in block levels
    developerAddress            : address;             // developer address
    emergencyGovernanceAddress  : address;             // emergency governance address
]

type councilMembersType is set(address)
type signersType is set(address)

type actionRecordType is record [
    
    initiator                  : address;          // address of action initiator
    status                     : string;           // PENDING / FLUSHED / EXECUTED / EXPIRED
    actionType                 : string;           // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, removeBreakGlassControl
    executed                   : bool;             // boolean of whether action has been executed

    signers                    : signersType;      // set of signers
    signersCount               : nat;              // total number of signers

    address_param_1            : address;
    address_param_2            : address;
    nat_param_1                : nat;
    nat_param_2                : nat;

    startDateTime              : timestamp;       // timestamp of when action was initiated
    startLevel                 : nat;             // block level of when action was initiated           
    executedDateTime           : timestamp;       // will follow startDateTime and be updated when executed
    executedLevel              : nat;             // will follow startLevel and be updated when executed
    expirationDateTime         : timestamp;       // timestamp of when action will expire
    
]
type actionsLedgerType is big_map(nat, actionRecordType)

type flushRecordType is record [
    action      : string;              // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, removeBreakGlassControl
    expired     : nat;                 // action expiry level in block levels
    threshold   : nat;                 // capture threshold at this point in time
    flushedBy   : councilMembersType; 
]
type flushLedgerType is big_map(nat, flushRecordType)

type storage is record [
    admin                       : address;               // for init of contract - needed?
    config                      : configType;
    
    generalContracts            : generalContractsType; // map of all contract addresses (e.g. doorman, delegation, vesting)
    
    glassBroken                 : bool;
    councilMembers              : councilMembersType;  // set of council member addresses
    
    actionsLedger               : actionsLedgerType;    // record of past actions taken by council members
    flushLedger                 : flushLedgerType;     // for council members to flush current action if required

    currentActionId             : nat;                 // current action id -> set to 0 if there is no action currently
    nextActionId                : nat;                 // index of next action id   
    
    actionCounter               : nat;
]

type signActionType is (nat)
type flushActionType is (nat)

type breakGlassAction is 
    | BreakGlass of (unit)

    // glass broken not required
    | SetEmergencyGovernanceAddress of (address)      // set emergency governance contract address
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
    if (Tezos.sender = s.config.emergencyGovernanceAddress) then unit
        else failwith("Only the Emergency Governance Contract can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

function checkGlassIsBroken(var s : storage) : unit is
    if s.glassBroken = True then unit
        else failwith("Error. Glass has not been broken");

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

function setEmergencyGovernanceAddress(const newEmergencyGovernanceAddress : address; var s : storage) : return is 
block {

//     Steps Overview:
//     1. check that sender is a council member
//     2. check if there is a current action already, if not add a new "setEmergencyGovernanceAddress" action record 
//     3. add sender to action record's approvedBy set
//     4. once threshold has been reached, immediately execute action and flush current action id to 0

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount 
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for updating multisig
        var newActionRecord : actionRecordType := record [
            action     = "setEmergencyGovernanceAddress";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionsLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of addCouncilMember type, if not fail
        var actionRecord : actionRecordType := case s.actionsLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setEmergencyGovernanceAddress" then failwith("Error. Another action is currently underway.")
          else skip;

        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionsLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so add new council member address to the set of council members in storage
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.config.emergencyGovernanceAddress := newEmergencyGovernanceAddress;
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;

    }

} with (noOperations, s)


function addCouncilMember(const newCouncilMemberAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "addCouncilMember";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        address_param_1       = newCouncilMemberAddress;  
        address_param_2       = zeroAddress;                 // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;

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

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "removeCouncilMember";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        address_param_1       = councilMemberAddress;  
        address_param_2       = zeroAddress;                 // extra slot for address if needed
        nat_param_1           = 0n;
        nat_param_2           = 0n;

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

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "changeCouncilMember";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        address_param_1       = oldCouncilMemberAddress;  
        address_param_2       = newCouncilMemberAddress;           
        nat_param_1           = 0n;
        nat_param_2           = 0n;

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

    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var actionRecord : actionRecordType := record[

        initiator             = Tezos.sender;
        status                = "PENDING";
        actionType            = "flushAction";
        executed              = False;

        signers               = set[Tezos.sender];
        signersCount          = 1n;

        address_param_1       = zeroAddress;     // extra slot for address if needed
        address_param_2       = zeroAddress;     // extra slot for address if needed
        nat_param_1           = actionId;
        nat_param_2           = 0n;

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

    // Steps Overview:
    // 1. check that glass has been broken
    // 2. check if there is a current action already, if not add a new "setAllContractsAdmin" action 
    // 3. add sender to action record's approvedBy set
    // 4. once threshold has been reached, immediately execute action and flush current action id to 0
    //     - send operations to pause all entrypoints (loop over contract addresses in map)
    
    checkNoAmount(Unit);            // entrypoint should not receive any tez amount 
    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var operations : list(operation) := nil; // init empty operations

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for pausing all entrypoints
        var newActionRecord : actionRecordType := record [
            action     = "pauseAllEntrypoints";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionsLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionsLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "pauseAllEntrypoints" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionsLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so release operations to pause all entrypoints in other contracts
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
            for _contractName -> contractAddress in map s.generalContracts block {
                const pauseAllEntrypointsInContractOperation : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    pauseAllEntrypointsInContract(contractAddress)
                );
                operations := pauseAllEntrypointsInContractOperation # operations;
            } 
        } else skip;

    }

} with (operations, s)

function unpauseAllEntrypoints(var s : storage) : return is
block {

    // Steps Overview:
    // 1. check that glass has been broken
    // 2. send operations to unpause all entrypoints
    
    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var operations : list(operation) := nil; // init empty operations

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for pausing all entrypoints
        var newActionRecord : actionRecordType := record [
            action     = "unpauseAllEntrypoints";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionsLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionsLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "unpauseAllEntrypoints" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionsLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so release operations to pause all entrypoints in other contracts
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {        
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
            for _contractName -> contractAddress in map s.generalContracts block {
                const unpauseAllEntrypointsInContractOperation : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    unpauseAllEntrypointsInContract(contractAddress)
                );
                operations := unpauseAllEntrypointsInContractOperation # operations;
            }       
        } else skip;

    }

} with (operations, s)

function setSingleContractAdmin(const newAdminAddress : address; const targetContractAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. set new admin address of target contract 
    
    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var operations : list(operation) := nil; // init empty operations

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for pausing all entrypoints
        var newActionRecord : actionRecordType := record [
            action     = "setSingleContractAdmin";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionsLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;

    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionsLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setSingleContractAdmin" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionsLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so release operations to pause all entrypoints in other contracts
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {            
            const setSingleContractAdminOperation : operation = Tezos.transaction(
                newAdminAddress, 
                0tez, 
                setAdminInContract(targetContractAddress)
            );
            operations := setSingleContractAdminOperation # operations;
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;
    }
} with (operations, s)

function setAllContractsAdmin(const newAdminAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. set new admin address of all contracts
    
    // check that glass has been broken
    // checkGlassIsBroken(s)
    
    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var operations : list(operation) := nil; // init empty operations

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for pausing all entrypoints
        var newActionRecord : actionRecordType := record [
            action     = "setAllContractsAdmin";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionsLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;

    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionsLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setAllContractsAdmin" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionsLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so release operations to set admin in all contracts
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed

            for _contractName -> contractAddress in map s.generalContracts block {
                const setContractAdminOperation : operation = Tezos.transaction(
                    newAdminAddress, 
                    0tez, 
                    setAdminInContract(contractAddress)
                );
                operations := setContractAdminOperation # operations;
            } 
            
        } else skip;
    }

} with (operations, s)


function removeBreakGlassControl(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. check sender is council member
    // 3. remove break glass control - auto call unpauseAll entrypoints just in case? or with a bool to trigger

    checkGlassIsBroken(s);          // check that glass is broken
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for removing break glass control
        var newActionRecord : actionRecordType := record [
            action     = "removeBreakGlassControl";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionsLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;

    } else block {
        // check that current action is of removeBreakGlassControl type, if not fail
        var actionRecord : actionRecordType := case s.actionsLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "removeBreakGlassControl" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionsLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so remove break glass control
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.glassBroken := False;  // remove break glass control - auto call unpauseAll entrypoints just in case? or with a bool to trigger
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;
    }

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
    if _actionRecord.status = "FLUSHED" then failwith("Error. Break Glass  action has been flushed") else skip;

    // check if break glass action has expired (status check, and block level + timestamp check)
    if _actionRecord.status = "Expired" then failwith("Error. Break Glass action has expired") else skip;

    var isExpired : bool := False;
    if Tezos.now > _councilActionRecord.expirationDateTime then isExpired := True else isExpired := False;

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

            const flushedCouncilActionId : nat = _actionRecord.nat_param_1;

            var flushedCouncilActionRecord : actionRecordType := case s.actionsLedger[flushedCouncilActionId] of        
                Some(_record) -> _record
                | None -> failwith("Error. Council Action not found")
            end;

            flushedCouncilActionRecord.status := "FLUSHED";
            s.actionsLedger[flushedCouncilActionId] := flushedCouncilActionRecord;

        } else skip;

        // addCouncilMember action type
        if actionType = "addCouncilMember" then block {
            s.councilMembers := Set.add(_actionRecord.address_param_1, s.councilMembers);
        } else skip;

        // removeCouncilMember action type
        if actionType = "removeCouncilMember" then block {
            s.councilMembers := Set.remove(_actionRecord.address_param_1, s.councilMembers);
        } else skip;

        // changeCouncilMember action type
        if actionType = "changeCouncilMember" then block {
            s.councilMembers := Set.add(_actionRecord.address_param_2, s.councilMembers);
            s.councilMembers := Set.remove(_actionRecord.address_param_1, s.councilMembers);
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

        // glass broken not required
        | SetEmergencyGovernanceAddress(parameters) -> setEmergencyGovernanceAddress(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
        | AddCouncilMember(parameters) -> addCouncilMember(parameters, s)
        | RemoveCouncilMember(parameters) -> removeCouncilMember(parameters, s)
        | FlushAction(parameters) -> flushAction(parameters, s)

        // glass broken required
        | SetSingleContractAdmin(parameters) -> setSingleContractAdmin(parameters.0, parameters.1, s)
        | SetAllContractsAdmin(parameters) -> setAllContractsAdmin(parameters, s)
        | PauseAllEntrypoints(_parameters) -> pauseAllEntrypoints(s)
        | UnpauseAllEntrypoints(_parameters) -> unpauseAllEntrypoints(s)
        | RemoveBreakGlassControl(_parameters) -> removeBreakGlassControl(s)

        | SignAction(parameters) -> signAction(parameters, s)
    end