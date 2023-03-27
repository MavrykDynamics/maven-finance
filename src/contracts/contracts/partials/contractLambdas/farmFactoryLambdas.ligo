// ------------------------------------------------------------------------------
//
// Farm Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case farmFactoryLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case farmFactoryLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case farmFactoryLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : farmFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : farmFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigFarmNameMaxLength (_v)     -> s.config.farmNameMaxLength         := updateConfigNewValue
                    |   Empty (_v)                       -> skip
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmFactoryLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case farmFactoryLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that sender is admin or from the Governance Satellite Contract
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

(*  pauseAll lambda *)
function lambdaPauseAll(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause entrypoints in Farm Factory
    // 3. Create and execute operations to %pauseAll entrypoint in tracked Farms

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createFarmIsPaused then skip
                else s.breakGlassConfig.createFarmIsPaused := True;

                if s.breakGlassConfig.createFarmMTokenIsPaused then skip
                else s.breakGlassConfig.createFarmMTokenIsPaused := True;

                if s.breakGlassConfig.trackFarmIsPaused then skip
                else s.breakGlassConfig.trackFarmIsPaused := True;

                if s.breakGlassConfig.untrackFarmIsPaused then skip
                else s.breakGlassConfig.untrackFarmIsPaused := True;

                for farmAddress in set s.trackedFarms 
                block {
                    case (Tezos.get_entrypoint_opt("%pauseAll", farmAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause entrypoints in Farm Factory
    // 3. Create and execute operations to %unpauseAll entrypoint in tracked Farms

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
                else skip;

                if s.breakGlassConfig.createFarmMTokenIsPaused then s.breakGlassConfig.createFarmMTokenIsPaused := False
                else skip;

                if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
                else skip;

                if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
                else skip;

                for farmAddress in set s.trackedFarms 
                block {
                    case (Tezos.get_entrypoint_opt("%unpauseAll", farmAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        |   _ -> skip
    ];
    
} with (operations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case farmFactoryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        CreateFarm (_v)           -> s.breakGlassConfig.createFarmIsPaused := _v
                    |   CreateFarmMToken (_v)     -> s.breakGlassConfig.createFarmMTokenIsPaused := _v
                    |   UntrackFarm (_v)          -> s.breakGlassConfig.untrackFarmIsPaused := _v
                    |   TrackFarm (_v)            -> s.breakGlassConfig.trackFarmIsPaused := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Factory Lambdas Begin
// ------------------------------------------------------------------------------

(* createFarm lambda *)
function lambdaCreateFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %createFarm entrypoint is not paused (e.g. glass broken)
    // 3. Create Farm parameters
    //      -   Validate inputs - Farm name does not exceed max length
    //      -   Add FarmFactory Address and Council Address to whitelistContracts map of created Farm
    //      -   Init empty General Contracts map (local contract scope, to be used if necessary)
    //      -   Create needed records for Farm contract
    //      -   Init break glass config and farm config
    //      -   Prepare Farm Metadata
    //      -   Check whether the farm is infinite or its total blocks has been set
    // 4. Create operation to originate new Farm
    // 5. Add newly created Farm to tracked Farms
    // 6. Add newly created Farm to the Governance Contract - General Contracts map

    verifySenderIsAdmin(s.admin);   // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.createFarmIsPaused, error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaCreateFarm(createFarmParams) -> {

                // Prepare new Farm storage
                const originatedFarmStorage : farmStorageType = prepareFarmStorage(createFarmParams, s);

                // Create operation to originate Farm
                const farmOrigination : (operation * address) = createFarmFunc(
                    (None: option(key_hash)), 
                    0tez,
                    originatedFarmStorage
                );

                // Add newly created Farm to tracked Farms
                s.trackedFarms := trackFarm(farmOrigination.1, s);

                // Add newly created Farm to the Governance Contract - General Contracts map
                if createFarmParams.addToGeneralContracts then {

                    // Create and send updateGeneralContractsMap operation to the Governance Contract
                    const updateGeneralContractsOperation : operation = updateGeneralContractsOperation(
                        createFarmParams.name,  // farm name
                        farmOrigination.1,      // farm contract address
                        s                       // storage
                    );
                    operations := updateGeneralContractsOperation # operations;

                }
                else skip;

                operations := farmOrigination.0 # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* createFarmMToken lambda *)
function lambdaCreateFarmMToken(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %createFarm entrypoint is not paused (e.g. glass broken)
    // 3. Create Farm parameters
    //      -   Validate inputs - Farm name does not exceed max length
    //      -   Add FarmFactory Address and Council Address to whitelistContracts map of created Farm
    //      -   Init empty General Contracts map (local contract scope, to be used if necessary)
    //      -   Create needed records for Farm contract
    //      -   Init break glass config and farm config
    //      -   Prepare Farm Metadata
    //      -   Check whether the farm is infinite or its total blocks has been set
    // 4. Create operation to originate new Farm
    // 5. Add newly created Farm to tracked Farms
    // 6. Add newly created Farm to the Governance Contract - General Contracts map

    verifySenderIsAdmin(s.admin);   // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.createFarmMTokenIsPaused, error_CREATE_FARM_M_TOKEN_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaCreateFarmMToken(createFarmMTokenParams) -> {

                // Prepare new Farm mToken storage
                const originatedFarmMTokenStorage : farmMTokenStorageType = prepareFarmMTokenStorage(createFarmMTokenParams, s);

                // Create operation to originate Farm mToken
                const farmMTokenOrigination : (operation * address) = createFarmMTokenFunc(
                    (None: option(key_hash)), 
                    0tez,
                    originatedFarmMTokenStorage
                );

                // Add newly created Farm to tracked Farms
                s.trackedFarms := trackFarm(farmMTokenOrigination.1, s);

                // Add newly created Farm to the Governance Contract - General Contracts map
                if createFarmMTokenParams.addToGeneralContracts then {

                    // Create and send updateGeneralContractsMap operation to the Governance Contract
                    const updateGeneralContractsOperation : operation = updateGeneralContractsOperation(
                        createFarmMTokenParams.name,  // farm name
                        farmMTokenOrigination.1,      // farm contract address
                        s                             // storage
                    );
                    operations := updateGeneralContractsOperation # operations;

                }
                else skip;

                operations := farmMTokenOrigination.0 # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* trackFarm lambda *)
function lambdaTrackFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %trackFarm entrypoint is not paused (e.g. glass broken)
    // 3. Add Farm Contract to tracked Farms
    
    verifySenderIsAdmin(s.admin);   // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.trackFarmIsPaused, error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED);

    case farmFactoryLambdaAction of [
        |   LambdaTrackFarm(farmContract) -> {
                
                s.trackedFarms := trackFarm(farmContract, s);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* untrackFarm lambda *)
function lambdaUntrackFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %untrackFarm entrypoint is not paused (e.g. glass broken)
    // 3. Remove Farm Contract from tracked Farms

    verifySenderIsAdmin(s.admin);     // verify that sender is admin
    verifyEntrypointIsNotPaused(s.breakGlassConfig.untrackFarmIsPaused, error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED);

    case farmFactoryLambdaAction of [
        |   LambdaUntrackFarm(farmContract) -> {

                s.trackedFarms := untrackFarm(farmContract, s);

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Farm Factory Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Farm Factory Lambdas End
//
// ------------------------------------------------------------------------------
