type mintTokenType is (address * nat)

type blockLevel is nat; 

type configType is record [
    defaultCliffPeriod           : nat;   // 6 months in block levels -> 2880 * 30 * 6 = 518,400
    defaultCooldownPeriod        : nat;   // 1 month in block level -> 2880 * 30 = 86400
    
    newBlockTimeLevel            : nat;  // block level where new blocksPerMinute takes effect -> if none, use blocksPerMinute (old); if exists, check block levels, then use newBlocksPerMinute if current block level exceeds block level, if not use old blocksPerMinute
    newBlocksPerMinute           : nat;  // new blocks per minute 
    
    blocksPerMinute              : nat;  // to account for eventual changes in blocks per minute (and blocks per day / time) - todo: change to allow decimal
    blocksPerMonth               : nat;  // for convenience: blocks per month - to help with calculation for cliff/cooldown periods
]

type claimRecordType is record [
    amountClaimed      : nat;
    remainderVested    : nat; 
    dateTimeClaimed    : timestamp;
    blockLevelClaimed  : nat;
]
type claimLedgerType is big_map(address, claimRecordType)

type vesteeRecordType is record [
    
    // static variables initiated at start ----

    totalAllocatedAmount     : nat;             // total amount allocated to vestee
    claimAmountPerMonth      : nat;             // amount to be claimed each month: claimAmountPerMonth = (totalAllocatedAmount / vestingMonths)

    startBlock               : blockLevel;      // date/time of start in block levels
    startTimestamp           : timestamp;       // date/time start of when 

    vestingMonths            : nat;             // number of months of vesting for total allocaed amount
    cliffMonths              : nat;             // number of months for cliff before vestee can claim

    endCliffBlock            : blockLevel;      // calculated end of cliff duration in block levels based on dateTimeStart
    endCliffDateTime         : timestamp;       // calculated end of cliff duration in timestamp based on dateTimeStart
    
    endVestingBlock          : blockLevel;      // calculated end of vesting duration in block levels based on dateTimeStart
    endVestingDateTime       : timestamp;       // calculated end of vesting duration in timestamp based on dateTimeStart

    status                   : string;          // status of vestee: "ACTIVE", "LOCKED"

    // updateable variables on claim ----------

    totalRemainder           : nat;             // total amount that is left to be claimed
    totalClaimed             : nat;             // total amount that has been claimed

    monthsClaimed            : nat;             // claimed number of months   
    monthsRemaining          : nat;             // remaining number of months   
    
    nextRedemptionBlock      : blockLevel;      // block level where vestee will be able to claim again - calculated at start: nextRedemptionBlock = (block level of time start * cliff months * blocks per month)
    nextRedemptionTimestamp  : timestamp;       // timestamp of when vestee will be able to claim again

    lastClaimedBlock         : blockLevel;      // block level where vestee last claimed
    lastClaimedTimestamp     : timestamp;       // timestamp of when vestee last claimed
] 
type vesteeLedgerType is big_map(address, vesteeRecordType) // address, vestee record

type whitelistContractsType is map (string, address)
type contractAddressesType is map (string, address)

type storage is record [
    admin               : address;
    config              : configType;

    whitelistContracts    : whitelistContractsType;      
    contractAddresses     : contractAddressesType;

    claimLedger         : claimLedgerType;
    vesteeLedger        : vesteeLedgerType;

    totalVestedAmount   : nat;          // record of how much has been vested so far

    tempBlockLevel      : nat; 
]

// how to account for changes in block level

// determine if cliff period and vesting period will be unique to different users 
// e.g. different start times for each person depending on when they joined and vesting starts
    
type addVesteeType is (address * nat * nat * nat) // vestee address, total allocated amount, cliff in months, vesting in months
type updateVesteeType is (address * nat * nat * nat) // vestee address, new total allocated amount, new cliff in months, new vesting in months
type updateWhitelistContractParams is (string * address)
type updateContractAddressesParams is (string * address)

type vestingAction is 
    | Claim of (unit)
    | GetVestedBalance of (address * contract(nat))
    | UpdateWhitelistContracts of updateWhitelistContractParams
    | UpdateContractAddresses of updateContractAddressesParams
    | GetTotalVested of contract(nat)
    | AddVestee of (addVesteeType)
    | RemoveVestee of (address)
    | ToggleVesteeLock of (address)
    | UpdateVestee of (updateVesteeType)
    | UpdateVestingRecord of (address * vesteeRecordType)

const noOperations : list (operation) = nil;
const nullTimestamp : timestamp = ("2000-01-01T00:00:00Z" : timestamp);
type return is list (operation) * storage

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function getWhitelistContractsSet(var s : storage) : set(address) is 
block {
  var _whitelistContractsSet : set(address) := set [];
  for _key -> value in map s.whitelistContracts block {
    var _whitelistContractsSet : set(address) := Set.add(value, _whitelistContractsSet);
  }
} with _whitelistContractsSet

function checkSenderIsWhitelistContract(var s : storage) : unit is
block {
  var whitelistContractsSet : set(address) := getWhitelistContractsSet(s);
  if (whitelistContractsSet contains Tezos.sender) then skip
  else failwith("Error. Only whitelisted contracts can call this entrypoint.");
} with unit

function checkSenderIsAdminOrWhitelistContract(var s : storage) : unit is
block {
  var whitelistContractsSet : set(address) := getWhitelistContractsSet(s);
  if (Tezos.sender = s.admin or whitelistContractsSet contains Tezos.sender) then skip
  else failwith("Error. Only whitelisted contracts can call this entrypoint.");
} with unit

function getContractAddressesSet(var s : storage) : set(address) is 
block {
  var _contractAddressesSet : set(address) := set [];
  for _key -> value in map s.contractAddresses block {
    var _contractAddressesSet : set(address) := Set.add(value, _contractAddressesSet);
  }
} with _contractAddressesSet

// function checkSenderIsCouncil(var s : storage) : unit is
//     if (Tezos.sender = s.councilAddress) then unit
//     else failwith("Only the council contract can call this entrypoint.");

// function checkSenderIsAdminOrCouncil(var s : storage) : unit is
//     if (Tezos.sender = s.admin or Tezos.sender = s.councilAddress) then unit
//     else failwith("Only the administrator or council contract can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------

// toggle adding and removal of whitelist contract addresses
function updateWhitelistContracts(const contractName : string; const contractAddress : address; var s : storage) : return is 
block{

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    var whitelistContractsSet : set(address) := getWhitelistContractsSet(s);

    const checkIfWhitelistContractExists : bool = whitelistContractsSet contains contractAddress; 

    if (checkIfWhitelistContractExists) then block{
        // whitelist contract exists - remove whitelist contract from set 
        s.whitelistContracts := Map.update(contractName, Some(contractAddress), s.whitelistContracts);
    } else block {
        // whitelist contract does not exist - add whitelist contract to set 
        s.whitelistContracts := Map.add(contractName, contractAddress, s.whitelistContracts);
    }

} with (noOperations, s) 

// toggle adding and removal of contract addresses
function updateContractAddresses(const contractName : string; const contractAddress : address; var s : storage) : return is 
block{

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    var contractAddressesSet : set(address) := getContractAddressesSet(s);

    const checkIfContractExists : bool = contractAddressesSet contains contractAddress; 

    if (checkIfContractExists) then block{
        // whitelist contract exists - remove whitelist contract from set 
        s.contractAddresses := Map.update(contractName, Some(contractAddress), s.contractAddresses);
    } else block {
        // whitelist contract does not exist - add whitelist contract to set 
        s.contractAddresses := Map.add(contractName, contractAddress, s.contractAddresses);
    }

} with (noOperations, s) 

// helper function to update user's staked balance in doorman contract after vesting
function vestingUpdateStakedBalanceInDoorman(const contractAddress : address) : contract(address * nat) is
  case (Tezos.get_entrypoint_opt(
      "%vestingUpdateStakedBalanceInDoorman",
      contractAddress) : option(contract(address * nat))) of
    Some(contr) -> contr
  | None -> (failwith("vestingUpdateStakedBalanceInDoorman entrypoint in Doorman Contract not found") : contract(address * nat))
  end;

// helper function to update user balance in MVK contract
// function updateUserBalanceInMvkContract(const tokenAddress : address) : contract(address * nat * string) is
// case (Tezos.get_entrypoint_opt(
//     "%onStakeChange",
//     tokenAddress) : option(contract(address * nat * string))) of
// Some(contr) -> contr
// | None -> (failwith("onStakeChange entrypoint in Token Contract not found") : contract(address * nat * string))
// end;

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

    s.tempBlockLevel := Tezos.level;
    checkNoAmount(unit);

    // use _vestee and _operations so that compiling will not have warnings that variable is unused
    var _vestee : vesteeRecordType := case s.vesteeLedger[Tezos.sender] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;

    // vestee status is not locked
    if _vestee.status = "LOCKED" then failwith("Error. Vestee is locked.")
      else skip;

    const blockLevelCheck  : bool = Tezos.level > _vestee.nextRedemptionBlock;
    const timestampCheck   : bool = Tezos.now > _vestee.nextRedemptionTimestamp;

    const claimCheck : bool = timestampCheck and blockLevelCheck = True;
    
    var _operations : list(operation) := nil;

    if claimCheck then block {

        // calculate claim amount based on last redemption - calculate how many months has passed since last redemption if any
        var numberOfClaimMonths : nat := 0n;
        
        // at least one month needs to pass before the first claim (e.g. for edge case vestee with 0 cliff months and 1 vesting months)
        if _vestee.lastClaimedBlock = 0n then block {
            const blockLevelsSinceStart   = abs(Tezos.level - _vestee.startBlock);
            numberOfClaimMonths           := blockLevelsSinceStart / s.config.blocksPerMonth;
        } else skip;
        
        if _vestee.lastClaimedBlock > 0n then block {
            const blockLevelsSinceLastClaim  = abs(Tezos.level - _vestee.lastClaimedBlock);
            numberOfClaimMonths              := blockLevelsSinceLastClaim / s.config.blocksPerMonth;
        } else skip;
    
        // temp: for testing that mint inter-contract call works 
        // const numberOfClaimMonths : nat = 1n;

        // get total claim amount
        const totalClaimAmount = _vestee.claimAmountPerMonth * numberOfClaimMonths;  

        const mvkTokenAddress : address = case s.contractAddresses["mvkToken"] of
            Some(_address) -> _address
            | None -> failwith("Error. MVK Token Contract is not found.")
        end;

        const mintVMvkTokensOperation : operation = mintTokens(
            Tezos.sender,           // to address
            totalClaimAmount,       // amount of mvk Tokens to be minted
            mvkTokenAddress         // mvkTokenAddress
        ); 

        // update user's MVK balance -> increase user balance in mvk ledger
        // const updateUserMvkBalanceOperation : operation = Tezos.transaction(
        //     (Tezos.sender, totalClaimAmount, "claim"),
        //     0tez,
        //     updateUserBalanceInMvkContract(s.mvkTokenAddress)
        // );

        _operations := mintVMvkTokensOperation # _operations;

        // const _operations : list(operation) = list [mintVMvkTokensOperation; updateUserMvkBalanceOperation];
        
        const one_day        : int   = 86_400;
        const thirty_days    : int   = one_day * 30;

        var monthsRemaining  : nat   := 0n;
        if _vestee.monthsRemaining < numberOfClaimMonths then monthsRemaining := 0n; 
            else monthsRemaining := abs(_vestee.monthsRemaining - numberOfClaimMonths);

        _vestee.monthsRemaining          := monthsRemaining;

        var monthsClaimed : nat          := _vestee.monthsClaimed + numberOfClaimMonths;
        _vestee.monthsClaimed            := monthsClaimed;

        // use vestee start period to calculate next redemption period
        _vestee.nextRedemptionBlock      := _vestee.startBlock + (monthsClaimed * s.config.blocksPerMonth) + s.config.blocksPerMonth; 
        _vestee.nextRedemptionTimestamp  := _vestee.startTimestamp + (monthsClaimed * thirty_days) + thirty_days;

        _vestee.lastClaimedBlock         := Tezos.level;  // current block level 
        _vestee.lastClaimedTimestamp     := Tezos.now;    // current timestamp

        _vestee.totalClaimed             := _vestee.totalClaimed + totalClaimAmount;  

        var totalRemainder : nat := 0n;
        if _vestee.totalAllocatedAmount < totalClaimAmount then totalRemainder := 0n
            else totalRemainder := abs(_vestee.totalAllocatedAmount - totalClaimAmount);
        _vestee.totalRemainder           := totalRemainder;

        s.vesteeLedger[Tezos.sender] := _vestee;

        // update total vested amount in contract
        s.totalVestedAmount := s.totalVestedAmount + totalClaimAmount;

    } else failwith("Error. You are unable to claim now.");

} with (_operations, s)

function getVestedBalance(const vesteeAddress : address; const contr : contract(nat); var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. return vestee's total vested remainder to callback contract
    checkNoAmount(unit);

    const vestee : vesteeRecordType = case s.vesteeLedger[vesteeAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;
    
} with (list [transaction(vestee.totalRemainder, 0tz, contr)], s)

function getTotalVested(const contr : contract(nat); var s : storage) : return is 
block {
    checkNoAmount(unit);
} with (list [transaction(s.totalVestedAmount, 0tz, contr)], s)

function addVestee(const vesteeAddress : address; const totalAllocatedAmount : nat; const cliffInMonths : nat; const vestingInMonths : nat; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. create new vestee
    s.tempBlockLevel := Tezos.level;
    checkSenderIsAdmin(s);
    checkNoAmount(unit);

    const one_day        : int   = 86_400;
    const thirty_days    : int   = one_day * 30;

    // check for div by 0 error
    if vestingInMonths = 0n then failwith("Error. Vesting months must be more than 0.")
        else skip;

    var newVestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of 
        | Some(_record) -> failwith("Error. Vestee already exists")
        | None -> record [
            
            // static variables initiated at start ----

            totalAllocatedAmount = totalAllocatedAmount;                      // totalAllocatedAmount should be in mu (10^6)
            claimAmountPerMonth  = totalAllocatedAmount / vestingInMonths;    // totalAllocatedAmount should be in mu (10^6)
            
            startBlock           = Tezos.level;                 // date/time of start in block levels
            startTimestamp       = Tezos.now;                   // date/time start of when 

            vestingMonths        = vestingInMonths;             // number of months of vesting for total allocaed amount
            cliffMonths          = cliffInMonths;               // number of months for cliff before vestee can claim

            endCliffBlock        = Tezos.level + (cliffInMonths * s.config.blocksPerMonth);    // calculated end of cliff duration in block levels based on dateTimeStart
            endCliffDateTime     = Tezos.now + (cliffInMonths * thirty_days);                  // calculated end of cliff duration in timestamp based on dateTimeStart
            
            endVestingBlock      = Tezos.level + (vestingInMonths * s.config.blocksPerMonth);  // calculated end of vesting duration in timestamp based on dateTimeStart
            endVestingDateTime   = Tezos.now + (vestingInMonths * thirty_days);                // calculated end of vesting duration in timestamp based on dateTimeStart

            // updateable variables on claim ----------

            status                   = "ACTIVE";

            totalRemainder           = totalAllocatedAmount;             // total amount that is left to be claimed
            totalClaimed             = 0n;                               // total amount that has been claimed

            monthsClaimed            = 0n;                               // claimed number of months   
            monthsRemaining          = vestingInMonths;                  // remaining number of months   
            
            nextRedemptionBlock      = Tezos.level + (cliffInMonths * s.config.blocksPerMonth);    //  block level where vestee will be able to claim again (same as end of cliff block)
            nextRedemptionTimestamp  = Tezos.now + (cliffInMonths * thirty_days);                  // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)
            lastClaimedBlock         = 0n;                                                         // block level where vestee last claimed
            lastClaimedTimestamp     = nullTimestamp;                                              // timestamp of when vestee last claimed
        ]
    end;    

    s.vesteeLedger[vesteeAddress] := newVestee;
    
} with (noOperations, s)

function removeVestee(const vesteeAddress : address; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. remove vestee from vesteeLedger

    checkSenderIsAdmin(s);
    checkNoAmount(unit);

    var _vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;    

    remove vesteeAddress from map s.vesteeLedger;
    
} with (noOperations, s)

function toggleVesteeLock(const vesteeAddress : address; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. lock vestee account

    checkSenderIsAdmin(s);
    checkNoAmount(unit);

    var vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;    

    var newStatus : string := "newStatus";
    if vestee.status = "LOCKED" then newStatus := "ACTIVE"
      else newStatus := "LOCKED";

    vestee.status := newStatus;
    s.vesteeLedger[vesteeAddress] := vestee;
    
} with (noOperations, s)


function updateVestee(const vesteeAddress : address; const newTotalAllocatedAmount : nat; const newCliffInMonths : nat; const newVestingInMonths : nat; var s : storage) : return is
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. update vestee record based on new params

    checkSenderIsAdmin(s);
    checkNoAmount(unit);

    // check for div by 0 error
    if newVestingInMonths = 0n then failwith("Error. Vesting months must be more than 0.")
        else skip;

    var vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;    

    const one_day        : int   = 86_400;
    const thirty_days    : int   = one_day * 30;
    
    vestee.totalAllocatedAmount  := newTotalAllocatedAmount;  // totalAllocatedAmount should be in mu (10^6)

    // factor any amount that vestee has claimed so far and update new claim amount per month accordingly
    var newMonthsRemaining      : nat  := abs(newVestingInMonths - vestee.monthsClaimed); 
    var newRemainder            : nat  := abs(newTotalAllocatedAmount - vestee.totalClaimed); 
    var newClaimAmountPerMonth  : nat  := newRemainder / newMonthsRemaining;

    vestee.totalRemainder       := newRemainder;
    vestee.claimAmountPerMonth  := newClaimAmountPerMonth;
    vestee.cliffMonths          := newCliffInMonths;
    vestee.vestingMonths        := newVestingInMonths;
    vestee.monthsRemaining      := newMonthsRemaining;

    vestee.endCliffBlock        := vestee.startBlock + (newCliffInMonths * s.config.blocksPerMonth);        // calculated end of new cliff duration in block levels based on dateTimeStart
    vestee.endCliffDateTime     := vestee.startTimestamp + (newCliffInMonths * thirty_days);                // calculated end of new cliff duration in timestamp based on dateTimeStart
            
    vestee.endVestingBlock      := vestee.startBlock + (newVestingInMonths * s.config.blocksPerMonth);      // calculated end of new vesting duration in timestamp based on dateTimeStart
    vestee.endVestingDateTime   := vestee.startTimestamp + (newVestingInMonths * thirty_days);              // calculated end of new vesting duration in timestamp based on dateTimeStart

    // todo bugfix: check that new cliff in months is different from old cliff in months

    // calculate next redemption block based on new cliff months and whether vestee has made a claim 
    if newCliffInMonths <= vestee.monthsClaimed then block {
        // no changes to vestee next redemption period
        vestee.nextRedemptionBlock      := vestee.startBlock + (vestee.monthsClaimed * s.config.blocksPerMonth) + s.config.blocksPerMonth;    //  block level where vestee will be able to claim again (same as end of cliff block)
        vestee.nextRedemptionTimestamp  := vestee.startTimestamp + (vestee.monthsClaimed * thirty_days) + thirty_days;            // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)
    } else block {
        // cliff has been adjusted upwards, requiring vestee to wait for cliff period to end again before he can start to claim
        vestee.nextRedemptionBlock      := vestee.startBlock + (newCliffInMonths * s.config.blocksPerMonth);    //  block level where vestee will be able to claim again (same as end of cliff block)
        vestee.nextRedemptionTimestamp  := vestee.startTimestamp + (newCliffInMonths * thirty_days);            // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)
    };

    s.vesteeLedger[vesteeAddress] := vestee;

} with (noOperations, s)


function updateVestingRecord(const vesteeAddress : address; const newVesteeRecord : vesteeRecordType; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. verify new vestee record params is of correct type
    // 3. update vestee with new vestee record 

    checkSenderIsAdmin(s);
    checkNoAmount(unit);

    var _vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    end;    

    _vestee := newVesteeRecord;
    s.vesteeLedger[vesteeAddress] := _vestee;
    
} with (noOperations, s)

function main (const action : vestingAction; const s : storage) : return is 
    case action of
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters.0, parameters.1, s)
        | UpdateContractAddresses(parameters) -> updateContractAddresses(parameters.0, parameters.1, s)
        | Claim(_params) -> claim(s)
        | AddVestee(params) -> addVestee(params.0, params.1, params.2, params.3, s)
        | RemoveVestee(params) -> removeVestee(params, s)
        | ToggleVesteeLock(params) -> toggleVesteeLock(params, s)
        | GetVestedBalance(params) -> getVestedBalance(params.0, params.1, s)
        | GetTotalVested(params) -> getTotalVested(params, s)
        | UpdateVestee(params) -> updateVestee(params.0, params.1, params.2, params.3, s)
        | UpdateVestingRecord(params) -> updateVestingRecord(params.0, params.1, s)
    end