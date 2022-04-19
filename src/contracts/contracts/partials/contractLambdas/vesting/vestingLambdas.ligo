// ------------------------------------------------------------------------------
//
// Vesting Contract Lambdas
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

(*  setAdmin lambda *)
function lambdaSetAdmin(const newAdminAddress : address; var s : vestingStorage) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const metadataKey: string; const metadataHash: bytes; var s : vestingStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: vestingStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: vestingStorage): return is
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

(*  addVestee lambda *)
function lambdaAddVestee(const addVesteeParams : addVesteeType; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. create new vestee

    // check sender is from council contract
    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    // init parameters
    const vesteeAddress          : address  = addVesteeParams.vesteeAddress;
    const totalAllocatedAmount   : nat      = addVesteeParams.totalAllocatedAmount;
    const cliffInMonths          : nat      = addVesteeParams.cliffInMonths;
    const vestingInMonths        : nat      = addVesteeParams.vestingInMonths;

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



(*  removeVestee lambda *)
function lambdaRemoveVestee(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. remove vestee from vesteeLedger

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var _vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
        | Some(_record) -> _record
        | None -> failwith("Error. Vestee is not found.")
    ];    

    remove vesteeAddress from map s.vesteeLedger;
    
} with (noOperations, s)



(*  updateVestee lambda *)
function lambdaUpdateVestee(const updateVesteeParams : updateVesteeType; var s : vestingStorage) : return is
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. update vestee record based on new params

    // check sender is from council contract
    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s.whitelistContracts);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;
    
    // init parameters
    const vesteeAddress             : address  = updateVesteeParams.vesteeAddress;
    const newTotalAllocatedAmount   : nat      = updateVesteeParams.newTotalAllocatedAmount;
    const newCliffInMonths          : nat      = updateVesteeParams.newCliffInMonths;
    const newVestingInMonths        : nat      = updateVesteeParams.newVestingInMonths;

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



(*  toggleVesteeLock lambda *)
function lambdaToggleVesteeLock(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. lock vestee account

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

(* claim lambda *)
function lambdaClaim(var s : vestingStorage) : return is 
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

        const mintMvkTokensOperation : operation = mintTokens(
            Tezos.sender,           // to address
            totalClaimAmount,       // amount of mvk Tokens to be minted
            mvkTokenAddress         // mvkTokenAddress
        ); 

        _operations := mintMvkTokensOperation # _operations;

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
//
// Entrypoints End
//
// ------------------------------------------------------------------------------
