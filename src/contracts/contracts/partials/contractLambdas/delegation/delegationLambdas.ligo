// ------------------------------------------------------------------------------
//
// Delegation Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    checkSenderIsAllowed(s); // check that sender is admin or governance contract (i.e. Governance DAO contract address)

    case delegationLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case delegationLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)  

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
function lambdaUpdateConfig(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

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
function lambdaUpdateWhitelistContracts(const delegationLambdaAction : delegationLambdaActionType; var s: delegationStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);

    case delegationLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const delegationLambdaAction : delegationLambdaActionType; var s: delegationStorage): return is
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
function lambdaMistakenTransfer(const delegationLambdaAction : delegationLambdaActionType; var s: delegationStorage): return is
block {

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
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
function lambdaPauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAllowed(s);

    // set all pause configs to True

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
function lambdaUnpauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAllowed(s);

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



(* togglePauseDelegateToSatellite lambda *)
function lambdaTogglePauseDelegateToSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin

    case delegationLambdaAction of [
        | LambdaPauseDelegateToSatellite(_parameters) -> {
                if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
                else s.breakGlassConfig.delegateToSatelliteIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseUndelegateSatellite lambda *)
function lambdaTogglePauseUndelegateSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin

    case delegationLambdaAction of [
        | LambdaPauseUndelegateSatellite(_parameters) -> {
                if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
                else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseRegisterSatellite lambda *)
function lambdaTogglePauseRegisterSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin

    case delegationLambdaAction of [
        | LambdaPauseRegisterSatellite(_parameters) -> {
                if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
                else s.breakGlassConfig.registerAsSatelliteIsPaused := True;    
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseUnregisterSatellite lambda *)
function lambdaTogglePauseUnregisterSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case delegationLambdaAction of [
        | LambdaPauseUnregisterSatellite(_parameters) -> {
                if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
                else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseUpdateSatellite lambda *)
function lambdaTogglePauseUpdateSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case delegationLambdaAction of [
        | LambdaPauseUpdateSatellite(_parameters) -> {
                if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
                else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* lambdaTogglePauseDistributeReward lambda *)
function lambdaTogglePauseDistributeReward(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case delegationLambdaAction of [
        | LambdaPauseDistributeReward(_parameters) -> {
                if s.breakGlassConfig.distributeRewardIsPaused then s.breakGlassConfig.distributeRewardIsPaused := False
                else s.breakGlassConfig.distributeRewardIsPaused := True;
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
function lambdaDelegateToSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is 
block {

    // Overall steps:
    // 1. check if satellite exists
    // 2. callback to doorman contract to fetch staked MVK (sMVK) balance
    // 3. save new user delegate record
    // 4. update satellite total delegated amount

    // check that entrypoint is not paused
    checkDelegateToSatelliteIsNotPaused(s);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaDelegateToSatellite(delegateToSatelliteParams) -> {

            // Get parameters
            const userAddress       : address = delegateToSatelliteParams.userAddress;
            const satelliteAddress  : address = delegateToSatelliteParams.satelliteAddress;

            // Check if sender is user or contract
            if Tezos.sender = userAddress or Tezos.sender = Tezos.self_address then skip
            else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

            // check that user is not a satellite
            checkUserIsNotSatellite(userAddress, s);

            // Update unclaimed rewards
            s := updateRewards(userAddress, s);
            
            // check if satellite exists
            var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of [
                Some(_val) -> _val
                | None -> failwith(error_SATELLITE_NOT_FOUND)
            ];

            const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
            const doormanAddress: address = case generalContractsOptView of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                    ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            // enable redelegation of satellites even if a user is delegated to a satellite already - easier alternative -> batch call undelegateFromSatellite, then delegateToSatellite
            // get delegate record if exists, if not create a new delegate record

            // check if user is delegated to a satellite or not
            if Big_map.mem(userAddress, s.delegateLedger) then block {
                // user is already delegated to a satellite 
                var delegateRecord : delegateRecordType := case s.delegateLedger[userAddress] of [
                    Some(_delegateRecord) -> _delegateRecord
                    | None -> failwith(error_DELEGATE_NOT_FOUND) // failwith should not be reached as conditional check is already cleared
                ];

                const previousSatellite : address = delegateRecord.satelliteAddress; 

                // check that new satellite is not the same as previously delegated satellite
                if previousSatellite = satelliteAddress then failwith(error_ALREADY_DELEGATED_SATELLITE)
                    else skip;

                const delegateToSatelliteOperation : operation = Tezos.transaction(
                    (delegateToSatelliteParams),
                    0tez, 
                    // delegateToSatellite
                    getDelegateToSatelliteEntrypoint(Tezos.self_address)
                );

                operations  := delegateToSatelliteOperation # operations;

                const undelegateFromSatelliteOperation : operation = Tezos.transaction(
                    (userAddress),
                    0tez, 
                    // undelegateFromSatellite
                    getUndelegateFromSatelliteEntrypoint(Tezos.self_address)
                );

                operations  := undelegateFromSatelliteOperation # operations;

            } else block {

                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
                ];

                // Retrieve satellite account from delegationStorage
                var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);
                
                // user is not delegated to a satellite
                var delegateRecord : delegateRecordType := record [
                    satelliteAddress              = satelliteAddress;
                    delegatedDateTime             = Tezos.now;
                    delegatedSMvkBalance          = stakedMvkBalance;
                ];

                s.delegateLedger[userAddress] := delegateRecord;

                // Update or create delegate reward record
                var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(satelliteAddress, s.satelliteRewardsLedger) of [
                    Some (_record) -> _record
                | None -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
                ];
                var delegateRewardsRecord: satelliteRewards := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
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

                // update satellite totalDelegatedAmount balance
                satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + stakedMvkBalance; 
                
                // update satellite ledger delegationStorage with new balance
                s.satelliteLedger[satelliteAddress] := satelliteRecord;

            }
        }
        | _ -> skip
    ];

} with (operations, s)



(* undelegateFromSatellite lambda *)
function lambdaUndelegateFromSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. callback to doorman contract to fetch sMVK balance
    // 3a. if satellite exists, update satellite record with new balance and remove user from delegateLedger
    // 3b. if satellite does not exist, remove user from delegateLedger

    // check that entrypoint is not paused
    checkUndelegateFromSatelliteIsNotPaused(s);

    case delegationLambdaAction of [
        | LambdaUndelegateFromSatellite(userAddress) -> {

                // Check if sender is self or userAddress -> Needed now because a user can compound for another so onStakeChange needs to reference a userAddress
                if Tezos.sender = userAddress or Tezos.sender = Tezos.self_address then skip 
                else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

                // Update unclaimed rewards
                s := updateRewards(userAddress, s);

                var _delegateRecord : delegateRecordType := case s.delegateLedger[userAddress] of [
                    Some(_val) -> _val
                    | None -> failwith(error_DELEGATE_NOT_FOUND)
                ];

                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                | None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];
                
                var emptySatelliteRecord : satelliteRecordType :=
                record [
                    status                = 0n;        
                    stakedMvkBalance      = 0n;       
                    satelliteFee          = 0n;    
                    totalDelegatedAmount  = 0n;
                    
                    name                  = "Empty Satellite";
                    description           = "Empty Satellite";
                    image                 = "";
                    website               = "";

                    registeredDateTime              = Tezos.now;
                ];

                var _satelliteRecord : satelliteRecordType := case s.satelliteLedger[_delegateRecord.satelliteAddress] of [
                      None          -> emptySatelliteRecord
                    | Some(_record) -> _record
                ];

                if _satelliteRecord.status = 1n then block {
                // satellite exists

                // check that sMVK balance does not exceed satellite's total delegated amount
                    if stakedMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith(error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT)
                    else skip;
                    
                    // update satellite totalDelegatedAmount balance
                    _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - stakedMvkBalance); 
                    
                    // update satellite ledger delegationStorage with new balance
                    s.satelliteLedger[_delegateRecord.satelliteAddress] := _satelliteRecord;

                } else skip;

                // remove user's address from delegateLedger
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
function lambdaRegisterAsSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is 
block {
    
    // Overall steps: 
    // 1. verify that satellite does not already exist (prevent double registration)
    // 2. callback to doorman contract to fetch sMVK balance
    // 3. if user sMVK balance is more than minimumDelegateBond, register as delegate
    // 4. add new satellite record and save to satelliteLedger

    // add the satellite fields here

    // check that entrypoint is not paused
    checkRegisterAsSatelliteIsNotPaused(s);

    case delegationLambdaAction of [
        | LambdaRegisterAsSatellite(registerAsSatelliteParams) -> {

                // Get user address
                const userAddress: address  = Tezos.sender;

                // check that user is not a delegate
                checkUserIsNotDelegate(userAddress, s);

                // Update unclaimed rewards
                s := updateRewards(userAddress, s);

                // Check if limit was reached
                if Map.size(s.satelliteLedger) >= s.config.maxSatellites then failwith(error_MAXIMUM_AMOUNT_OF_SATELLITES_REACHED) else skip;

                // Get user stake balance
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                | None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];

                // lock satellite's sMVK amount -> bond? 
                if stakedMvkBalance < s.config.minimumStakedMvkBalance then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip;
                
                // init new satellite record params
                const name          : string  = registerAsSatelliteParams.name;
                const description   : string  = registerAsSatelliteParams.description;
                const image         : string  = registerAsSatelliteParams.image;
                const website       : string  = registerAsSatelliteParams.website;
                const satelliteFee  : nat     = registerAsSatelliteParams.satelliteFee;

                // validate inputs
                if String.length(name) > s.config.satelliteNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(description) > s.config.satelliteDescriptionMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(image) > s.config.satelliteImageMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(website) > s.config.satelliteWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if satelliteFee > 10000n then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                const satelliteRecord: satelliteRecordType = case Map.find_opt(userAddress, s.satelliteLedger) of [
                      Some (_satellite) -> (failwith(error_SATELLITE_ALREADY_EXISTS): satelliteRecordType)
                    | None -> record [            
                            status                = 1n;
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

                // Update satellite's record
                s.satelliteLedger[userAddress] := satelliteRecord;

                // Update or create a satellite rewards record
                var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                Some (_rewards) -> _rewards
                | None -> record[
                    unpaid                                      = 0n;
                    paid                                        = 0n;
                    participationRewardsPerShare                = 0n;
                    satelliteAccumulatedRewardsPerShare         = 0n;
                    satelliteReferenceAddress                   = userAddress
                ]
                ];
                satelliteRewardsRecord.participationRewardsPerShare         := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                s.satelliteRewardsLedger[userAddress]                      := satelliteRewardsRecord;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* unregisterAsSatellite lambda *)
function lambdaUnregisterAsSatellite(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {
    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. remove satellite address from satelliteLedger

    // check that entrypoint is not paused
    checkUnregisterAsSatelliteIsNotPaused(s);

    case delegationLambdaAction of [
        | LambdaUnregisterAsSatellite(userAddress) -> {

                if Tezos.sender = userAddress or Tezos.sender = Tezos.self_address then skip 
                else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

                // check sender is satellite
                checkUserIsSatellite(userAddress, s);

                // Update unclaimed rewards
                s := updateRewards(userAddress, s);
                
                // remove sender from satellite ledger
                remove (userAddress : address) from map s.satelliteLedger;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateSatelliteRecord lambda *)
function lambdaUpdateSatelliteRecord(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // Overall steps:
    // 1. check if sender's address exists in satelliteLedger
    // 2. update satellite records

    checkUpdateSatelliteRecordIsNotPaused(s);

    case delegationLambdaAction of [
        | LambdaUpdateSatelliteRecord(updateSatelliteRecordParams) -> {

                // Get user address
                const userAddress: address  = Tezos.sender;

                // Update unclaimed rewards
                s := updateRewards(userAddress, s);
                
                var satelliteRecord : satelliteRecordType := case s.satelliteLedger[userAddress] of [
                      Some(_val) -> _val
                    | None       -> failwith(error_SATELLITE_NOT_FOUND)
                ];

                // init updated satellite record params
                const name          : string  = updateSatelliteRecordParams.name;
                const description   : string  = updateSatelliteRecordParams.description;
                const image         : string  = updateSatelliteRecordParams.image;
                const website       : string  = updateSatelliteRecordParams.website;
                const satelliteFee  : nat     = updateSatelliteRecordParams.satelliteFee;

                // validate inputs
                if String.length(name) > s.config.satelliteNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(description) > s.config.satelliteDescriptionMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(image) > s.config.satelliteImageMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(website) > s.config.satelliteWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if satelliteFee > 10000n then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // update satellite details - validation checks should be done before submitting to smart contract
                satelliteRecord.name           := name;         
                satelliteRecord.description    := description;  
                satelliteRecord.image          := image;
                satelliteRecord.website        := website;
                satelliteRecord.satelliteFee   := satelliteFee;        
                
                // update satellite ledger delegationStorage with new information
                s.satelliteLedger[userAddress] := satelliteRecord;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* distributeReward lambda *)
function lambdaDistributeReward(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // Overall steps:
    // 1. check if sender's address exists in satelliteLedger
    // 2. update satellite records

    checkDistributeRewardIsNotPaused(s);

    // Operation list
    var operations: list(operation) := nil;

    // Check sender is a whitelist contract
    if checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED);

    case delegationLambdaAction of [
        | LambdaDistributeReward(distributeRewardParams) -> {
                
            // Get variables from parameters
            const eligibleSatellites: set(address) = distributeRewardParams.eligibleSatellites;
            const totalReward: nat = distributeRewardParams.totalSMvkReward;

            // Send the rewards from the treasury to the doorman contract
            const generalContractsOptViewSatelliteTreasury : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "satelliteTreasury", s.governanceAddress);
            const treasuryAddress: address = case generalContractsOptViewSatelliteTreasury of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND)
                    ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
            const doormanAddress: address = case generalContractsOptViewDoorman of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                    ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];
            // Check if provided treasury exists
            const transferParam: transferActionType = list[
                record[
                to_=doormanAddress;
                token=(Fa2 (record[
                    tokenContractAddress=s.mvkTokenAddress;
                    tokenId=0n;
                ]): tokenType);
                amount=totalReward;
                ]
            ];

            const transferOperation: operation = Tezos.transaction(
                transferParam,
                0tez,
                sendTransferOperationToTreasury(treasuryAddress)
            );
            operations := transferOperation # operations;

            // Calculate reward for each satellite
            const eligibleSatellitesCount: nat = Set.cardinal(eligibleSatellites);
            const rewardPerSatellite: nat = totalReward * fixedPointAccuracy / eligibleSatellitesCount ;

            for satelliteAddress in set eligibleSatellites 
                block {
                    // Get satellite
                    var satelliteRecord: satelliteRecordType  := case Map.find_opt(satelliteAddress, s.satelliteLedger) of [
                        Some (_record) -> _record
                    | None -> failwith(error_SATELLITE_NOT_FOUND)
                    ];

                    var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(satelliteAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                    | None -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
                    ];

                    // Calculate satellite fee portion in reward
                    const satelliteFee: nat         = satelliteRecord.satelliteFee * rewardPerSatellite / 10000n;
                    const satelliteFeeReward: nat   = satelliteFee / fixedPointAccuracy;

                    // Check if the fee is not too big
                    if satelliteFee > rewardPerSatellite then failwith(error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD) else skip;

                    // Update satellite record
                    const satelliteVotingPower: nat                                 = satelliteRecord.totalDelegatedAmount + satelliteRecord.stakedMvkBalance;
                    satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare      := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare + (abs(rewardPerSatellite - satelliteFee) / satelliteVotingPower);
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
function lambdaOnStakeChange(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is 
block {

    // Overall steps:
    // 1. check if user is a satellite 
    // 2a. if user is a satellite, update satellite's bond amount
    // 2b. if user is not a satellite, update satellite's total delegated amount
    
    var operations: list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaOnStakeChange(userAddress) -> {
                const userIsSatellite: bool = Map.mem(userAddress, s.satelliteLedger);

                // Check sender is doorman contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];
                if doormanAddress = Tezos.sender then skip else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

                // Update user rewards
                s   := updateRewards(userAddress, s);

                // Check if user is delegate or satellite
                if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {
                    var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                    | None -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
                    ];

                    var _satelliteReferenceRewardsRecord: satelliteRewards  := case Big_map.find_opt(satelliteRewardsRecord.satelliteReferenceAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                    | None -> failwith(error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND)
                    ];

                    // Update record --> Empty the pending rewards
                    satelliteRewardsRecord.participationRewardsPerShare    := _satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    satelliteRewardsRecord.paid                            := satelliteRewardsRecord.paid + satelliteRewardsRecord.unpaid;
                    satelliteRewardsRecord.unpaid                          := 0n;
                    s.satelliteRewardsLedger[userAddress]                  := satelliteRewardsRecord;
                } else skip;

                // check if user is a satellite
                if userIsSatellite then block {

                    // Get user SMVK Balance
                    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                        Some (value) -> value
                    | None -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                    ];

                    var satelliteRecord: satelliteRecordType := case Map.find_opt(userAddress, s.satelliteLedger) of [
                        Some (_satellite) -> _satellite
                        | None -> failwith(error_SATELLITE_NOT_FOUND)
                    ];

                    // Save satellite
                    satelliteRecord.stakedMvkBalance := stakedMvkBalance;
                    s.satelliteLedger := Map.update(userAddress, Some(satelliteRecord), s.satelliteLedger);
                }
                else block {

                // check if user has delegated to a satellite
                const userIsDelegator: bool = Big_map.mem(userAddress, s.delegateLedger);
                
                if userIsDelegator then block {
                    // Retrieve satellite account from delegationStorage
                    var _delegatorRecord: delegateRecordType := case Big_map.find_opt(userAddress, s.delegateLedger) of [
                    Some (_delegate) -> _delegate
                    | None -> failwith(error_DELEGATE_NOT_FOUND)
                    ];

                    const userHasActiveSatellite: bool = Map.mem(_delegatorRecord.satelliteAddress, s.satelliteLedger);
                    if userHasActiveSatellite then block {

                        // Get user SMVK Balance
                        const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                        const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                            Some (value) -> value
                        | None -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                        ];

                        var userSatellite: satelliteRecordType := case Map.find_opt(_delegatorRecord.satelliteAddress, s.satelliteLedger) of [
                            Some (_delegatedSatellite) -> _delegatedSatellite
                        | None -> failwith(error_SATELLITE_NOT_FOUND)
                        ];

                        const stakeAmount: nat = abs(_delegatorRecord.delegatedSMvkBalance - stakedMvkBalance);

                        // Save satellite
                        if stakedMvkBalance > _delegatorRecord.delegatedSMvkBalance then userSatellite.totalDelegatedAmount := userSatellite.totalDelegatedAmount + stakeAmount
                        else if stakeAmount > userSatellite.totalDelegatedAmount then failwith(error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT)
                        else userSatellite.totalDelegatedAmount := abs(userSatellite.totalDelegatedAmount - stakeAmount);

                        _delegatorRecord.delegatedSMvkBalance  := stakedMvkBalance;
                        s.delegateLedger   := Big_map.update(userAddress, Some(_delegatorRecord), s.delegateLedger);
                        s.satelliteLedger  := Map.update(_delegatorRecord.satelliteAddress, Some(userSatellite), s.satelliteLedger);
                    } 
                    // Force User to undelegate if it does not have an active satellite anymore
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

// ------------------------------------------------------------------------------
// General Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Delegation Lambdas End
//
// ------------------------------------------------------------------------------