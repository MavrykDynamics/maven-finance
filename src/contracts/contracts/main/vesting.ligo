// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Vesting types
#include "../partials/types/vestingTypes.ligo"

type vestingAction is 
    | SetAdmin of (address)
    | UpdateConfig of updateConfigParamsType    

    | Claim of (unit)
    
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams
    
    | AddVestee of (addVesteeType)
    | RemoveVestee of (address)
    | ToggleVesteeLock of (address)
    | UpdateVestee of (updateVesteeType)

const noOperations   : list (operation) = nil;
const one_day        : int              = 86_400;
const thirty_days    : int              = one_day * 30;
type return is list (operation) * vestingStorage

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : vestingStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

// function checkSenderIsCouncil(var s : vestingStorage) : unit is
//     if (Tezos.sender = s.councilAddress) then unit
//     else failwith("Only the council contract can call this entrypoint.");

// function checkSenderIsAdminOrCouncil(var s : vestingStorage) : unit is
//     if (Tezos.sender = s.admin or Tezos.sender = s.councilAddress) then unit
//     else failwith("Only the administrator or council contract can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: vestingStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: vestingStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

// helper function to update user's staked balance in doorman contract after vesting
function vestingUpdateStakedBalanceInDoorman(const contractAddress : address) : contract(address * nat) is
  case (Tezos.get_entrypoint_opt(
      "%vestingUpdateStakedBalanceInDoorman",
      contractAddress) : option(contract(address * nat))) of [
    Some(contr) -> contr
  | None -> (failwith("vestingUpdateStakedBalanceInDoorman entrypoint in Doorman Contract not found") : contract(address * nat))
  ];

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintParams) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintParams))) of [
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintParams))
  ];

(* Helper function to mint mvk tokens *)
function mintTokens(
  const to_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : vestingStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    s.admin := newAdminAddress;

} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : vestingStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
    ConfigDefaultCliffPeriod (_v)        -> s.config.defaultCliffPeriod         := updateConfigNewValue
  | ConfigDefaultCooldownPeriod (_v)     -> s.config.defaultCooldownPeriod      := updateConfigNewValue
  ];

} with (noOperations, s)


function claim(var s : vestingStorage) : return is 
block {
    // Steps Overview:
    // 1. Check if vestee exists in record
    // 2. Check if vestee is able to claim (current block level > vestee next redemption block)
    // 3. Calculate total claim amount based on when vestee last claimed 
    // 4. Send operations to mint new MVK tokens and update user's balance in MVK ledger
    // 5. Update vestee records in vestingStorage

    s.tempBlockLevel := Tezos.level;
    checkNoAmount(unit);

    // use _vestee and _operations so that compiling will not have warnings that variable is unused
    var _vestee : vesteeRecordType := case s.vesteeLedger[Tezos.sender] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];

    // vestee status is not locked
    if _vestee.status = "LOCKED" then failwith("Error. Vestee is locked.")
      else skip;

    const timestampCheck   : bool = Tezos.now > _vestee.nextRedemptionTimestamp;
    
    var _operations : list(operation) := nil;

    if timestampCheck then block {

        // calculate claim amount based on last redemption - calculate how many months has passed since last redemption if any
        var numberOfClaimMonths : nat := abs(abs(Tezos.now - _vestee.lastClaimedTimestamp) / thirty_days);
    
        // temp: for testing that mint inter-contract call works 
        // const numberOfClaimMonths : nat = 1n;

        // get total claim amount
        const totalClaimAmount = _vestee.claimAmountPerMonth * numberOfClaimMonths;  

        const mvkTokenAddress : address = s.mvkTokenAddress;

        const mintSMvkTokensOperation : operation = mintTokens(
            Tezos.sender,           // to address
            totalClaimAmount,       // amount of mvk Tokens to be minted
            mvkTokenAddress         // mvkTokenAddress
        ); 

        _operations := mintSMvkTokensOperation # _operations;

        var monthsRemaining  : nat   := 0n;
        if _vestee.monthsRemaining < numberOfClaimMonths then monthsRemaining := 0n
            else monthsRemaining := abs(_vestee.monthsRemaining - numberOfClaimMonths);

        _vestee.monthsRemaining          := monthsRemaining;

        var monthsClaimed : nat          := _vestee.monthsClaimed + numberOfClaimMonths;
        _vestee.monthsClaimed            := monthsClaimed;

        // use vestee start period to calculate next redemption period
        _vestee.nextRedemptionTimestamp  := _vestee.startTimestamp + (monthsClaimed * thirty_days) + thirty_days;
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

(* View functions to get the totalRemainder for the vestee *)
[@view] function getVesteeBalance(const vesteeAddress : address; var s : vestingStorage) : nat is 
    case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record.totalRemainder
        | None -> failwith("Error. Vestee not found.")
    ];

(* View functions to get the totalRemainder for the vestee *)
[@view] function getVesteeOpt(const vesteeAddress : address; var s : vestingStorage) : option(vesteeRecordType) is 
    Big_map.find_opt(vesteeAddress, s.vesteeLedger)

(* View functions to get the total vested amount *)
[@view] function getTotalVested(const _ : unit; var s : vestingStorage) : nat is 
    s.totalVestedAmount

function addVestee(const vesteeAddress : address; const totalAllocatedAmount : nat; const cliffInMonths : nat; const vestingInMonths : nat; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. create new vestee
    
    s.tempBlockLevel := Tezos.level;
    checkNoAmount(unit);

    // checkSenderIsAdmin(s);

    // check sender is from council contract
    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    // check for div by 0 error
    if vestingInMonths = 0n then failwith("Error. Vesting months must be more than 0.")
        else skip;

    var newVestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [
            Some(_record) -> failwith("Error. Vestee already exists")
        |   None -> record [
            
            // static variables initiated at start ----

            totalAllocatedAmount = totalAllocatedAmount;                      // totalAllocatedAmount should be in (10^9)
            claimAmountPerMonth  = totalAllocatedAmount / vestingInMonths;    // totalAllocatedAmount should be in (10^9)
            
            startTimestamp       = Tezos.now;                   // date/time start of when 

            vestingMonths        = vestingInMonths;             // number of months of vesting for total allocaed amount
            cliffMonths          = cliffInMonths;               // number of months for cliff before vestee can claim

            endCliffDateTime     = Tezos.now + (cliffInMonths * thirty_days);                  // calculated end of cliff duration in timestamp based on dateTimeStart
            
            endVestingDateTime   = Tezos.now + (vestingInMonths * thirty_days);                // calculated end of vesting duration in timestamp based on dateTimeStart

            // updateable variables on claim ----------

            status                   = "ACTIVE";

            totalRemainder           = totalAllocatedAmount;             // total amount that is left to be claimed
            totalClaimed             = 0n;                               // total amount that has been claimed

            monthsClaimed            = 0n;                               // claimed number of months   
            monthsRemaining          = vestingInMonths;                  // remaining number of months   
            
            nextRedemptionTimestamp  = Tezos.now + (cliffInMonths * thirty_days);                  // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)
            lastClaimedTimestamp     = Tezos.now;                                              // timestamp of when vestee last claimed
        ]
    ];    

    s.vesteeLedger[vesteeAddress] := newVestee;
    
} with (noOperations, s)

function removeVestee(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. remove vestee from vesteeLedger

    // checkSenderIsAdmin(s);
    checkNoAmount(unit);

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var _vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];    

    remove vesteeAddress from map s.vesteeLedger;
    
} with (noOperations, s)

function toggleVesteeLock(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. lock vestee account

    // checkSenderIsAdmin(s);
    checkNoAmount(unit);

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];    

    var newStatus : string := "newStatus";
    if vestee.status = "LOCKED" then newStatus := "ACTIVE"
      else newStatus := "LOCKED";

    vestee.status := newStatus;
    s.vesteeLedger[vesteeAddress] := vestee;
    
} with (noOperations, s)


function updateVestee(const vesteeAddress : address; const newTotalAllocatedAmount : nat; const newCliffInMonths : nat; const newVestingInMonths : nat; var s : vestingStorage) : return is
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. update vestee record based on new params

    // checkSenderIsAdmin(s);
    checkNoAmount(unit);

    // check sender is from council contract
    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    // check for div by 0 error
    if newVestingInMonths = 0n then failwith("Error. Vesting months must be more than 0.")
        else skip;

    var vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];
    
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

    vestee.endCliffDateTime     := vestee.startTimestamp + (newCliffInMonths * thirty_days);                // calculated end of new cliff duration in timestamp based on dateTimeStart
            
    vestee.endVestingDateTime   := vestee.startTimestamp + (newVestingInMonths * thirty_days);              // calculated end of new vesting duration in timestamp based on dateTimeStart

    // todo bugfix: check that new cliff in months is different from old cliff in months

    // calculate next redemption block based on new cliff months and whether vestee has made a claim 
    if newCliffInMonths <= vestee.monthsClaimed then block {
        // no changes to vestee next redemption period
        vestee.nextRedemptionTimestamp  := vestee.startTimestamp + (vestee.monthsClaimed * thirty_days) + thirty_days;            // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)
    } else block {
        // cliff has been adjusted upwards, requiring vestee to wait for cliff period to end again before he can start to claim
        vestee.nextRedemptionTimestamp  := vestee.startTimestamp + (newCliffInMonths * thirty_days);            // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)
    };

    s.vesteeLedger[vesteeAddress] := vestee;

} with (noOperations, s)


function main (const action : vestingAction; const s : vestingStorage) : return is 
    case action of [
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        | Claim(_params) -> claim(s)
        | AddVestee(params) -> addVestee(params.0, params.1, params.2, params.3, s)
        | RemoveVestee(params) -> removeVestee(params, s)
        | ToggleVesteeLock(params) -> toggleVesteeLock(params, s)

        | UpdateVestee(params) -> updateVestee(params.0, params.1, params.2, params.3, s)        
    ]