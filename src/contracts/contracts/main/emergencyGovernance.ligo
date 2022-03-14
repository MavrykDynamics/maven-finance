// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// type emergencyGovernanceVoteCheckParams is (nat * timestamp)
// type emergencyGovernanceVoteCheckCallback is contract(nat * timestamp)
// type emergencyGovernanceVoteCheckType is (address * emergencyGovernanceVoteCheckCallback)

type voteType is (nat * timestamp)              // mvk amount, timestamp
type voterMapType is map (address, voteType)
type emergencyGovernanceRecordType is record [
    proposerAddress                  : address;
    status                           : bool;   
    executed                         : bool;
    dropped                          : bool;

    title                            : string;
    description                      : string;   
    voters                           : voterMapType; 
    totalStakedMvkVotes              : nat;              
    stakedMvkPercentageRequired      : nat;              // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
    stakedMvkRequiredForTrigger      : nat;              // capture state of min staked MVK vote required
    
    startDateTime                    : timestamp;
    startLevel                       : nat;              // block level of submission, used to order proposals
    executedDateTime                 : timestamp;        // will follow startDateTime and be updated when executed
    executedLevel                    : nat;              // will follow startLevel and be updated when executed
    expirationDateTime               : timestamp;
]

type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type configType is record [
    voteExpiryDays                   : nat;   // track time by tezos blocks - e.g. 2 days 
    stakedMvkPercentageRequired      : nat;   // minimum staked MVK percentage amount required to trigger emergency control
    requiredFee                      : nat;   // fee for triggering emergency control - e.g. 100 tez -> change to MVK 
]

type storage is record [
    admin                               : address;
    config                              : configType;
    
    generalContracts                    : generalContractsType;

    emergencyGovernanceLedger           : emergencyGovernanceLedgerType; 
    
    tempMvkTotalSupply                  : nat;           // at point where emergency control is triggered
    currentEmergencyGovernanceId        : nat;
    nextEmergencyGovernanceProposalId   : nat;
]

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigVoteExpiryDays of unit
| ConfigStakedMvkPercentRequired of unit
| ConfigRequiredFee of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : updateConfigNewValueType; 
  updateConfigAction    : updateConfigActionType;
]

type emergencyGovernanceAction is 
    | UpdateConfig of updateConfigParamsType    
    | UpdateGeneralContracts of updateGeneralContractsParams
    | SetTempMvkTotalSupply of (nat)
    
    | TriggerEmergencyControl of (string * string)
    | VoteForEmergencyControl of (nat)
    | VoteForEmergencyControlComplete of (nat)
    | DropEmergencyGovernance of (unit)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
block{
  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found.")
  end;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsDoormanContract(var s : storage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found.")
  end;
  if (Tezos.sender = doormanAddress) then skip
  else failwith("Error. Only the Doorman Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

// helper function to get token total supply (for MVK)
function getTokenTotalSupply(const tokenAddress : address) : contract(unit * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      tokenAddress) : option(contract(unit * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in Token Contract not found") : contract(unit * contract(nat)))
  end;

// helper function to get User's MVK balance from MVK token address
function fetchMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%balance_of",
      tokenAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("Balance_of entrypoint in MVK Token Contract not found") : contract(address * contract(nat)))
  end;

// helper function to get User's staked MVK balance from Doorman address
function fetchStakedMvkBalance(const contractAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getStakedBalance",
      contractAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetStakedBalance entrypoint in Doorman Contract not found") : contract(address * contract(nat)))
  end;

// helper function to get User's staked MVK balance and emergency governance last voted timestamp from Doorman address
// function doormanVoteCheck(const contractAddress : address) : contract(emergencyGovernanceVoteCheckType) is
//   case (Tezos.get_entrypoint_opt(
//       "%emergencyGovernanceVoteCheck",
//       contractAddress) : option(contract(emergencyGovernanceVoteCheckType))) of
//     Some(contr) -> contr
//   | None -> (failwith("EmergencyGovernanceVoteCheck entrypoint in Doorman Contract not found") : contract(emergencyGovernanceVoteCheckType))
//   end;

// helper function to break glass in the governance or breakGlass contract
function triggerBreakGlass(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%breakGlass",
      contractAddress) : option(contract(unit))) of
    Some(contr) -> contr
  | None -> (failwith("breakGlass entrypoint in Contract not found") : contract(unit))
  end;


function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    checkNoAmount(Unit);                    (* Should not receive any tez amount *)
    checkSenderIsMvkTokenContract(s);       (* Check this call is comming from the mvk Token contract *)
    s.tempMvkTotalSupply := totalSupply;

    // set min MVK total required in emergency governance record based on temp MVK total supply
    const emergencyGovernanceProposalId : nat = abs(s.nextEmergencyGovernanceProposalId - 1n);
    var emergencyGovernanceRecord : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[emergencyGovernanceProposalId] of
        | Some(_governanceRecord) -> _governanceRecord
        | None -> failwith("Emergency Governance Record not found.")
    end;

    var stakedMvkRequiredForTrigger : nat := abs(s.config.stakedMvkPercentageRequired * totalSupply / 100_000);

    emergencyGovernanceRecord.stakedMvkRequiredForTrigger := stakedMvkRequiredForTrigger;
    s.emergencyGovernanceLedger[emergencyGovernanceProposalId] := emergencyGovernanceRecord;    

} with (noOperations, s);

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  // checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
    ConfigVoteExpiryDays (_v)                -> s.config.voteExpiryDays                 := updateConfigNewValue
  | ConfigStakedMvkPercentRequired (_v)      -> s.config.stakedMvkPercentageRequired    := updateConfigNewValue  
  | ConfigRequiredFee (_v)                   -> s.config.requiredFee                    := updateConfigNewValue  
  end;

} with (noOperations, s)

function triggerEmergencyControl(const title : string; const description : string; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that there is no currently active emergency governance being voted on
    // 2. operation to MVK token contract to get total supply -> then update temp total supply and emergency governce record min MVK required

    if s.currentEmergencyGovernanceId = 0n then skip
      else failwith("Error. There is a emergency control governance in process.");

    const emptyVotersMap : voterMapType = map[];
    var newEmergencyGovernanceRecord : emergencyGovernanceRecordType := record [
        proposerAddress                  = Tezos.sender;
        status                           = False;
        executed                         = False;
        dropped                          = False;

        title                            = title;
        description                      = description; 
        voters                           = emptyVotersMap;
        totalStakedMvkVotes              = 0n;
        stakedMvkPercentageRequired      = s.config.stakedMvkPercentageRequired;  // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
        stakedMvkRequiredForTrigger      = 0n;

        startDateTime                    = Tezos.now;
        startLevel                       = Tezos.level;             
        executedDateTime                 = Tezos.now;
        executedLevel                    = Tezos.level;
        expirationDateTime               = Tezos.now + (86_400 * s.config.voteExpiryDays);
    ];

    s.emergencyGovernanceLedger[s.nextEmergencyGovernanceProposalId] := newEmergencyGovernanceRecord;
    s.currentEmergencyGovernanceId := s.nextEmergencyGovernanceProposalId;
    s.nextEmergencyGovernanceProposalId := s.nextEmergencyGovernanceProposalId + 1n;

    const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
        Some(_address) -> _address
        | None -> failwith("Error. MVK Token Contract is not found.")
    end;

    // update temp MVK total supply
    const setTempMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempMvkTotalSupply");    
    const updateMvkTotalSupplyOperation : operation = Tezos.transaction(
        (unit, setTempMvkTotalSupplyCallback),
         0tez, 
         getTokenTotalSupply(mvkTokenAddress)
         );
    
    const operations : list(operation) = list [updateMvkTotalSupplyOperation];

} with (operations, s)


function voteForEmergencyControl(const emergencyGovernanceId : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that user has not already voted for the emergency governance
    // 3. check proposer's staked MVK balance (via proxy) and increment totalMvkVotes by the balance
    
    if s.currentEmergencyGovernanceId = 0n then failwith("Error. There is no emergency control governance in process.")
      else skip;

    var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[emergencyGovernanceId] of 
        | None -> failwith("Error. Emergency governance record not found with given id.")
        | Some(_instance) -> _instance
    end;

    var operations : list(operation) := nil;

    const checkIfUserHasVotedFlag : bool = Map.mem(Tezos.sender, emergencyGovernance.voters);
    if checkIfUserHasVotedFlag = False then block {

        const doormanAddress : address = case s.generalContracts["doorman"] of
            Some(_address) -> _address
            | None -> failwith("Error. Doorman Contract is not found.")
        end;
        
        // get user staked MVK Balance
        const voteForEmergencyControlCompleteCallback : contract(nat) = Tezos.self("%voteForEmergencyControlComplete");    
        const voteForEmergencyControlCompleteOperation : operation = Tezos.transaction(
            (Tezos.sender, voteForEmergencyControlCompleteCallback),
            0tez, 
            fetchStakedMvkBalance(doormanAddress)
            );

        operations := voteForEmergencyControlCompleteOperation # operations;

    } else skip;

} with (operations, s)

function voteForEmergencyControlComplete(const stakedMvkBalance : nat; var s : storage) : return is 
block {

    checkSenderIsDoormanContract(s);

    var _emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of 
        | None -> failwith("Error. Emergency governance record not found.")
        | Some(_instance) -> _instance
    end;

    if _emergencyGovernance.dropped = True then failwith("Error. Emergency governance has been dropped")
      else skip; 

    // if emergencyGovernanceLastVotedTimestamp > _emergencyGovernance.startDateTime and emergencyGovernanceLastVotedTimestamp < _emergencyGovernance.expirationDateTime 
    // then failwith("Error. You have already voted for this emergency governance.")
    // else skip;

    const totalStakedMvkVotes : nat = _emergencyGovernance.totalStakedMvkVotes + stakedMvkBalance;

    _emergencyGovernance.voters[Tezos.source] := (stakedMvkBalance, Tezos.now);
    _emergencyGovernance.totalStakedMvkVotes := totalStakedMvkVotes;
    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := _emergencyGovernance;

    // check if total votes has exceed threshold - if yes, trigger operation to break glass contract
    var operations : list(operation) := nil;
    if totalStakedMvkVotes > _emergencyGovernance.stakedMvkRequiredForTrigger then block {

        const breakGlassContractAddress : address = case s.generalContracts["breakGlass"] of
            Some(_address) -> _address
            | None -> failwith("Error. Break Glass Contract is not found.")
        end;

        const governanceContractAddress : address = case s.generalContracts["governance"] of
            Some(_address) -> _address
            | None -> failwith("Error. Governance Contract is not found.")
        end;

        // trigger break glass in break glass contract - set glassbroken to true in breakglass contract to give council members access to protected entrypoints
        const triggerBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(breakGlassContractAddress)
            );

        // trigger break glass in governance contract - send operations to pause all entrypoints and change contract admin to break glass address
        const triggerGovernanceBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(governanceContractAddress)
            );
        
        operations := triggerBreakGlassOperation # operations;
        operations := triggerGovernanceBreakGlassOperation # operations;

        // update emergency governance record
        _emergencyGovernance.status              := True;
        _emergencyGovernance.executed            := True;
        _emergencyGovernance.executedDateTime    := Tezos.now;
        _emergencyGovernance.executedLevel       := Tezos.level;
        
        // save emergency governance record
        s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId]  := _emergencyGovernance;


    } else skip;

} with (operations, s)
 
function dropEmergencyGovernance(var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that satellite is proposer of emergency governance
    // 3. change emergency governance proposal to inactive and reset currentEmergencyGovernanceId
    
    if s.currentEmergencyGovernanceId = 0n then failwith("Error. There is no emergency control governance in process.")
      else skip;

    var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of 
        | None -> failwith("Error. Emergency governance record not found.")
        | Some(_instance) -> _instance
    end;

    if emergencyGovernance.proposerAddress =/= Tezos.sender then failwith("Error: You do not have permission to drop this emergency governance.")
      else skip;

    emergencyGovernance.dropped := True; 
    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

    s.currentEmergencyGovernanceId := 0n; 

} with (noOperations, s)

function main (const action : emergencyGovernanceAction; const s : storage) : return is 
    case action of
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
        | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)

        | TriggerEmergencyControl(parameters) -> triggerEmergencyControl(parameters.0, parameters.1, s)
        | VoteForEmergencyControl(parameters) -> voteForEmergencyControl(parameters, s)
        | VoteForEmergencyControlComplete(parameters) -> voteForEmergencyControlComplete(parameters, s)     
        | DropEmergencyGovernance(_parameters) -> dropEmergencyGovernance(s)
    end