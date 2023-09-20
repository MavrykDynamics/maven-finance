// ------------------------------------------------------------------------------
//
// Aggregator Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case aggregatorFactoryLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case aggregatorFactoryLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda  *)
function lambdaUpdateMetadata(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{
  
    verifySenderIsAdmin(s.admin); // verify that sender is admin (i.e. Governance Proxy Contract address)

    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function lambdaUpdateConfig(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    verifySenderIsAdmin(s.admin); // verify that sender is admin 

    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : aggregatorFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : aggregatorFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigAggregatorNameMaxLength (_v)  -> s.config.aggregatorNameMaxLength  := updateConfigNewValue
                    |   Empty (_v)                          -> skip
                ];
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block {

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the governanceSatellite contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers)                
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
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
function lambdaPauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createAggregatorIsPaused then skip
                else s.breakGlassConfig.createAggregatorIsPaused := True;

                if s.breakGlassConfig.trackAggregatorIsPaused then skip
                else s.breakGlassConfig.trackAggregatorIsPaused := True;

                if s.breakGlassConfig.untrackAggregatorIsPaused then skip
                else s.breakGlassConfig.untrackAggregatorIsPaused := True;

                if s.breakGlassConfig.distributeRewardStakedMvkIsPaused then skip
                else s.breakGlassConfig.distributeRewardStakedMvkIsPaused := True;

                if s.breakGlassConfig.distributeRewardXtzIsPaused then skip
                else s.breakGlassConfig.distributeRewardXtzIsPaused := True;

                for aggregatorAddress in set s.trackedAggregators
                block {
                    case (Mavryk.get_entrypoint_opt("%pauseAll", aggregatorAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Mavryk.transaction(Unit, 0mav, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createAggregatorIsPaused then s.breakGlassConfig.createAggregatorIsPaused := False
                else skip;

                if s.breakGlassConfig.trackAggregatorIsPaused then s.breakGlassConfig.trackAggregatorIsPaused := False
                else skip;

                if s.breakGlassConfig.untrackAggregatorIsPaused then s.breakGlassConfig.untrackAggregatorIsPaused := False
                else skip;

                if s.breakGlassConfig.distributeRewardStakedMvkIsPaused then s.breakGlassConfig.distributeRewardStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.distributeRewardXtzIsPaused then s.breakGlassConfig.distributeRewardXtzIsPaused := False
                else skip;

                for aggregatorAddress in set s.trackedAggregators
                block {
                    case (Mavryk.get_entrypoint_opt("%unpauseAll", aggregatorAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Mavryk.transaction(Unit, 0mav, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        |   _ -> skip
    ];
    
} with (operations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    verifyNoAmountSent(Unit);   // entrypoint should not receive any mav amount  
    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case aggregatorFactoryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        CreateAggregator (_v)             -> s.breakGlassConfig.createAggregatorIsPaused := _v
                    |   UntrackAggregator (_v)            -> s.breakGlassConfig.untrackAggregatorIsPaused := _v
                    |   TrackAggregator (_v)              -> s.breakGlassConfig.trackAggregatorIsPaused := _v
                    |   DistributeRewardXtz (_v)          -> s.breakGlassConfig.distributeRewardXtzIsPaused := _v
                    |   DistributeRewardStakedMvk (_v)    -> s.breakGlassConfig.distributeRewardStakedMvkIsPaused := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas Begin
// ------------------------------------------------------------------------------

(*  createAggregator lambda  *)
function lambdaCreateAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %createAggregator entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin
    // 2. Initialise parameters for new Aggregator Contract
    //      -   Get Governance Satellite Contract Address from the General Contracts Map on the Governance Contract
    //      -   Add Aggregator Factory Contract and Governance Satellite Contract to Whitelisted Contracts Map on the new Aggregator Contract
    //      -   Prepare Aggregator Metadata
    //      -   Validate name input does not exceed max length
    //      -   Declare new Aggregator Storage 
    // 3. Contract origination
    // 4. Add new Aggregator to Tracked Aggregators map on Aggregator Factory
    // 5. Register Aggregator operation to Governance Satellite Contract
    // 6. If addToGeneralContracts boolean is True - add new Aggregator to the Governance Contract - General Contracts Map
    // 7. Execute operations
    
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.createAggregatorIsPaused, error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaCreateAggregator(createAggregatorParams) -> {
                
                // Prepare new Aggregator storage
                const originatedAggregatorStorage : aggregatorStorageType = prepareAggregatorStorage(createAggregatorParams, s);

                // Contract origination
                const aggregatorOrigination : (operation * address) = createAggregatorFunc(
                    (None: option(key_hash)),
                    0mav,
                    originatedAggregatorStorage
                );
                
                // Add new Aggregator to Tracked Aggregators map on Aggregator Factory
                s.trackedAggregators := trackAggregator(aggregatorOrigination.1, s);

                // If addToGeneralContracts boolean is True - add new Aggregator to the Governance Contract - General Contracts Map
                if createAggregatorParams.addToGeneralContracts = True then {
                    
                    // Create and send updateGeneralContractsMap operation to the Governance Contract
                    const updateGeneralContractsOperation : operation = updateGeneralContractsOperation(
                        createAggregatorParams.name,  // aggregator name
                        aggregatorOrigination.1,      // aggregator contract address
                        s                             // storage
                    );
                    operations := updateGeneralContractsOperation # operations;

                }
                else skip;

                // originate aggregator operation
                operations := aggregatorOrigination.0 # operations;

                // Set Aggregator Reference operation to Governance Satellite Contract
                const setAggregatorReferenceOperation : operation = setAggregatorReferenceOperation(
                    createAggregatorParams.name,  // aggregator name
                    aggregatorOrigination.1,      // aggregator contract address
                    s                             // storage
                );

                operations := setAggregatorReferenceOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  trackAggregator lambda  *)
function lambdaTrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %trackAggregator entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin
    // 2. Check if Aggregator Name exists (e.g. BTC/USD) 
    //      -   Add Aggregator Contract to Tracked Aggregators Map if Aggregator Name does not exist

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.trackAggregatorIsPaused, error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaTrackAggregator(trackAggregatorParams) -> {
                
                // add aggregator to tracked aggregators set
                s.trackedAggregators := trackAggregator(trackAggregatorParams, s);

                // Get the aggregator's name
                const aggregatorName : string = getAggregatorName(trackAggregatorParams);

                // Set Aggregator Reference operation to Governance Satellite Contract
                const setAggregatorReferenceOperation : operation = setAggregatorReferenceOperation(
                    aggregatorName,               // aggregator name
                    trackAggregatorParams,        // aggregator contract address
                    s                             // storage
                );

                operations := setAggregatorReferenceOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  untrackAggregator lambda  *)
function lambdaUntrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %untrackAggregator entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin
    // 2. Remove Aggregator Contract from Tracked Aggregators Map 

    verifySenderIsAdmin(s.admin);               // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.untrackAggregatorIsPaused, error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaUntrackAggregator(untrackAggregatorParams) -> {

                // remove aggregator from tracked aggregators set
                s.trackedAggregators := untrackAggregator(untrackAggregatorParams, s);

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Lambdas Begin
// ------------------------------------------------------------------------------

(*  distributeRewardXtz lambda  *)
function lambdaDistributeRewardXtz(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %distributeRewardXtz entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is from a tracked Aggregator Contract
    // 2. Get Aggregator Treasury Contract Address from the General Contracts Map on the Governance Contract
    // 3. Create operation to transfer XTZ reward from Aggregator Treasury to oracle recipient


    // Check that %distributeRewardXtz entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.distributeRewardXtzIsPaused, error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaDistributeRewardXtz(distributeRewardXtzParams) -> {
                
                // Verify that sender is from a tracked Aggregator Contract
                verifySenderIsTrackedAggregators(s);

                // init params
                const recipient          : address    = distributeRewardXtzParams.recipient;
                const reward             : nat        = distributeRewardXtzParams.reward;

                // Create operation to distribute XTZ reward from Aggregator Treasury to oracle recipient (satellite)
                const distributeRewardXtzOperation : operation = distributeRewardXtzOperation(recipient, reward, s);
                operations := distributeRewardXtzOperation # operations;

            }
        |   _ -> skip
    ];    

} with (operations, s)



(*  distributeRewardStakedMvk lambda  *)
function lambdaDistributeRewardStakedMvk(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %distributeRewardStakedMvk entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is from a tracked Aggregator Contract
    // 2. Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    // 3. Create operation to distribute staked MVK reward to oracle recipient through the %distributeReward entrypoint on the Delegation Contract

    // Check that %distributeRewardStakedMvk entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.distributeRewardStakedMvkIsPaused, error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaDistributeRewardStakedMvk(distributeRewardStakedMvkParams) -> {
                
                // Verify that sender is from a tracked Aggregator Contract
                verifySenderIsTrackedAggregators(s);

                // Create operation to distribute staked MVK reward to eligible oracle recipient (satellite) through the %distributeReward entrypoint on the Delegation Contract
                const distributeRewardStakedMvkOperation : operation = distributeRewardStakedMvkOperation(
                    distributeRewardStakedMvkParams.eligibleSatellites,
                    distributeRewardStakedMvkParams.totalStakedMvkReward,
                    s 
                );

                operations := distributeRewardStakedMvkOperation # operations;

            }
        |   _ -> skip
    ];    

} with (operations, s)

// ------------------------------------------------------------------------------
// Aggregator Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Aggregator Factory Lambdas End
//
// ------------------------------------------------------------------------------