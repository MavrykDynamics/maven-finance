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

    var response : return := (nil, s);
    
    case doormanLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                response := _setAdmin(newAdminAddress, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  setGovernance lambda *)
function lambdaSetGovernance(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                response := _setGovernance(newGovernanceAddress, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {
    
    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                response := _updateMetadata(updateMetadataParams, s);
            }
        |   _ -> skip
    ];

} with (response)



(* updateConfig lambda *)
function lambdaUpdateConfig(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is 
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                response := _updateConfig(updateConfigParams, s);
            }
        |   _ -> skip
    ];
  
} with (response)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                response := _updateWhitelistContracts(updateWhitelistContractsParams, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                response := _updateGeneralContracts(updateGeneralContractsParams, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  mistaken lambda *)
function lambdaMistakenTransfer(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Check that token is not MVK (it would break staked MVK in the Doorman Contract) before creating the transfer operation
    // 3. Create and execute transfer operations based on the params sent

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {
                response := _mistakenTransfer(destinationParams, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  migrateFunds lambda - for migration to an upgraded Doorman Contract if necessary *)
function lambdaMigrateFunds(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin 
    // 2. Check that no Tez is sent to the entrypoint 
    // 3. Check that all entrypoints are paused
    // 4. Get Doorman MVK balance from MVK Token Contract - equivalent to total staked MVK supply
    // 5. Create a transfer to transfer all funds to an upgraded Doorman Contract
    
    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaMigrateFunds(destinationAddress) -> {
                response := _migrateFunds(destinationAddress, s);
            }
        |   _ -> skip
    ];

} with (response)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                response := _pauseAll(_parameters, s);
            }
        |   _ -> skip
    ];  

} with (response)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                response := _pauseAll(_parameters, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {
                response := _togglePauseEntrypoint(params, s);
            }
        |   _ -> skip
    ];

} with (response)



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

    var response : return := (nil, s);
    
    case doormanLambdaAction of [
        |   LambdaStake(stakeAmount) -> {
                response := _stake(stakeAmount, s);
            }
        |   _ -> skip
    ];

} with (response)



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
    
    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaUnstake(unstakeAmount) -> {
                response := _unstake(unstakeAmount, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  compound lambda *)
function lambdaCompound(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{

    // Steps Overview: 
    // 1. Check that %compound entrypoint is not paused (e.g. glass broken)
    // 2. Compound user rewards
    // 3. Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    // 4. Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    
    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaCompound(userAddress) -> {
                response := _compound(userAddress, s);
            }
        |   _ -> skip
    ];

} with (response)



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

    var response : return := (nil, s);

    case doormanLambdaAction of [
        |   LambdaFarmClaim(farmClaim) -> {
                response := _farmClaim(farmClaim, s);
            }
        |   _ -> skip
    ];

} with (response)



(*  onVaultDepositStake lambda *)
function lambdaOnVaultDepositStake(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{

    var response : return := (nil, s);

    case doormanLambdaAction of [
        | LambdaOnVaultDepositStake(onVaultDepositStakeParams) -> {
                response := _onVaultDepositStake(onVaultDepositStakeParams, s);
            }
        | _ -> skip
    ];

} with (response)



(*  onVaultWithdrawStake lambda *)
function lambdaOnVaultWithdrawStake(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{

    var response : return := (nil, s);

    case doormanLambdaAction of [
        | LambdaOnVaultWithdrawStake(onVaultWithdrawStakeParams) -> {
                response := _onVaultWithdrawStake(onVaultWithdrawStakeParams, s);
            }
        | _ -> skip
    ];

} with (response)



(*  onVaultLiquidateStake lambda *)
function lambdaOnVaultLiquidateStake(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorageType) : return is
block{
    
    var response : return := (nil, s);

    case doormanLambdaAction of [
        | LambdaOnVaultLiquidateStake(onVaultLiquidateStakeParams) -> {
                response := _onVaultLiquidateStake(onVaultLiquidateStakeParams, s);
            }
        | _ -> skip
    ];

} with (response)

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
                const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(userAddress, s);

                // fill a list of operations
                operations := list[transferOperation; delegationOnStakeChangeOperation]
            }
        |   _ -> skip
    ];

} with (operations, s)