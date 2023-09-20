// ------------------------------------------------------------------------------
//
// Farm Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);
    
    case farmLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case farmLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* settName lambda - update the contract name *)
function lambdaSetName(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:
    // 1. Check if sender is admin
    // 2. Get Farm Factory Contract address from the General Contracts Map on the Governance Contract
    // 3. Get the Farm Factory Contract Config
    // 4. Get the nameMaxLength parameter from the Farm Factory Contract Config
    // 5. Validate input (name does not exceed max length) and update the Farm Contract name

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmLambdaAction of [
        |   LambdaSetName(updatedName) -> {

                // Get Farm Factory Contract address from the General Contracts Map on the Governance Contract
                const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

                // Get the Farm Factory Contract Config
                const configView : option (farmFactoryConfigType) = Mavryk.call_view ("getConfig", unit, farmFactoryAddress);
                const farmFactoryConfig: farmFactoryConfigType = case configView of [
                        Some (_config) -> _config
                    |   None -> failwith (error_GET_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // Get the farmNameMaxLength parameter from the Farm Factory Contract Config
                const farmNameMaxLength: nat    = farmFactoryConfig.farmNameMaxLength;

                // Validate input (name does not exceed max length) and update the Farm Contract name
                if String.length(updatedName) > farmNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else s.name  := updatedName;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is 
block {

  verifySenderIsAdmin(s.admin); // verify that sender is admin
  
  case farmLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : farmUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : farmUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    ConfigForceRewardFromTransfer (_v)  -> block {
                        
                        // Check that config's new value can only be 1n or 0n
                        if updateConfigNewValue =/= 1n and updateConfigNewValue =/= 0n then failwith(error_CONFIG_VALUE_ERROR) else skip;
                        s.config.forceRewardFromTransfer := updateConfigNewValue = 1n;

                    }
                |   ConfigRewardPerBlock (_v)           -> block {
                        
                        // Check if Farm has been initiated
                        verifyFarmIsInitialised(s);

                        // Update Farm storage
                        s := updateFarm(s);

                        // Calculate new total rewards
                        const totalClaimedRewards : nat     = s.claimedRewards.unpaid + s.claimedRewards.paid;
                        const remainingBlocks : nat         = abs((s.initBlock + s.config.plannedRewards.totalBlocks) - s.lastBlockUpdate);
                        const newTotalRewards : nat         = totalClaimedRewards + remainingBlocks * updateConfigNewValue;

                        // Update farm storage
                        s.config.plannedRewards.currentRewardPerBlock := updateConfigNewValue;
                        s.config.plannedRewards.totalRewards := newTotalRewards;
                    }
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistaken lambda *)
function lambdaMistakenTransfer(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent


    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Get LP Token address
                const lpTokenAddress : address  = s.config.lpToken.tokenAddress;

                // verify token is allowed to be transferred
                verifyTokenAllowedForOperationFold(lpTokenAddress, destinationParams, error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER);

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
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------



(* initFarm lambda *)
function lambdaInitFarm(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Check if farm is already open
    // 3. Check that blocks per minute is greater than 0
    // 4. Check whether the farm is infinite or if its total blocks has been set
    // 5. Update Farm Storage and init Farm

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case farmLambdaAction of [
        |   LambdaInitFarm(initFarmParams) -> {
                
                // Verify that farm is not open
                verifyFarmIsNotOpen(s);

                // Validate that farm reward blocks has been set (or is an infinite farm)
                validateFarmRewardBlocks(initFarmParams);
                
                // Update Farm Storage and init Farm
                s := updateFarm(s);
                s := _initFarm(initFarmParams, s);
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* closeFarm lambda *)
function lambdaCloseFarm(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Check that farm is open
    // 3. Update and close farm

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    checkFarmIsOpen(s);     // check that farm is open

    case farmLambdaAction of [
        |   LambdaCloseFarm(_parameters) -> {
                
                s := updateFarm(s);
                s.open := False ;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin, Governance Contract address or Farm Factory Contract address
    // 2. Pause all main entrypoints in the Farm Contract
    
    // verify that sender is admin, Governance Contract address or Farm Factory Contract address
    verifySenderIsGovernanceOrFactory(s);

    case farmLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                s := pauseAllFarmEntrypoints(s);

            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin, Governance Contract address or Treasury Factory Contract address
    // 2. Unpause all main entrypoints in the Farm Contract

    // verify that sender is admin, Governance Contract address or Treasury Factory Contract address
    verifySenderIsGovernanceOrFactory(s);

    case farmLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                s := unpauseAllFarmEntrypoints(s);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause specified entrypoint

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case farmLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        Deposit (_v)       -> s.breakGlassConfig.depositIsPaused    := _v
                    |   Withdraw (_v)      -> s.breakGlassConfig.withdrawIsPaused   := _v
                    |   Claim (_v)         -> s.breakGlassConfig.claimIsPaused      := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Lambdas Begin
// ------------------------------------------------------------------------------

(* deposit lambda *)
function lambdaDeposit(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:    
    // 1. Check that %deposit entrypoint is not paused (e.g. glass broken)
    // 2. Check if farm has started
    // 3. Update farm pool 
    // 4. Check if farm is closed 
    // 5. Check if sender is an existing depositor
    // 6. If sender is an existing depositor, update user's unclaimed rewards and update deposit record
    // 7. Update depositor token balance and depositor ledger
    // 8. Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)


    // Verify that %deposit entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.depositIsPaused, error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED);

    // Check if farm has started
    verifyFarmIsInitialised(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaDeposit(tokenAmount) -> {
                
                // Update pool farmStorageType
                s := updateFarm(s);

                // Check if farm is closed or not
                checkFarmIsOpen(s);

                // Init depositor address
                const depositor : depositorType = Mavryk.get_sender();

                // Check if sender is an existing depositor
                const existingDepositor : bool = checkDepositorExists(depositor, s);

                // Prepare new depositor record
                var depositorRecord : depositorRecordType := createDepositorRecord(s);

                // Get depositor deposit and perform a claim
                if existingDepositor then {
                    
                    // Update user's unclaimed rewards
                    s := updateUnclaimedRewards(depositor, s);

                    // Refresh depositor deposit with updated unclaimed rewards
                    depositorRecord := getDepositorRecord(depositor, s);
                    
                }
                else skip;

                // Update depositor token balance
                depositorRecord.balance := depositorRecord.balance + tokenAmount;

                // Update depositor ledger and farmTokenBalance
                s.config.lpToken.tokenBalance := s.config.lpToken.tokenBalance + tokenAmount;
                s.depositorLedger[depositor] := depositorRecord;

                // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
                const transferFarmLpTokenOperation : operation = transferFarmLpTokenOperation(
                    depositor,                      // from_
                    Mavryk.get_self_address(),       // to_
                    tokenAmount,                    // tokenAmount
                    s                               // storage
                );

                operations := transferFarmLpTokenOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdraw lambda *)
function lambdaWithdraw(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:    
    // 1. Check that %withdraw entrypoint is not paused (e.g. glass broken)
    // 2. Check if farm has started
    // 3. Update farm pool 
    // 4. Update user's unclaimedRewards if user already deposited tokens
    // 5. Check if the depositor has enough tokens to withdraw
    // 6. Check if the farm has enough tokens for withdrawal
    // 7. Transfer LP tokens to the user from the farm balance in the LP Contract


    // Verify that %withdraw entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.withdrawIsPaused, error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED);

    // Check if farm has started
    verifyFarmIsInitialised(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaWithdraw(withdrawAmount) -> {
                
                // Update pool farmStorageType
                s := updateFarm(s);     

                // Init depositor address
                const depositor : depositorType = Mavryk.get_sender();

                // Update user's unclaimedRewards if user already deposited tokens
                s := updateUnclaimedRewards(depositor, s);

                // Get depositor record
                var depositorRecord : depositorRecordType := getDepositorRecord(depositor, s);

                // Calculation for final withdrawn amount (max is depositor's balance)
                var finalWithdrawAmount : nat := 0n;

                if withdrawAmount > depositorRecord.balance 
                then finalWithdrawAmount := depositorRecord.balance 
                else finalWithdrawAmount := withdrawAmount;

                // Update depositor record with new balance
                depositorRecord.balance := abs(depositorRecord.balance - finalWithdrawAmount);
                s.depositorLedger[depositor] := depositorRecord;

                // Verify that the farm has enough tokens for withdrawal
                verifySufficientBalance(finalWithdrawAmount, s.config.lpToken.tokenBalance, error_WITHDRAWN_AMOUNT_TOO_HIGH);

                // Update farm token balance
                s.config.lpToken.tokenBalance := abs(s.config.lpToken.tokenBalance - finalWithdrawAmount);
                
                // Transfer LP tokens to the user from the farm balance in the LP Contract
                const transferFarmLpTokenOperation : operation = transferFarmLpTokenOperation(
                    Mavryk.get_self_address(),       // from_
                    depositor,                      // to_
                    finalWithdrawAmount,            // tokenAmount
                    s                               // storage
                );

                operations := transferFarmLpTokenOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* claim lambda *)
function lambdaClaim(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:    
    // 1. Check that %claim entrypoint is not paused (e.g. glass broken)
    // 2. Check if farm has started
    // 3. Update farm pool 
    // 4. Update user's unclaimedRewards if user already deposited tokens
    // 5. Check if sender is an existing depositor
    // 6. Get depositor's unclaimed rewards and check that user has more than 0 rewards to claim
    // 7. Reset depositor's unclaimedRewards to 0, and update claimedRewards total
    // 8. Update storage with new depositor record
    // 9. Transfer staked MVK rewards to user through the %farmClaim entrypoint on the Doorman Contract

    
    // Verify that %claim entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.claimIsPaused, error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED);

    // Check if farm has started
    verifyFarmIsInitialised(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaClaim(depositors) -> {
                
                // Update farm
                s := updateFarm(s);

                // Init farm claim parameters
                var farmClaimDepositors : set(farmClaimDepositorType)   := set[];

                // Loop through depositors and claim rewards
                for depositor in set depositors block{

                    // Update user's unclaimed rewards
                    s := updateUnclaimedRewards(depositor, s);

                    // Check if sender is an existing depositor
                    var depositorRecord : depositorRecordType := getDepositorRecord(depositor, s);

                    // Get depositor's unclaimed rewards
                    const unclaimedRewards : tokenBalanceType = depositorRecord.unclaimedRewards;

                    // Process unclaimed rewards if user has more than 0 rewards to claim
                    if unclaimedRewards > 0n then {

                        // Reset depositor's unclaimedRewards to 0, and update claimedRewards total
                        depositorRecord.claimedRewards      := depositorRecord.claimedRewards + depositorRecord.unclaimedRewards;
                        depositorRecord.unclaimedRewards    := 0n;

                        // Update storage with new depositor record
                        s.depositorLedger[depositor]        := depositorRecord;

                        // Add the claim to the set
                        farmClaimDepositors                 := Set.add((depositor, unclaimedRewards), farmClaimDepositors);
                    }

                };

                // Transfer staked MVK rewards to user through the %farmClaim entrypoint on the Doorman Contract
                if Set.cardinal(farmClaimDepositors) > 0n then {
                    const transferRewardOperation : operation   = transferReward(farmClaimDepositors, s);
                    operations                                  := transferRewardOperation # operations;
                }

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Farm Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Farm Lambdas End
//
// ------------------------------------------------------------------------------
