type voteType is (nat * timestamp)              // mvk amount, timestamp
type voterMapType is map (address, voteType)
type emergencyGovernanceRecordType is record [
    proposerAddress        : address;
    status                 : nat;         
    title                  : string;
    description            : string;   
    voters                 : voterMapType; 
    totalVMvkVotes         : nat;
    minMvkRequiredPercentage  : nat;           // capture state of min required MVK vote percentage (e.g. 5% - as min required votes may change over time)
    minMvkRequired          : nat;             // capture state of min MVK vote required
    startDateTime          : timestamp;
    startLevel             : nat;           // block level of submission, used to order proposals
    endLevel               : nat;
]

type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type configType is record [
    voteDuration : nat;                 // track time by tezos blocks - e.g. 2 days 
    minMvkPercentageForTrigger : nat;  // minimum vMVK percentage amount required to trigger emergency control
    requiredFee : tez;                  // fee for triggering emergency control - e.g. 100 tez
]

type storage is record [
    admin                       : address;
    breakGlassContractAddress   : address; 
    config                      : configType;
    
    startLevel                  : nat;           // Tezos.level as start level

    tempMvkTotalSupply          : nat;           // at point where emergency control is triggered
    mvkTokenAddress             : address;  
    
    emergencyGovernanceLedger   : emergencyGovernanceLedgerType; 
    currentEmergencyGovernanceId : nat;
    nextProposalId               : nat;
]

type emergencyGovernanceAction is 
    | TriggerEmergencyControl of (string * string)
    | VoteForEmergencyControl of (nat)
    | VoteForEmergencyControlComplete of (nat)
    | SetTempMvkTotalSupply of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
    if (Tezos.sender = s.mvkTokenAddress) then unit
    else failwith("Only the MVK Token Contract can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------

// helper function to get token total supply (for MVK and vMVK)
function getTokenTotalSupply(const tokenAddress : address) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      tokenAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in Token Contract not found") : contract(contract(nat)))
  end;

// helper function to get User's MVK balance from MVK token address
function fetchMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getBalance",
      tokenAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetBalance entrypoint in MVK Token Contract not found") : contract(address * contract(nat)))
  end;

// helper function to get User's MVK balance from MVK token address
function triggerBreakGlass(const tokenAddress : address) : contract(contract(unit)) is
  case (Tezos.get_entrypoint_opt(
      "%breakGlass",
      tokenAddress) : option(contract(contract(unit)))) of
    Some(contr) -> contr
  | None -> (failwith("breakGlass entrypoint in Break Glass Token Contract not found") : contract(contract(unit)))
  end;


function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    checkNoAmount(Unit);                    (* Should not receive any tez amount *)
    checkSenderIsMvkTokenContract(s);       (* Check this call is comming from the mvk Token contract *)
    s.tempMvkTotalSupply := totalSupply;
} with (noOperations, s);

function triggerEmergencyControl(const title : string; const description : string; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that there is no currently active emergency governance being voted on
    // 2. operations to MVK token contract to get total supply, and update temp total supply
    // 3. set proposer as first vote
    //   - check proposer's vMVK balance (via proxy) and increment totalVMvkVotes by the balance
    //   - add proposer to voter map

    // 1. check that there is no currently active emergency governance being voted on
    // - todo: get last emergency governance proposal - save temp state in storage?

    if s.currentEmergencyGovernanceId = 0n then skip
      else failwith("Error. There is a emergency control governance in process.");

    const emptyVotersMap : voterMapType = map[];
    var newEmergencyGovernanceRecord : emergencyGovernanceRecordType := record [
        proposerAddress         = Tezos.sender;
        status                  = 1n;
        title                   = title;
        description             = description; 
        voters                  = emptyVotersMap;
        totalVMvkVotes          = 0n;
        minMvkRequiredPercentage   = s.config.minMvkPercentageForTrigger;  // capture state of min required vMVK vote percentage (e.g. 5% - as min required votes may change over time)
        minMvkRequired          = 0n;
        startDateTime           = Tezos.now;
        startLevel              = Tezos.level;          
        endLevel                = Tezos.level + s.config.voteDuration;
    ];

    s.emergencyGovernanceLedger[s.nextProposalId] := newEmergencyGovernanceRecord;
    s.currentEmergencyGovernanceId := s.nextProposalId;
    s.nextProposalId := s.nextProposalId + 1n;

    // update temp MVK total supply
    const setTempMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempMvkTotalSupply");    
    const updateMvkTotalSupplyOperation : operation = Tezos.transaction(
        (setTempMvkTotalSupplyCallback),
         0tez, 
         getTokenTotalSupply(s.mvkTokenAddress)
         );
    
    const operations : list(operation) = list [updateMvkTotalSupplyOperation];

} with (operations, s)


function voteForEmergencyControl(emergencyGovernanceId : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that user has not already voted for the emergency governance
    // 3. check proposer's vMVK balance (via proxy) and increment totalVMvkVotes by the balance
    
    if s.currentEmergencyGovernanceId = 0n then failwith("Error. There is no emergency control governance in process.")
      else skip;

    var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[emergencyGovernanceId] of 
        | None -> failwith("Error. Emergency governance record not found with given id.")
        | Some(_instance) -> _instance
    end;

    const checkIfUserHasVotedFlag : bool = Map.mem(Tezos.sender, s.emergencyGovernanceLedger[emergencyGovernanceId].voters);)
    if checkIfSatelliteHasVotedFlag = False then block {
        
        // get user MVK Balance
        const voteForEmergencyControlCompleteCallback : contract(nat) = Tezos.self("%voteForEmergencyControlComplete");    
        const voteForEmergencyControlCompleteOperation : operation = Tezos.transaction(
            (voteForEmergencyControlCompleteCallback),
            0tez, 
            fetchMvkBalance(s.mvkTokenAddress)
            );
        
        const operations : list(operation) = list [voteForEmergencyControlCompleteOperation];

    } else skip;

} with (noOperations, s)

function voteForEmergencyControlComplete(mvkBalance : nat; var s : storage) : return is 
block {

    checkSenderIsMvkTokenContract(unit);

    var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of 
        | None -> failwith("Error. Emergency governance record not found.")
        | Some(_instance) -> _instance
    end;

    if emergencyGovernance.status = 0n then failwith("Error. Emergency governance has been dropped")
      else skip; 

    emergencyGovernance.voters[Tezos.source] := (mvkBalance, Tezos.now);
    emergencyGovernance.totalMvkVotes := emergencyGovernance.totalMvkVotes + mvkBalance;

    // check if total votes has exceed threshold 
    // - trigger operation to break glass contract
    if emergencyGovernance.totalMvkVotes > emergencyGovernance.minTotalMvkRequired then block {

        // trigger break glass
        const triggerBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(s.breakGlassContractAddress)
            );
        
        const operations : list(operation) = list [triggerBreakGlassOperation];

    } else skip;

    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

} with (noOperations, s)
 
function dropEmergencyGovernance(var s : storage) : return is 
block {

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
        | VoteForEmergencyControl(parameters) -> voteForEmergencyControl(paramters.0, s)
        | VoteForEmergencyControlComplete(parameters) -> voteForEmergencyControlComplete(parameters.0, s)
        | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
        | DropEmergencyGovernance(_parameters) -> dropEmergencyGovernance(s)
    end