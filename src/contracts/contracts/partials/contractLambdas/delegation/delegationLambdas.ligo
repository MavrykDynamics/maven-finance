// ------------------------------------------------------------------------------
//
// Delegation Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case delegationLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case delegationLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case delegationLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey : string = updateMetadataParams.metadataKey;
                const metadataHash : bytes = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case delegationLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : delegationUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : delegationUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                      ConfigDelegationRatio (_v)         -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.delegationRatio          := updateConfigNewValue
                    | ConfigMinimumStakedMvkBalance (_v) -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW) else s.config.minimumStakedMvkBalance  := updateConfigNewValue
                    | ConfigMaxSatellites (_v)           -> s.config.maxSatellites                     := updateConfigNewValue
                    | ConfigSatNameMaxLength (_v)        -> s.config.satelliteNameMaxLength            := updateConfigNewValue
                    | ConfigSatDescMaxLength (_v)        -> s.config.satelliteDescriptionMaxLength     := updateConfigNewValue
                    | ConfigSatImageMaxLength (_v)       -> s.config.satelliteImageMaxLength           := updateConfigNewValue
                    | ConfigSatWebsiteMaxLength (_v)     -> s.config.satelliteWebsiteMaxLength         := updateConfigNewValue
                ];
            }
        | _ -> skip
    ];
  
} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const delegationLambdaAction : delegationLambdaActionType; var s: delegationStorageType): return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin

    case delegationLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const delegationLambdaAction : delegationLambdaActionType; var s: delegationStorageType): return is
block {

    checkSenderIsAdmin(s); // check that sender is admin

    case delegationLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const delegationLambdaAction : delegationLambdaActionType; var s: delegationStorageType): return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    const transferTokenOperation : operation = case transferParam.token of [
                      | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                      | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
                      | Fa2(token)  -> transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
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
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause all main entrypoints in the Delegation Contract
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case delegationLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
            if s.breakGlassConfig.delegateToSatelliteIsPaused then skip
            else s.breakGlassConfig.delegateToSatelliteIsPaused := True;

            if s.breakGlassConfig.undelegateFromSatelliteIsPaused then skip
            else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;

            if s.breakGlassConfig.registerAsSatelliteIsPaused then skip
            else s.breakGlassConfig.registerAsSatelliteIsPaused := True;

            if s.breakGlassConfig.unregisterAsSatelliteIsPaused then skip
            else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;

            if s.breakGlassConfig.updateSatelliteRecordIsPaused then skip
            else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;

            if s.breakGlassConfig.distributeRewardIsPaused then skip
            else s.breakGlassConfig.distributeRewardIsPaused := True;

          }
        | _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause all main entrypoints in the Delegation Contract

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    // set all pause configs to False
    case delegationLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
            
            if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
            else skip;

            if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
            else skip;

            if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
            else skip;

            if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
            else skip;

            if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
            else skip;

            if s.breakGlassConfig.distributeRewardIsPaused then s.breakGlassConfig.distributeRewardIsPaused := False
            else skip;
            
          }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause entrypoint depending on boolean parameter sent 

    checkSenderIsAdmin(s); // check that sender is admin

    case delegationLambdaAction of [
        | LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                    DelegateToSatellite (_v)          -> s.breakGlassConfig.delegateToSatelliteIsPaused := _v
                  | UndelegateFromSatellite (_v)      -> s.breakGlassConfig.undelegateFromSatelliteIsPaused := _v
                  | RegisterAsSatellite (_v)          -> s.breakGlassConfig.registerAsSatelliteIsPaused := _v
                  | UnregisterAsSatellite (_v)        -> s.breakGlassConfig.unregisterAsSatelliteIsPaused := _v
                  | UpdateSatelliteRecord (_v)        -> s.breakGlassConfig.updateSatelliteRecordIsPaused := _v
                  | DistributeReward (_v)             -> s.breakGlassConfig.distributeRewardIsPaused := _v
                ]
                
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Delegation Lambdas Begin
// ------------------------------------------------------------------------------

(* delegateToSatellite lambda *)
function lambdaDelegateToSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {

    // Steps Overview: 
    // 1. Check that %delegateToSatellite entrypoint is not paused (e.g. glass broken)
    // 2. Check if the sender is the user specified in parameters, or the Delegation Contract
    // 3. Check that the user is not a satellite
    // 4. Update user's unclaimed satellite rewards (in the event user is already delegated to another satellite)
    // 5. Verify that satellite exists 
    // 6. Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    // 7. Check if user is delegated to a satellite or not
    //    - User is already delegated to one satellite
    //        - Check that new satellite is not the same as previously delegated satellite
    //        - Create operation to delegate to new satellite
    //        - Create operation to undelegate from previous satellite
    //    - User is not delegated to a satellite
    //        - Get user's staked MVK balance from the Doorman Contract
    //        - Create and save new delegate record for user
    //        - Update or create new rewards record for user (delegate)
    //        - Update satellite's total delegated amount (increment by user's staked MVK balance)
    //        - Update satellite record in storage

    checkDelegateToSatelliteIsNotPaused(s); // check that %delegateToSatellite entrypoint is not paused (e.g. glass broken)

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaDelegateToSatellite(delegateToSatelliteParams) -> {

            // Init parameters
            const userAddress       : address = delegateToSatelliteParams.userAddress;
            const satelliteAddress  : address = delegateToSatelliteParams.satelliteAddress;

            // Check if the sender is the user specified in parameters, or the Delegation Contract
            if Tezos.sender = userAddress or Tezos.sender = Tezos.self_address then skip
            else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

            // Check that user is not a satellite
            checkUserIsNotSatellite(userAddress, s);

            // Update user's unclaimed satellite rewards (in the event user is already delegated to another satellite)
            s := updateRewards(userAddress, s);
            
            // Verify that satellite exists
            var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of [
                Some(_val) -> _val
              | None       -> failwith(error_SATELLITE_NOT_FOUND)
            ];

            // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
            const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
            const doormanAddress: address = case generalContractsOptView of [
                Some (_optionContract) -> case _optionContract of [
                      Some (_contract)    -> _contract
                    | None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                  ]
              | None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            // --------------------------------------------------------------
            //
            // Enable redelegation to another satellite if a user is already delegated to a satellite  
            //
            // ---------------------------------------------------------------

            // Check if user is delegated to a satellite or not
            if Big_map.mem(userAddress, s.delegateLedger) then block {

                // ------------------------------------------------
                // User is already delegated to one satellite
                // ------------------------------------------------
              
                // Get user's delegate record
                var delegateRecord : delegateRecordType := case s.delegateLedger[userAddress] of [
                    Some(_delegateRecord) -> _delegateRecord
                  | None                  -> failwith(error_DELEGATE_NOT_FOUND) // failwith should not be reached as conditional check has already cleared
                ];

                // Temp variable for current satellite to be replaced
                const previousSatellite : address = delegateRecord.satelliteAddress; 

                // Check that new satellite is not the same as previously delegated satellite
                if previousSatellite = satelliteAddress then failwith(error_ALREADY_DELEGATED_SATELLITE)
                else skip;

                // Create operation to delegate to new satellite
                const delegateToSatelliteOperation : operation = Tezos.transaction(
                    (delegateToSatelliteParams),
                    0tez, 
                    getDelegateToSatelliteEntrypoint(Tezos.self_address)
                );

                operations  := delegateToSatelliteOperation # operations;

                // Create operation to undelegate from previous satellite
                const undelegateFromSatelliteOperation : operation = Tezos.transaction(
                    (userAddress),
                    0tez, 
                    getUndelegateFromSatelliteEntrypoint(Tezos.self_address)
                );

                operations  := undelegateFromSatelliteOperation # operations;

            } else block {

                // ------------------------------------------------
                // User is not delegated to any satellite
                // ------------------------------------------------

                // Get user's staked MVK balance from the Doorman Contract
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance : nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                  | None         -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
                ];

                // Get satellite record
                var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);
                
                // Create and save new delegate record for user
                var delegateRecord : delegateRecordType := record [
                    satelliteAddress              = satelliteAddress;
                    delegatedDateTime             = Tezos.now;
                    delegatedStakedMvkBalance     = stakedMvkBalance;
                ];

                s.delegateLedger[userAddress] := delegateRecord;

                // Get satellite's rewards record
                var satelliteRewardsRecord : satelliteRewardsType  := case Big_map.find_opt(satelliteAddress, s.satelliteRewardsLedger) of [
                    Some (_record) -> _record
                  | None -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
                ];

                // Update or create new rewards record for user (delegate)
                var delegateRewardsRecord: satelliteRewardsType := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                    Some(_record) -> _record
                  | None -> record[
                        unpaid                                  = 0n;
                        paid                                    = 0n;
                        participationRewardsPerShare            = satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                        satelliteAccumulatedRewardsPerShare     = satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                        satelliteReferenceAddress               = satelliteAddress;
                    ]
                ];
                delegateRewardsRecord.participationRewardsPerShare              := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                delegateRewardsRecord.satelliteReferenceAddress                 := satelliteAddress;
                s.satelliteRewardsLedger[userAddress]                          := delegateRewardsRecord;

                // Update satellite's total delegated amount (increment by user's staked MVK balance)
                satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + stakedMvkBalance; 
                
                // Update satellite record in storage
                s.satelliteLedger[satelliteAddress] := satelliteRecord;

            }
        }
        | _ -> skip
    ];

} with (operations, s)



(* undelegateFromSatellite lambda *)
function lambdaUndelegateFromSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %undelegateFromSatellite entrypoint is not paused (e.g. glass broken)
    // 2. Check if sender is self (Delegation Contract) or userAddress (Needed now because a user can compound for another user, so onStakeChange needs to reference a userAddress)
    // 3. Update unclaimed rewards for user
    // 4. Get user's delegate record
    // 5. Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    // 6. Get user's staked MVK balance from the Doorman Contract
    // 7. Get satellite record
    // 8. Check if satellite exists and status is not "INACTIVE"
    //    - Check that user's staked MVK balance does not exceed satellite's total delegated amount
    //    - Update satellite total delegated amount (decrement by user's staked MVK balance)
    //    - Update satellite record in storage
    // 9. Remove user's address from delegateLedger

    checkUndelegateFromSatelliteIsNotPaused(s); // check that %undelegateFromSatellite entrypoint is not paused (e.g. glass broken)

    case delegationLambdaAction of [
        | LambdaUndelegateFromSatellite(userAddress) -> {

                // Check if sender is self (Delegation Contract) or userAddress -> Needed now because a user can compound for another user, so onStakeChange needs to reference a userAddress
                if Tezos.sender = userAddress or Tezos.sender = Tezos.self_address then skip 
                else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

                // Update unclaimed rewards for user
                s := updateRewards(userAddress, s);

                // Get user's delegate record
                var _delegateRecord : delegateRecordType := case s.delegateLedger[userAddress] of [
                    Some(_val) -> _val
                  | None -> failwith(error_DELEGATE_NOT_FOUND)
                ];

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                          Some (_contract)    -> _contract
                        | None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                      ]
                  | None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get user's staked MVK balance from the Doorman Contract
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                  | None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];
                
                // Init empty satellite record - for type checking
                var emptySatelliteRecord : satelliteRecordType := record [
                    status                = "INACTIVE";        
                    stakedMvkBalance      = 0n;
                    satelliteFee          = 0n;
                    totalDelegatedAmount  = 0n;
                    
                    name                  = "Empty Satellite";
                    description           = "Empty Satellite";
                    image                 = "";
                    website               = "";

                    registeredDateTime    = Tezos.now;
                ];

                // Get satellite record
                var _satelliteRecord : satelliteRecordType := case s.satelliteLedger[_delegateRecord.satelliteAddress] of [
                      None          -> emptySatelliteRecord
                    | Some(_record) -> _record
                ];

                // Check if satellite exists and is not inactive (if satellite does not exist, it will return "INACTIVE" from the empty satellite record above)
                // - if satellite is suspended or banned, users should be able to undelegate from satellite 
                if _satelliteRecord.status =/= "INACTIVE" then block {
                
                    // Check that user's staked MVK balance does not exceed satellite's total delegated amount
                    if stakedMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith(error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT)
                    else skip;
                    
                    // Update satellite total delegated amount (decrement by user's staked MVK balance)
                    _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - stakedMvkBalance); 
                    
                    // Update satellite record in storage
                    s.satelliteLedger[_delegateRecord.satelliteAddress] := _satelliteRecord;

                } else skip;

                // Remove user's address from delegateLedger
                remove (userAddress : address) from map s.delegateLedger;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Delegation Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Lambdas Begin
// ------------------------------------------------------------------------------

(* registerAsSatellite lambda *)
function lambdaRegisterAsSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {
    
    // Steps Overview: 
    // 1. Check that %registerAsSatellite entrypoint is not paused (e.g. glass broken)
    // 2. Check if sender is not delegated to any satellite
    // 3. Update user's unclaimed rewards
    // 4. Check if max number of satellites limit has been reached
    // 5. Check if user's staked MVK balance has reached the minimum staked MVK amount required to be a satellite
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    //    - Get user's staked MVK balance from the Doorman Contract
    // 6. Create new satellite record
    //    - Validate inputs (max length not exceeded)
    //    - Validate satellite fee input not exceeding 100%
    // 7. Save new satellite record
    // 8. Update or create a satellite rewards record

    checkRegisterAsSatelliteIsNotPaused(s); // check that %registerAsSatellite entrypoint is not paused (e.g. glass broken)

    case delegationLambdaAction of [
        | LambdaRegisterAsSatellite(registerAsSatelliteParams) -> {

                // Init user address
                const userAddress : address  = Tezos.sender;

                // check that user is not a delegate
                checkUserIsNotDelegate(userAddress, s);

                // Update user's unclaimed rewards
                s := updateRewards(userAddress, s);

                // Check if max number of satellites limit has been reached
                if Map.size(s.satelliteLedger) >= s.config.maxSatellites then failwith(error_MAXIMUM_AMOUNT_OF_SATELLITES_REACHED) else skip;

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                          Some (_contract)    -> _contract
                        | None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                      ]
                  | None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get user's staked MVK balance from the Doorman Contract
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance : nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                  | None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Check if user's staked MVK balance has reached the minimum staked MVK amount required to be a satellite
                if stakedMvkBalance < s.config.minimumStakedMvkBalance then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;
                
                // Init new satellite record params
                const name          : string  = registerAsSatelliteParams.name;
                const description   : string  = registerAsSatelliteParams.description;
                const image         : string  = registerAsSatelliteParams.image;
                const website       : string  = registerAsSatelliteParams.website;
                const satelliteFee  : nat     = registerAsSatelliteParams.satelliteFee;

                // Validate inputs (max length not exceeded)
                if String.length(name)        > s.config.satelliteNameMaxLength         then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(description) > s.config.satelliteDescriptionMaxLength  then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(image)       > s.config.satelliteImageMaxLength        then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(website)     > s.config.satelliteWebsiteMaxLength      then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
                // Validate satellite fee input not exceeding 100%
                if satelliteFee > 10000n then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Create new satellite record
                const satelliteRecord: satelliteRecordType = case Map.find_opt(userAddress, s.satelliteLedger) of [
                      Some (_satellite) -> (failwith(error_SATELLITE_ALREADY_EXISTS): satelliteRecordType)
                    | None -> record [            
                          status                = "ACTIVE";
                          stakedMvkBalance      = stakedMvkBalance;
                          satelliteFee          = satelliteFee;
                          totalDelegatedAmount  = 0n;

                          name                  = name;
                          description           = description;
                          image                 = image;
                          website               = website;
                          
                          registeredDateTime    = Tezos.now;
                      ]
                    ];

                // Save new satellite record
                s.satelliteLedger[userAddress] := satelliteRecord;

                // Update or create a satellite rewards record
                var satelliteRewardsRecord: satelliteRewardsType  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                    Some (_rewards) -> _rewards
                  | None -> record[
                      unpaid                                      = 0n;
                      paid                                        = 0n;
                      participationRewardsPerShare                = 0n;
                      satelliteAccumulatedRewardsPerShare         = 0n;
                      satelliteReferenceAddress                   = userAddress
                  ]
                ];
                satelliteRewardsRecord.participationRewardsPerShare        := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                s.satelliteRewardsLedger[userAddress]                      := satelliteRewardsRecord;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* unregisterAsSatellite lambda *)
function lambdaUnregisterAsSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {
    
    // Steps Overview: 
    // 1. Check that %unregisterAsSatellite entrypoint is not paused (e.g. glass broken)
    // 2. Check if sender is self (Delegation Contract) or userAddress
    // 3. Check that sender is a satellite
    // 4. Check that satellite is not suspended or banned
    // 5. Update user's unclaimed rewards
    // 6. Remove user from satellite ledger
    
    checkUnregisterAsSatelliteIsNotPaused(s); // check that %unregisterAsSatellite entrypoint is not paused (e.g. glass broken)

    case delegationLambdaAction of [
        | LambdaUnregisterAsSatellite(userAddress) -> {

                // Check if sender is self (Delegation Contract) or userAddress
                if Tezos.sender = userAddress or Tezos.sender = Tezos.self_address then skip 
                else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

                // Check that sender is a satellite
                checkUserIsSatellite(userAddress, s);

                // Check that satellite is not suspended or banned
                checkSatelliteIsNotSuspendedOrBanned(userAddress, s);

                // Update user's unclaimed rewards
                s := updateRewards(userAddress, s);
                
                // remove sender from satellite ledger
                remove (userAddress : address) from map s.satelliteLedger;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateSatelliteRecord lambda *)
function lambdaUpdateSatelliteRecord(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %updateSatelliteRecord entrypoint is not paused (e.g. glass broken)
    // 2. Check that satellite is not banned
    // 3. Update user's unclaimed rewards
    // 4. Get satellite record
    // 5. Update satellite record in storage
    //    - Validate inputs (max length not exceeded)
    //    - Validate satellite fee input not exceeding 100%

    checkUpdateSatelliteRecordIsNotPaused(s); // check that %updateSatelliteRecord entrypoint is not paused (e.g. glass broken)

    case delegationLambdaAction of [
        | LambdaUpdateSatelliteRecord(updateSatelliteRecordParams) -> {

                // Init user address
                const userAddress : address  = Tezos.sender;

                // check satellite is not banned
                checkSatelliteIsNotBanned(userAddress, s);

                // Update user's unclaimed rewards
                s := updateRewards(userAddress, s);
                
                // Get satellite record
                var satelliteRecord : satelliteRecordType := case s.satelliteLedger[userAddress] of [
                    Some(_val) -> _val
                  | None       -> failwith(error_SATELLITE_NOT_FOUND)
                ];

                // Init updated satellite record params
                const name          : string  = updateSatelliteRecordParams.name;
                const description   : string  = updateSatelliteRecordParams.description;
                const image         : string  = updateSatelliteRecordParams.image;
                const website       : string  = updateSatelliteRecordParams.website;
                const satelliteFee  : nat     = updateSatelliteRecordParams.satelliteFee;

                // Validate inputs (max length not exceeded)
                if String.length(name)        > s.config.satelliteNameMaxLength         then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(description) > s.config.satelliteDescriptionMaxLength  then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(image)       > s.config.satelliteImageMaxLength        then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(website)     > s.config.satelliteWebsiteMaxLength      then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
                // Validate satellite fee input not exceeding 100%
                if satelliteFee > 10000n then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Update satellite record 
                satelliteRecord.name           := name;         
                satelliteRecord.description    := description;  
                satelliteRecord.image          := image;
                satelliteRecord.website        := website;
                satelliteRecord.satelliteFee   := satelliteFee;        
                
                // Update satellite record in storage
                s.satelliteLedger[userAddress] := satelliteRecord;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* distributeReward lambda *)
function lambdaDistributeReward(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %distributeReward entrypoint is not paused (e.g. glass broken)
    // 2. Check sender is from a whitelisted contract
    // 3. Init variables from parameters (eligible satellites set, and total reward)
    // 4. Send the rewards from the Satellite Treasury Contract to the Doorman Contract
    //    - Get Satellite Treasury Address from the General Contracts Map on the Governance Contract
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    // 5. Calculate reward per satellite (equal split among satellites)
    // 6. Update rewards for each satellite in the eligible satellites set
    //    - Get satellite record
    //    - Get satellite rewards record
    //    - Calculate satellite fee portion of reward
    //    - Check that satellite fee does not exceed reward
    //    - Calculate total distribution amount for satellite's delegates (total reward amount - satellite fee amount)
    //    - Calculate satellite's total staked MVK (total delegated amount from delegates + satellite's staked MVK amount)
    //    - Calculate increment to satellite accumulated rewards per share
    //    - Update satellite's rewards record (satelliteAccumulatedRewardsPerShare, unpaid amount)

    checkDistributeRewardIsNotPaused(s); // check that %distributeReward entrypoint is not paused (e.g. glass broken)

    // Operation list
    var operations: list(operation) := nil;

    // Check sender is from a whitelisted contract (e.g. Governance, Governance Satellite, Aggregator Factory, Doorman, Treasury)
    if checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED);

    case delegationLambdaAction of [
        | LambdaDistributeReward(distributeRewardParams) -> {
                
            // Init variables from parameters (eligible satellites set, and total reward)
            const eligibleSatellites : set(address) = distributeRewardParams.eligibleSatellites;
            const totalReward : nat = distributeRewardParams.totalStakedMvkReward;

            // Get Satellite Treasury Address from the General Contracts Map on the Governance Contract
            const generalContractsOptViewSatelliteTreasury : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "satelliteTreasury", s.governanceAddress);
            const treasuryAddress : address = case generalContractsOptViewSatelliteTreasury of [
                Some (_optionContract) -> case _optionContract of [
                      Some (_contract)    -> _contract
                    | None                -> failwith (error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND)
                  ]
              | None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
            const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
            const doormanAddress : address = case generalContractsOptViewDoorman of [
                Some (_optionContract) -> case _optionContract of [
                      Some (_contract)    -> _contract
                    | None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                  ]
              | None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            // Send the rewards from the Satellite Treasury Contract to the Doorman Contract
            const transferParam : transferActionType = list[
                record[
                  to_   = doormanAddress;
                  amount = totalReward;
                  token = (Fa2 (record [
                        tokenContractAddress = s.mvkTokenAddress;
                        tokenId              = 0n;
                    ]) : tokenType
                  );                
                ]
            ];

            const transferOperation: operation = Tezos.transaction(
                transferParam,
                0tez,
                sendTransferOperationToTreasury(treasuryAddress)
            );

            operations := transferOperation # operations;

            // Calculate reward per satellite (equal split among satellites)
            const eligibleSatellitesCount : nat = Set.cardinal(eligibleSatellites);
            const rewardPerSatellite : nat = totalReward * fixedPointAccuracy / eligibleSatellitesCount ;

            // Update rewards for each satellite in the eligible satellites set
            for satelliteAddress in set eligibleSatellites 
                block {
                    
                    // Get satellite record
                    var satelliteRecord : satelliteRecordType  := case Map.find_opt(satelliteAddress, s.satelliteLedger) of [
                        Some (_record) -> _record
                      | None           -> failwith(error_SATELLITE_NOT_FOUND)
                    ];

                    // Get satellite rewards record
                    var satelliteRewardsRecord : satelliteRewardsType  := case Big_map.find_opt(satelliteAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                      | None           -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
                    ];

                    // Calculate satellite fee portion of reward
                    const satelliteFee : nat         = satelliteRecord.satelliteFee * rewardPerSatellite / 10000n;
                    const satelliteFeeReward : nat   = satelliteFee / fixedPointAccuracy;

                    // Check that satellite fee does not exceed reward
                    if satelliteFee > rewardPerSatellite then failwith(error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD) else skip;

                    // Calculate total distribution amount for satellite's delegates (total reward amount - satellite fee amount)
                    const totalDistributionAmountForDelegates : nat  = abs(rewardPerSatellite - satelliteFee);

                    // Calculate satellite's total staked MVK (total delegated amount from delegates + satellite's staked MVK amount)
                    const satelliteTotalStakedMvk : nat              = satelliteRecord.totalDelegatedAmount + satelliteRecord.stakedMvkBalance;

                    // Calculate increment to satellite accumulated rewards per share
                    const incrementRewardsPerShare : nat             = totalDistributionAmountForDelegates / satelliteTotalStakedMvk;

                    // Update satellite's rewards record (satelliteAccumulatedRewardsPerShare, unpaid amount)
                    satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare      := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare + incrementRewardsPerShare;
                    satelliteRewardsRecord.unpaid                                   := satelliteRewardsRecord.unpaid + satelliteFeeReward;
                    s.satelliteRewardsLedger[satelliteAddress]                      := satelliteRewardsRecord;
                }
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Satellite Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Lambdas Begin
// ------------------------------------------------------------------------------

(* onStakeChange lambda *)
function lambdaOnStakeChange(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {

    // Steps Overview: 
    // 1. Check that sender is the Doorman Contract
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    // 2. Update user's satellite rewards (reference satellite that user is delegated to and update his unpaid satellite rewards)
    // 3. Check if user has a satellite rewards record
    //    - Get user's satellite rewards record
    //    - Get satellite's rewards record (that user is delegated to)
    //    - Update user's satellite rewards record - empty pending rewards
    //    - Set user's participationRewardsPerShare to satellite's satelliteAccumulatedRewardsPerShare
    //    - Increment user's paid balance by his unpaid balance
    //    - Reset user's unpaid balance to 0
    // 4. Update user's staked MVK balance depending if he is a satellite or delegator
    //    - If user is a satellite
    //        - Get user's staked MVK balance from the Doorman Contract
    //        - Get user's satellite record
    //        - Update user's satellite record staked MVK balance and storage in satelliteLedger
    //    - If user is a delegator
    //        - Get user's delegate record
    //        - Check if user is delegated to an active satellite (e.g. satellite may have unregistered)
    //            - Get user's staked MVK balance from the Doorman Contract
    //            - Get satellite record of satellite that user is delegated to
    //            - Calculate difference between user's staked MVK balance in delegate record and his current staked MVK balance
    //            - Check if there has been a positive or negative change in user's staked MVK balance and adjust satellite's total delegated amount correspondingly
    //                - If there is a positive change in user's staked MVK balance, increment userSatellite's total delegated amount by the difference (stakeAmount)
    //                - Else If stakeAmount is greater than userSatellite's total delegated amount then fail with error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT
    //                - Else, there is a negative change in user's staked MVK balance, so decrement userSatellite's total delegated amount by the difference (stakeAmount)
    //            - Update storage (user's delegate record and his delegated satellite record)
    //        - Force User to undelegate if he does not have an active satellite anymore
    
    var operations: list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaOnStakeChange(userAddress) -> {

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                          Some (_contract)    -> _contract
                        | None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                      ]
                  | None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Check that sender is the Doorman Contract
                if doormanAddress = Tezos.sender then skip else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

                // Update user's rewards
                s := updateRewards(userAddress, s);

                // Check if user has a satellite rewards record
                if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {

                    // Get user's satellite rewards record
                    var satelliteRewardsRecord: satelliteRewardsType  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                      | None -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
                    ];

                    // Get satellite's rewards record (that user is delegated to)
                    var _satelliteReferenceRewardsRecord: satelliteRewardsType  := case Big_map.find_opt(satelliteRewardsRecord.satelliteReferenceAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                      | None -> failwith(error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND)
                    ];

                    // Update user's satellite rewards record - empty pending rewards
                    // - Set user's participationRewardsPerShare to satellite's satelliteAccumulatedRewardsPerShare
                    // - Increment user's paid balance by his unpaid balance
                    // - Reset user's unpaid balance to 0

                    satelliteRewardsRecord.participationRewardsPerShare    := _satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    satelliteRewardsRecord.paid                            := satelliteRewardsRecord.paid + satelliteRewardsRecord.unpaid;
                    satelliteRewardsRecord.unpaid                          := 0n;
                    s.satelliteRewardsLedger[userAddress]                  := satelliteRewardsRecord;

                } else skip;

                // Check if user is a satellite
                const userIsSatellite: bool = Map.mem(userAddress, s.satelliteLedger);

                // ------------------------------------------------------------
                // Update user's staked MVK balance depending if he is a satellite or delegator
                // ------------------------------------------------------------

                if userIsSatellite then block {

                    // Get user's staked MVK balance from the Doorman Contract
                    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                        Some (value) -> value
                      | None -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                    ];

                    // Get user's satellite record
                    var satelliteRecord: satelliteRecordType := case Map.find_opt(userAddress, s.satelliteLedger) of [
                        Some (_satellite) -> _satellite
                      | None -> failwith(error_SATELLITE_NOT_FOUND)
                    ];

                    // Update user's satellite record staked MVK balance and storage in satelliteLedger
                    satelliteRecord.stakedMvkBalance  := stakedMvkBalance;
                    s.satelliteLedger[userAddress]    := satelliteRecord;
                }
                else block {

                  // check if user has delegated to a satellite
                  const userIsDelegator: bool = Big_map.mem(userAddress, s.delegateLedger);
                
                  if userIsDelegator then block {
                    
                    // Get user's delegate record
                    var _delegatorRecord: delegateRecordType := case Big_map.find_opt(userAddress, s.delegateLedger) of [
                        Some (_delegate) -> _delegate
                      | None -> failwith(error_DELEGATE_NOT_FOUND)
                    ];

                    // Check if user is delegated to an active satellite (e.g. satellite may have unregistered)
                    const userHasActiveSatellite: bool = Map.mem(_delegatorRecord.satelliteAddress, s.satelliteLedger);

                    if userHasActiveSatellite then block {

                        // Get user's staked MVK balance from the Doorman Contract
                        const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                        const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                            Some (value) -> value
                          | None -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                        ];

                        // Get satellite record of satellite that user is delegated to
                        var userSatellite: satelliteRecordType := case Map.find_opt(_delegatorRecord.satelliteAddress, s.satelliteLedger) of [
                            Some (_delegatedSatellite) -> _delegatedSatellite
                          | None -> failwith(error_SATELLITE_NOT_FOUND)
                        ];

                        // Calculate difference between user's staked MVK balance in delegate record and his current staked MVK balance
                        const stakeAmount: nat = abs(_delegatorRecord.delegatedStakedMvkBalance - stakedMvkBalance);

                        // Check if there has been a positive or negative change in user's staked MVK balance and adjust satellite's total delegated amount correspondingly
                        // - If there is a positive change in user's staked MVK balance, increment userSatellite's total delegated amount by the difference (stakeAmount)
                        // - Else If stakeAmount is greater than userSatellite's total delegated amount then fail with error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT
                        // - Else, there is a negative change in user's staked MVK balance, so decrement userSatellite's total delegated amount by the difference (stakeAmount)
                        if stakedMvkBalance > _delegatorRecord.delegatedStakedMvkBalance then userSatellite.totalDelegatedAmount := userSatellite.totalDelegatedAmount + stakeAmount
                        else if stakeAmount > userSatellite.totalDelegatedAmount then failwith(error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT)
                        else userSatellite.totalDelegatedAmount := abs(userSatellite.totalDelegatedAmount - stakeAmount);

                        // Update storage (user's delegate record and his delegated satellite record)
                        _delegatorRecord.delegatedStakedMvkBalance  := stakedMvkBalance;
                        s.delegateLedger   := Big_map.update(userAddress, Some(_delegatorRecord), s.delegateLedger);
                        s.satelliteLedger  := Map.update(_delegatorRecord.satelliteAddress, Some(userSatellite), s.satelliteLedger);
                    } 

                    // Force User to undelegate if he does not have an active satellite anymore
                    else operations := Tezos.transaction(
                          (userAddress), 
                          0tez, 
                          getUndelegateFromSatelliteEntrypoint(Tezos.self_address)
                        ) # operations;
                  }
                else skip
                }

            }
        | _ -> skip
    ];

} with (operations, s)



(* updateSatelliteStatus lambda *)
function lambdaUpdateSatelliteStatus(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check sender is from a whitelisted contract
    // 2. Get satellite record
    // 3. Update satellite record with new status
    // 4. Update storage - satellite record

    // Check sender is admin or from a whitelisted contract (e.g. Governance, Governance Satellite, Aggregator Factory, Doorman, Treasury)
    if s.admin = Tezos.sender or checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED);

    case delegationLambdaAction of [
        | LambdaUpdateSatelliteStatus(updateSatelliteStatusParams) -> {
                
                // Init variables from parameters
                const satelliteAddress  : address = updateSatelliteStatusParams.satelliteAddress;
                const newStatus         : string  = updateSatelliteStatusParams.newStatus;

                // Get satellite record 
                var satelliteRecord : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of [
                    Some(_record) -> _record 
                  | None -> failwith(error_SATELLITE_NOT_FOUND)
                ];
            
                // Update satellite with new status
                satelliteRecord.status := newStatus;

                // Update storage - satellite record
                s.satelliteLedger[satelliteAddress] := satelliteRecord;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)


// ------------------------------------------------------------------------------
// General Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Delegation Lambdas End
//
// ------------------------------------------------------------------------------