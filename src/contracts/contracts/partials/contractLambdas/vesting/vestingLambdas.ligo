// ------------------------------------------------------------------------------
//
// Vesting Contract Lambdas
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is
block {
    
    checkSenderIsAllowed(s); 

    case vestingLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const vestingLambdaAction : vestingLambdaActionType;  var s : vestingStorageType) : return is
block {
    
    checkSenderIsAllowed(s);

    case vestingLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is
block {

    checkSenderIsAdmin(s); 
    
    case vestingLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType): return is
block {

    checkSenderIsAdmin(s);
    
    case vestingLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType): return is
block {

    checkSenderIsAdmin(s);
    
    case vestingLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType): return is
block {

    var operations : list(operation) := nil;

    case vestingLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                        | Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Internal Vestee Control Lambdas Begin
// ------------------------------------------------------------------------------

(*  addVestee lambda *)
function lambdaAddVestee(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. create new vestee

    case vestingLambdaAction of [
        | LambdaAddVestee(addVesteeParams) -> {
                
                // check sender is from council contract
                checkSenderIsCouncilOrAdmin(s);

                // init parameters
                const vesteeAddress          : address  = addVesteeParams.vesteeAddress;
                const totalAllocatedAmount   : nat      = addVesteeParams.totalAllocatedAmount;
                const cliffInMonths          : nat      = addVesteeParams.cliffInMonths;
                const vestingInMonths        : nat      = addVesteeParams.vestingInMonths;

                // check for div by 0 error
                if vestingInMonths = 0n then failwith(error_VESTING_IN_MONTHS_TOO_SHORT)
                else skip;

                // Check for duration
                if cliffInMonths > vestingInMonths then failwith(error_CLIFF_PERIOD_TOO_LONG)
                else skip;

                var newVestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [
                        Some(_record) -> failwith(error_VESTEE_ALREADY_EXISTS)
                    |   None -> record [
                        
                        // static variables initiated at start ----

                        totalAllocatedAmount = totalAllocatedAmount;                      // totalAllocatedAmount should be in (10^9)
                        claimAmountPerMonth  = totalAllocatedAmount / vestingInMonths;    // totalAllocatedAmount should be in (10^9)
                        
                        startTimestamp       = Tezos.get_now();                   // date/time start of when 

                        vestingMonths        = vestingInMonths;             // number of months of vesting for total allocaed amount
                        cliffMonths          = cliffInMonths;               // number of months for cliff before vestee can claim

                        endCliffDateTime     = Tezos.get_now() + (cliffInMonths * thirty_days);                  // calculated end of cliff duration in timestamp based on dateTimeStart
                        
                        endVestingDateTime   = Tezos.get_now() + (vestingInMonths * thirty_days);                // calculated end of vesting duration in timestamp based on dateTimeStart

                        // updateable variables on claim ----------

                        status                   = "ACTIVE";

                        totalRemainder           = totalAllocatedAmount;             // total amount that is left to be claimed
                        totalClaimed             = 0n;                               // total amount that has been claimed

                        monthsClaimed            = 0n;                               // claimed number of months   
                        monthsRemaining          = vestingInMonths;                  // remaining number of months   
                        
                        nextRedemptionTimestamp  = Tezos.get_now();                  // timestamp of when vestee will be able to claim again (claim at start of period; if cliff exists, will be the same as end of cliff timestamp)
                        lastClaimedTimestamp     = Tezos.get_now();                  // timestamp of when vestee last claimed
                    ]
                ];    

                s.vesteeLedger[vesteeAddress] := newVestee;

            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  removeVestee lambda *)
function lambdaRemoveVestee(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    // Steps Overview:
    // 1. check if user address exists in vestee ledger
    // 2. remove vestee from vesteeLedger

    case vestingLambdaAction of [
        | LambdaRemoveVestee(vesteeAddress) -> {
                
                checkSenderIsCouncilOrAdmin(s);

                var _vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
                    | Some(_record) -> _record
                    | None -> failwith(error_VESTEE_NOT_FOUND)
                ];    

                remove vesteeAddress from map s.vesteeLedger;
            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  updateVestee lambda *)
function lambdaUpdateVestee(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. update vestee record based on new params

    case vestingLambdaAction of [
        | LambdaUpdateVestee(updateVesteeParams) -> {
                
                checkSenderIsCouncilOrAdmin(s);
                
                // init parameters
                const vesteeAddress             : address  = updateVesteeParams.vesteeAddress;
                const newTotalAllocatedAmount   : nat      = updateVesteeParams.newTotalAllocatedAmount;
                const newCliffInMonths          : nat      = updateVesteeParams.newCliffInMonths;
                const newVestingInMonths        : nat      = updateVesteeParams.newVestingInMonths;

                // check for div by 0 error
                if newVestingInMonths = 0n then failwith(error_VESTING_IN_MONTHS_TOO_SHORT)
                else skip;

                var vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
                    | Some(_record) -> _record
                    | None -> failwith(error_VESTEE_NOT_FOUND)
                ];

                // Check for duration
                if newCliffInMonths > newVestingInMonths then failwith(error_CLIFF_PERIOD_TOO_LONG)
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

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  toggleVesteeLock lambda *)
function lambdaToggleVesteeLock(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    // Steps Overview:
    // 1. check if vestee address exists in vestee ledger
    // 2. lock vestee account

    case vestingLambdaAction of [
        | LambdaToggleVesteeLock(vesteeAddress) -> {
                
                checkSenderIsCouncilOrAdmin(s);

                var vestee : vesteeRecordType := case s.vesteeLedger[vesteeAddress] of [ 
                    | Some(_record) -> _record
                    | None          -> failwith(error_VESTEE_NOT_FOUND)
                ];    

                var newStatus : string := "newStatus";
                if vestee.status = "LOCKED" then newStatus := "ACTIVE"
                else newStatus := "LOCKED";

                vestee.status := newStatus;
                s.vesteeLedger[vesteeAddress] := vestee;

            }
        | _ -> skip
    ];
    
} with (noOperations, s)

// ------------------------------------------------------------------------------
// Internal Vestee Control Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Vestee Lambdas Begin
// ------------------------------------------------------------------------------

(* claim lambda *)
function lambdaClaim(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {
    // Steps Overview:
    // 1. Check if vestee exists in record
    // 2. Check if vestee is able to claim (current block level > vestee next redemption block)
    // 3. Calculate total claim amount based on when vestee last claimed 
    // 4. Send operations to mint new MVK tokens and update user's balance in MVK ledger
    // 5. Update vestee records in vestingStorageType

    var operations : list(operation) := nil;

    case vestingLambdaAction of [
        | LambdaClaim(_parameters) -> {
                
                // use _vestee and _operations so that compiling will not have warnings that variable is unused
                var _vestee : vesteeRecordType := case s.vesteeLedger[Tezos.get_sender()] of [ 
                    | Some(_record) -> _record
                    | None -> failwith(error_VESTEE_NOT_FOUND)
                ];

                // vestee status is not locked
                if _vestee.status = "LOCKED" then failwith(error_VESTEE_LOCKED)
                else skip;

                if _vestee.totalRemainder = 0n then failwith(error_NO_VESTING_REWARDS_TO_CLAIM)
                else skip;

                const timestampCheck   : bool = Tezos.get_now() > _vestee.nextRedemptionTimestamp and _vestee.totalRemainder > 0n;

                if timestampCheck then block {

                    // calculate claim amount based on last redemption - calculate how many months has passed since last redemption if any
                    var numberOfClaimMonths : nat := abs(abs(Tezos.get_now() - _vestee.lastClaimedTimestamp) / thirty_days);

                    // first claim month
                    if _vestee.lastClaimedTimestamp = _vestee.startTimestamp then numberOfClaimMonths   := numberOfClaimMonths + 1n else skip;

                    // get total claim amount
                    var totalClaimAmount := _vestee.claimAmountPerMonth * numberOfClaimMonths;
                    if totalClaimAmount > _vestee.totalRemainder then totalClaimAmount := _vestee.totalRemainder
                    else skip;

                    const mvkTokenAddress : address = s.mvkTokenAddress;

                    const mintMvkTokensOperation : operation = mintTokens(
                        Tezos.get_sender(),           // to address
                        totalClaimAmount,       // amount of mvk Tokens to be minted
                        mvkTokenAddress         // mvkTokenAddress
                    ); 

                    operations := mintMvkTokensOperation # operations;

                    var monthsRemaining  : nat   := 0n;
                    if _vestee.monthsRemaining < numberOfClaimMonths then monthsRemaining := 0n
                    else monthsRemaining := abs(_vestee.monthsRemaining - numberOfClaimMonths);

                    _vestee.monthsRemaining          := monthsRemaining;

                    var monthsClaimed : nat          := _vestee.monthsClaimed + numberOfClaimMonths;
                    _vestee.monthsClaimed            := monthsClaimed;

                    // use vestee start period to calculate next redemption period
                    _vestee.nextRedemptionTimestamp  := _vestee.startTimestamp + (monthsClaimed * thirty_days);
                    _vestee.lastClaimedTimestamp     := Tezos.get_now();    // current timestamp

                    _vestee.totalClaimed             := _vestee.totalClaimed + totalClaimAmount;  

                    var totalRemainder : nat := 0n;
                    if _vestee.totalAllocatedAmount < totalClaimAmount then totalRemainder := 0n
                    else totalRemainder := abs(_vestee.totalAllocatedAmount - totalClaimAmount);
                    _vestee.totalRemainder           := totalRemainder;

                    s.vesteeLedger[Tezos.get_sender()] := _vestee;

                    // update total vested amount in contract
                    s.totalVestedAmount := s.totalVestedAmount + totalClaimAmount;

                } else failwith(error_CANNOT_CLAIM_VESTING_REWARDS_NOW);

            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Vestee Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Vesting Lambdas End
//
// ------------------------------------------------------------------------------
