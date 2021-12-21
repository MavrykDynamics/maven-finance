type mintTokenType is (address * nat)

type configType is record [
    defaultCliffPeriod           : nat;   // 6 months in block levels -> 2880 * 30 * 6 = 518,400
    defaultCooldownPeriod        : nat;   // 1 month in block level -> 2880 * 30 = 86400
    
    newBlockTimeLevel            : nat;  // block level where new blocksPerMinute takes effect -> if none, use blocksPerMinute (old); if exists, check block levels, then use newBlocksPerMinute if current block level exceeds block level, if not use old blocksPerMinute
    newBlocksPerMinute           : nat;  // new blocks per minute 
    blocksPerMinute              : nat;  // to account for eventual changes in blocks per minute (and blocks per day / time) - todo: change to allow decimal
    blocksPerMonth               : nat;  // blocks per month - to help with calculation for cliff/cooldown periods
]

type claimRecordType is record [
    amountClaimed      : nat;
    remainderVested    : nat; 
    dateTimeClaimed    : timestamp;
    blockLevelClaimed  : nat;
]
type claimLedgerType is big_map(address, claimRecordType)

type vesteeRecordType is record [
    
    totalAllocatedAmount  : nat;        // total amount allocated to vestee
    totalRemainder        : nat;        // total amount that is left to be claimed
    totalClaimed          : nat;        // total amount that has been claimed
    claimAmountPerMonth   : nat;        // amount to be claimed each month: claimAmountPerMonth = (totalAllocatedAmount / vestingMonths)

    dateTimeStart         : timestamp;  // date/time start of when 
    vestingMonths         : nat;        // number of months of vesting for total allocaed amount
    cliffMonths           : nat;        // number of months for cliff before vestee can claim

    endCliffBlock         : nat;        // calculated end of cliff duration in block levels based on dateTimeStart
    endCliffDateTime      : timestamp;  // calculated end of cliff duration in timestamp based on dateTimeStart
    endVestingDateTime    : timestamp;  // calculated end of vesting duration in timestamp based on dateTimeStart

    monthsRemaining       : nat;        // remaining number of months   
    nextRedemptionBlock   : nat;        // block level where vestee will be able to claim again - calculated at start: nextRedemptionBlock = (block level of time start * cliff months * blocks per month)
    lastClaimedBlock      : nat;        // block level where vestee last claimed
] 
type vesteeLedgerType is big_map(address, vesteeRecordType) // address, vestee record

type storage is record [
    admin               : address;
    config              : configType;

    claimLedger         : claimLedgerType;
    vesteeLedger        : vesteeLedgerType;

    totalVestedAmount   : nat; 

    delegationAddress   : address;
    doormanAddress      : address; 
    governanceAddress   : address;
    mvkTokenAddress     : address;
]

// how to account for changes in block level

// determine if cliff period and vesting period will be unique to different users 
// e.g. different start times for each person depending on when they joined and vesting starts
    

type vestingAction is 
    | Claim of (unit)
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

// helper function to update user balance in MVK contract
function updateUserBalanceInMvkContract(const tokenAddress : address) : contract(address * nat * string) is
case (Tezos.get_entrypoint_opt(
    "%onStakeChange",
    tokenAddress) : option(contract(address * nat * string))) of
Some(contr) -> contr
| None -> (failwith("onStakeChange entrypoint in Token Contract not found") : contract(address * nat * string))
end;

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintTokenType))
  end;

(* Helper function to mint mvk/vmvk tokens *)
function mintTokens(
  const to_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );


function claim(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. Check if vestee exists in record
    // 2. Check if vestee is able to claim (current block level > vestee next redemption block)
    // 3. Calculate total claim amount based on when vestee last claimed 
    // 4. Send operations to mint new MVK tokens and update user's balance in MVK ledger
    // 5. Update vestee records in storage

    checkNoAmount(unit);

    // use _vestee and _operations so that compiling will not have warnings that variable is unused

    var _vestee : vesteeRecordType := case s.vesteeLedger[Tezos.sender] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;

    const currentBlockLevel = Tezos.level;
    
    var _operations : list(operation) := nil;

    if currentBlockLevel > _vestee.nextRedemptionBlock then block {

        // calculate claim amount based on last redemption - calculate how many months has passed since last redemption if any
        const claimAmount = _vestee.claimAmount;  // claim amount per month


        const mintVMvkTokensOperation : operation = mintTokens(
            Tezos.sender,           // to address
            claimAmount,            // amount of mvk Tokens to be minted
            s.mvkTokenAddress       // mvkTokenAddress
        ); 

        // update user's MVK balance -> increase user balance in mvk ledger
        const updateUserMvkBalanceOperation : operation = Tezos.transaction(
            (Tezos.sender, claimAmount, "claim"),
            0tez,
            updateUserBalanceInMvkContract(s.mvkTokenAddress)
        );

        const _operations : list(operation) = list [mintVMvkTokensOperation; updateUserMvkBalanceOperation];

        // increment vestee next redemption block (min date/time in which he will be able to make another claim)
        // if vestee.totalAllocatedAmount < vestee.totalRemainder then block { 
        //     const totalRemainder = 0;
        // } else block {
        //     const totalRemainder = abs(vestee.totalAllocatedAmount - vestee.totalRemainder);
        // }

        

        _vestee.lastClaimedBlock      := Tezos.level;  // current block level 
        _vestee.nextRedemptionBlock   := _vestee.nextRedemptionBlock + s.config.blocksPerMonth; 


        _vestee.totalClaimed          := _vestee.totalClaimed + claimAmount;        
        _vestee.totalRemainder        := abs(_vestee.totalAllocatedAmount - _vestee.totalRemainder);
        s.vesteeLedger[Tezos.sender] := _vestee;

    } else failwith("Error. You are unable to claim now.")

} with (_operations, s)

function getVestedBalance(const userAddress : address; const contr : contract(nat); var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. return vestee's total vested remainder to callback contract
    checkNoAmount(unit);

    const vestee : vesteeRecordType = case s.vesteeLedger[userAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;
    
} with (list [transaction(vestee.totalRemainder, 0tz, contr)], s)

function getTotalVested(const contr : contract(nat); var s : storage) : return is 
block {
    checkNoAmount(unit);
} with (list [transaction(s.totalVestedAmount, 0tz, contr)], s)

function updateVesting(const userAddress : address; const newVesteeRecord : vesteeRecordType; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. verify new vestee record params is of correct type
    // 3. update vestee with new vestee record 

    checkSenderIsAdmin(s);
    checkNoAmount(unit);

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
        | Claim(_params) -> claim(s)
        | GetVestedBalance(params) -> getVestedBalance(params.0, params.1, s)
        | GetTotalVested(params) -> getTotalVested(params, s)
        | UpdateVesting(params) -> updateVesting(params.0, params.1, s)
    end