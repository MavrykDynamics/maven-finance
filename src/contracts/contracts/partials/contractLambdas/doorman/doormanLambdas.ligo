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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address
    
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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case doormanLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin

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

    checkSenderIsAdmin(s); // check that sender is admin

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

    checkSenderIsAdmin(s); // check that sender is admin

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

                // Check if the sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Get MVK Token address
                const mvkTokenAddress : address  = s.mvkTokenAddress;

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)) : list(operation) is
                    block{
                        
                        // Check that token is not MVK (it would break staked MVK in the Doorman Contract) before creating the transfer operation
                        const transferTokenOperation : operation = case transferParam.token of [
                            |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                            |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                            |   Fa2(token)  -> if token.tokenContractAddress = mvkTokenAddress then failwith(error_CANNOT_TRANSFER_MVK_TOKEN_USING_MISTAKEN_TRANSFER) else transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                        ];

                    } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
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
    
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaMigrateFunds(destinationAddress) -> {
                
                // Check that all entrypoints are paused
                if s.breakGlassConfig.stakeIsPaused and s.breakGlassConfig.unstakeIsPaused and s.breakGlassConfig.compoundIsPaused and s.breakGlassConfig.farmClaimIsPaused then skip
                else failwith(error_ALL_DOORMAN_CONTRACT_ENTRYPOINTS_SHOULD_BE_PAUSED_TO_MIGRATE_FUNDS);

                // Get Doorman MVK balance from MVK Token Contract - equivalent to total staked MVK supply
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.get_self_address(), 0n), s.mvkTokenAddress);
                const doormanBalance: nat = case balanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Create a transfer to transfer all funds to an upgraded Doorman Contract
                const transferParameters: fa2TransferType = list[
                    record [
                        from_= Tezos.get_self_address();
                        txs  = list [
                            record [
                                to_        = destinationAddress;
                                token_id   = 0n;
                                amount     = doormanBalance;
                            ]
                        ]
                    ]
                ];

                const transferOperation: operation = Tezos.transaction(
                    transferParameters,
                    0tez,
                    getTransferEntrypointFromTokenAddress(s.mvkTokenAddress)
                );

                operations  := transferOperation # operations;

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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case doormanLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
              
                // set all pause configs to True
                if s.breakGlassConfig.stakeIsPaused then skip
                else s.breakGlassConfig.stakeIsPaused := True;

                if s.breakGlassConfig.unstakeIsPaused then skip
                else s.breakGlassConfig.unstakeIsPaused := True;

                if s.breakGlassConfig.compoundIsPaused then skip
                else s.breakGlassConfig.compoundIsPaused := True;

                if s.breakGlassConfig.farmClaimIsPaused then skip
                else s.breakGlassConfig.farmClaimIsPaused := True;
              
            }
        |   _ -> skip
    ];  

} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case doormanLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
                else skip;

                if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
                else skip;
                
                if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
                else skip;
                
                if s.breakGlassConfig.farmClaimIsPaused then s.breakGlassConfig.farmClaimIsPaused := False
                else skip;
              
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    case doormanLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        Stake (_v)            -> s.breakGlassConfig.stakeIsPaused       := _v
                    |   Unstake (_v)          -> s.breakGlassConfig.unstakeIsPaused     := _v
                    |   Compound (_v)         -> s.breakGlassConfig.compoundIsPaused    := _v
                    |   FarmClaim (_v)        -> s.breakGlassConfig.farmClaimIsPaused   := _v
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
    // 4. Update MVK balances for user and Doorman Contract
    //      -   Get MVK Token Contract
    //      -   Transfer MVK from user to the Doorman Contract
    // 5. Update Delegation contract since user staked MVK balance has changed
    //      -   Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    //      -   Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    // 6. Update user's staked MVK balance in storage
    

    // Check that %stake entrypoint is not paused (e.g. glass broken)
    checkStakeIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaStake(stakeAmount) -> {

                // Get params - userAddress
                const userAddress : address  = Tezos.get_sender();
                    
                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                // Check that user is staking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
                if stakeAmount < s.config.minMvkAmount then failwith(error_MVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;

                // -------------------------------------------
                // Update MVK balances for user and Doorman Contract
                // -------------------------------------------

                // Get MVK Token Contract
                const mvkTokenAddress : address = s.mvkTokenAddress;

                // Transfer MVK from user to the Doorman Contract
                const transferParameters : fa2TransferType = list[
                    record [
                        from_  = userAddress;
                        txs    = list [
                            record [
                                to_      = Tezos.get_self_address();
                                token_id = 0n;
                                amount   = stakeAmount;
                            ]
                        ]
                    ]
                ];

                const transferOperation : operation = Tezos.transaction(
                    transferParameters,
                    0tez,
                    getTransferEntrypointFromTokenAddress(mvkTokenAddress)
                );

                // -------------------------------------------
                // Update Delegation contract since user staked MVK balance has changed
                // -------------------------------------------

                // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = Tezos.transaction(
                    (userAddress),
                    0tez,
                    delegationOnStakeChange(delegationAddress)
                );
                                
                operations  := list [transferOperation; delegationOnStakeChangeOperation];

                // -------------------------------------------
                // Update Storage
                // -------------------------------------------

                // Update user's staked MVK balance in storage
                var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[userAddress] of [
                        Some(_val) -> _val
                    |   None -> record[
                            balance                        = 0n;
                            totalExitFeeRewardsClaimed     = 0n;
                            totalSatelliteRewardsClaimed   = 0n;
                            totalFarmRewardsClaimed        = 0n;
                            participationFeesPerShare      = s.accumulatedFeesPerShare;
                        ]
                ];
                userBalanceInStakeBalanceLedger.balance  := userBalanceInStakeBalanceLedger.balance + stakeAmount; 
                s.userStakeBalanceLedger[userAddress]    := userBalanceInStakeBalanceLedger;
                
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
    

    // Check that %unstake entrypoint is not paused (e.g. glass broken)
    checkUnstakeIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaUnstake(unstakeAmount) -> {

                // Get params - userAddress
                const userAddress   : address   = Tezos.get_sender();
                
                // Check that user is unstaking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
                if unstakeAmount < s.config.minMvkAmount then failwith(error_MVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                // -------------------------------------------
                // Compute MLI (MVK Loyalty Index) and Exit Fee 
                // -------------------------------------------

                // Get MVK Total Supply
                const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
                const mvkTotalSupply : nat = case mvkTotalSupplyView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Get Staked MVK Total Supply
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.get_self_address(), 0n), s.mvkTokenAddress);
                const stakedMvkTotalSupply : nat = case balanceView of [
                        Some (value) -> value
                    |   None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate MVK Loyalty Index
                const mvkLoyaltyIndex : nat = (stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
                
                // Calculate Exit Fee
                const exitFee : nat = (500n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (5n * fixedPointAccuracy));

                // Calculate final unstake amount and increment unclaimed rewards
                const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
                const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
                s.unclaimedRewards := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

                // Check that unstakeAmount is not greater than staked MVK total supply
                if unstakeAmount > stakedMvkTotalSupply then failwith(error_UNSTAKE_AMOUNT_ERROR) 
                else skip;

                // Update staked MVK total supply
                const stakedTotalWithoutUnstake : nat = abs(stakedMvkTotalSupply - unstakeAmount);
                
                // Update accumulated fees per share 
                if stakedTotalWithoutUnstake > 0n then s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + (paidFee / stakedTotalWithoutUnstake)
                else skip;

                // Get user's stake balance record
                 var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[userAddress] of [
                        Some(_val) -> _val
                    |   None       -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
                ];
                
                // Check that unstake amount is not greater than user's staked MVK balance
                if unstakeAmount > userBalanceInStakeBalanceLedger.balance then failwith(error_NOT_ENOUGH_SMVK_BALANCE)
                else skip;

                // Check that final unstakeAmount is not greater than staked MVK total supply
                if stakedMvkTotalSupply < finalUnstakeAmount then failwith(error_UNSTAKE_AMOUNT_ERROR)
                else skip;

                // Update user's stake balance record
                userBalanceInStakeBalanceLedger.balance := abs(userBalanceInStakeBalanceLedger.balance - unstakeAmount); 

                // -------------------------------------------
                // Transfer MVK Operation
                // -------------------------------------------

                // Get MVK Token Contract
                const mvkTokenAddress : address = s.mvkTokenAddress;

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const transferParameters: fa2TransferType = list[
                    record[
                        from_ = Tezos.get_self_address();
                        txs   = list [
                            record[
                                to_      = userAddress;
                                token_id = 0n;
                                amount   = finalUnstakeAmount;
                            ]
                        ]
                    ]
                ];

                const transferOperation: operation = Tezos.transaction(
                    transferParameters,
                    0tez,
                    getTransferEntrypointFromTokenAddress(mvkTokenAddress)
                );

                // -------------------------------------------
                // Compound Exit Fee and Update Participation Fees Per Share
                // -------------------------------------------

                // Compound only the exit fee rewards
                // Check if the user has more than 0 MVK staked. If he/she hasn't, he cannot earn rewards
                if userBalanceInStakeBalanceLedger.balance > 0n then {
                    
                    // Calculate what fees the user missed since his/her last claim
                    const currentFeesPerShare : nat = abs(s.accumulatedFeesPerShare - userBalanceInStakeBalanceLedger.participationFeesPerShare);

                    // Calculate the user reward based on his current staked MVK
                    const exitFeeRewards : nat = (currentFeesPerShare * userBalanceInStakeBalanceLedger.balance) / fixedPointAccuracy;

                    // Increase the user balance with exit fee rewards
                    userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + exitFeeRewards;

                    // Update storage unclaimed rewards (decrement by exit fee rewards given to user)
                    s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);

                }
                else skip;
                
                // Set the user's new participationFeesPerShare to storage's accumulatedFeesPerShare
                userBalanceInStakeBalanceLedger.participationFeesPerShare := s.accumulatedFeesPerShare;

                // Update user's stake balance record in storage
                s.userStakeBalanceLedger[userAddress] := userBalanceInStakeBalanceLedger;

                // -------------------------------------------
                // Update Delegation contract since user staked MVK balance has changed
                // -------------------------------------------

                // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = Tezos.transaction(
                    (userAddress),
                    0tez,
                    delegationOnStakeChange(delegationAddress)
                );

                // Execute operations list
                operations := list[transferOperation; delegationOnStakeChangeOperation]

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  new unstake lambda - only for testing upgrading of entrypoints *)
function lambdaNewUnstake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is
block {

    // New unstake lambda for upgradability testing

    // break glass check
    checkUnstakeIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaUnstake(unstakeAmount) -> {
                
                // Get params
                const userAddress   : address   = Tezos.get_sender();
                
                // 1. verify that user is unstaking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
                if unstakeAmount < s.config.minMvkAmount then failwith(error_MVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
                const mvkTotalSupply: nat = case mvkTotalSupplyView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Get SMVK Total Supply
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.get_self_address(), 0n), s.mvkTokenAddress);
                const stakedMvkTotalSupply: nat = case balanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // sMVK total supply is a part of MVK total supply since token aren't burned anymore.
                const mvkLoyaltyIndex: nat = (stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
                
                // Fee calculation
                const exitFee: nat = (200n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (2n * fixedPointAccuracy));

                //const finalAmountPercent: nat = abs(percentageFactor - exitFee);
                const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
                const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
                s.unclaimedRewards := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

                // Updated shares by users
                if unstakeAmount > stakedMvkTotalSupply then failwith(error_UNSTAKE_AMOUNT_ERROR) 
                else skip;
                const stakedTotalWithoutUnstake: nat = abs(stakedMvkTotalSupply - unstakeAmount);
                
                if stakedTotalWithoutUnstake > 0n then s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + (paidFee / stakedTotalWithoutUnstake)
                else skip;

                // update user's staked balance in staked balance ledger
                 var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[userAddress] of [
                        Some(_val) -> _val
                    |   None       -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
                ];
                
                // check if user has enough staked mvk to withdraw
                if unstakeAmount > userBalanceInStakeBalanceLedger.balance then failwith(error_NOT_ENOUGH_SMVK_BALANCE)
                else skip;

                // update staked MVK total supply
                if stakedMvkTotalSupply < finalUnstakeAmount then failwith(error_UNSTAKE_AMOUNT_ERROR)
                else skip;

                userBalanceInStakeBalanceLedger.balance := abs(userBalanceInStakeBalanceLedger.balance - unstakeAmount); 

                const mvkTokenAddress : address = s.mvkTokenAddress;

                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // update user's MVK balance (unstake) -> increase user balance in mvk ledger
                const transferParameters : fa2TransferType = list[
                    record [
                        from_  =  Tezos.get_self_address();
                        txs    = list [
                            record[
                                to_       = userAddress;
                                token_id  = 0n;
                                amount    = finalUnstakeAmount;
                            ]
                        ]
                    ]
                ];

                const transferOperation: operation = Tezos.transaction(
                    transferParameters,
                    0tez,
                    getTransferEntrypointFromTokenAddress(mvkTokenAddress)
                );

                // Compound only the exit fee rewards
                // Check if the user has more than 0MVK staked. If he/she hasn't, he cannot earn rewards
                if userBalanceInStakeBalanceLedger.balance > 0n then {
                    
                    // Calculate what fees the user missed since his/her last claim
                    const currentFeesPerShare : nat = abs(s.accumulatedFeesPerShare - userBalanceInStakeBalanceLedger.participationFeesPerShare);
                    // Calculate the user reward based on his sMVK
                    const exitFeeRewards : nat = (currentFeesPerShare * userBalanceInStakeBalanceLedger.balance) / fixedPointAccuracy;
                    // Increase the user balance
                    userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + exitFeeRewards;
                    s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);

                }
                else skip;

                // Set the user's participationFeesPerShare 
                userBalanceInStakeBalanceLedger.participationFeesPerShare := s.accumulatedFeesPerShare;
                // Update the doormanStorageType
                s.userStakeBalanceLedger[userAddress] := userBalanceInStakeBalanceLedger;


                // update satellite balance if user is delegated to a satellite
                const delegationOnStakeChangeOperation : operation = Tezos.transaction(
                    (userAddress),
                    0tez,
                    delegationOnStakeChange(delegationAddress)
                );

                // fill a list of operations
                operations := list[transferOperation; delegationOnStakeChangeOperation]
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
    
    
    // Check that %compound entrypoint is not paused (e.g. glass broken)
    checkCompoundIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaCompound(userAddress) -> {
                
                // Compound rewards
                s := compoundUserRewards(userAddress, s);
                
                // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const onStakeChangeOperation : operation = Tezos.transaction((userAddress), 0tez, delegationOnStakeChange(delegationAddress));

                operations  := list [onStakeChangeOperation]
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


    // Check that %farmClaim entrypoint is not paused (e.g. glass broken)
    checkFarmClaimIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        |   LambdaFarmClaim(farmClaim) -> {
                
                // Init parameter values from input
                const delegator      : address   = farmClaim.0;
                var claimAmount      : nat      := farmClaim.1;
                var transferedToken  : nat      := 0n;
                const forceTransfer  : bool      = farmClaim.2;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get farm address
                const farmAddress : address = Tezos.get_sender();

                // Get MVK Token address
                const mvkTokenAddress : address = s.mvkTokenAddress;

                // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptViewDelegation : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case generalContractsOptViewDelegation of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Farm Factory Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptViewFarmFactory : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
                const farmFactoryAddress : address = case generalContractsOptViewFarmFactory of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Farm Treasury Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptViewFarmTreasury : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmTreasury", s.governanceAddress);
                const treasuryAddress : address = case generalContractsOptViewFarmTreasury of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_FARM_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check if farm address is known to the farmFactory
                const checkFarmExistsView : option (bool) = Tezos.call_view ("checkFarmExists", farmAddress, farmFactoryAddress);
                const checkFarmExists : bool = case checkFarmExistsView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_CHECK_FARM_EXISTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : bool)
                ];
                if not checkFarmExists then failwith(error_FARM_CONTRACT_NOT_FOUND) else skip;

                // ------------------------------------------------------------------
                // Compound and update user's staked balance record
                // ------------------------------------------------------------------

                // Compound user rewards
                s := compoundUserRewards(delegator, s);

                // Get user's staked balance record
                var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[delegator] of [
                        Some (_val) -> _val
                    |   None  -> record[
                            balance                        = 0n;
                            totalExitFeeRewardsClaimed     = 0n;
                            totalSatelliteRewardsClaimed   = 0n;
                            totalFarmRewardsClaimed        = 0n;
                            participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
                ];

                // Update user's stake balance record
                userBalanceInStakeBalanceLedger.balance                 := userBalanceInStakeBalanceLedger.balance + claimAmount; 
                userBalanceInStakeBalanceLedger.totalFarmRewardsClaimed := userBalanceInStakeBalanceLedger.totalFarmRewardsClaimed + claimAmount;
                s.userStakeBalanceLedger[delegator] := userBalanceInStakeBalanceLedger;

                // ------------------------------------------------------------------
                // Check if MVK Tokens should be minted or transferred from Treasury
                // ------------------------------------------------------------------

                // Check if MVK Force Transfer is enabled (no minting new MVK Tokens)
                if forceTransfer then {

                    transferedToken  := claimAmount;
                    claimAmount      := 0n;

                }
                else {

                    // Get MVK Total Supply
                    const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
                    const mvkTotalSupply : (nat) = case mvkTotalSupplyView of [
                            Some (_totalSupply) -> _totalSupply
                        |   None                -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                    ];

                    // Get MVK Maximum Total Supply
                    const mvkMaximumSupplyView : option (nat) = Tezos.call_view ("getMaximumSupply", unit, s.mvkTokenAddress);
                    const mvkMaximumSupply : (nat) = case mvkMaximumSupplyView of [
                            Some (_totalSupply) -> _totalSupply
                        |   None                -> (failwith (error_GET_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                    ];

                    // Check if the desired minted amount will surpass the maximum total supply
                    const tempTotalSupply : nat = mvkTotalSupply + claimAmount;
                    if tempTotalSupply > mvkMaximumSupply then {
                        
                        transferedToken  := abs(tempTotalSupply - mvkMaximumSupply);
                        claimAmount      := abs(claimAmount - transferedToken);

                    } else skip;

                };

                // Mint MVK Tokens if claimAmount is greater than 0
                if claimAmount > 0n then {

                    const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
                        to_  = Tezos.get_self_address();
                        amt  = claimAmount;
                    ];

                  const mintOperation : operation = Tezos.transaction(
                        mintMvkAndTransferTokenParams, 
                        0tez, 
                        sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
                  );

                  operations := mintOperation # operations;

                } else skip;

                // Transfer MVK Tokens from treasury if transferredToken is greater than 0
                if transferedToken > 0n then {
                    
                    const transferParam : transferActionType = list [
                        record [
                            to_   = Tezos.get_self_address();
                            token = (Fa2 (record[
                                tokenContractAddress  = mvkTokenAddress;
                                tokenId               = 0n;
                            ]) : tokenType);
                            amount = transferedToken;
                        ]
                    ];

                    const transferOperation : operation = Tezos.transaction(
                        transferParam,
                        0tez,
                        sendTransferOperationToTreasury(treasuryAddress)
                    );
                    operations := transferOperation # operations;

                } else skip;

                // -------------------------------------------
                // Update Delegation contract since user staked MVK balance has changed
                // -------------------------------------------
                
                // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
                const delegationOnStakeChangeOperation : operation = Tezos.transaction(
                    (delegator),
                    0tez,
                    delegationOnStakeChange(delegationAddress)
                );

                operations  := delegationOnStakeChangeOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  vaultDepositStakedMvk lambda *)
function lambdaVaultDepositStakedMvk(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block{
    
    checkCompoundIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams) -> {

                // check sender is USDM Token Controller (user's vault balances are updated there as well)
                checkSenderIsUsdmTokenControllerContract(s);

                // init parameters
                const depositAmount  : nat     = vaultDepositStakedMvkParams.depositAmount;
                const vaultId        : nat     = vaultDepositStakedMvkParams.vaultId;
                const vaultOwner     : address = Tezos.sender;

                // get vault through on-chain views to USDM Token Controller
                // Find USDM Token Controller address
                const usdmTokenControllerAddress : address = case s.generalContracts["usdmTokenController"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. USDM Token Controller contract not found.")
                ];

                // create vault handle
                const vaultHandle : vaultHandleType = record [
                  id    = vaultId;
                  owner = vaultOwner;
                ];

                // get vault record using on-chain view to USDM Token Controller
                const getVaultView : option (option(vaultType)) = Tezos.call_view ("getVaultOpt", vaultHandle, usdmTokenControllerAddress);
                const getVaultViewOpt : option(vaultType) = case getVaultView of [
                      Some (_opt)   -> _opt
                    | None          -> failwith ("Error. getVaultView not found in USDM Token Controller contract.")
                ];
                const vault : vaultType = case getVaultViewOpt of [
                      Some(_vault)  -> _vault
                    | None          -> failwith ("Error. User Vault not found.")
                ];

                // get vault address
                const vaultAddress : address = vault.address;

                // Compound rewards for user and vault before any changes in balance takes place
                s := compoundUserRewards(Tezos.sender, s);
                s := compoundUserRewards(vaultAddress, s);

                // check that user has a record in stake balance ledger and sufficient balance
                var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
                  | Some(_v) -> _v
                  | None -> failwith("Error. User has no stake balance record. ")
                ];

                // calculate new user staked balance
                const userStakedBalance : nat = userBalanceInStakeBalanceLedger.balance; 
                if depositAmount > userStakedBalance then failwith("Error. User does not have enough staked balance.") else skip;
                const newUserStakedBalance : nat = abs(userStakedBalance - depositAmount);

                // find or create vault record in stake balance ledger
                var vaultBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
                    Some(_val) -> _val
                  | None -> record[
                      balance                        = 0n;
                      totalExitFeeRewardsClaimed     = 0n;
                      totalSatelliteRewardsClaimed   = 0n;
                      totalFarmRewardsClaimed        = 0n;
                      participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
                ];

                // update vault stake balance in stake balance ledger
                vaultBalanceInStakeBalanceLedger.balance  := vaultBalanceInStakeBalanceLedger.balance + depositAmount; 
                s.userStakeBalanceLedger[vaultAddress]    := vaultBalanceInStakeBalanceLedger;

                // update user stake balance in stake balance ledger
                userBalanceInStakeBalanceLedger.balance   := newUserStakedBalance;
                s.userStakeBalanceLedger[vaultOwner]      := userBalanceInStakeBalanceLedger;

                // Find delegation address
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // update satellite balance if user/vault is delegated to a satellite
                const ownerOnStakeChangeOperation: operation = Tezos.transaction((vaultOwner), 0tez, updateSatelliteBalance(delegationAddress));
                const vaultOnStakeChangeOperation: operation = Tezos.transaction((vaultAddress), 0tez, updateSatelliteBalance(delegationAddress));

                // tell the delegation contract that the reward has been paid 
                const ownerUpdateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (vaultOwner),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                const vaultUpdateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (vaultAddress),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                operations  := list [ownerUpdateSatelliteBalanceOperation; vaultUpdateSatelliteBalanceOperation; ownerOnStakeChangeOperation; vaultOnStakeChangeOperation]
            }
        | _ -> skip
    ];

} with (operations, s)



(*  vaultWithdrawStakedMvk lambda *)
function lambdaVaultWithdrawStakedMvk(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block{
    
    checkCompoundIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams) -> {

                // check sender is USDM Token Controller (user's vault balances are updated there as well)
                checkSenderIsUsdmTokenControllerContract(s);

                // init parameters
                const withdrawAmount  : nat     = vaultWithdrawStakedMvkParams.withdrawAmount;
                const vaultId         : nat     = vaultWithdrawStakedMvkParams.vaultId;
                const vaultOwner      : address = Tezos.sender;

                // get vault through on-chain views to USDM Token Controller
                // Find USDM Token Controller address
                const usdmTokenControllerAddress : address = case s.generalContracts["usdmTokenController"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. USDM Token Controller contract not found.")
                ];

                // create vault handle
                const vaultHandle : vaultHandleType = record [
                  id    = vaultId;
                  owner = vaultOwner;
                ];

                // get vault record using on-chain view to USDM Token Controller
                const getVaultView : option (option(vaultType)) = Tezos.call_view ("getVaultOpt", vaultHandle, usdmTokenControllerAddress);
                const getVaultViewOpt : option(vaultType) = case getVaultView of [
                      Some (_opt)   -> _opt
                    | None          -> failwith ("Error. getVaultOpt not found in USDM Token Controller contract.")
                ];
                const vault : vaultType = case getVaultViewOpt of [
                      Some(_vault)  -> _vault
                    | None          -> failwith ("Error. User Vault not found.")
                ];

                // get vault address
                const vaultAddress : address = vault.address;

                // Compound rewards for user and vault before any changes in balance takes place
                s := compoundUserRewards(Tezos.sender, s);
                s := compoundUserRewards(vaultAddress, s);

                // check that user has a record in stake balance ledger and sufficient balance
                var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
                  | Some(_v) -> _v
                  | None -> failwith("Error. User has no stake balance record. ")
                ];

                // find vault record in stake balance ledger
                var vaultBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
                    Some(_val) -> _val
                  | None       -> failwith("Error. Vault has no stake balance record. ")
                ];

                // calculate new vault staked balance (check if vault has enough staked MVK to be withdrawn)
                const vaultStakedBalance : nat = vaultBalanceInStakeBalanceLedger.balance; 
                if withdrawAmount > vaultStakedBalance then failwith("Error. Vault does not have enough staked balance.") else skip;
                const newVaultStakedBalance : nat = abs(vaultStakedBalance - withdrawAmount);

                // update vault stake balance in stake balance ledger
                vaultBalanceInStakeBalanceLedger.balance  := newVaultStakedBalance; 
                s.userStakeBalanceLedger[vaultAddress]    := vaultBalanceInStakeBalanceLedger;

                // update user stake balance in stake balance ledger
                userBalanceInStakeBalanceLedger.balance   := userBalanceInStakeBalanceLedger.balance + withdrawAmount;
                s.userStakeBalanceLedger[vaultOwner]      := userBalanceInStakeBalanceLedger;

                // Find delegation address
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // update satellite balance if user/vault is delegated to a satellite
                const ownerOnStakeChangeOperation: operation = Tezos.transaction((vaultOwner), 0tez, updateSatelliteBalance(delegationAddress));
                const vaultOnStakeChangeOperation: operation = Tezos.transaction((vaultAddress), 0tez, updateSatelliteBalance(delegationAddress));

                // tell the delegation contract that the reward has been paid 
                const ownerUpdateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (vaultOwner),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                const vaultUpdateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (vaultAddress),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                operations  := list [ownerUpdateSatelliteBalanceOperation; vaultUpdateSatelliteBalanceOperation; ownerOnStakeChangeOperation; vaultOnStakeChangeOperation]
            }
        | _ -> skip
    ];

} with (operations, s)



(*  vaultLiquidateStakedMvk lambda *)
function lambdaVaultLiquidateStakedMvk(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block{
    
    checkCompoundIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaVaultLiquidateStakedMvk(vaultLiquidateStakedMvkParams) -> {

                // check sender is USDM Token Controller (user's vault balances are updated there as well)
                checkSenderIsUsdmTokenControllerContract(s);

                // init parameters
                const liquidatedAmount  : nat      = vaultLiquidateStakedMvkParams.liquidatedAmount;
                const vaultId           : nat      = vaultLiquidateStakedMvkParams.vaultId;
                const vaultOwner        : address  = vaultLiquidateStakedMvkParams.vaultOwner;
                const liquidator        : address  = vaultLiquidateStakedMvkParams.liquidator;

                // get vault through on-chain views to USDM Token Controller
                // Find USDM Token Controller address
                const usdmTokenControllerAddress : address = case s.generalContracts["usdmTokenController"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. USDM Token Controller contract not found.")
                ];

                // create vault handle
                const vaultHandle : vaultHandleType = record [
                  id    = vaultId;
                  owner = vaultOwner;
                ];

                // get vault record using on-chain view to USDM Token Controller
                const getVaultView : option (option(vaultType)) = Tezos.call_view ("getVaultOpt", vaultHandle, usdmTokenControllerAddress);
                const getVaultViewOpt : option(vaultType) = case getVaultView of [
                      Some (_opt)   -> _opt
                    | None          -> failwith ("Error. getVaultOpt not found in USDM Token Controller contract.")
                ];
                const vault : vaultType = case getVaultViewOpt of [
                      Some(_vault)  -> _vault
                    | None          -> failwith ("Error. User Vault not found.")
                ];

                // get vault address
                const vaultAddress : address = vault.address;

                // Compound rewards for user, liquidator, and vault before any changes in balance takes place
                s := compoundUserRewards(liquidator, s);
                s := compoundUserRewards(vaultAddress, s);

                // check that user has a record in stake balance ledger and sufficient balance
                // var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
                //   | Some(_v) -> _v
                //   | None -> failwith("Error. User has no stake balance record. ")
                // ];

                // find vault record in stake balance ledger
                var vaultBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
                    Some(_val) -> _val
                  | None       -> failwith("Error. Vault has no stake balance record. ")
                ];

                // find or create liquidator record in stake balance ledger 
                var liquidatorBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[liquidator] of [
                  | Some(_v) -> _v
                  | None -> record[
                      balance                        = 0n;
                      totalExitFeeRewardsClaimed     = 0n;
                      totalSatelliteRewardsClaimed   = 0n;
                      totalFarmRewardsClaimed        = 0n;
                      participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
                ];

                // calculate new vault staked balance (check if vault has enough staked MVK to be liquidated)
                const vaultStakedBalance : nat = vaultBalanceInStakeBalanceLedger.balance; 
                if liquidatedAmount > vaultStakedBalance then failwith("Error. Vault does not have enough staked balance to be liquidated.") else skip;
                const newVaultStakedBalance : nat = abs(vaultStakedBalance - liquidatedAmount);

                // update vault stake balance in stake balance ledger
                vaultBalanceInStakeBalanceLedger.balance  := newVaultStakedBalance; 
                s.userStakeBalanceLedger[vaultAddress]    := vaultBalanceInStakeBalanceLedger;

                // update liquidator stake balance in stake balance ledger
                liquidatorBalanceInStakeBalanceLedger.balance   := liquidatorBalanceInStakeBalanceLedger.balance + liquidatedAmount;
                s.userStakeBalanceLedger[liquidator]            := liquidatorBalanceInStakeBalanceLedger;

                // Find delegation address
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // update satellite balance if user/vault is delegated to a satellite
                const liquidatorOnStakeChangeOperation: operation = Tezos.transaction((liquidator), 0tez, updateSatelliteBalance(delegationAddress));
                const vaultOnStakeChangeOperation: operation = Tezos.transaction((vaultAddress), 0tez, updateSatelliteBalance(delegationAddress));

                // tell the delegation contract that the reward has been paid 
                const liquidatorUpdateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (liquidator),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                const vaultUpdateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (vaultAddress),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                operations  := list [liquidatorUpdateSatelliteBalanceOperation; vaultUpdateSatelliteBalanceOperation; liquidatorOnStakeChangeOperation; vaultOnStakeChangeOperation]
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
