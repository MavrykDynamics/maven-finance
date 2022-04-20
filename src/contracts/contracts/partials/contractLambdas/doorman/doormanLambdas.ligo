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

    checkSenderIsAdmin(s); 
    
    case doormanLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
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



(*  updateMinMvkAmount lambda *)
function lambdaUpdateMinMvkAmount(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is 
block {

    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
        | LambdaUpdateMinMvkAmount(newMinMvkAmount) -> {
                
              if newMinMvkAmount < 1_000_000_000n then failwith("Error. The minimum amount of MVK to stake should be equal to 1.") 
              else skip;

              s.minMvkAmount := newMinMvkAmount;

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

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {

    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
      | LambdaPauseAll(_parameters) -> {
              
              // set all pause configs to True
              if s.breakGlassConfig.stakeIsPaused then skip
              else s.breakGlassConfig.stakeIsPaused := True;

              if s.breakGlassConfig.unstakeIsPaused then skip
              else s.breakGlassConfig.unstakeIsPaused := True;

              if s.breakGlassConfig.compoundIsPaused then skip
              else s.breakGlassConfig.compoundIsPaused := True;
              
          }
      | _ -> skip
    ];  

} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is
block {

    checkSenderIsAdmin(s);

    case doormanLambdaAction of [
      | LambdaUnpauseAll(_parameters) -> {
              
            // set all pause configs to False
            if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
            else skip;

            if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
            else skip;
            
            if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
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
                
              // Compound user rewards
              const userCompound: (doormanStorage) = compoundUserRewards(s);
              s := userCompound;

              // 1. verify that user is staking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
              if stakeAmount < s.minMvkAmount then failwith("You have to stake more MVK.")
              else skip;

              const mvkTokenAddress : address = s.mvkTokenAddress;

              const delegationAddress : address = case s.generalContracts["delegation"] of [
                    Some(_address) -> _address
                  | None           -> failwith("Error. Delegation Contract is not found.")
              ];
                    
              // update user's MVK balance (stake) -> decrease user balance in mvk ledger
              const transferParameters: transferType = list[
                record[
                  from_=Tezos.sender;
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
                (Tezos.sender),
                0tez,
                updateSatelliteBalance(delegationAddress)
              );

              // list of operations: burn mvk tokens first, then mint smvk tokens
              // operations := case userCompound.0 of [
              //     Some (compoundOperation) -> list [compoundOperation; updateSatelliteBalanceOperation; transferOperation]
              //   | None                     -> list [updateSatelliteBalanceOperation; transferOperation]
              // ];

              operations := list [updateSatelliteBalanceOperation; transferOperation];
              
              // 3. update record of user address with minted sMVK tokens

              // update user's staked balance in staked balance ledger
              var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[Tezos.sender] of [
                    Some(_val) -> _val
                  | None -> record[
                      balance                        = 0n;
                      totalExitFeeRewardsClaimed     = 0n;
                      totalSatelliteRewardsClaimed   = 0n;
                      participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
              ];
              userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + stakeAmount; 
              s.userStakeBalanceLedger[Tezos.sender] := userBalanceInStakeBalanceLedger;

              // update staked MVK total supply
              s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + stakeAmount;
                
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
                
                // 1. verify that user is unstaking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
                if unstakeAmount < s.minMvkAmount then failwith("You have to unstake at least 1 MVK token.")
                else skip;

                // Compound user rewards
                const firstCompound: (doormanStorage) = compoundUserRewards(s);
                s := firstCompound;

                const mvkTotalSupplyView : option (nat) = Tezos.call_view ("getTotalSupply", unit, s.mvkTokenAddress);
                const mvkTotalSupply: nat = case mvkTotalSupplyView of [
                    Some (value) -> value
                  | None         -> (failwith ("Error. GetTotalSupply View not found in the MVK Token Contract") : nat)
                ];

                // sMVK total supply is a part of MVK total supply since token aren't burned anymore.
                const mvkLoyaltyIndex: nat = (s.stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
                
                // Fee calculation
                const exitFee: nat = (500n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (5n * fixedPointAccuracy));

                //const finalAmountPercent: nat = abs(percentageFactor - exitFee);
                const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
                const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
                s.unclaimedRewards := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

                // Updated shares by users
                if unstakeAmount > s.stakedMvkTotalSupply then failwith("Error. You cannot unstake more than what is in the staked MVK Total supply") 
                else skip;
                const stakedTotalWithoutUnstake: nat = abs(s.stakedMvkTotalSupply - unstakeAmount);
                
                if stakedTotalWithoutUnstake > 0n then s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + (paidFee / stakedTotalWithoutUnstake)
                else skip;

                // temp to check correct amount of exit fee and final amount in console truffle tests
                s.logExitFee := exitFee;
                s.logFinalAmount := finalUnstakeAmount;

                // update user's staked balance in staked balance ledger
                var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[Tezos.source] of [
                      Some(_val) -> _val
                    | None       -> failwith("User staked balance not found in staked balance ledger.")
                ];
                
                // check if user has enough staked mvk to withdraw
                if unstakeAmount > userBalanceInStakeBalanceLedger.balance then failwith("Error. Not enough balance.")
                else skip;

                // update staked MVK total supply
                if s.stakedMvkTotalSupply < finalUnstakeAmount then failwith("Error. You cannot unstake more than what is in the staked MVK Total supply")
                else skip;
                s.stakedMvkTotalSupply := abs(s.stakedMvkTotalSupply - finalUnstakeAmount);

                userBalanceInStakeBalanceLedger.balance := abs(userBalanceInStakeBalanceLedger.balance - unstakeAmount); 
                s.userStakeBalanceLedger[Tezos.source] := userBalanceInStakeBalanceLedger;

                const mvkTokenAddress : address = s.mvkTokenAddress;

                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found.")
                ];

                // update user's MVK balance (unstake) -> increase user balance in mvk ledger
                const transferParameters: transferType = list[
                  record[
                    from_=Tezos.self_address;
                    txs=list[
                      record[
                        to_=Tezos.source;
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

                // update satellite balance if user is delegated to a satellite
                const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                  (Tezos.source),
                  0tez,
                  updateSatelliteBalance(delegationAddress)
                );

                // Compound with the user new rewards if he still have sMVK after unstaking
                const secondCompound: (doormanStorage) = compoundUserRewards(s);
                s := secondCompound;

                // create list of operations
                // operations := case secondCompound.0 of [
                //     Some (compoundOperation) -> list[compoundOperation; updateSatelliteBalanceOperation; transferOperation]
                //   | None                     -> list[updateSatelliteBalanceOperation; transferOperation]
                // ];

                // operations := case firstCompound.0 of [
                //     Some (compoundOperation) -> compoundOperation # operations
                //   | None                     -> operations
                // ];

                operations := list [updateSatelliteBalanceOperation; transferOperation];

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
        | LambdaCompound(_parameters) -> {
                
                // Compound rewards
                const userCompound: (doormanStorage) = compoundUserRewards(s);
                s := userCompound;

                // operations := case userCompound.0 of [
                //     Some (compoundOperation) -> list[compoundOperation]
                //   | None                     -> noOperations
                // ];

            }
        | _ -> skip
    ];

} with (operations, s)



(* farmClaim lambda *)
function lambdaFarmClaim(const doormanLambdaAction : doormanLambdaActionType; var s: doormanStorage): return is
  block{

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
                const farmFactoryAddress: address = case Map.find_opt("farmFactory", s.generalContracts) of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Farm Factory Contract is not found.")
                ];

                const checkFarmExistsView : option (bool) = Tezos.call_view ("checkFarmExists", farmAddress, farmFactoryAddress);
                const checkFarmExists: bool = case checkFarmExistsView of [
                    Some (value) -> value
                  | None         -> (failwith ("Error. CheckFarmExistsView View not found in the Farm factory Contract") : bool)
                ];

                if not checkFarmExists then failwith("Error. The Farm is not tracked by the Farm Factory or it does not exist.") else skip;

                const mvkTotalAndMaximumSupplyView : option (nat * nat) = Tezos.call_view ("getTotalAndMaximumSupply", unit, s.mvkTokenAddress);
                const mvkTotalAndMaximumSupply: (nat * nat) = case mvkTotalAndMaximumSupplyView of [
                    Some (totalSupply, maximumSupply) -> (totalSupply, maximumSupply)
                  | None                              -> (failwith ("Error. GetTotalAndMaximumSupply View not found in the MVK Token Contract") : nat * nat)
                ];

                // Set the supplies variables
                const mvkTotalSupply    : nat = mvkTotalAndMaximumSupply.0;
                const mvkMaximumSupply  : nat = mvkTotalAndMaximumSupply.1;

                // Compound user rewards
                const userCompound: (doormanStorage) = compoundUserRewards(s);
                s := userCompound;

                // Update the delegation balance
                const delegationAddress : address = case Map.find_opt("delegation", s.generalContracts) of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found.")
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
                      participationFeesPerShare      = s.accumulatedFeesPerShare;
                    ]
                ];

                userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + claimAmount; 
                s.userStakeBalanceLedger[delegator] := userBalanceInStakeBalanceLedger;

                // update staked MVK total supply
                s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + claimAmount;

                // Get treasury address from name
                const treasuryAddress: address = case Map.find_opt("farmTreasury", s.generalContracts) of [
                    Some (v) -> v
                  | None     -> failwith("Error. Farm treasury contract not found")
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

                // Prepare operation list
                var operations: list(operation) :=  case userCompound.0 of [
                  Some (o) -> list [o; updateSatelliteBalanceOperation]
                | None -> list [updateSatelliteBalanceOperation]
                ];
                
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
                      token = Fa2 (record[
                        tokenContractAddress  = mvkTokenAddress;
                        tokenId               = 0n;
                      ]);
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

            }
        | _ -> skip
    ];

} with(operations, s)



(* satelliteRewardsClaim lambda *)
function lambdaSatelliteRewardsClaim(const satelliteRewardsClaim: satelliteRewardsClaimType; var s: doormanStorage): return is
  block{
    // Get variables
    const user: address = satelliteRewardsClaim.0; 
    const rewards: nat  = satelliteRewardsClaim.1;

    // Compound user rewards
    const userCompound: (option(operation) * doormanStorage) = compoundUserRewards(s);
    s := userCompound.1;

    // Update the delegation balance
    const delegationAddress : address = case Map.find_opt("delegation", s.generalContracts) of [
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    ];
    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
      (user),
      0tez,
      updateSatelliteBalance(delegationAddress)
    );

    // Check sender is delegation contract
    if Tezos.sender = delegationAddress then skip else failwith("Error. Only the delegation contract can access this entrypoint");

    // get user's staked balance in staked balance ledger
    var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[user] of [
      Some (_val) -> _val
    | None -> record[
        balance=0n;
        participationFeesPerShare=s.accumulatedFeesPerShare;
      ]
    ];

    userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + rewards; 
    s.userStakeBalanceLedger[user] := userBalanceInStakeBalanceLedger;

    // update staked MVK total supply
    s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + rewards;

    // Get treasury address from name
    const treasuryAddress: address = case Map.find_opt("satelliteTreasury", s.generalContracts) of [
      Some (v) -> v
    | None -> failwith("Error. Satellite treasury contract not found")
    ];

    // Prepare operation list
    var operations: list(operation) :=  case userCompound.0 of [
      Some (o) -> list [o; updateSatelliteBalanceOperation]
    | None -> list [updateSatelliteBalanceOperation]
    ];
    
    // Get MVK Token address
    const mvkTokenAddress: address = s.mvkTokenAddress;

    const transferParam: transferActionType = list[
      record[
        to_=Tezos.self_address;
        token=Fa2 (record[
          tokenContractAddress=mvkTokenAddress;
          tokenId=0n;
        ]);
        amount=rewards;
      ]
    ];

    const transferOperation: operation = Tezos.transaction(
      transferParam,
      0tez,
      sendTransferOperationToTreasury(treasuryAddress)
    );
    operations := transferOperation # operations;
  } with(operations, s)

// ------------------------------------------------------------------------------
// Doorman Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Doorman Lambdas End
//
// ------------------------------------------------------------------------------
