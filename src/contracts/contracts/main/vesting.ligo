
type configType is record [
    cliffPeriod           : nat;   // 6 months in block levels -> 2880 * 30 * 6 = 518,400
    cooldownPeriod        : nat;   // 1 month in block level -> 2880 * 30 = 86400
]

type claimRecordType is record [
    amountClaimed    : nat;
    remainderVested  : nat; 
    dateTimeClaimed  : timestamp;
]
type claimLedgerType is big_map(address, claimRecordType)

type vesteeRecordType is record [
    totalVestedAmount     : nat;
    totalVestedRemainder  : nat;
    totalClaimedAmount    : nat;

    dateTimeStart         : timestamp; 
    monthsRemaining       : nat; 
    nextCooldown          : timestamp;
] 
type vesteeLedgerType is big_map(address, vesteeRecordType) // address, vestee record

type storage is record [
    admin  : address;
    config : configType;

    claimLedger : claimLedgerType;
    vesteeLedger : vesteeLedgerType;

    totalVestedAmount : nat; 

    delegationAddress : address;
    doormanAddress : address; 
    governanceAddress : address;
]

type vestingAction is 
    | Claim of (nat)
    | GetVestedBalance of (address * contract(nat))
    | GetTotalVested of contract(nat)
    | UpdateVesting of (address * vesteeRecordType)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------

// helper function to update user's staked balance in doorman contract after vesting
function vestingUpdateStakedBalanceInDoorman(const contractAddress : address) : contract(address * nat) is
  case (Tezos.get_entrypoint_opt(
      "%vestingUpdateStakedBalanceInDoorman",
      contractAddress) : option(contract(address * nat))) of
    Some(contr) -> contr
  | None -> (failwith("vestingUpdateStakedBalanceInDoorman entrypoint in Doorman Contract not found") : contract(address * nat))
  end;

function claim(const _proposal : nat ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2. 
    
    checkNoAmount();

    const vestee : vesteeRecordType = case s.vesteeLedger[Tezos.sender] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;

} with (noOperations, s)

function getVestedBalance(const userAddress : address; const contr : contract(nat); var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. return vestee's total vested remainder to callback contract
    checkNoAmount();

    const vestee : vesteeRecordType = case s.vesteeLedger[userAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;
    
} with (list [transaction(vestee.totalVestedRemainder, 0tz, contr)], s)

function getTotalVested(const contr : contract(nat); var s : storage) : return is 
block {
    checkNoAmount();
} with (list [transaction(s.totalVestedAmount, 0tz, contr)], s)

function updateVesting(const userAddress : address; const newVesteeRecord : vesteeRecordType; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. verify new vestee record params is of correct type
    // 3. update vestee with new vestee record 

    checkSenderIsAdmin(s);
    checkNoAmount();

    var _vestee : vesteeRecordType := case s.vesteeLedger[userAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;    

    // todo: 2. verify new vestee record params is of correct type

    vestee := newVesteeRecord;
    s.vesteeLedger[userAddress] := vestee;
    
} with (noOperations, s)

function main (const action : vestingAction; const s : storage) : return is 
    case action of
        | Claim(params) -> claim(params, s)
        | GetVestedBalance(params) -> getVestedBalance(params.0, params.1, s)
        | GetTotalVested(params) -> getTotalVested(params, s)
        | UpdateVesting(params) -> updateVesting(params.0, params.1, s)
    end