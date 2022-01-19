// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type voteType is (nat * timestamp)              // mvk amount, timestamp
type voterMapType is map (address, voteType)
type emergencyGovernanceRecordType is record [
    proposerAddress                  : address;
    status                           : nat;         
    title                            : string;
    description                      : string;   
    voters                           : voterMapType; 
    totalStakedMvkVotes              : nat;
    minStakedMvkRequiredPercentage   : nat;              // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
    minTotalStakedMvkRequired        : nat;              // capture state of min MVK vote required
    startDateTime                    : timestamp;
    startLevel                       : nat;              // block level of submission, used to order proposals
    endLevel                         : nat;
]

type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type configType is record [
    voteDuration : nat;                       // track time by tezos blocks - e.g. 2 days 
    minStakedMvkPercentageForTrigger : nat;   // minimum staked MVK percentage amount required to trigger emergency control
    requiredFee : tez;                        // fee for triggering emergency control - e.g. 100 tez
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

type emergencyGovernanceAction is 
    | UpdateGeneralContracts of updateGeneralContractsParams
    | TriggerEmergencyControl of (string * string)
    | VoteForEmergencyControl of (nat)
    | VoteForEmergencyControlComplete of (nat)
    | SetTempMvkTotalSupply of (nat)
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

// helper function to break glass in the governance or breakGlass contract
function triggerBreakGlass(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%breakGlass",
      contractAddress) : option(contract(unit))) of
    Some(contr) -> contr
  | None -> (failwith("breakGlass entrypoint in Contract not found") : contract(unit))
  end;


// function setBreakGlassContractAddress(const newBreakGlassContractAddress : address; var s : storage) is 
// block {
//     checkNoAmount(Unit);   // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(s); // check that sender is admin
//     s.breakGlassContractAddress := newBreakGlassContractAddress;
// } with (noOperations, s)


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

    var minTotalStakedMvkRequired : nat := abs(s.config.minStakedMvkPercentageForTrigger * totalSupply / 100_000);

    emergencyGovernanceRecord.minTotalStakedMvkRequired := minTotalStakedMvkRequired;
    s.emergencyGovernanceLedger[emergencyGovernanceProposalId] := emergencyGovernanceRecord;    

} with (noOperations, s);

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
        status                           = 1n;
        title                            = title;
        description                      = description; 
        voters                           = emptyVotersMap;
        totalStakedMvkVotes              = 0n;
        minStakedMvkRequiredPercentage   = s.config.minStakedMvkPercentageForTrigger;  // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
        minTotalStakedMvkRequired        = 0n;
        startDateTime                    = Tezos.now;

        startLevel                       = 1n; // placeholder until compiler issue fixed with tezos.level
        endLevel                         = 2n; // placeholder until compiler issue fixed with tezos.level
        // startLevel                    = Tezos.level;          
        // endLevel                      = Tezos.level + s.config.voteDuration;
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

        const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
            Some(_address) -> _address
            | None -> failwith("Error. MVK Token Contract is not found.")
        end;
        
        // get user MVK Balance
        const voteForEmergencyControlCompleteCallback : contract(nat) = Tezos.self("%voteForEmergencyControlComplete");    
        const voteForEmergencyControlCompleteOperation : operation = Tezos.transaction(
            (Tezos.sender, voteForEmergencyControlCompleteCallback),
            0tez, 
            fetchMvkBalance(mvkTokenAddress)
            );

        operations := voteForEmergencyControlCompleteOperation # operations;

    } else skip;

} with (operations, s)

function voteForEmergencyControlComplete(const mvkBalance : nat; var s : storage) : return is 
block {

    // checkSenderIsMvkTokenContract(unit);

    var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of 
        | None -> failwith("Error. Emergency governance record not found.")
        | Some(_instance) -> _instance
    end;

    if emergencyGovernance.status = 0n then failwith("Error. Emergency governance has been dropped")
      else skip; 

    emergencyGovernance.voters[Tezos.source] := (mvkBalance, Tezos.now);
    emergencyGovernance.totalStakedMvkVotes := emergencyGovernance.totalStakedMvkVotes + mvkBalance;
    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

    // check if total votes has exceed threshold - if yes, trigger operation to break glass contract
    var operations : list(operation) := nil;
    if emergencyGovernance.totalStakedMvkVotes > emergencyGovernance.minTotalStakedMvkRequired then block {

        const breakGlassContractAddress : address = case s.generalContracts["breakGlass"] of
            Some(_address) -> _address
            | None -> failwith("Error. Break Glass Contract is not found.")
        end;

        const governanceContractAddress : address = case s.generalContracts["governance"] of
            Some(_address) -> _address
            | None -> failwith("Error. Governance Contract is not found.")
        end;

        // trigger break glass - set glassbroken to true in breakglass contract to give council members access to protected entrypoints
        const triggerBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(breakGlassContractAddress)
            );

        const triggerGovernanceBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(governanceContractAddress)
            );
        
        operations := triggerBreakGlassOperation # operations;
        operations := triggerGovernanceBreakGlassOperation # operations;

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

    emergencyGovernance.status := 0n; 
    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

    s.currentEmergencyGovernanceId := 0n; 

} with (noOperations, s)

function main (const action : emergencyGovernanceAction; const s : storage) : return is 
    case action of
        | TriggerEmergencyControl(parameters) -> triggerEmergencyControl(parameters.0, parameters.1, s)
        | VoteForEmergencyControl(parameters) -> voteForEmergencyControl(parameters, s)
        | VoteForEmergencyControlComplete(parameters) -> voteForEmergencyControlComplete(parameters, s)
        | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
        | DropEmergencyGovernance(_parameters) -> dropEmergencyGovernance(s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
    end