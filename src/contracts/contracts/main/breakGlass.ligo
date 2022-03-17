// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type configType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDuration        : nat;                 // action expiry duration in block levels
    developerAddress            : address;             // developer address
    emergencyGovernanceAddress  : address;             // emergency governance address
]

type councilMembersType is set(address)

type actionRecordType is record [
    action      : string;              // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, setThreshold, removeBreakGlassControl
    expired     : nat;                 // action expiry level in block levels
    threshold   : nat;                 // capture threshold at this point in time
    approvedBy  : councilMembersType;  // council members who have approved the action
]
type actionLedgerType is big_map(nat, actionRecordType)

type flushRecordType is record [
    action      : string;              // record action type - e.g. pauseAll, unpauseAll, updateMultiSig, setThreshold, removeBreakGlassControl
    expired     : nat;                 // action expiry level in block levels
    threshold   : nat;                 // capture threshold at this point in time
    flushedBy   : councilMembersType; 
]
type flushLedgerType is big_map(nat, flushRecordType)

type storage is record [
    admin                       : address;               // for init of contract - needed?
    mvkTokenAddress             : address;
    
    config                      : configType;
    
    generalContracts            : generalContractsType; // map of all contract addresses (e.g. doorman, delegation, vesting)
    
    glassBroken                 : bool;
    councilMembers              : councilMembersType;  // set of council member addresses
    
    currentActionId             : nat;                 // current action id -> set to 0 if there is no action currently
    nextActionId                : nat;                 // index of next action id
    actionLedger                : actionLedgerType;    // record of past actions taken by council members
    flushLedger                 : flushLedgerType;     // for council members to flush current action if required
]

type breakGlassAction is 
    | BreakGlass of (unit)

    // glass broken not required
    | SetEmergencyGovernanceAddress of (address)      // set emergency governance contract address
    | UpdateGeneralContracts of updateGeneralContractsParams
    | AddCouncilMember of address
    | RemoveCouncilMember of address
    | SetThreshold of (nat)
    | Flush of (unit)

    // glass broken required
    | SetSingleContractAdmin of (address * address)   // set admin for single contract
    | SetAllContractsAdmin of (address)               // set admin for single contract
    | PauseAllEntrypoints of (unit)            
    | UnpauseAllEntrypoints of (unit)
    | RemoveBreakGlassControl of (unit)

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
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of addCouncilMember type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setEmergencyGovernanceAddress" then failwith("Error. Another action is currently underway.")
          else skip;

        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so add new council member address to the set of council members in storage
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.config.emergencyGovernanceAddress := newEmergencyGovernanceAddress;
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;

    }

} with (noOperations, s)


function addCouncilMember(const newCouncilMemberAddress : address; var s : storage) : return is 
block {

//     Steps Overview:
//     1. check that sender is a council member
//     2. check if there is a current action already, if not add a new "addCouncilMember" action record 
//     3. add sender to action record's approvedBy set
//     4. once threshold has been reached, immediately execute action and flush current action id to 0

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount 
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for updating multisig
        var newActionRecord : actionRecordType := record [
            action     = "addCouncilMember";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of addCouncilMember type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "addCouncilMember" then failwith("Error. Another action is currently underway.")
          else skip;

        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so add new council member address to the set of council members in storage
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.councilMembers := Set.add(newCouncilMemberAddress, s.councilMembers);
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;

    }

} with (noOperations, s)

function removeCouncilMember(const councilMemberAddress : address; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check that sender is a council member
    // 2. todo: check that councilMemberAddress exists in council member set
    // 3. check if there is a current action already, if not add a new "removeCouncilMember" action 
    // 4. add sender to action record's approvedBy set
    // 5. once threshold has been reached, immediately execute action and flush current action id to 0

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount 
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for updating multisig
        var newActionRecord : actionRecordType := record [
            action     = "removeCouncilMember";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of addCouncilMember type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "removeCouncilMember" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.remove(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so remove council member address from the set of council members in storage
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.councilMembers := Set.remove(councilMemberAddress, s.councilMembers);
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;
    }

} with (noOperations, s)

function setThreshold(const newThreshold : nat; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check that sender is a council member
    // 2. check that newThreshold is within range (between 0 and number of existing council members)
    // 3. check if there is a current action already, if not add a new "setThreshold" action record 
    // 4. add sender to action record's approvedBy set
    // 5. once threshold has been reached, immediately execute action and flush current action id to 0

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount 
    checkSenderIsCouncilMember(s);  // check that sender is council member

    (* Ensure newThreshold is in range *)
    if newThreshold > 0n and newThreshold <= Set.size(s.councilMembers) then skip
        else failwith("Error. New threshold needs to be in range.");

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for setting threshold
        var newActionRecord : actionRecordType := record [
            action     = "setThreshold";
            // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.config.threshold;
            approvedBy = set[Tezos.sender];
        ];
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {

        // check that current action is of setThreshold type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setThreshold" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.remove(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so set new threshold
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.config.threshold := newThreshold; // set new threshold amount of confirmations required
            s.currentActionId := 0n;     // reset current action id to 0n since action has been completed
        } else skip;
    }
    
} with (noOperations, s)

function flush(var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check that sender is a council member
    // 2. check if there is a current action already, if not add a new "flush" action record 
    // 3. add sender to action record's approvedBy set
    // 4. once threshold has been reached, immediately execute action and flush current action id to 0
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount 
    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then failwith("Error. There is no action in progress now.")
      else block {

        // check that there is a current action 
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.") // should not be triggered as it has already been checked
        end;

        // get or create flush record -> with same id as action record
        var flushRecord : flushRecordType := case s.flushLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> record [
                action     = actionRecord.action;
                // expired    = Tezos.level + s.config.actionExpiryDuration; // when tezos.level is fixed
                expired    = 1n;                     // temp placeholder until tezos.level is fixed
                threshold  = s.config.threshold;
                flushedBy = set[Tezos.sender];
            ]
        end;

        // check if action record's action is the same as flush record's action
        if actionRecord.action =/= flushRecord.action then failwith("Error. Action to be flushed is not the same.")
          else skip;

        // add council member to flush record's flushedBy set
        flushRecord.flushedBy := Set.add(Tezos.sender, flushRecord.flushedBy);
        s.flushLedger[s.currentActionId] := flushRecord; 

        // threshold has been reached, so clear current action id
        if Set.size(flushRecord.flushedBy) >= flushRecord.threshold then block {
            s.currentActionId := 0n;     // reset current action id to 0n since action has been completed
        } else skip;
    }

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
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "pauseAllEntrypoints" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

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
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;
    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "unpauseAllEntrypoints" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

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
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;

    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setSingleContractAdmin" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

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
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;

    } else block {
        // check that current action is of pauseAllEntrypoints type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "setAllContractsAdmin" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

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
        s.actionLedger[s.nextActionId] := newActionRecord;
        s.nextActionId := s.nextActionId + 1n;

    } else block {
        // check that current action is of removeBreakGlassControl type, if not fail
        var actionRecord : actionRecordType := case s.actionLedger[s.currentActionId] of
            | Some(_record) -> _record
            | None -> failwith("Error. Action record is not found.")
        end;

        if actionRecord.action =/= "removeBreakGlassControl" then failwith("Error. Another action is currently underway.")
          else skip;

        // add council member to action record's approvedBy set
        actionRecord.approvedBy := Set.add(Tezos.sender, actionRecord.approvedBy);
        s.actionLedger[s.currentActionId] := actionRecord; 

        // threshold has been reached, so remove break glass control
        if Set.size(actionRecord.approvedBy) >= actionRecord.threshold then block {
            s.glassBroken := False;  // remove break glass control - auto call unpauseAll entrypoints just in case? or with a bool to trigger
            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;
    }

} with (noOperations, s)

function main (const action : breakGlassAction; const s : storage) : return is 
    case action of
        | BreakGlass(_parameters) -> breakGlass(s)

        // glass broken not required
        | SetEmergencyGovernanceAddress(parameters) -> setEmergencyGovernanceAddress(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
        | AddCouncilMember(parameters) -> addCouncilMember(parameters, s)
        | RemoveCouncilMember(parameters) -> removeCouncilMember(parameters, s)
        | SetThreshold(parameters) -> setThreshold(parameters, s)
        | Flush(_parameters) -> flush(s)

        // glass broken required
        | SetSingleContractAdmin(parameters) -> setSingleContractAdmin(parameters.0, parameters.1, s)
        | SetAllContractsAdmin(parameters) -> setAllContractsAdmin(parameters, s)
        | PauseAllEntrypoints(_parameters) -> pauseAllEntrypoints(s)
        | UnpauseAllEntrypoints(_parameters) -> unpauseAllEntrypoints(s)
        | RemoveBreakGlassControl(_parameters) -> removeBreakGlassControl(s)
    end