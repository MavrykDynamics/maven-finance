type voteType is (nat * timestamp)
type voterMapType is map (address, voteType)
type emergencyGovernanceRecordType is record [
    proposerAddress        : address;
    status                 : nat;         
    title                  : string;
    description            : string;   
    voters                 : voterMapType; 
    totalVMvkVotes         : nat;
    minVMvkVotePercentage  : nat;           // capture state of min required vMVK vote percentage (e.g. 5% - as min required votes may change over time)
    startDateTime          : timestamp;
    startLevel             : nat;           // block level of submission, used to order proposals
    votingStageNum         : nat;           // stage number in which it is possible to vote on this proposal
]

type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type configType is record [
    voteDuration : nat;                 // track time by tezos blocks?
    minVMvkPercentageForTrigger : nat;  // minimum vMVK percentage amount required to trigger emergency control
    requiredFee : tez;                  // fee for triggering emergency control - e.g. 100 tez
]

type storage is record [
    admin                       : address;
    breakGlassContractAddress   : address; 
    config                      : configType;
    emergencyGovernanceLedger   : emergencyGovernanceLedgerType; 
    tempMvkTotalSupply          : nat;           // at point where emergency control is triggered
    tempVMvkTotalSupply         : nat;           // at point where emergency control is triggered
    startLevel                  : nat;           // Tezos.level as start level
    mvkTokenAddress             : address;  
    vMvkTokenAddress            : address;
]

type emergencyGovernanceAction is 
    | TriggerEmergencyControl of (unit)
    | VoteForEmergencyControl of (unit)
    | SetTempMvkTotalSupply of (nat)
    | SetTempVMvkTotalSupply of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsVMvkTokenContract(var s : storage) : unit is
    if (Tezos.sender = s.vMvkTokenAddress) then unit
    else failwith("Only the vMVK Token Contract can call this entrypoint.");

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

function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    checkNoAmount(Unit);                    (* Should not receive any tez amount *)
    checkSenderIsMvkTokenContract(s);       (* Check this call is comming from the mvk Token contract *)
    s.tempMvkTotalSupply := totalSupply;
} with (noOperations, s);


function setTempVMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    checkNoAmount(Unit);                    (* Should not receive any tez amount *)
    checkSenderIsVMvkTokenContract(s);      (* Check this call is comming from the vMvk Token contract *)
    s.tempVMvkTotalSupply := totalSupply;
} with (noOperations, s);


function triggerEmergencyControl(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that there is no currently active emergency governance being voted on
    // 2. operations to MVK and vMVK token contracts to get total supply, and update temp total supply
    // 3. set proposer as first vote
    //   - check proposer's vMVK balance (via proxy) and increment totalVMvkVotes by the balance
    //   - add proposer to voter map

    // 1. check that there is no currently active emergency governance being voted on
    // - todo: get last emergency governance proposal - save temp state in storage?

    // update temp MVK total supply
    const setTempMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempMvkTotalSupply");    
    const updateMvkTotalSupplyOperation : operation = Tezos.transaction(
        (setTempMvkTotalSupplyCallback),
         0tez, 
         getTokenTotalSupply(s.mvkTokenAddress)
         );

    // update temp vMVK total supply
    const setTempVMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempVMvkTotalSupply");
    const updateVMvkTotalSupplyOperation : operation = Tezos.transaction(
        (setTempVMvkTotalSupplyCallback),
         0tez, 
         getTokenTotalSupply(s.mvkTokenAddress)
         );
    
    const operations : list(operation) = list [updateMvkTotalSupplyOperation; updateVMvkTotalSupplyOperation];

} with (operations, s)


function voteForEmergencyControl(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that user has not already voted for the emergency governance
    // 3. check proposer's vMVK balance (via proxy) and increment totalVMvkVotes by the balance
    
    skip

} with (noOperations, s)


function main (const action : emergencyGovernanceAction; const s : storage) : return is 
    case action of
        | TriggerEmergencyControl(_parameters) -> triggerEmergencyControl(s)
        | VoteForEmergencyControl(_parameters) -> voteForEmergencyControl(s)
        | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
        | SetTempVMvkTotalSupply(parameters) -> setTempVMvkTotalSupply(parameters, s)
    end