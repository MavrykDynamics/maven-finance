// ------------------------------------------------------------------------------
//
// Doorman Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {

    checkSenderIsAllowed(s); 
    
    case doormanLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case doormanLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
    
    checkSenderIsAdmin(s); 

    case doormanLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case doormanLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : doormanUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : doormanUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigMinMvkAmount (_v)              -> s.config.minMvkAmount         := updateConfigNewValue
                    | Empty (_v)                           -> skip
                ];
            }
        | _ -> skip
    ];
  
} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block {

    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block {

    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistaken lambda *)
function lambdaMistakenTransfer(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block {

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Get MVK Token address
                const mvkTokenAddress: address  = s.mvkTokenAddress;

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                        | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> if token.tokenContractAddress = mvkTokenAddress then failwith(error_CANNOT_TRANSFER_MVK_TOKEN_USING_MISTAKEN_TRANSFER) else transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        | _ -> skip
    ];

} with (operations, s)



(*  migrateFunds lambda *)
function lambdaMigrateFunds(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block {

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaMigrateFunds(destinationAddress) -> {
                
                // Check if all entrypoints are paused
                if s.breakGlassConfig.stakeIsPaused and s.breakGlassConfig.unstakeIsPaused and s.breakGlassConfig.compoundIsPaused and s.breakGlassConfig.farmClaimIsPaused then skip
                else failwith(error_ALL_DOORMAN_CONTRACT_ENTRYPOINTS_SHOULD_BE_PAUSED_TO_MIGRATE_FUNDS);

                // Get Doorman MVK balance
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.self_address, 0n), s.mvkTokenAddress);
                const doormanBalance: nat = case balanceView of [
                  Some (value) -> value
                | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Create a transfer to transfer all funds
                const transferParameters: transferType = list[
                  record[
                    from_=Tezos.self_address;
                    txs=list[
                      record[
                        to_=destinationAddress;
                        token_id=0n;
                        amount=doormanBalance;
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
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {

    checkSenderIsAllowed(s);

    case doormanLambdaAction of [
      | LambdaPauseAll(_parameters) -> {
              
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
      | _ -> skip
    ];  

} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {

    checkSenderIsAllowed(s);

    case doormanLambdaAction of [
      | LambdaUnpauseAll(_parameters) -> {
              
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
      | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseStake lambda *)
function lambdaTogglePauseStake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
    
    checkSenderIsAdmin(s); 

    case doormanLambdaAction of [
        | LambdaTogglePauseStake(_parameters) -> {
                
              if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
              else s.breakGlassConfig.stakeIsPaused := True;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseUnstake lambda *)
function lambdaTogglePauseUnstake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
    
    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
        | LambdaTogglePauseUnstake(_parameters) -> {
                
              if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
              else s.breakGlassConfig.unstakeIsPaused := True;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseCompound lambda *)
function lambdaTogglePauseCompound(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
    
    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
        | LambdaTogglePauseCompound(_parameters) -> {
                
              if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
              else s.breakGlassConfig.compoundIsPaused := True;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseFarmClaim lambda *)
function lambdaTogglePauseFarmClaim(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
    
    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
        | LambdaTogglePauseFarmClaim(_parameters) -> {
                
              if s.breakGlassConfig.farmClaimIsPaused then s.breakGlassConfig.farmClaimIsPaused := False
              else s.breakGlassConfig.farmClaimIsPaused := True;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Doorman Lambdas Begin
// ------------------------------------------------------------------------------

(*  stake lambda *)
function lambdaStake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {

  // Steps Overview
  // 1. verify that user is staking more than 1 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez - set min to 1
  // 2. update user staked balance in staked balance ledger, and update the total staked MVK supply
  // 3. send an operation to update Satellite's total delegated amount (there are checks for the user user in the delegation contract)
  // 4. add a new stake record for the user
  
  // old steps - no more mint + burn used
  // 2. mint + burn method in mvkToken.ligo and smvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and sMVK - burn/mint operations are reflected
  // 3. update record of user staking
  // ----------------------------------------

  // break glass check
  checkStakeIsNotPaused(s);

  var operations : list(operation) := nil;

  case doormanLambdaAction of [
        | LambdaStake(stakeAmount) -> {

              // Get params
              const userAddress: address  = Tezos.sender;
                
              // Compound user rewards
              s := compoundUserRewards(userAddress, s);

              // 1. verify that user is staking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
              if stakeAmount < s.config.minMvkAmount then failwith(error_MVK_ACCESS_AMOUNT_NOT_REACHED)
              else skip;

              const mvkTokenAddress : address = s.mvkTokenAddress;

              const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
              const delegationAddress: address = case generalContractsOptView of [
                  Some (_optionContract) -> case _optionContract of [
                          Some (_contract)    -> _contract
                      |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                      ]
              |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
              ];

              // update user's MVK balance (stake) -> decrease user balance in mvk ledger
              const transferParameters: transferType = list[
                record[
                  from_=userAddress;
                  txs=list[
                    record[
                      to_=Tezos.self_address;
                      token_id=0n;
                      amount=stakeAmount;
                    ]
                  ]
                ]
              ];
              const transferOperation: operation = Tezos.transaction(
                transferParameters,
                0tez,
                getTransferEntrypointFromTokenAddress(mvkTokenAddress)
              );

              const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                (userAddress),
                0tez,
                updateSatelliteBalance(delegationAddress)
              );

              // list of operations: burn mvk tokens first, then mint smvk tokens
              // const operations : list(operation) = list [burnMvkTokensOperation; mintSMvkTokensOperation; updateSatelliteBalanceOperation];
              operations  := list [transferOperation; updateSatelliteBalanceOperation];

              // 3. update record of user address with minted sMVK tokens

              // update user's staked balance in staked balance ledger
              var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[userAddress] of [
                    Some(_val) -> _val
                  | None -> record[
                      balance                        = 0n;
                      totalExitFeeRewardsClaimed     = 0n;
                      totalSatelliteRewardsClaimed   = 0n;
                      totalFarmRewardsClaimed        = 0n;
                      participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
              ];
              userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + stakeAmount; 
              s.userStakeBalanceLedger[userAddress] := userBalanceInStakeBalanceLedger;
                
            }
        | _ -> skip
    ];

} with (operations, s)



(*  unstake lambda *)
function lambdaUnstake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
  // Steps Overview
  // 1. verify that user is unstaking more than 0 sMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. fetch and update total MVK supply by getting balance in MVK token coontract
  // 3. complete unstake in callback operation after total MVK supply has been set
  // 4. calculate exit fee and verify that user has a record in stake balance ledger, and has enough balance to unstake
  // 5. update user's staked balance in staked balance ledger
  // 6. add a new unstake record to user's stake records ledger 
  // 7. send an operation to update Satellite's total delegated amount (there are checks for the user user in the delegation contract)
  // 8. increase staked MVK in exit fee reward pool - update exit fee staked balance in stake balance ledger 

  // old steps - no more mint + burn used
  // 2. intercontract invocation -> update total supply for MVK and sMVK
  
  // to be done in future
  // 4. calculate distribution of exit fee as rewards to sMVK holders
  // 5. transfer / save record of exit fee rewards for each sMVK holder - unless exit fee rewards are calculated in a different way 
  // ----------------------------------------

  // break glass check
  checkUnstakeIsNotPaused(s);

  var operations : list(operation) := nil;

  case doormanLambdaAction of [
        | LambdaUnstake(unstakeAmount) -> {

                // Get params
                const userAddress   : address   = Tezos.sender;
                
                // 1. verify that user is unstaking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
                if unstakeAmount < s.config.minMvkAmount then failwith(error_MVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
                const mvkTotalSupply: nat = case mvkTotalSupplyView of [
                  Some (value) -> value
                | None -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Get SMVK Total Supply
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.self_address, 0n), s.mvkTokenAddress);
                const stakedMvkTotalSupply: nat = case balanceView of [
                  Some (value) -> value
                | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // sMVK total supply is a part of MVK total supply since token aren't burned anymore.
                const mvkLoyaltyIndex: nat = (stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
                
                // Fee calculation
                const exitFee: nat = (500n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (5n * fixedPointAccuracy));

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
                    | None       -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
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
                const delegationAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // update user's MVK balance (unstake) -> increase user balance in mvk ledger
                const transferParameters: transferType = list[
                  record[
                    from_=Tezos.self_address;
                    txs=list[
                      record[
                        to_=userAddress;
                        token_id=0n;
                        amount=finalUnstakeAmount;
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
                  const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userBalanceInStakeBalanceLedger.participationFeesPerShare);
                  // Calculate the user reward based on his sMVK
                  const exitFeeRewards: nat = (currentFeesPerShare * userBalanceInStakeBalanceLedger.balance) / fixedPointAccuracy;
                  // Increase the user balance
                  userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + exitFeeRewards;
                  s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);
                }
                else skip;
                // Set the user's participationFeesPerShare 
                userBalanceInStakeBalanceLedger.participationFeesPerShare := s.accumulatedFeesPerShare;
                // Update the doormanStorage
                s.userStakeBalanceLedger[userAddress] := userBalanceInStakeBalanceLedger;


                // update satellite balance if user is delegated to a satellite
                const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (userAddress),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                // fill a list of operations
                operations := list[transferOperation; updateSatelliteBalanceOperation]
            }
        | _ -> skip
    ];

} with (operations, s)



(*  new unstake lambda *)
function lambdaNewUnstake(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {
  // New unstake lambda for upgradability testing

  // break glass check
  checkUnstakeIsNotPaused(s);

  var operations : list(operation) := nil;

  case doormanLambdaAction of [
        | LambdaUnstake(unstakeAmount) -> {
                
                // Get params
                const userAddress   : address   = Tezos.sender;
                
                // 1. verify that user is unstaking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
                if unstakeAmount < s.config.minMvkAmount then failwith(error_MVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;

                // Compound user rewards
                s := compoundUserRewards(userAddress, s);

                const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
                const mvkTotalSupply: nat = case mvkTotalSupplyView of [
                  Some (value) -> value
                | None -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Get SMVK Total Supply
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.self_address, 0n), s.mvkTokenAddress);
                const stakedMvkTotalSupply: nat = case balanceView of [
                  Some (value) -> value
                | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
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
                    | None       -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
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
                const delegationAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // update user's MVK balance (unstake) -> increase user balance in mvk ledger
                const transferParameters: transferType = list[
                  record[
                    from_=Tezos.self_address;
                    txs=list[
                      record[
                        to_=userAddress;
                        token_id=0n;
                        amount=finalUnstakeAmount;
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
                  const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userBalanceInStakeBalanceLedger.participationFeesPerShare);
                  // Calculate the user reward based on his sMVK
                  const exitFeeRewards: nat = (currentFeesPerShare * userBalanceInStakeBalanceLedger.balance) / fixedPointAccuracy;
                  // Increase the user balance
                  userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + exitFeeRewards;
                  s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);
                }
                else skip;
                // Set the user's participationFeesPerShare 
                userBalanceInStakeBalanceLedger.participationFeesPerShare := s.accumulatedFeesPerShare;
                // Update the doormanStorage
                s.userStakeBalanceLedger[userAddress] := userBalanceInStakeBalanceLedger;


                // update satellite balance if user is delegated to a satellite
                const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (userAddress),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                // fill a list of operations
                operations := list[transferOperation; updateSatelliteBalanceOperation]
            }
        | _ -> skip
    ];

} with (operations, s)



(*  compound lambda *)
function lambdaCompound(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
block{
    
    checkCompoundIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaCompound(userAddress) -> {
                
                // Compound rewards
                s := compoundUserRewards(userAddress, s);
                
                // Find delegation address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // update satellite balance if user is delegated to a satellite
                const onStakeChangeOperation: operation = Tezos.transaction((userAddress), 0tez, updateSatelliteBalance(delegationAddress));

                operations  := list [onStakeChangeOperation]
            }
        | _ -> skip
    ];

} with (operations, s)



(* farmClaim lambda *)
function lambdaFarmClaim(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
  block{
    
    checkFarmClaimIsNotPaused(s);

    var operations : list(operation) := nil;

    case doormanLambdaAction of [
        | LambdaFarmClaim(farmClaim) -> {
                
                // Get values from parameter
                const delegator      : address   = farmClaim.0;
                var claimAmount      : nat      := farmClaim.1;
                var transferedToken  : nat      := 0n;
                const forceTransfer  : bool      = farmClaim.2;

                // Get farm address
                const farmAddress: address = Tezos.sender;

                // Check if farm address is known to the farmFactory
                const generalContractsOptViewFarmFactory : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
                const farmFactoryAddress: address = case generalContractsOptViewFarmFactory of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const checkFarmExistsView : option (bool) = Tezos.call_view ("checkFarmExists", farmAddress, farmFactoryAddress);
                const checkFarmExists: bool = case checkFarmExistsView of [
                    Some (value) -> value
                  | None         -> (failwith (error_CHECK_FARM_EXISTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : bool)
                ];

                if not checkFarmExists then failwith(error_FARM_CONTRACT_NOT_FOUND) else skip;

                const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
                const mvkTotalSupply: (nat) = case mvkTotalSupplyView of [
                    Some (_totalSupply) -> _totalSupply
                  | None                -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const mvkMaximumSupplyView : option (nat) = Tezos.call_view ("getMaximumSupply", unit, s.mvkTokenAddress);
                const mvkMaximumSupply: (nat) = case mvkMaximumSupplyView of [
                    Some (_totalSupply) -> _totalSupply
                  | None                -> (failwith (error_GET_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Compound user rewards
                s := compoundUserRewards(delegator, s);

                // Update the delegation balance
                const generalContractsOptViewDelegation : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case generalContractsOptViewDelegation of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];
                const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (delegator),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                // get user's staked balance in staked balance ledger
                var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[delegator] of [
                    Some (_val) -> _val
                  | None  -> record[
                      balance                        = 0n;
                      totalExitFeeRewardsClaimed     = 0n;
                      totalSatelliteRewardsClaimed   = 0n;
                      totalFarmRewardsClaimed        = 0n;
                      participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
                ];

                userBalanceInStakeBalanceLedger.balance                 := userBalanceInStakeBalanceLedger.balance + claimAmount; 
                userBalanceInStakeBalanceLedger.totalFarmRewardsClaimed := userBalanceInStakeBalanceLedger.totalFarmRewardsClaimed + claimAmount;
                s.userStakeBalanceLedger[delegator] := userBalanceInStakeBalanceLedger;

                // Get treasury address from name
                const generalContractsOptViewFarmTreasury : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmTreasury", s.governanceAddress);
                const treasuryAddress: address = case generalContractsOptViewFarmTreasury of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_FARM_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Check if MVK should force the transfer instead of checking the possibility of minting
                if forceTransfer then {
                  transferedToken := claimAmount;
                  claimAmount := 0n;
                }
                else {
                  // Check if the desired minted amount will surpass the maximum total supply
                  const tempTotalSupply: nat = mvkTotalSupply + claimAmount;
                  if tempTotalSupply > mvkMaximumSupply then {
                    transferedToken := abs(tempTotalSupply - mvkMaximumSupply);
                    claimAmount := abs(claimAmount - transferedToken);
                  } else skip;
                };
                
                // Get MVK Token address
                const mvkTokenAddress: address = s.mvkTokenAddress;

                // Mint Tokens
                if claimAmount > 0n then {
                  const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
                    to_  = Tezos.self_address;
                    amt  = claimAmount;
                  ];

                  const mintOperation : operation = Tezos.transaction(
                    mintMvkAndTransferTokenParams, 
                    0tez, 
                    sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
                  );
                  operations := mintOperation # operations;
                } else skip;

                // Transfer from treasury
                if transferedToken > 0n then {
                  // Check if provided treasury exists
                  const transferParam: transferActionType = list[
                    record[
                      to_   = Tezos.self_address;
                      token = (Fa2 (record[
                        tokenContractAddress  = mvkTokenAddress;
                        tokenId               = 0n;
                      ]): tokenType);
                      amount=transferedToken;
                    ]
                  ];

                  const transferOperation: operation = Tezos.transaction(
                    transferParam,
                    0tez,
                    sendTransferOperationToTreasury(treasuryAddress)
                  );
                  operations := transferOperation # operations;
                } else skip;

                // Update satellite balance
                operations  := updateSatelliteBalanceOperation # operations;

            }
        | _ -> skip
    ];

} with(operations, s)



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
                const ownerOnSatelliteRewardPaidOperation : operation = Tezos.transaction(
                  (vaultOwner),
                  0tez,
                  onSatelliteRewardPaid(delegationAddress)
                );

                const vaultOnSatelliteRewardPaidOperation : operation = Tezos.transaction(
                  (vaultAddress),
                  0tez,
                  onSatelliteRewardPaid(delegationAddress)
                );

                operations  := list [ownerOnSatelliteRewardPaidOperation; vaultOnSatelliteRewardPaidOperation; ownerOnStakeChangeOperation; vaultOnStakeChangeOperation]
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
                const ownerOnSatelliteRewardPaidOperation : operation = Tezos.transaction(
                  (vaultOwner),
                  0tez,
                  onSatelliteRewardPaid(delegationAddress)
                );

                const vaultOnSatelliteRewardPaidOperation : operation = Tezos.transaction(
                  (vaultAddress),
                  0tez,
                  onSatelliteRewardPaid(delegationAddress)
                );

                operations  := list [ownerOnSatelliteRewardPaidOperation; vaultOnSatelliteRewardPaidOperation; ownerOnStakeChangeOperation; vaultOnStakeChangeOperation]
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
                const liquidatorOnSatelliteRewardPaidOperation : operation = Tezos.transaction(
                  (liquidator),
                  0tez,
                  onSatelliteRewardPaid(delegationAddress)
                );

                const vaultOnSatelliteRewardPaidOperation : operation = Tezos.transaction(
                  (vaultAddress),
                  0tez,
                  onSatelliteRewardPaid(delegationAddress)
                );

                operations  := list [liquidatorOnSatelliteRewardPaidOperation; vaultOnSatelliteRewardPaidOperation; liquidatorOnStakeChangeOperation; vaultOnStakeChangeOperation]
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