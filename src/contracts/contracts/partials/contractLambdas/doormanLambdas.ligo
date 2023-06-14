// ------------------------------------------------------------------------------
//
// Doorman Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);
    
    case doormanLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case doormanLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {
    
    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    case doormanLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is 
block {

    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    case doormanLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : doormanUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : doormanUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigMinMvkAmount (_v)  -> s.config.minMvkAmount         := updateConfigNewValue
                    |   Empty (_v)               -> skip
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    // verify that sender is admin
    verifySenderIsAdmin(s.admin); 

    case doormanLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    case doormanLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistaken lambda *)
function lambdaMistakenTransfer(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Check that token is not MVK (it would break staked MVK in the Doorman Contract) before creating the transfer operation
    // 3. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Get MVK Token address
                const mvkTokenAddress : address  = s.mvkTokenAddress;

                // verify token is allowed to be transferred
                verifyTokenAllowedForOperationFold(mvkTokenAddress, destinationParams, error_CANNOT_TRANSFER_MVK_TOKEN_USING_MISTAKEN_TRANSFER);

                // Create transfer operations (transferOperationFold in transferHelpers)
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  migrateFunds lambda - for migration to an upgraded Doorman Contract if necessary *)
function lambdaMigrateFunds(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin 
    // 2. Check that no Tez is sent to the entrypoint 
    // 3. Check that all entrypoints are paused
    // 4. Get Doorman MVK balance from MVK Token Contract - equivalent to total staked MVK supply
    // 5. Create a transfer to transfer all funds to an upgraded Doorman Contract
    
    verifyNoAmountSent(Unit);          // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // check that sender is admin 

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaMigrateFunds(destinationAddress) -> {
                
                // Verify that all entrypoints are paused
                verifyAllEntrypointsPaused(s);

                // Migrate funds operation to transfer all funds to an upgraded Doorman Contract
                const migrateFundsOperation : operation = migrateFundsOperation(destinationAddress, s);
                operations := migrateFundsOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case doormanLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
              
                // set all pause configs to True
                s := pauseAllDoormanEntrypoints(s);
              
            }
        |   _ -> skip
    ];  

} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case doormanLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                s := unpauseAllDoormanEntrypoints(s);
              
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    verifyNoAmountSent(Unit);          // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // check that sender is admin 

    case doormanLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        Stake (_v)            -> s.breakGlassConfig.stakeIsPaused       := _v
                    |   Unstake (_v)          -> s.breakGlassConfig.unstakeIsPaused     := _v
                    |   Exit (_v)             -> s.breakGlassConfig.exitIsPaused        := _v
                    |   Compound (_v)         -> s.breakGlassConfig.compoundIsPaused    := _v
                    |   FarmClaim (_v)        -> s.breakGlassConfig.farmClaimIsPaused   := _v

                        // Vault Entrypoints
                    |   OnVaultDepositStake (_v)    -> s.breakGlassConfig.onVaultDepositStakeIsPaused    := _v
                    |   OnVaultWithdrawStake (_v)   -> s.breakGlassConfig.onVaultWithdrawStakeIsPaused   := _v
                    |   OnVaultLiquidateStake (_v)  -> s.breakGlassConfig.onVaultLiquidateStakeIsPaused  := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Doorman Lambdas Begin
// ------------------------------------------------------------------------------

(*  stake lambda *)
function lambdaStake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %stake entrypoint is not paused (e.g. glass broken)
    // 2. Compound user rewards
    // 3. Check that user is staking at least the min amount of MVK tokens required 
    // 4. Transfer MVK from user to the Doorman Contract
    // 5. Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    // 6. Update user's staked MVK balance in storage

    verifyEntrypointIsNotPaused(s.breakGlassConfig.stakeIsPaused, error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaStake(stakeAmount) -> {

                // Get params - userAddress
                const userAddress : address = Tezos.get_sender();
                    
                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                // Verify that user is staking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
                verifyMinMvkAmountReached(stakeAmount, s);

                // -------------------------------------------
                // Transfer MVK from user to the Doorman Contract
                // -------------------------------------------

                const transferOperation : operation = transferFa2Token(
                    userAddress,                // from_
                    Tezos.get_self_address(),   // to_
                    stakeAmount,                // amount
                    0n,                         // tokenId
                    s.mvkTokenAddress           // tokenContractAddress
                );

                // -------------------------------------------
                // Update Delegation contract since user staked MVK balance has changed
                // -------------------------------------------

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(set[userAddress], s);                                
                operations := list [transferOperation; delegationOnStakeChangeOperation];

                // -------------------------------------------
                // Update Storage
                // -------------------------------------------

                var userStakeBalanceRecord : userStakeBalanceRecordType := getOrCreateUserStakeBalanceRecord(userAddress, s);
                userStakeBalanceRecord.balance  := userStakeBalanceRecord.balance + stakeAmount; 

                s.userStakeBalanceLedger[userAddress] := userStakeBalanceRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  unstake lambda *)
function lambdaUnstake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %unstake entrypoint is not paused (e.g. glass broken)
    // 2. Check user is unstaking at least the min amount of MVK tokens required 
    // 3. Compound user rewards
    // 4. Compute MLI (MVK Loyalty Index) and Exit Fee 
    //      -   Get MVK Total Supply
    //      -   Get staked MVK Total Supply
    //      -   Calculate MVK Loyalty Index
    //      -   Calculate Exit Fee
    //      -   Calculate final unstake amount and increment unclaimed rewards
    // 5. Balance Checks
    //      -   Check that unstakeAmount is not greater than staked MVK total supply 
    //      -   Check that final unstakeAmount is not greater than staked MVK total supply
    //      -   Update user's stake balance record
    // 6. Update MVK balances for user and Doorman Contract
    //      -   Get MVK Token Contract
    //      -   Transfer MVK from user to the Doorman Contract
    // 7. Compound Exit Fee and Update Participation Fees Per Share
    // 8. Update Storage
    //      -   Set the user's new participationFeesPerShare to storage's accumulatedFeesPerShare
    //      -   Update user's staked MVK balance in storage
    // 9. Update Delegation contract since user staked MVK balance has changed
    //      -   Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    //      -   Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    
    verifyEntrypointIsNotPaused(s.breakGlassConfig.unstakeIsPaused, error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaUnstake(unstakeAmount) -> {

                // Get params - userAddress
                const userAddress : address = Tezos.get_sender();
                
                // Verify that user is unstaking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
                verifyMinMvkAmountReached(unstakeAmount, s);

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                // -------------------------------------------
                // Compute MLI (MVK Loyalty Index) and Exit Fee 
                // -------------------------------------------

                // Calculate Exit Fee
                const exitFee : nat = calculateExitFee(s);        

                // Calculate final unstake amount and increment unclaimed rewards
                const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
                const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
                s.unclaimedRewards               := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

                // Verify unstake amount is less than staked total supply
                const stakedMvkTotalSupply : nat = getStakedMvkTotalSupply(s);
                verifyUnstakeAmountLessThanStakedTotalSupply(unstakeAmount, stakedMvkTotalSupply);

                // Update accumulated fees per share 
                s := incrementAccumulatedFeesPerShare(
                    paidFee,
                    unstakeAmount,
                    stakedMvkTotalSupply,
                    s 
                );

                // Get user's stake balance record
                var userStakeBalanceRecord : userStakeBalanceRecordType := getUserStakeBalanceRecord(userAddress, s);
                
                // Verify that unstake amount is not greater than user's staked MVK balance
                verifySufficientWithdrawalBalance(unstakeAmount, userStakeBalanceRecord);

                // Update user's stake balance record
                userStakeBalanceRecord.balance := abs(userStakeBalanceRecord.balance - unstakeAmount); 

                // -------------------------------------------
                // Transfer MVK Operation
                // -------------------------------------------

                const transferOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),   // from_
                    userAddress,                // to_
                    finalUnstakeAmount,         // amount
                    0n,                         // tokenId
                    s.mvkTokenAddress           // tokenContractAddress
                );

                // -------------------------------------------
                // Compound Exit Fee and Update Participation Fees Per Share
                // -------------------------------------------

                // Compound only the exit fee rewards
                // Check if the user has more than 0 MVK staked. If he/she hasn't, he cannot earn rewards
                if userStakeBalanceRecord.balance > 0n then {

                    // Calculate user rewards
                    const exitFeeRewards : nat = calculateExitFeeRewards(userStakeBalanceRecord, s);

                    // Increase the user balance with exit fee rewards
                    userStakeBalanceRecord.balance := userStakeBalanceRecord.balance + exitFeeRewards;

                    // Update storage unclaimed rewards (decrement by exit fee rewards given to user)
                    s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);

                }
                else skip;
                
                // Set the user's new participationFeesPerShare to storage's accumulatedFeesPerShare
                userStakeBalanceRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

                // Update user's stake balance record in storage
                s.userStakeBalanceLedger[userAddress] := userStakeBalanceRecord;

                // -------------------------------------------
                // Update Delegation contract since user staked MVK balance has changed
                // -------------------------------------------

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(set[userAddress], s);

                // Execute operations list
                operations := list[transferOperation; delegationOnStakeChangeOperation]

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  exit lambda *)
function lambdaExit(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %unstake entrypoint is not paused (e.g. glass broken)
    // 2. Check user is unstaking at least the min amount of MVK tokens required 
    // 3. Compound user rewards
    // 4. Compute MLI (MVK Loyalty Index) and Exit Fee 
    //      -   Get MVK Total Supply
    //      -   Get staked MVK Total Supply
    //      -   Calculate MVK Loyalty Index
    //      -   Calculate Exit Fee
    //      -   Calculate final unstake amount and increment unclaimed rewards
    // 5. Balance Checks
    //      -   Check that unstakeAmount is not greater than staked MVK total supply 
    //      -   Check that final unstakeAmount is not greater than staked MVK total supply
    //      -   Update user's stake balance record
    // 6. Update MVK balances for user and Doorman Contract
    //      -   Get MVK Token Contract
    //      -   Transfer MVK from user to the Doorman Contract
    // 7. Compound Exit Fee and Update Participation Fees Per Share
    // 8. Update Storage
    //      -   Set the user's new participationFeesPerShare to storage's accumulatedFeesPerShare
    //      -   Update user's staked MVK balance in storage
    // 9. Update Delegation contract since user staked MVK balance has changed
    //      -   Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    //      -   Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    
    verifyEntrypointIsNotPaused(s.breakGlassConfig.exitIsPaused, error_EXIT_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaExit(_params) -> {

                // Get params - userAddress
                const userAddress : address = Tezos.get_sender();

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                // Get user's stake balance record
                var userStakeBalanceRecord : userStakeBalanceRecordType := getUserStakeBalanceRecord(userAddress, s);
                
                // -------------------------------------------
                // Calculate Exit Fee and Transfer Everything out
                // -------------------------------------------

                // Compound only the exit fee rewards
                // Check if the user has more than 0 MVK staked. If he/she hasn't, he cannot earn rewards
                if userStakeBalanceRecord.balance > 0n then {

                    // Update user's stake balance record
                    const unstakeAmount : nat = userStakeBalanceRecord.balance;
                    userStakeBalanceRecord.balance := 0n;

                    // -------------------------------------------
                    // Compute MLI (MVK Loyalty Index) and Exit Fee 
                    // -------------------------------------------

                    // Calculate Exit Fee
                    const exitFee : nat = calculateExitFee(s);        

                    // Calculate final unstake amount and increment unclaimed rewards
                    const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
                    const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
                    s.unclaimedRewards               := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

                    // Verify unstake amount is less than staked total supply
                    const stakedMvkTotalSupply : nat = getStakedMvkTotalSupply(s);
                    verifyUnstakeAmountLessThanStakedTotalSupply(unstakeAmount, stakedMvkTotalSupply);

                    // Update accumulated fees per share 
                    s := incrementAccumulatedFeesPerShare(
                        paidFee,
                        unstakeAmount,
                        stakedMvkTotalSupply,
                        s 
                    );

                    // Set the user's new participationFeesPerShare to storage's accumulatedFeesPerShare
                    userStakeBalanceRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

                    // Update user's stake balance record in storage
                    s.userStakeBalanceLedger[userAddress] := userStakeBalanceRecord;

                    // -------------------------------------------
                    // Transfer MVK Operation
                    // -------------------------------------------

                    const transferOperation : operation = transferFa2Token(
                        Tezos.get_self_address(),   // from_
                        userAddress,                // to_
                        finalUnstakeAmount,         // amount
                        0n,                         // tokenId
                        s.mvkTokenAddress           // tokenContractAddress
                    );

                    // -------------------------------------------
                    // Update Delegation contract since user staked MVK balance has changed
                    // -------------------------------------------

                    // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                    const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(set[userAddress], s);

                    // Execute operations list
                    operations := list[transferOperation; delegationOnStakeChangeOperation]
                }
                else skip;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  compound lambda *)
function lambdaCompound(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{

    // Steps Overview: 
    // 1. Check that %compound entrypoint is not paused (e.g. glass broken)
    // 2. Compound user rewards
    // 3. Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    // 4. Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    
    verifyEntrypointIsNotPaused(s.breakGlassConfig.compoundIsPaused, error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaCompound(userAddress) -> {
                
                // Compound rewards
                s := compoundUserRewards(userAddress, s);

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(set[userAddress], s);
                operations := list [delegationOnStakeChangeOperation]
            }
        |   _ -> skip
    ];

} with (operations, s)



(* farmClaim lambda *)
function lambdaFarmClaim(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
  block{

    // Steps Overview: 
    // 1. Check that %farmClaim entrypoint is not paused (e.g. glass broken)
    // 2. Get necessary contracts and info - Farm, MVK Token, Delegation, Farm Treasury
    // 3. Validation Check 
    //      -   Check if farm address is known to the farmFactory
    // 4. Compound and update user's staked balance record
    //      -   Compound user rewards
    //      -   Get and update user's staked balance record
    // 5. Check if MVK Tokens should be minted or transferred from Treasury
    //      -   Check if MVK Force Transfer is enabled (no minting new MVK Tokens)
    //      -   If Force Transfer is not enabled, calculate claimAmount and transferredToken
    //          -   Check if the desired minted amount will surpass the maximum total supply
    //      -   Mint MVK Tokens if claimAmount is greater than 0
    //      -   Transfer MVK Tokens from treasury if transferredToken is greater than 0
    // 6. Update Delegation contract since user staked MVK balance has changed
    //      -   Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)

    verifyEntrypointIsNotPaused(s.breakGlassConfig.farmClaimIsPaused, error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaFarmClaim(farmClaim) -> {
                
                // Init parameter values from input
                const delegatorsRewards : set(farmClaimDepositorType)  = farmClaim.0;
                var transferAmount      : nat                          := 0n;
                const forceTransfer     : bool                         = farmClaim.1;
                var onStakeChangeUsers  : onStakeChangeType            := set[];

                // Get farm address
                const farmAddress : address = Tezos.get_sender();

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------
            
                // Verify farm exists (i.e. farm address is known to the farmFactory)
                verifyFarmExists(farmAddress, s);

                // ------------------------------------------------------------------
                // Compound and update user's staked balance record
                // ------------------------------------------------------------------

                for delegatorReward in set delegatorsRewards block {

                    // Parse parameters
                    const delegator      : address  = delegatorReward.0;
                    var claimAmount      : nat      := delegatorReward.1;

                    // Compound user rewards
                    s := compoundUserRewards(delegator, s);

                    // Get user's staked balance record
                    var userStakeBalanceRecord : userStakeBalanceRecordType := getOrCreateUserStakeBalanceRecord(delegator, s);

                    // Update user's stake balance record
                    userStakeBalanceRecord.balance                 := userStakeBalanceRecord.balance + claimAmount; 
                    userStakeBalanceRecord.totalFarmRewardsClaimed := userStakeBalanceRecord.totalFarmRewardsClaimed + claimAmount;
                    s.userStakeBalanceLedger[delegator] := userStakeBalanceRecord;

                    // ------------------------------------------------------------------
                    // Check if MVK Tokens should be minted or transferred from Treasury
                    // ------------------------------------------------------------------

                    // Check if MVK Force Transfer is enabled (no minting new MVK Tokens)
                    if forceTransfer then {

                        transferAmount   := claimAmount;
                        claimAmount      := 0n;

                    }
                    else {

                        // get MVK Total Supply, and MVK Maximum Total Supply
                        const mvkTotalSupply    : nat = getMvkTotalSupply(s);
                        const mvkMaximumSupply  : nat = getMvkMaximumTotalSupply(s);

                        // Check if the desired minted amount will surpass the maximum total supply
                        const tempTotalSupply : nat = mvkTotalSupply + claimAmount;
                        if tempTotalSupply > mvkMaximumSupply then {
                            
                            transferAmount   := abs(tempTotalSupply - mvkMaximumSupply);
                            claimAmount      := abs(claimAmount - transferAmount);

                        } else skip;

                    };

                    // Mint MVK Tokens if claimAmount is greater than 0
                    if claimAmount > 0n then {

                    const mintMvkAndTransferOperation : operation = mintMvkAndTransferOperation(claimAmount, s);
                    operations := mintMvkAndTransferOperation # operations;

                    } else skip;

                    // Transfer MVK Tokens from treasury if transferredToken is greater than 0
                    if transferAmount > 0n then {
                        
                        const transferFromTreasuryOperation : operation = transferFromTreasuryOperation(transferAmount, s);
                        operations := transferFromTreasuryOperation # operations;

                    } else skip;

                    // Add the user for the future onStakeChange
                    onStakeChangeUsers  := Set.add(delegator, onStakeChangeUsers);

                };

                // -------------------------------------------
                // Update Delegation contract since user staked MVK balance has changed
                // -------------------------------------------
                
                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(onStakeChangeUsers, s);
                operations := delegationOnStakeChangeOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  onVaultDepositStake lambda *)
function lambdaOnVaultDepositStake(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{

    verifyEntrypointIsNotPaused(s.breakGlassConfig.onVaultDepositStakeIsPaused, error_ON_VAULT_DEPOSIT_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaOnVaultDepositStake(onVaultDepositStakeParams) -> {

                // verify sender is Lending Controller 
                verifySenderIsLendingControllerContract(s);

                // init parameters
                const vaultOwner     : address  = onVaultDepositStakeParams.vaultOwner;
                const vaultAddress   : address  = onVaultDepositStakeParams.vaultAddress;
                const depositAmount  : nat      = onVaultDepositStakeParams.depositAmount;
                
                // Get Delegation Address from the General Contracts map on the Governance Contract
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                // Compound rewards for user and vault before any changes in balance takes place
                s := compoundUserRewards(vaultOwner, s);
                s := compoundUserRewards(vaultAddress, s);

                // check that user (vault owner) has a record in stake balance ledger and sufficient balance
                var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
                        Some(_v) -> _v
                    |   None     -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
                ];

                // calculate new user staked balance
                const userStakedBalance : nat = userBalanceInStakeBalanceLedger.balance; 
                if depositAmount > userStakedBalance then failwith(error_INSUFFICIENT_STAKED_MVK_BALANCE) else skip;
                const newUserStakedBalance : nat = abs(userStakedBalance - depositAmount);

                // find or create vault record in stake balance ledger
                var vaultStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
                        Some(_val) -> _val
                    |   None -> record[
                            balance                        = 0n;
                            totalExitFeeRewardsClaimed     = 0n;
                            totalSatelliteRewardsClaimed   = 0n;
                            totalFarmRewardsClaimed        = 0n;
                            participationFeesPerShare      = s.accumulatedFeesPerShare;
                        ]
                ];

                // update vault stake balance in stake balance ledger
                vaultStakeBalanceRecord.balance           := vaultStakeBalanceRecord.balance + depositAmount; 
                s.userStakeBalanceLedger[vaultAddress]    := vaultStakeBalanceRecord;

                // update user stake balance in stake balance ledger
                userBalanceInStakeBalanceLedger.balance   := newUserStakedBalance;
                s.userStakeBalanceLedger[vaultOwner]      := userBalanceInStakeBalanceLedger;

                // update satellite balance if user/vault is delegated to a satellite
                const onStakeChangeOperation : operation    = Tezos.transaction(set[vaultAddress; vaultOwner]  , 0tez, delegationOnStakeChange(delegationAddress));

                operations  := list [onStakeChangeOperation];
            }
        | _ -> skip
    ];

} with (operations, s)



(*  onVaultWithdrawStake lambda *)
function lambdaOnVaultWithdrawStake(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{

    verifyEntrypointIsNotPaused(s.breakGlassConfig.onVaultWithdrawStakeIsPaused, error_ON_VAULT_WITHDRAW_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaOnVaultWithdrawStake(onVaultWithdrawStakeParams) -> {

                // verify sender is Lending Controller 
                verifySenderIsLendingControllerContract(s);

                // init parameters
                const vaultOwner      : address = onVaultWithdrawStakeParams.vaultOwner;
                const vaultAddress    : address = onVaultWithdrawStakeParams.vaultAddress;
                const withdrawAmount  : nat     = onVaultWithdrawStakeParams.withdrawAmount;

                // Get Delegation Address from the General Contracts map on the Governance Contract
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                // Compound rewards for user and vault before any changes in balance takes place
                s := compoundUserRewards(vaultOwner, s);
                s := compoundUserRewards(vaultAddress, s);

                // check that user (vault owner) has a record in stake balance ledger and sufficient balance
                var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
                ];

                // find vault record in stake balance ledger
                var vaultStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
                ];

                // calculate new vault staked balance (check if vault has enough staked MVK to be withdrawn)
                const vaultStakedBalance : nat = vaultStakeBalanceRecord.balance; 
                if withdrawAmount > vaultStakedBalance then failwith(error_INSUFFICIENT_STAKED_MVK_BALANCE) else skip;
                const newVaultStakedBalance : nat = abs(vaultStakedBalance - withdrawAmount);

                // update vault stake balance in stake balance ledger
                vaultStakeBalanceRecord.balance           := newVaultStakedBalance; 
                s.userStakeBalanceLedger[vaultAddress]    := vaultStakeBalanceRecord;

                // update user stake balance in stake balance ledger
                userBalanceInStakeBalanceLedger.balance   := userBalanceInStakeBalanceLedger.balance + withdrawAmount;
                s.userStakeBalanceLedger[vaultOwner]      := userBalanceInStakeBalanceLedger;

                // update satellite balance if user/vault is delegated to a satellite
                const onStakeChangeOperation : operation    = Tezos.transaction(set[vaultAddress; vaultOwner]  , 0tez, delegationOnStakeChange(delegationAddress));

                operations  := list [onStakeChangeOperation]
            }
        | _ -> skip
    ];

} with (operations, s)



(*  onVaultLiquidateStake lambda *)
function lambdaOnVaultLiquidateStake(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{
    
    verifyEntrypointIsNotPaused(s.breakGlassConfig.onVaultLiquidateStakeIsPaused, error_ON_VAULT_LIQUIDATE_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaOnVaultLiquidateStake(onVaultLiquidateStakeParams) -> {

                // verify sender is Lending Controller 
                verifySenderIsLendingControllerContract(s);

                // init parameters
                const vaultAddress      : address  = onVaultLiquidateStakeParams.vaultAddress;
                const liquidator        : address  = onVaultLiquidateStakeParams.liquidator;
                const liquidatedAmount  : nat      = onVaultLiquidateStakeParams.liquidatedAmount;

                // Get Delegation Address from the General Contracts map on the Governance Contract
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                // Compound rewards for liquidator, and vault before any changes in balance takes place
                s := compoundUserRewards(liquidator, s);
                s := compoundUserRewards(vaultAddress, s);

                // find vault record in stake balance ledger
                var vaultStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
                        Some(_val)  -> _val
                    |   None        -> failwith(error_VAULT_STAKE_RECORD_NOT_FOUND)
                ];

                // find or create liquidator record in stake balance ledger 
                var liquidatorStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[liquidator] of [
                        Some(_v) -> _v
                    |   None -> record[
                            balance                        = 0n;
                            totalExitFeeRewardsClaimed     = 0n;
                            totalSatelliteRewardsClaimed   = 0n;
                            totalFarmRewardsClaimed        = 0n;
                            participationFeesPerShare      = s.accumulatedFeesPerShare;
                        ]
                ];

                // calculate new vault staked balance (check if vault has enough staked MVK to be liquidated)
                const vaultStakedBalance : nat = vaultStakeBalanceRecord.balance; 
                if liquidatedAmount > vaultStakedBalance then failwith(error_INSUFFICIENT_STAKED_MVK_BALANCE) else skip;
                const newVaultStakedBalance : nat = abs(vaultStakedBalance - liquidatedAmount);

                // update vault stake balance in stake balance ledger
                vaultStakeBalanceRecord.balance           := newVaultStakedBalance; 
                s.userStakeBalanceLedger[vaultAddress]    := vaultStakeBalanceRecord;

                // update liquidator stake balance in stake balance ledger
                liquidatorStakeBalanceRecord.balance      := liquidatorStakeBalanceRecord.balance + liquidatedAmount;
                s.userStakeBalanceLedger[liquidator]      := liquidatorStakeBalanceRecord;

                // update satellite balance if user/vault is delegated to a satellite
                const onStakeChangeOperation : operation    = Tezos.transaction(set[vaultAddress; liquidator]  , 0tez, delegationOnStakeChange(delegationAddress));

                operations  := list [onStakeChangeOperation]
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Doorman Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Doorman Lambdas End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Doorman Test Upgrade Lambda
//
// ------------------------------------------------------------------------------

(*  new unstake lambda - only for testing upgrading of entrypoints *)
function lambdaNewUnstake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // New unstake lambda for upgradability testing
    // - different exit fee calculation

    verifyEntrypointIsNotPaused(s.breakGlassConfig.unstakeIsPaused, error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaUnstake(unstakeAmount) -> {
                
                // Get params
                const userAddress : address = Tezos.get_sender();
                
                // Verify that user is unstaking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
                verifyMinMvkAmountReached(unstakeAmount, s);

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                // get MVK and staked MVK total supply
                const mvkTotalSupply        : nat = getMvkTotalSupply(s);
                const stakedMvkTotalSupply  : nat = getStakedMvkTotalSupply(s);

                // sMVK total supply is a part of MVK total supply since token aren't burned anymore.
                const mvkLoyaltyIndex: nat = (stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
                
                // Fee calculation
                const exitFee: nat = (200n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (2n * fixedPointAccuracy));

                //const finalAmountPercent: nat = abs(percentageFactor - exitFee);
                const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
                const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
                s.unclaimedRewards := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

                // Verify unstake amount is less than staked total supply
                verifyUnstakeAmountLessThanStakedTotalSupply(unstakeAmount, stakedMvkTotalSupply);

                // Update accumulated fees per share 
                s := incrementAccumulatedFeesPerShare(
                    paidFee,
                    unstakeAmount,
                    stakedMvkTotalSupply,
                    s 
                );

                // update user's staked balance in staked balance ledger
                 var userStakeBalanceRecord : userStakeBalanceRecordType := getUserStakeBalanceRecord(userAddress, s);
                
                // Verify that unstake amount is not greater than user's staked MVK balance
                verifySufficientWithdrawalBalance(unstakeAmount, userStakeBalanceRecord);

                userStakeBalanceRecord.balance := abs(userStakeBalanceRecord.balance - unstakeAmount); 

                const transferOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),   // from_
                    userAddress,                // to_
                    finalUnstakeAmount,         // amount
                    0n,                         // tokenId
                    s.mvkTokenAddress           // tokenContractAddress
                );

                // Compound only the exit fee rewards
                // Check if the user has more than 0MVK staked. If he/she hasn't, he cannot earn rewards
                if userStakeBalanceRecord.balance > 0n then {
                    
                    // Calculate user rewards
                    const exitFeeRewards : nat = calculateExitFeeRewards(userStakeBalanceRecord, s);

                    // Increase the user balance
                    userStakeBalanceRecord.balance := userStakeBalanceRecord.balance + exitFeeRewards;

                    s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);

                }
                else skip;

                // Set the user's participationFeesPerShare 
                userStakeBalanceRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

                // Update the doormanStorageType
                s.userStakeBalanceLedger[userAddress] := userStakeBalanceRecord;

                // update satellite balance if user is delegated to a satellite
                const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(set[userAddress], s);

                // fill a list of operations
                operations := list[transferOperation; delegationOnStakeChangeOperation]
            }
        |   _ -> skip
    ];

} with (operations, s)