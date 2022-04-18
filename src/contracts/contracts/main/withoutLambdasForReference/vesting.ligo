// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Vesting types
#include "../partials/types/vestingTypes.ligo"

type vestingAction is 
    
    // Housekeeping Entrypoints
    | SetAdmin                      of (address)
    | UpdateMetadata                of (string * bytes)
    | UpdateWhitelistContracts      of updateWhitelistContractsParams
    | UpdateGeneralContracts        of updateGeneralContractsParams
    
    // Internal Vestee Control Entrypoints
    | AddVestee                     of (addVesteeType)
    | RemoveVestee                  of (address)
    | UpdateVestee                  of (updateVesteeType)
    | ToggleVesteeLock              of (address)

    // Vestee Entrypoints
    | Claim                         of (unit)

    // Lambda Entrypoints
    | SetLambda                   of setLambdaType

const noOperations   : list (operation) = nil;
type return is list (operation) * vestingStorage

// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const one_day        : int              = 86_400;
const thirty_days    : int              = one_day * 30;

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(var s : vestingStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Entrypoint / General Helper Functions Begin
// ------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------
// Entrypoint / General Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View function to get the totalRemainder for the vestee *)
[@view] function getVesteeBalance(const vesteeAddress : address; var s : vestingStorage) : nat is 
    case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record.totalRemainder
        | None -> failwith("Error. Vestee not found.")
    ];



(* View function to get the totalRemainder for the vestee *)
[@view] function getVesteeOpt(const vesteeAddress : address; var s : vestingStorage) : option(vesteeRecordType) is 
    Big_map.find_opt(vesteeAddress, s.vesteeLedger)



(* View function to get the total vested amount *)
[@view] function getTotalVested(const _ : unit; var s : vestingStorage) : nat is 
    s.totalVestedAmount

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : vestingStorage) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin

    s.admin := newAdminAddress;

} with (noOperations, s)



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : vestingStorage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
} with (noOperations, s)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: vestingStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: vestingStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addVestee entrypoint *)
function addVestee(const vesteeAddress : address; const totalAllocatedAmount : nat; const cliffInMonths : nat; const vestingInMonths : nat; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. create new vestee
    
    // checkSenderIsAdmin(s);

    // check sender is from council contract
    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    // check for div by 0 error
    if vestingInMonths = 0n then failwith("Error. Vesting months must be more than 0.")
      else skip;

    // Check for duration
    if cliffInMonths > vestingInMonths then failwith("Error. The cliff period cannot last longer than the vesting period.")
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
            lastClaimedTimestamp     = Tezos.now;                  // timestamp of when vestee last claimed
        ]
    ];    

    s.vesteeLedger[vesteeAddress] := newVestee;
    
} with (noOperations, s)



(*  removeVestee entrypoint *)
function removeVestee(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. remove vestee from vesteeLedger

    // checkSenderIsAdmin(s);

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var _vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];    

    remove vesteeAddress from map s.vesteeLedger;
    
} with (noOperations, s)



(*  updateVestee entrypoint *)
function updateVestee(const vesteeAddress : address; const newTotalAllocatedAmount : nat; const newCliffInMonths : nat; const newVestingInMonths : nat; var s : vestingStorage) : return is
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. update vestee record based on new params

    // checkSenderIsAdmin(s);

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
    
    // Check for duration
    if newCliffInMonths > newVestingInMonths then failwith("Error. The cliff period cannot last longer than the vesting period.")
      else skip;

    vestee.totalAllocatedAmount  := newTotalAllocatedAmount;  // totalAllocatedAmount should be in mu (10^6)

    // factor any amount that vestee has claimed so far and update new claim amount per month accordingly
    var newMonthsRemaining      : nat  := abs(newVestingInMonths - vestee.monthsClaimed);
    var newRemainder            : nat  := abs(newTotalAllocatedAmount - vestee.totalClaimed); 
    var newClaimAmountPerMonth  : nat  := newRemainder;
    if vestee.monthsClaimed < newVestingInMonths then 
      newClaimAmountPerMonth := newRemainder / newMonthsRemaining
    else skip;

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



(*  toggleVesteeLock entrypoint *)
function toggleVesteeLock(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. lock vestee account

    // checkSenderIsAdmin(s);

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

// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Vestee Entrypoints Begin
// ------------------------------------------------------------------------------

(* claim entrypoint *)
function claim(var s : vestingStorage) : return is 
block {
    // Steps Overview:
    // 1. Check if vestee exists in record
    // 2. Check if vestee is able to claim (current block level > vestee next redemption block)
    // 3. Calculate total claim amount based on when vestee last claimed 
    // 4. Send operations to mint new MVK tokens and update user's balance in MVK ledger
    // 5. Update vestee records in vestingStorage


    // use _vestee and _operations so that compiling will not have warnings that variable is unused
    var _vestee : vesteeRecordType := case s.vesteeLedger[Tezos.sender] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];

    // vestee status is not locked
    if _vestee.status = "LOCKED" then failwith("Error. Vestee is locked.")
      else skip;

    if _vestee.totalRemainder = 0n then failwith("Error. You already claimed everything")
      else skip;

    const timestampCheck   : bool = Tezos.now > _vestee.nextRedemptionTimestamp and _vestee.totalRemainder > 0n;
    
    var _operations : list(operation) := nil;

    if timestampCheck then block {

        // calculate claim amount based on last redemption - calculate how many months has passed since last redemption if any
        var numberOfClaimMonths : nat := abs(abs(Tezos.now - _vestee.lastClaimedTimestamp) / thirty_days);

        // get total claim amount
        var totalClaimAmount := _vestee.claimAmountPerMonth * numberOfClaimMonths;
        if totalClaimAmount > _vestee.totalRemainder then totalClaimAmount := _vestee.totalRemainder
          else skip;

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

// ------------------------------------------------------------------------------
// Vestee Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: councilStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------


function main (const action : vestingAction; const s : vestingStorage) : return is
  block{
    
    // Vesting contract entrypoints should not receive XTZ
    checkNoAmount(unit);

  } with (case action of [

        // Housekeeping Entrypoints
      | SetAdmin(parameters)                    -> setAdmin(parameters, s)  
      | UpdateMetadata(parameters)              -> updateMetadata(parameters.0, parameters.1, s)
      | UpdateWhitelistContracts(parameters)    -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts(parameters)      -> updateGeneralContracts(parameters, s)

        // Internal Vestee Control Entrypoints
      | AddVestee(params)                       -> addVestee(params.0, params.1, params.2, params.3, s)
      | RemoveVestee(params)                    -> removeVestee(params, s)
      | UpdateVestee(params)                    -> updateVestee(params.0, params.1, params.2, params.3, s)        
      | ToggleVesteeLock(params)                -> toggleVesteeLock(params, s)

        // Vestee Entrypoints
      | Claim(_params)                          -> claim(s)

        // Lambda Entrypoints
      | SetLambda(parameters)                   -> setLambda(parameters, s)
  ])