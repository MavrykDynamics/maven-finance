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

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case delegationLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case delegationLambdaAction of [
        |    LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    case delegationLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey : string = updateMetadataParams.metadataKey;
                const metadataHash : bytes = updateMetadataParams.metadataHash;

                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {

    // verify that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case delegationLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : delegationUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : delegationUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigDelegationRatio (_v)         -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.delegationRatio          := updateConfigNewValue
                    |   ConfigMinimumStakedMvnBalance (_v) -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW) else s.config.minimumStakedMvnBalance  := updateConfigNewValue
                    |   ConfigMaxSatellites (_v)           -> s.config.maxSatellites                     := updateConfigNewValue
                    |   ConfigSatNameMaxLength (_v)        -> s.config.satelliteNameMaxLength            := updateConfigNewValue
                    |   ConfigSatDescMaxLength (_v)        -> s.config.satelliteDescriptionMaxLength     := updateConfigNewValue
                    |   ConfigSatImageMaxLength (_v)       -> s.config.satelliteImageMaxLength           := updateConfigNewValue
                    |   ConfigSatWebsiteMaxLength (_v)     -> s.config.satelliteWebsiteMaxLength         := updateConfigNewValue
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {
    
    // verify that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case delegationLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // verify that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case delegationLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
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
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause all main entrypoints in the Delegation Contract
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case delegationLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                s := pauseAllDelegationEntrypoints(s);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause all main entrypoints in the Delegation Contract

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // set all pause configs to False
    case delegationLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
            
                // set all pause configs to False
                s := unpauseAllDelegationEntrypoints(s);
            
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause entrypoint depending on boolean parameter sent 

    // verify that sender is admin
    verifySenderIsAdmin(s.admin); 

    case delegationLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        DelegateToSatellite (_v)          -> s.breakGlassConfig.delegateToSatelliteIsPaused := _v
                    |   UndelegateFromSatellite (_v)      -> s.breakGlassConfig.undelegateFromSatelliteIsPaused := _v
                    |   RegisterAsSatellite (_v)          -> s.breakGlassConfig.registerAsSatelliteIsPaused := _v
                    |   UnregisterAsSatellite (_v)        -> s.breakGlassConfig.unregisterAsSatelliteIsPaused := _v
                    |   UpdateSatelliteRecord (_v)        -> s.breakGlassConfig.updateSatelliteRecordIsPaused := _v
                    |   DistributeReward (_v)             -> s.breakGlassConfig.distributeRewardIsPaused := _v
                    |   TakeSatellitesSnapshot (_v)       -> s.breakGlassConfig.takeSatellitesSnapshotPaused := _v
                ]
                
            }
        |   _ -> skip
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
    //    - User is already delegated to one satellite (switch delegation to another satellite)
    //        - Check that new satellite is not the same as previously delegated satellite
    //        - Create operation to delegate to new satellite
    //        - Create operation to undelegate from previous satellite
    //    - User is not delegated to a satellite
    //        - Get user's staked MVN balance from the Doorman Contract
    //        - Create and save new delegate record for user
    //        - Update or create new rewards record for user (delegate)
    //        - Update satellite's total delegated amount (increment by user's staked MVN balance)
    //        - Update satellite record in storage

    verifyEntrypointIsNotPaused(s.breakGlassConfig.delegateToSatelliteIsPaused, error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaDelegateToSatellite(delegateToSatelliteParams) -> {

                // Init parameters
                const userAddress       : address = delegateToSatelliteParams.userAddress;
                const satelliteAddress  : address = delegateToSatelliteParams.satelliteAddress;

                // Check if the sender is the user specified in parameters, or the Delegation Contract
                verifySenderIsSelfOrAddress(userAddress);

                // Check that user is not a satellite
                checkUserIsNotSatellite(userAddress, s);

                // Update the satellite snapshot on the governance contract before updating its record
                operations := updateGovernanceSnapshot(set[satelliteAddress], True, operations, s);

                // Update user's unclaimed satellite rewards (in the event user is already delegated to another satellite)
                s := updateRewards(userAddress, s);
                
                // Verify that satellite exists
                var _checkSatelliteExists : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);

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
                    var delegateRecord : delegateRecordType := getDelegateRecord(userAddress, s);

                    // Temp variable for current satellite to be replaced
                    const previousSatellite : address = delegateRecord.satelliteAddress; 

                    // Verify that new satellite is not the same as previously delegated satellite
                    verifyDifferentAddress(previousSatellite, satelliteAddress, error_ALREADY_DELEGATED_SATELLITE);

                    // Create operation to delegate to new satellite
                    const delegateToSatelliteOperation : operation = delegateToSatelliteOperation(delegateToSatelliteParams);
                    operations := delegateToSatelliteOperation # operations;

                    // Create operation to undelegate from previous satellite
                    const undelegateFromSatelliteOperation : operation = undelegateFromSatelliteOperation(userAddress);
                    operations := undelegateFromSatelliteOperation # operations;

                } else block {

                    // ------------------------------------------------
                    // User is not delegated to any satellite
                    // ------------------------------------------------

                    // Get user's staked MVN balance from the Doorman Contract
                    const stakedMvnBalance : nat = getUserStakedMvnBalanceFromDoorman(userAddress, s);

                    // Get satellite record
                    var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);
                    
                    // Create and save new delegate record for user
                    s.delegateLedger[userAddress] := createDelegateRecord(satelliteAddress, satelliteRecord.registeredDateTime, stakedMvnBalance);

                    // Get satellite's rewards record
                    var satelliteRewardsRecord : satelliteRewardsType := getSatelliteRewardsRecord(satelliteAddress, s, error_SATELLITE_REWARDS_NOT_FOUND);

                    // Update or create new rewards record for user (delegate)
                    var delegateRewardsRecord : satelliteRewardsType := getOrCreateUpdatedDelegateRewardsRecord(
                        userAddress,                                                        // user address (delegate)
                        satelliteAddress,                                                   // satellite address
                        satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare,         // satellites's accumulate rewards per share
                        s                                                                   // storage
                    );
                    s.satelliteRewardsLedger[userAddress] := delegateRewardsRecord;

                    // Update satellite's total delegated amount (increment by user's staked MVN balance)
                    satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + stakedMvnBalance; 
                    
                    // Update satellite record in storage
                    s.satelliteLedger[satelliteAddress] := satelliteRecord;

                }
            }
        |   _ -> skip
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
    // 6. Get user's staked MVN balance from the Doorman Contract
    // 7. Get satellite record
    // 8. Check if satellite exists and status is not "INACTIVE" - temporary check
    //    - Check that user's staked MVN balance does not exceed satellite's total delegated amount
    //    - Update satellite total delegated amount (decrement by user's staked MVN balance)
    //    - Update satellite record in storage
    // 9. Remove user's address from delegateLedger

    verifyEntrypointIsNotPaused(s.breakGlassConfig.undelegateFromSatelliteIsPaused, error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaUndelegateFromSatellite(userAddress) -> {

                // Verify that sender is self (Delegation Contract) or userAddress -> Needed now because a user can compound for another user, so onStakeChange needs to reference a userAddress
                verifySenderIsSelfOrAddress(userAddress);

                // Get user's delegate record
                var delegateRecord : delegateRecordType := getDelegateRecord(userAddress, s);

                // get satellite address from user's delegate record
                const satelliteAddress : address = delegateRecord.satelliteAddress;

                // Update the satellite snapshot on the governance contract before updating its record
                operations := updateGovernanceSnapshot(set[satelliteAddress], True, operations, s);

                // Update unclaimed rewards for user
                s := updateRewards(userAddress, s);

                // Get user's staked MVN balance from the Doorman Contract
                const stakedMvnBalance : nat = getUserStakedMvnBalanceFromDoorman(userAddress, s);

                // Get satellite record
                var satelliteRecord : satelliteRecordType := getOrDefaultSatelliteRecord(satelliteAddress, s);

                // Check if satellite exists, wasn't recreated recently and is not inactive (if satellite does not exist, it will return "INACTIVE" from the empty satellite record above)
                // - if satellite is suspended or banned, users should be able to undelegate from satellite 
                if satelliteRecord.status =/= "INACTIVE" and satelliteRecord.registeredDateTime = delegateRecord.satelliteRegisteredDateTime then block {
                
                    // Verify that user's staked MVN balance does not exceed satellite's total delegated amount
                    verifyLessThanOrEqual(stakedMvnBalance, satelliteRecord.totalDelegatedAmount, error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT);
                    
                    // Update satellite total delegated amount (decrement by user's staked MVN balance)
                    satelliteRecord.totalDelegatedAmount := abs(satelliteRecord.totalDelegatedAmount - stakedMvnBalance); 
                    
                    // Update satellite record in storage
                    s.satelliteLedger[satelliteAddress] := satelliteRecord;

                } else skip;

                // Remove user's address from delegateLedger
                remove (userAddress : address) from map s.delegateLedger;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

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
    // 5. Check if user's staked MVN balance has reached the minimum staked MVN amount required to be a satellite
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    //    - Get user's staked MVN balance from the Doorman Contract
    // 6. Create new satellite record
    //    - Validate inputs (max length not exceeded)
    //    - Validate satellite fee input not exceeding 100%
    // 7. Save new satellite record
    // 8. Update or create a satellite rewards record

    verifyEntrypointIsNotPaused(s.breakGlassConfig.registerAsSatelliteIsPaused, error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaRegisterAsSatellite(registerAsSatelliteParams) -> {

                // Init user address
                const userAddress : address  = Mavryk.get_sender();

                // check that user is not a delegate
                checkUserIsNotDelegate(userAddress, s);

                // Update user's unclaimed rewards
                s := updateRewards(userAddress, s);

                // Verify that max number of satellites limit has not been reached
                verifyMaxSatellitesAllowed(s);

                // create new satellite record
                const satelliteRecord : satelliteRecordType = createSatelliteRecord(registerAsSatelliteParams, s);

                // Save new satellite record
                s.satelliteLedger[userAddress]  := satelliteRecord;
                s.satelliteCounter              := s.satelliteCounter + 1n;

                // Update the satellite snapshot on the governance contract before updating its record
                operations := updateGovernanceSnapshot(set[userAddress], False, operations, s);

                // Get or create satellite rewards record
                var satelliteRewardsRecord : satelliteRewardsType := getOrCreateSatelliteRewardsRecord(userAddress, s);

                satelliteRewardsRecord.participationRewardsPerShare        := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare;
                satelliteRewardsRecord.tracked                             := True;
                s.satelliteRewardsLedger[userAddress]                      := satelliteRewardsRecord;
                
            }
        |   _ -> skip
    ];  

} with (operations, s)



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
    
    verifyEntrypointIsNotPaused(s.breakGlassConfig.unregisterAsSatelliteIsPaused, error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaUnregisterAsSatellite(userAddress) -> {

                // Check if sender is self (Delegation Contract) or userAddress
                verifySenderIsSelfOrAddress(userAddress);

                // Check that sender is a satellite
                checkUserIsSatellite(userAddress, s);

                // Check that satellite is not suspended or banned
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
                checkSatelliteStatus(userAddress, delegationAddress, True, True);

                // Update the satellite snapshot on the governance contract before updating its record
                operations := updateGovernanceSnapshot(set[userAddress], True, operations, s);

                // Update user's unclaimed rewards
                s := updateRewards(userAddress, s);
                
                // remove sender from satellite ledger
                s.satelliteLedger   := Big_map.remove(userAddress, s.satelliteLedger);
                s.satelliteCounter  := abs(s.satelliteCounter - 1n);

            }
        |   _ -> skip
    ];

} with (operations, s)



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

    verifyEntrypointIsNotPaused(s.breakGlassConfig.updateSatelliteRecordIsPaused, error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaUpdateSatelliteRecord(updateSatelliteRecordParams) -> {

                // Init user address
                const satelliteAddress : address  = Mavryk.get_sender();

                // check satellite is not banned
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
                checkSatelliteStatus(satelliteAddress, delegationAddress, False, True);

                // Update the satellite snapshot on the governance contract before updating its record
                operations := updateGovernanceSnapshot(set[satelliteAddress], True, operations, s);
                
                // Update user's unclaimed rewards
                s := updateRewards(satelliteAddress, s);

                // Update satellite record
                const satelliteRecord : satelliteRecordType = updateSatelliteRecord(satelliteAddress, updateSatelliteRecordParams, s);

                // Update satellite record in storage
                s.satelliteLedger[satelliteAddress] := satelliteRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



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
    //    - Calculate satellite's total staked MVN (total delegated amount from delegates + satellite's staked MVN amount)
    //    - Calculate increment to satellite accumulated rewards per share
    //    - Update satellite's rewards record (satelliteAccumulatedRewardsPerShare, unpaid amount)

    verifyEntrypointIsNotPaused(s.breakGlassConfig.distributeRewardIsPaused, error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    // Operation list
    var operations: list(operation) := nil;

    // Check sender is from a whitelisted contract (e.g. Governance, Governance Satellite, Aggregator Factory, Doorman, Treasury)
    if checkInWhitelistContracts(Mavryk.get_sender(), s.whitelistContracts) then skip else failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED);

    case delegationLambdaAction of [
        |   LambdaDistributeReward(distributeRewardParams) -> {
                
            // Init variables from parameters (eligible satellites set, and total reward)
            const eligibleSatellites : set(address) = distributeRewardParams.eligibleSatellites;
            const totalReward : nat = distributeRewardParams.totalStakedMvnReward;

            // Distribute satellite rewards (transfers MVN token from Satellite Treasury contract to the doorman contract i.e. increases staked MVN supply)
            const distributeSatelliteRewardsOperation : operation = distributeSatelliteRewardsOperation(totalReward, s);
            operations := distributeSatelliteRewardsOperation # operations;

            // Calculate reward per satellite (equal split among satellites)
            const eligibleSatellitesCount   : nat = Set.cardinal(eligibleSatellites);
            const rewardPerSatellite        : nat = totalReward * fixedPointAccuracy / eligibleSatellitesCount ;

            // Update rewards for each satellite in the eligible satellites set
            for satelliteAddress in set eligibleSatellites 
                block {
                    
                    // Get satellite record
                    var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);

                    // Get satellite rewards record
                    var satelliteRewardsRecord : satelliteRewardsType := getSatelliteRewardsRecord(satelliteAddress, s, error_SATELLITE_REWARDS_NOT_FOUND);

                    // Calculate satellite fee portion of reward
                    const satelliteFee : nat         = satelliteRecord.satelliteFee * rewardPerSatellite / 10000n;
                    const satelliteFeeReward : nat   = satelliteFee / fixedPointAccuracy;

                    // Check that satellite fee does not exceed reward
                    if satelliteFee > rewardPerSatellite then failwith(error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD) else skip;

                    // Calculate total distribution amount for satellite's delegates (total reward amount - satellite fee amount)
                    const totalDistributionAmountForDelegates : nat  = abs(rewardPerSatellite - satelliteFee);

                    // Calculate satellite's total staked MVN (total delegated amount from delegates + satellite's staked MVN amount)
                    const satelliteTotalStakedMvn : nat  = satelliteRecord.totalDelegatedAmount + satelliteRecord.stakedMvnBalance;

                    // Calculate increment to satellite accumulated rewards per share
                    const incrementRewardsPerShare : nat = totalDistributionAmountForDelegates / satelliteTotalStakedMvn;

                    // Update satellite's rewards record (satelliteAccumulatedRewardsPerShare, unpaid amount)
                    satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare      := satelliteRewardsRecord.satelliteAccumulatedRewardsPerShare + incrementRewardsPerShare;
                    satelliteRewardsRecord.unpaid                                   := satelliteRewardsRecord.unpaid + satelliteFeeReward;
                    s.satelliteRewardsLedger[satelliteAddress]                      := satelliteRewardsRecord;
                }
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* takeSatellitesSnapshot lambda *)
function lambdaTakeSatellitesSnapshot(const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %takeSatellitesSnapshot entrypoint is not paused (e.g. glass broken)
    // 2. Update the satellites snapshots based on the parameters

    verifyEntrypointIsNotPaused(s.breakGlassConfig.takeSatellitesSnapshotPaused, error_TAKE_SATELLITES_SNAPSHOT_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED);

    // Operation list
    var operations: list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaTakeSatelliteSnapshot(takeSatellitesSnapshotParams) -> {

                // Update the governance snapshot for the given satellites
                operations  := updateGovernanceSnapshot(takeSatellitesSnapshotParams, True, operations, s);

        }
        |   _ -> skip
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
    // 4. Update user's staked MVN balance depending if he is a satellite or delegator
    //    - If user is a satellite
    //        - Get user's staked MVN balance from the Doorman Contract
    //        - Get user's satellite record
    //        - Update user's satellite record staked MVN balance and storage in satelliteLedger
    //    - If user is a delegator
    //        - Get user's delegate record
    //        - Check if user is delegated to an active satellite (e.g. satellite may have unregistered)
    //            - Get user's staked MVN balance from the Doorman Contract
    //            - Get satellite record of satellite that user is delegated to
    //            - Calculate difference between user's staked MVN balance in delegate record and his current staked MVN balance
    //            - Check if there has been a positive or negative change in user's staked MVN balance and adjust satellite's total delegated amount correspondingly
    //                - If there is a positive change in user's staked MVN balance, increment userSatellite's total delegated amount by the difference (stakeAmount)
    //                - Else If stakeAmount is greater than userSatellite's total delegated amount then fail with error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT
    //                - Else, there is a negative change in user's staked MVN balance, so decrement userSatellite's total delegated amount by the difference (stakeAmount)
    //            - Update storage (user's delegate record and his delegated satellite record)
    //        - Force User to undelegate if he does not have an active satellite anymore
    
    var operations: list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaOnStakeChange(userAddressAndBalances) -> {

                // Verify that sender is the Doorman Contract
                verifySenderIsDoormanContract(s);

                // Update the satellite snapshot
                var satellitesToUpdate : set(address)  := set[];

                for userAddressAndBalance in set userAddressAndBalances block {

                    // Parse parameters
                    const userAddress : address = userAddressAndBalance.0;
                    const userBalance : nat     = userAddressAndBalance.1;

                    // Add the user to update
                    satellitesToUpdate  := Set.add(userAddress, satellitesToUpdate);

                    // Check if user has a satellite rewards record
                    if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {

                        // Get user's satellite rewards record
                        var satelliteRewardsRecord : satelliteRewardsType := getSatelliteRewardsRecord(userAddress, s, error_SATELLITE_REWARDS_NOT_FOUND);

                        // Get satellite's rewards record (that user is delegated to)
                        const satelliteReferenceAddress : address = satelliteRewardsRecord.satelliteReferenceAddress;
                        var _satelliteReferenceRewardsRecord : satelliteRewardsType := getSatelliteRewardsRecord(satelliteReferenceAddress, s, error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND);

                        // Calculate increment rewards based on difference between satellite's accumulated rewards per share and user's participations rewards per share
                        const rewardsRatio      : nat   = abs(_satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - satelliteRewardsRecord.participationRewardsPerShare);
                        const incrementRewards  : nat   = userBalance * rewardsRatio;
                        satelliteRewardsRecord.unpaid   := satelliteRewardsRecord.unpaid + (incrementRewards / fixedPointAccuracy);

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
                    const userIsSatellite: bool = Big_map.mem(userAddress, s.satelliteLedger);

                    // ------------------------------------------------------------
                    // Update user's staked MVN balance depending if he is a satellite or delegator
                    // ------------------------------------------------------------

                    if userIsSatellite then block {

                        // Get user's staked MVN balance from the Doorman Contract
                        const stakedMvnBalance : nat = getUserStakedMvnBalanceFromDoorman(userAddress, s);

                        // Get user's satellite record
                        var satelliteRecord: satelliteRecordType := getSatelliteRecord(userAddress, s);

                        // Update user's satellite record staked MVN balance and storage in satelliteLedger
                        satelliteRecord.stakedMvnBalance  := stakedMvnBalance;
                        s.satelliteLedger[userAddress]    := satelliteRecord;
                    }

                    else block {

                        // check if user has delegated to a satellite
                        const userIsDelegator: bool = Big_map.mem(userAddress, s.delegateLedger);
                    
                        if userIsDelegator then block {
                        
                            // Get user's delegate record
                            var delegatorRecord : delegateRecordType := getDelegateRecord(userAddress, s);

                            // Get satellite address
                            const satelliteAddress : address = delegatorRecord.satelliteAddress;

                            // Check if user is delegated to an active satellite (e.g. satellite may have unregistered)
                            // RegeristeredDateTime is checked in the case the satellite unregistered then registered again before the delegate could undelegate.
                            const userNeedsToUndelegate : bool  = case Big_map.find_opt(satelliteAddress, s.satelliteLedger) of [
                                    Some (_satelliteRecord) -> if _satelliteRecord.registeredDateTime = delegatorRecord.satelliteRegisteredDateTime then False else True
                                |   None                    -> True
                            ];

                            if userNeedsToUndelegate then 

                                // Force User to undelegate if he does not have an active satellite anymore or if its satellite unregistered and registered
                                operations := undelegateFromSatelliteOperation(userAddress) # operations
                            
                            else block {

                                // Get user's staked MVN balance from the Doorman Contract
                                const stakedMvnBalance : nat = getUserStakedMvnBalanceFromDoorman(userAddress, s);

                                // Get satellite record of satellite that user is delegated to
                                var userSatellite: satelliteRecordType := getSatelliteRecord(satelliteAddress, s);

                                // Calculate difference between user's staked MVN balance in delegate record and his current staked MVN balance
                                const stakeAmount: nat = abs(delegatorRecord.delegatedStakedMvnBalance - stakedMvnBalance);

                                // Check if there has been a positive or negative change in user's staked MVN balance and adjust satellite's total delegated amount correspondingly
                                // - If there is a positive change in user's staked MVN balance, increment userSatellite's total delegated amount by the difference (stakeAmount)
                                // - Else If stakeAmount is greater than userSatellite's total delegated amount then fail with error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT
                                // - Else, there is a negative change in user's staked MVN balance, so decrement userSatellite's total delegated amount by the difference (stakeAmount)
                                if stakedMvnBalance > delegatorRecord.delegatedStakedMvnBalance then userSatellite.totalDelegatedAmount := userSatellite.totalDelegatedAmount + stakeAmount
                                else if stakeAmount > userSatellite.totalDelegatedAmount then failwith(error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT)
                                else userSatellite.totalDelegatedAmount := abs(userSatellite.totalDelegatedAmount - stakeAmount);

                                // Add the satellite address to the set of snapshots to update
                                satellitesToUpdate  := Set.add(satelliteAddress, satellitesToUpdate);

                                // Update storage (user's delegate record and his delegated satellite record)
                                delegatorRecord.delegatedStakedMvnBalance  := stakedMvnBalance;

                                s.delegateLedger[userAddress]        := delegatorRecord;
                                s.satelliteLedger[satelliteAddress]  := userSatellite;
                            
                            }
                        
                        } 
                        
                        else skip
                    };

                };

                // Update the satellites snapshots
                operations := updateGovernanceSnapshot(satellitesToUpdate, True, operations, s);

            }
        |   _ -> skip
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
    if s.admin = Mavryk.get_sender() or checkInWhitelistContracts(Mavryk.get_sender(), s.whitelistContracts) then skip else failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED);

    var operations : list(operation) := nil;

    case delegationLambdaAction of [
        |   LambdaUpdateSatelliteStatus(updateSatelliteStatusParams) -> {
                
                // Init variables from parameters
                const satelliteAddress  : address = updateSatelliteStatusParams.satelliteAddress;
                const newStatus         : string  = updateSatelliteStatusParams.newStatus;

                verifyValidSatelliteStatus(newStatus);

                // Update the satellite snapshot on the governance contract before updating its record
                operations := updateGovernanceSnapshot(set[satelliteAddress], True, operations, s);

                // Get satellite record 
                var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);
            
                // Update satellite with new status
                satelliteRecord.status := newStatus;

                // Update storage - satellite record
                s.satelliteLedger[satelliteAddress] := satelliteRecord;
                
            }
        |   _ -> skip
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
