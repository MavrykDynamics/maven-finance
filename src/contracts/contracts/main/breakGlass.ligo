type configType is record [
    doormanContractAddress      : address;
    delegationContractAddress   : address; 
    governanceContractAddress   : address;
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
    data        : string;              // any relevant data
]
type flushLedgerType is big_map(nat, flushRecordType)

type storage is record [
    admin                       : address;             // for init of contract - needed?
    config                      : configType;
    developerAddress            : address;             // developer address
    emergencyGovernanceAddress  : address;             // emergency governance address
    glassBroken                 : bool;
    councilMembers              : councilMembersType;  // set of council member addresses
    threshold                   : nat;                 // min number of council members who need to agree on action
    currentActionId             : nat;                 // current action id -> set to 0 if there is no action currently
    nextActionId                : nat;                 // index of next action id
    actionLedger                : actionLedgerType;    // record of past actions taken by council members
    flushLedger                 : flushLedgerType;     // for council members to flush current action if required
    actionExpiryDuration        : nat;                 // action expiry duration in block levels
]

type breakGlassAction is 
    | BreakGlass of (unit)
    | AddCouncilMember of address
    | RemoveCouncilMember of address
    | SetThreshold of (nat)
    | Flush of (unit)
    | SetEmergencyGovernanceAddress of (address)      // set emergency governance contract address

    | SetSingleContractAdmin of (address)             // set admin for single contract
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
    if (Tezos.sender = s.emergencyGovernanceAddress) then unit
        else failwith("Only the Emergency Governance Contract can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

function checkGlassIsBroken(var s : storage) : unit is
    if s.glassBroken = True then unit
        else failwith("Error. Glass has not been broken");

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


function breakGlass(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. set contract admins to breakglass address - should be done in emergency governance?
    // 2. send pause all operations to main contracts

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);

    var operations : list(operation) := nil;
    // const pauseAllEntrypointsInDoormanContract : operation = Tezos.transaction(
    //         unit, 
    //         0tez, 
    //         pauseAllEntrypointsInContract(s.config.doormanContractAddress)
    //     );

    // const pauseAllEntrypointsInDelegationContract : operation = Tezos.transaction(
    //         unit, 
    //         0tez, 
    //         pauseAllEntrypointsInContract(s.config.delegationContractAddress)
        // );

    // const pauseAllEntrypointsInGovernanceContract : operation = Tezos.transaction(
    //         unit, 
    //         0tez, 
    //         pauseAllEntrypointsInContract(s.config.governanceContractAddress)
    //     );
    
    // const operations : list(operation) = list [pauseAllEntrypointsInDoormanContract; pauseAllEntrypointsInDelegationContract];   

} with (operations, s)

function addCouncilMember(const newCouncilMemberAddress : address; var s : storage) : return is 
block {

    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for updating multisig
        var newActionRecord : actionRecordType := record [
            action     = "addCouncilMember";
            // expired    = Tezos.level + s.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.threshold;
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

    checkSenderIsCouncilMember(s);  // check that sender is council member

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for updating multisig
        var newActionRecord : actionRecordType := record [
            action     = "removeCouncilMember";
            // expired    = Tezos.level + s.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.threshold;
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

    checkSenderIsCouncilMember(s);  // check that sender is council member

    (* Ensure newThreshold is in range *)
    if newThreshold > 0n and newThreshold <= Set.size(s.councilMembers) then skip
        else failwith("Error. New threshold needs to be in range.");

    var currentActionId : nat := s.currentActionId; 
    if currentActionId = 0n then block {
        // add new action record for setting threshold
        var newActionRecord : actionRecordType := record [
            action     = "setThreshold";
            // expired    = Tezos.level + s.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.threshold;
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
            s.threshold := newThreshold; // set new threshold amount of confirmations required
            s.currentActionId := 0n;     // reset current action id to 0n since action has been completed
        } else skip;
    }
    
} with (noOperations, s)

function flush(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. todo: check multisig contract for reference
    // 2.
    
    skip

} with (noOperations, s)

function pauseAllEntrypoints(var s : storage) : return is
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
            action     = "pauseAllEntrypoints";
            // expired    = Tezos.level + s.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.threshold;
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
            
            // todo: refactor to loop if possible for cleaner code

            const pauseAllEntrypointsInDoormanContract : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    pauseAllEntrypointsInContract(s.config.doormanContractAddress)
                );

            const pauseAllEntrypointsInDelegationContract : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    pauseAllEntrypointsInContract(s.config.delegationContractAddress)
                );

            const pauseAllEntrypointsInGovernanceContract : operation = Tezos.transaction(
                    unit, 
                    0tez, 
                    pauseAllEntrypointsInContract(s.config.governanceContractAddress)
                );

            operations := pauseAllEntrypointsInDoormanContract # operations;
            operations := pauseAllEntrypointsInDelegationContract # operations;
            operations := pauseAllEntrypointsInGovernanceContract # operations;

            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
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
            // expired    = Tezos.level + s.actionExpiryDuration; // when tezos.level is fixed
            expired    = 1n;                        // temp placeholder until tezos.level is fixed
            threshold  = s.threshold;
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
            
            // todo: refactor to loop if possible for cleaner code
            
            const unpauseAllEntrypointsInDoormanContract : operation = Tezos.transaction(
                unit, 
                0tez, 
                unpauseAllEntrypointsInContract(s.config.doormanContractAddress)
            );

            const unpauseAllEntrypointsInDelegationContract : operation = Tezos.transaction(
                unit, 
                0tez, 
                unpauseAllEntrypointsInContract(s.config.delegationContractAddress)
            );

            const unpauseAllEntrypointsInGovernanceContract : operation = Tezos.transaction(
                unit, 
                0tez, 
                unpauseAllEntrypointsInContract(s.config.governanceContractAddress)
            );

            operations := unpauseAllEntrypointsInDoormanContract # operations;
            operations := unpauseAllEntrypointsInDelegationContract # operations;
            operations := unpauseAllEntrypointsInGovernanceContract # operations;

            s.currentActionId := 0n; // reset current action id to 0n since action has been completed
        } else skip;

    }

} with (operations, s)

function setEmergencyGovernanceAddress(const newEmergencyGovernanceAddress : address; var s : storage) : return is 
block {
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount 
    checkSenderIsAdmin(s); // check that sender is admin
    s.emergencyGovernanceAddress := newEmergencyGovernanceAddress;
} with (noOperations, s)

function setSingleContractAdmin(const _targetContractAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. set admin address of target contract 
    
    // check that glass has been broken
    // checkGlassIsBroken(s)
    
    skip

} with (noOperations, s)

function setAllContractsAdmin(const _targetContractAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. set admin address of target contract 
    
    // check that glass has been broken
    // checkGlassIsBroken(s)
    
    skip

} with (noOperations, s)


function removeBreakGlassControl(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. check sender is this address
    // 3. remove break glass control - auto call unpauseAll entrypoints just in case? or with a bool to trigger
    
    checkGlassIsBroken(s);   // check that glass has been broken
    checkSenderIsAdmin(s);   // check sender is admin
    s.glassBroken := False;  // remove break glass control - auto call unpauseAll entrypoints just in case? or with a bool to trigger

} with (noOperations, s)

function main (const action : breakGlassAction; const s : storage) : return is 
    case action of
        | BreakGlass(_parameters) -> breakGlass(s)
        | AddCouncilMember(parameters) -> addCouncilMember(parameters, s)
        | RemoveCouncilMember(parameters) -> removeCouncilMember(parameters, s)
        | SetThreshold(parameters) -> setThreshold(parameters, s)
        | SetEmergencyGovernanceAddress(parameters) -> setEmergencyGovernanceAddress(parameters, s)
        | Flush(_parameters) -> flush(s)

        | SetSingleContractAdmin(parameters) -> setSingleContractAdmin(parameters, s)
        | SetAllContractsAdmin(parameters) -> setAllContractsAdmin(parameters, s)
        | PauseAllEntrypoints(_parameters) -> pauseAllEntrypoints(s)
        | UnpauseAllEntrypoints(_parameters) -> unpauseAllEntrypoints(s)
        
        | RemoveBreakGlassControl(_parameters) -> removeBreakGlassControl(s)
    end