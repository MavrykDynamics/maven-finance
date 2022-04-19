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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case delegationLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
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
                      ConfigDelegationRatio (_v)         -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.delegationRatio          := updateConfigNewValue
                    | ConfigMinimumStakedMvkBalance (_v) -> if updateConfigNewValue < 100_000_000n then failwith("Error. This config value cannot go below 0.1SMVK") else s.config.minimumStakedMvkBalance  := updateConfigNewValue
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
    checkSenderIsAdmin(s);

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

            }
        | _ -> skip
    ];

    if s.breakGlassConfig.distributeRewardIsPaused then skip
    else s.breakGlassConfig.distributeRewardIsPaused := True;

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

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

    // check that sender is not a satellite
    checkSenderIsNotSatellite(s);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaDelegateToSatellite(satelliteAddress) -> {
            // Update unclaimed rewards
            s := updateRewards(s);
            
            // check if satellite exists
            var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of [
                Some(_val) -> _val
                | None -> failwith("Satellite does not exist")
            ];

            const doormanAddress : address = case s.generalContracts["doorman"] of [
            Some(_address) -> _address
            | None -> failwith("Error. Doorman Contract is not found")
            ];

            // enable redelegation of satellites even if a user is delegated to a satellite already - easier alternative -> batch call undelegateFromSatellite, then delegateToSatellite
            // get delegate record if exists, if not create a new delegate record

            // check if user is delegated to a satellite or not
            if Big_map.mem(Tezos.source, s.delegateLedger) then block {
            // user is already delegated to a satellite 
            var delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.source] of [
                Some(_delegateRecord) -> _delegateRecord
                | None -> failwith("Delegate Record does not exist") // failwith should not be reached as conditional check is already cleared
            ];

            const previousSatellite : address = delegateRecord.satelliteAddress; 

            // check that new satellite is not the same as previously delegated satellite
            if previousSatellite = satelliteAddress then failwith("You are already delegated to this satellite")
                else skip;

            const delegateToSatelliteOperation : operation = Tezos.transaction(
                (satelliteAddress),
                0tez, 
                // delegateToSatellite
                getDelegateToSatelliteEntrypoint(Tezos.self_address)
            );

            operations  := delegateToSatelliteOperation # operations;

            const undelegateFromSatelliteOperation : operation = Tezos.transaction(
                (unit),
                0tez, 
                // undelegateFromSatellite
                getUndelegateFromSatelliteEntrypoint(Tezos.self_address)
            );

            operations  := undelegateFromSatelliteOperation # operations;

            } else block {

            const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
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

            s.delegateLedger[Tezos.source] := delegateRecord;

            // Update or create delegate reward record
            var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(satelliteAddress, s.satelliteRewardsLedger) of [
                Some (_record) -> _record
            | None -> failwith("Error. Rewards record not found")
            ];
            var delegateRewardsRecord: satelliteRewards := case Big_map.find_opt(Tezos.source, s.satelliteRewardsLedger) of [
                Some(_record) -> _record
            | None -> record[
                    unpaid                                  = 0n;
                    participationRewardsPerShare            = satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    satelliteAccumulatedRewardsPerShare     = satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    satelliteReferenceAddress               = satelliteAddress;
                ]
            ];
            delegateRewardsRecord.participationRewardsPerShare              := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
            delegateRewardsRecord.satelliteReferenceAddress                 := satelliteAddress;
            s.satelliteRewardsLedger[Tezos.source]                          := delegateRewardsRecord;

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

    // Update unclaimed rewards
    s := updateRewards(s);

    var _delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.source] of [
         Some(_val) -> _val
        | None -> failwith("Error. User address not found in delegateLedger.")
    ];

    const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None           -> failwith("Error. Doorman Contract is not found")
    ];

    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
        Some (value) -> value
      | None         -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
    ];

    case delegationLambdaAction of [
        | LambdaUndelegateFromSatellite(_parameters) -> {
                
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
                    if stakedMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith("Error. User's staked MVK balance exceeds satellite's total delegated amount.")
                    else skip;
                    
                    // update satellite totalDelegatedAmount balance
                    _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - stakedMvkBalance); 
                    
                    // update satellite ledger delegationStorage with new balance
                    s.satelliteLedger[_delegateRecord.satelliteAddress] := _satelliteRecord;

                } else skip;

                // remove user's address from delegateLedger
                remove (Tezos.source : address) from map s.delegateLedger;
                
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

    // Update unclaimed rewards
    s := updateRewards(s);

    // Check if limit was reached
    if Map.size(s.satelliteLedger) >= s.config.maxSatellites then failwith("Error. The maximum amount of satellites has been reached") else skip;

    // Get user stake balance
    const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None           -> failwith("Error. Doorman Contract is not found")
    ];

    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
        Some (value) -> value
      | None         -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
    ];

    // lock satellite's sMVK amount -> bond? 
    if stakedMvkBalance < s.config.minimumStakedMvkBalance then failwith("You do not have enough sMVK to meet the minimum delegate bond.")
      else skip;

    case delegationLambdaAction of [
        | LambdaRegisterAsSatellite(registerAsSatelliteParams) -> {
                
                // init new satellite record params
                const name          : string  = registerAsSatelliteParams.name;
                const description   : string  = registerAsSatelliteParams.description;
                const image         : string  = registerAsSatelliteParams.image;
                const website       : string  = registerAsSatelliteParams.website;
                const satelliteFee  : nat     = registerAsSatelliteParams.satelliteFee;

                // validate inputs
                if String.length(name) > s.config.satelliteNameMaxLength then failwith("Error. Satellite name too long") else skip;
                if String.length(description) > s.config.satelliteDescriptionMaxLength then failwith("Error. Satellite description too long") else skip;
                if String.length(image) > s.config.satelliteImageMaxLength then failwith("Error. Satellite image link too long") else skip;
                if String.length(website) > s.config.satelliteWebsiteMaxLength then failwith("Error. Satellite website link too long") else skip;
                if satelliteFee > 10000n then failwith("Error. Satellite fee cannot exceeds 100%") else skip;

                const satelliteRecord: satelliteRecordType = case Map.find_opt(Tezos.source, s.satelliteLedger) of [
                      Some (_satellite) -> (failwith("Satellite already exists"): satelliteRecordType)
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
                s.satelliteLedger[Tezos.source] := satelliteRecord;

                // Update or create a satellite rewards record
                var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(Tezos.source, s.satelliteRewardsLedger) of [
                Some (_rewards) -> _rewards
                | None -> record[
                    unpaid                                      = 0n;
                    participationRewardsPerShare                = 0n;
                    satelliteAccumulatedRewardsPerShare         = 0n;
                    satelliteReferenceAddress                   = Tezos.source
                ]
                ];
                satelliteRewardsRecord.participationRewardsPerShare         := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                s.satelliteRewardsLedger[Tezos.source]                      := satelliteRewardsRecord;
                
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

    // check sender is satellite
    checkSenderIsSatellite(s);

    // Update unclaimed rewards
    s := updateRewards(s);

    case delegationLambdaAction of [
        | LambdaUnregisterAsSatellite(_parameters) -> {
                
                // Update unclaimed rewards
                s := updateRewards(s);
                
                // remove sender from satellite ledger
                remove (Tezos.sender : address) from map s.satelliteLedger;

                // todo: oracles check
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

    // Update unclaimed rewards
    s := updateRewards(s);

    case delegationLambdaAction of [
        | LambdaUpdateSatelliteRecord(updateSatelliteRecordParams) -> {

                var satelliteRecord : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of [
                      Some(_val) -> _val
                    | None       -> failwith("Satellite does not exist")
                ];

                // init updated satellite record params
                const name          : string  = updateSatelliteRecordParams.name;
                const description   : string  = updateSatelliteRecordParams.description;
                const image         : string  = updateSatelliteRecordParams.image;
                const website       : string  = updateSatelliteRecordParams.website;
                const satelliteFee  : nat     = updateSatelliteRecordParams.satelliteFee;

                // validate inputs
                if String.length(name) > s.config.satelliteNameMaxLength then failwith("Error. Satellite name too long") else skip;
                if String.length(description) > s.config.satelliteDescriptionMaxLength then failwith("Error. Satellite description too long") else skip;
                if String.length(image) > s.config.satelliteImageMaxLength then failwith("Error. Satellite image too long") else skip;
                if String.length(website) > s.config.satelliteWebsiteMaxLength then failwith("Error. Satellite website too long") else skip;
                if satelliteFee > 10000n then failwith("Error. Satellite fee cannot exceeds 100%") else skip;

                // update satellite details - validation checks should be done before submitting to smart contract
                satelliteRecord.name           := name;         
                satelliteRecord.description    := description;  
                satelliteRecord.image          := image;
                satelliteRecord.website        := website;
                satelliteRecord.satelliteFee   := satelliteFee;        
                
                // update satellite ledger delegationStorage with new information
                s.satelliteLedger[Tezos.sender] := satelliteRecord;
                
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
    if checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith("Error. Sender is not in whitelisted contracts.");

    case delegationLambdaAction of [
        | LambdaDistributeReward(distributeRewardParams) -> {
                
            // Get variables from parameters
            const elligibleSatellites: set(address) = distributeRewardParams.elligibleSatellites;
            const totalReward: nat = distributeRewardParams.totalSMvkReward;

            // Send the rewards from the treasury to the doorman contract
            const treasuryAddress: address  = case Map.find_opt("satelliteTreasury", s.generalContracts) of [
                Some (_treasury) -> _treasury
            |   None -> failwith("Error. Satellite treasury contract not found")
            ];
            const doormanAddress: address  = case Map.find_opt("doorman", s.generalContracts) of [
                Some (_treasury) -> _treasury
            |   None -> failwith("Error. Doorman contract not found")
            ];
            // Check if provided treasury exists
            const transferParam: transferActionType = list[
                record[
                to_=doormanAddress;
                token=Fa2 (record[
                    tokenContractAddress=s.mvkTokenAddress;
                    tokenId=0n;
                ]);
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
            const elligibleSatellitesAmount: nat = Set.cardinal(elligibleSatellites);
            const rewardPerSatellite: nat = totalReward * fixedPointAccuracy / elligibleSatellitesAmount ;

            for satelliteAddress in set elligibleSatellites 
                block {
                    // Get satellite
                    var satelliteRecord: satelliteRecordType  := case Map.find_opt(satelliteAddress, s.satelliteLedger) of [
                        Some (_record) -> _record
                    | None -> failwith("Error. Satellite not found")
                    ];

                    var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(satelliteAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                    | None -> failwith("Error. Rewards record not found")
                    ];

                    // Calculate satellite fee portion in reward
                    const satelliteFee: nat         = satelliteRecord.satelliteFee * rewardPerSatellite / 10000n;
                    const satelliteFeeReward: nat   = satelliteFee / fixedPointAccuracy;

                    // Check if the fee is not too big
                    if satelliteFee > rewardPerSatellite then failwith("Error. The satellite fee exceeds the actual reward") else skip;

                    // Update satellite record
                    const satelliteVotingPower: nat                                 = satelliteRecord.totalDelegatedAmount + satelliteRecord.stakedMvkBalance;
                    satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare      := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare + (abs(rewardPerSatellite - satelliteFee) / satelliteVotingPower);

                    // Calculate satellite unclaim rewards
                    const satelliteRewardsRatio: nat  = abs(satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare - satelliteRewardsRecord.participationRewardsPerShare);
                    const satelliteRewards: nat       = (satelliteRecord.stakedMvkBalance * satelliteRewardsRatio) / fixedPointAccuracy;

                    satelliteRewardsRecord.participationRewardsPerShare             := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    satelliteRewardsRecord.unpaid                                   := satelliteRewardsRecord.unpaid + satelliteFeeReward + satelliteRewards;
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
    // 2a. if user is a satellite, update satellite's bond amount depending on stakeAmount and stakeType
    // 2b. if user is not a satellite, update satellite's total delegated amount depending on stakeAmount and stakeType
    // Note: stakeType 1n to increase, stakeType 0n to decrease

    // check sender is Doorman Contract or Treasury Contract
    // checkSenderIsDoormanContract(s);
    
    var operations: list(operation) := nil;

    // Update unclaimed rewards
    s := updateRewards(s);

    case delegationLambdaAction of [
        | LambdaOnStakeChange(userAddress) -> {
                const userIsSatellite: bool = Map.mem(userAddress, s.satelliteLedger);

                if checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith("Error. Sender is not in whitelisted contracts.");

                // check if user is a satellite
                if userIsSatellite then block {

                // Find doorman address
                const doormanAddress : address = case s.generalContracts["doorman"] of [
                    Some(_address) -> _address
                    | None -> failwith("Error. Doorman Contract is not found")
                ];

                // Get user SMVK Balance
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
                ];

                var satelliteRecord: satelliteRecordType := case Map.find_opt(Tezos.source, s.satelliteLedger) of [
                    Some (_satellite) -> _satellite
                    | None -> failwith("Error: satellite record not found.")
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
                    | None -> failwith("Error: delegate record not found.")
                    ];

                    const userHasActiveSatellite: bool = Map.mem(_delegatorRecord.satelliteAddress, s.satelliteLedger);
                    if userHasActiveSatellite then block {
                    // Find doorman address
                    const doormanAddress : address = case s.generalContracts["doorman"] of [
                        Some(_address) -> _address
                        | None -> failwith("Error. Doorman Contract is not found")
                    ];

                    // Get user SMVK Balance
                    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
                    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                        Some (value) -> value
                    | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
                    ];

                    var userSatellite: satelliteRecordType := case Map.find_opt(_delegatorRecord.satelliteAddress, s.satelliteLedger) of [
                        Some (_delegatedSatellite) -> _delegatedSatellite
                    | None -> failwith("Error: satellite record not found.")
                    ];

                    const stakeAmount: nat = abs(_delegatorRecord.delegatedSMvkBalance - stakedMvkBalance);

                    // Save satellite
                    if stakedMvkBalance > _delegatorRecord.delegatedSMvkBalance then userSatellite.totalDelegatedAmount := userSatellite.totalDelegatedAmount + stakeAmount
                    else if stakeAmount > userSatellite.totalDelegatedAmount then failwith("Error: stakeAmount is larger than satellite's total delegated amount.")
                    else userSatellite.totalDelegatedAmount := abs(userSatellite.totalDelegatedAmount - stakeAmount);

                    _delegatorRecord.delegatedSMvkBalance  := stakedMvkBalance;
                    s.delegateLedger   := Map.update(userAddress, Some(_delegatorRecord), s.delegateLedger);
                    s.satelliteLedger  := Map.update(_delegatorRecord.satelliteAddress, Some(userSatellite), s.satelliteLedger);
                    } 
                    // Force User to undelegate if it does not have an active satellite anymore
                    else operations := Tezos.transaction(
                        (unit), 
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



(* onSatelliteRewardPaid lambda *)
function lambdaOnSatelliteRewardPaid(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is 
block {
                
    // Check sender is doorman contract
    const doormanAddress : address = case s.generalContracts["doorman"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Doorman Contract is not found")
    ];
    if doormanAddress = Tezos.sender then skip else failwith("Error. Only the doorman contract can access this entrypoint");
    
    var operations: list(operation) := nil;

    case delegationLambdaAction of [
        | LambdaOnSatelliteRewardPaid(userAddress) -> {
                // Get user address
                const userAddress: address  = userAddress;

                // Update user rewards
                s   := updateRewards(s);

                // Check if user is delegate or satellite
                if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {
                    var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                    | None -> failwith("Error. Rewards record not found")
                    ];

                    var _satelliteReferenceRewardsRecord: satelliteRewards  := case Big_map.find_opt(satelliteRewardsRecord.satelliteReferenceAddress, s.satelliteRewardsLedger) of [
                        Some (_record) -> _record
                    | None -> failwith("Error. Rewards record not found")
                    ];

                    // Update record
                    satelliteRewardsRecord.participationRewardsPerShare    := _satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    satelliteRewardsRecord.unpaid                          := 0n;
                    s.satelliteRewardsLedger[userAddress]                  := satelliteRewardsRecord;
                } else skip;
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