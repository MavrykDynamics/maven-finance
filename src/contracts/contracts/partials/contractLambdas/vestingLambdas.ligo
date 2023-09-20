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
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case vestingLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const vestingLambdaAction : vestingLambdaActionType;  var s : vestingStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case vestingLambdaAction of [
        |    LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case vestingLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case vestingLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case vestingLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case vestingLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers)
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
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
    // 1. Check if sender is admin or from the Council Contract
    // 2. Check that inputs are properly configured
    //    - vestingInMonths cannot be zero (div by 0 error)
    //    - cliffInMonths cannot be greater than vestingInMonths (duration error)
    // 3. Check if the vestee already exists
    // 4. Create and save new vestee

    case vestingLambdaAction of [
        |   LambdaAddVestee(addVesteeParams) -> {
                
                // verify that sender is admin or from council contract
                verifySenderIsCouncilOrAdmin(s);

                // init parameters
                const vesteeAddress          : address  = addVesteeParams.vesteeAddress;
                const totalAllocatedAmount   : nat      = addVesteeParams.totalAllocatedAmount;
                const cliffInMonths          : nat      = addVesteeParams.cliffInMonths;
                const vestingInMonths        : nat      = addVesteeParams.vestingInMonths;

                // Verify that vestingInMonths is not zero (div by 0 error)
                verifyIsNotZero(vestingInMonths, error_VESTING_IN_MONTHS_TOO_SHORT);

                // Verify that cliffInMonths cannot be greater than vestingInMonths (duration error)
                verifyLessThanOrEqual(cliffInMonths, vestingInMonths, error_CLIFF_PERIOD_TOO_LONG);

                var newVestee : vesteeRecordType := createVesteeRecord(
                    vesteeAddress,
                    totalAllocatedAmount,
                    vestingInMonths,
                    cliffInMonths,
                    s
                );

                s.vesteeLedger[vesteeAddress] := newVestee;

            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  removeVestee lambda *)
function lambdaRemoveVestee(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is admin or from the Council Contract
    // 3. Check if the vestee exists
    // 3. Remove vestee from vestee ledger

    case vestingLambdaAction of [
        |   LambdaRemoveVestee(vesteeAddress) -> {
                
                // verify that sender is admin or from council contract
                verifySenderIsCouncilOrAdmin(s);

                var _vestee : vesteeRecordType := getVesteeRecord(vesteeAddress, s);

                remove vesteeAddress from map s.vesteeLedger;
            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  updateVestee lambda *)
function lambdaUpdateVestee(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is
block {

    // Steps Overview:
    // 1. Check if sender is admin or from the Council Contract
    // 2. Check that new inputs are properly configured
    //    - new vestingInMonths cannot be zero (div by 0 error)
    //    - new cliffInMonths cannot be greater than new vestingInMonths (duration error)
    // 3. Check if the vestee exists
    // 4. Update vestee with new inputs and account for any changes

    case vestingLambdaAction of [
        |   LambdaUpdateVestee(updateVesteeParams) -> {
                
                // verify that sender is admin or from council contract
                verifySenderIsCouncilOrAdmin(s);
                
                // init parameters
                const vesteeAddress             : address  = updateVesteeParams.vesteeAddress;
                const newTotalAllocatedAmount   : nat      = updateVesteeParams.newTotalAllocatedAmount;
                const newCliffInMonths          : nat      = updateVesteeParams.newCliffInMonths;
                const newVestingInMonths        : nat      = updateVesteeParams.newVestingInMonths;

                // Verify that new vestingInMonths is not zero (div by 0 error)
                verifyIsNotZero(newVestingInMonths, error_VESTING_IN_MONTHS_TOO_SHORT);

                // Verify that new cliffInMonths cannot be greater than new vestingInMonths (duration error)
                verifyLessThanOrEqual(newCliffInMonths, newVestingInMonths, error_CLIFF_PERIOD_TOO_LONG);

                // Get vestee record from ledger
                var vestee : vesteeRecordType := getVesteeRecord(vesteeAddress, s);

                vestee.totalAllocatedAmount := newTotalAllocatedAmount;  // totalAllocatedAmount should be in mu (10^6)

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

                // calculate next redemption block based on new cliff months and whether vestee has made a claim 
                if newCliffInMonths <= vestee.monthsClaimed then block {
                    
                    // no changes to vestee next redemption period
                    vestee.nextRedemptionTimestamp  := vestee.startTimestamp + (vestee.monthsClaimed * thirty_days) + thirty_days;  // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)

                } else block {

                    // cliff has been adjusted upwards, requiring vestee to wait for cliff period to end again before he can start to claim
                    vestee.nextRedemptionTimestamp  := vestee.startTimestamp + (newCliffInMonths * thirty_days);            // timestamp of when vestee will be able to claim again (same as end of cliff timestamp)

                };

                s.vesteeLedger[vesteeAddress] := vestee;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  toggleVesteeLock lambda *)
function lambdaToggleVesteeLock(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is admin or from the Council Contract
    // 2. Check if the vestee exists
    // 3. Toggle vestee status - ACTIVE / LOCKED
    // 4. Update vestee record

    case vestingLambdaAction of [
        |   LambdaToggleVesteeLock(vesteeAddress) -> {
                
                // verify that sender is admin or from council contract
                verifySenderIsCouncilOrAdmin(s);

                // Get vestee record from ledger
                var vestee : vesteeRecordType := getVesteeRecord(vesteeAddress, s);

                // Toggle vestee status
                const newStatus : string = toggleVesteeStatus(vestee);

                // Update vestee record
                vestee.status := newStatus;
                s.vesteeLedger[vesteeAddress] := vestee;

            }
        |   _ -> skip
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
    // 1. Check if sender is a vestee
    // 2. Validate that vestee is able to claim
    //    - check that vestee's status is not LOCKED 
    //    - check that vestee has a total remainder greater than 0
    //    - check that current timestamp is greater than vestee's next redemption timestamp
    // 3. Calculate amount that vestee is able to claim
    // 4. Send operation to mint new MVK tokens and update user's balance in MVK ledger
    // 5. Calculate changes to vestee record 
    //    - e.g. months remaining, months claimed, total claimed, total remaining, next redemption timestamp
    // 6. Update vestee records in ledger

    var operations : list(operation) := nil;

    case vestingLambdaAction of [
        |   LambdaClaim(_parameters) -> {
                
                // Get sender's vestee record from ledger
                var _vestee : vesteeRecordType := getVesteeRecord(Mavryk.get_sender(), s);

                // check that vestee's status is not locked
                if _vestee.status = "LOCKED" then failwith(error_VESTEE_LOCKED)
                else skip;

                // Verify that vestee's total remainder is greater than zero
                verifyIsNotZero(_vestee.totalRemainder, error_NO_VESTING_REWARDS_TO_CLAIM);

                // check that current timestamp is greater than vestee's next redemption timestamp
                const timestampCheck : bool = Mavryk.get_now() > _vestee.nextRedemptionTimestamp and _vestee.totalRemainder > 0n;

                if timestampCheck then block {

                    // calculate claim amount based on last redemption - calculate how many months has passed since last redemption if any
                    var numberOfClaimMonths : nat := abs(abs(Mavryk.get_now() - _vestee.lastClaimedTimestamp) / thirty_days);

                    // first claim month
                    if _vestee.lastClaimedTimestamp = _vestee.startTimestamp then numberOfClaimMonths   := numberOfClaimMonths + 1n else skip;

                    // get total claim amount
                    var totalClaimAmount := _vestee.claimAmountPerMonth * numberOfClaimMonths;
                    if totalClaimAmount > _vestee.totalRemainder then totalClaimAmount := _vestee.totalRemainder
                    else skip;

                    // ---------------------------------------------

                    // mint MVK Tokens based on total claim amount
                    const mintMvkTokensOperation : operation = mintTokens(
                        Mavryk.get_sender(),           // to address
                        totalClaimAmount,             // amount of mvk Tokens to be minted
                        s                             // storage
                    ); 

                    operations := mintMvkTokensOperation # operations;
                    
                    // ---------------------------------------------

                    // calculate changes to vestee record
                    // - months remaining, months claimed, total claimed, total remaining, next redemption timestamp

                    var monthsRemaining  : nat   := 0n;
                    if _vestee.monthsRemaining < numberOfClaimMonths then monthsRemaining := 0n
                    else monthsRemaining := abs(_vestee.monthsRemaining - numberOfClaimMonths);

                    _vestee.monthsRemaining          := monthsRemaining;

                    var monthsClaimed : nat          := _vestee.monthsClaimed + numberOfClaimMonths;
                    _vestee.monthsClaimed            := monthsClaimed;

                    // use vestee start period to calculate next redemption period
                    _vestee.nextRedemptionTimestamp  := _vestee.startTimestamp + (monthsClaimed * thirty_days);
                    _vestee.lastClaimedTimestamp     := Mavryk.get_now();    

                    _vestee.totalClaimed             := _vestee.totalClaimed + totalClaimAmount;  

                    var totalRemainder : nat := 0n;
                    if _vestee.totalAllocatedAmount < totalClaimAmount then totalRemainder := 0n
                    else totalRemainder := abs(_vestee.totalAllocatedAmount - totalClaimAmount);
                    _vestee.totalRemainder           := totalRemainder;

                    s.vesteeLedger[Mavryk.get_sender()] := _vestee;

                    // update total vested amount in contract
                    s.totalVestedAmount := s.totalVestedAmount + totalClaimAmount;

                } else failwith(error_CANNOT_CLAIM_VESTING_REWARDS_NOW);

            }
        |   _ -> skip
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
