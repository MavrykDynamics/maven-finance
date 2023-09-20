// ------------------------------------------------------------------------------
//
// Treasury Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address
    
    case treasuryFactoryLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case treasuryFactoryLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case treasuryFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 

    case treasuryFactoryLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : treasuryFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : treasuryFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigTreasuryNameMaxLength (_v)     -> s.config.treasuryNameMaxLength         := updateConfigNewValue
                    |   Empty (_v)                           -> skip
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case treasuryFactoryLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case treasuryFactoryLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin 

    case treasuryFactoryLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // verify that the sender is admin or the Governance Satellite Contract
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
function lambdaPauseAll(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause entrypoints in Treasury Factory
    // 3. Create and execute operations to %pauseAll entrypoint in tracked Treasuries

    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createTreasuryIsPaused then skip
                else s.breakGlassConfig.createTreasuryIsPaused := True;

                if s.breakGlassConfig.trackTreasuryIsPaused then skip
                else s.breakGlassConfig.trackTreasuryIsPaused := True;

                if s.breakGlassConfig.untrackTreasuryIsPaused then skip
                else s.breakGlassConfig.untrackTreasuryIsPaused := True;

                for treasuryAddress in set s.trackedTreasuries
                block {
                    case (Mavryk.get_entrypoint_opt("%pauseAll", treasuryAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Mavryk.transaction(Unit, 0mav, contr) # operations
                        |   None -> skip
                    ];
                };

            }
        |   _ -> skip
    ];

} with (operations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause entrypoints in Treasury Factory
    // 3. Create and execute operations to %unpauseAll entrypoint in tracked Treasuries

    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
                else skip;

                if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
                else skip;

                if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
                else skip;

                for treasuryAddress in set s.trackedTreasuries
                block {
                    case (Mavryk.get_entrypoint_opt("%unpauseAll", treasuryAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Mavryk.transaction(Unit, 0mav, contr) # operations
                        |   None -> skip
                    ];
                };

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause entrypoint depending on boolean parameter sent 

    verifySenderIsAdmin(s.admin); // verify that sender is admin 

    case treasuryFactoryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        CreateTreasury (_v)       -> s.breakGlassConfig.createTreasuryIsPaused   := _v
                    |   TrackTreasury (_v)        -> s.breakGlassConfig.trackTreasuryIsPaused    := _v
                    |   UntrackTreasury (_v)      -> s.breakGlassConfig.untrackTreasuryIsPaused  := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createTreasury lambda *)
function lambdaCreateTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %createTreasury entrypoint is not paused (e.g. glass broken)
    // 3. Create Treasury parameters
    //    - Validate inputs - Treasury name does not exceed max length
    //    - Add TreasuryFactory Address and Governance Proxy Address to whitelistContracts of created treasury
    //    - Add whitelisted tokens (on Treasury Factory) to created treasury 
    //    - Init empty General Contracts map (local contract scope, to be used if necessary)
    //    - Init break glass config
    //    - Prepare Treasury Metadata
    //    - Init Treasury lambdas (stored on Treasury Factory)
    // 4. Create operation to originate new Treasury
    // 5. Add newly created Treasury to tracked Treasuries
    // 6. Add newly created Treasury to the Governance Contract - General Contracts map

    verifySenderIsAdmin(s.admin);       // verify that sender is admin 
    
    // verify that %createTreasury entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.createTreasuryIsPaused, error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        |   LambdaCreateTreasury(createTreasuryParams) -> {
                
                // Check treasury name length
                validateStringLength(createTreasuryParams.name, s.config.treasuryNameMaxLength, error_WRONG_INPUT_PROVIDED);

                // Prepare new Treasury storage
                const originatedTreasuryStorage : treasuryStorageType = prepareTreasuryStorage(createTreasuryParams, s);

                // Create operation to originate Treasury
                const treasuryOrigination: (operation * address) = createTreasuryFunc(
                    createTreasuryParams.baker, 
                    0mav,
                    originatedTreasuryStorage
                );

                // Add newly created Treasury to tracked Treasuries
                s.trackedTreasuries := trackTreasury(treasuryOrigination.1, s);

                // Add the treasury to the Governance Contract - General Contracts map
                if createTreasuryParams.addToGeneralContracts then {
                    
                    // Create and send updateGeneralContractsMap operation to the Governance Contract
                    const updateGeneralContractsOperation : operation = updateGeneralContractsOperation(
                        createTreasuryParams.name,  // treasury name
                        treasuryOrigination.1,      // treasury contract address
                        s                           // storage
                    );
                    operations := updateGeneralContractsOperation # operations;

                }
                else skip;

                operations := treasuryOrigination.0 # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* trackTreasury lambda *)
function lambdaTrackTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %trackTreasury entrypoint is not paused (e.g. glass broken)
    // 3. Add Treasury Contract to tracked Treasuries

    verifySenderIsAdmin(s.admin);       // verify that sender is admin 
    
    // verify that %trackTreasury entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.trackTreasuryIsPaused, error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED);

    case treasuryFactoryLambdaAction of [
        |   LambdaTrackTreasury(treasuryContract) -> {
                
                s.trackedTreasuries := trackTreasury(treasuryContract, s);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* untrackTreasury lambda *)
function lambdaUntrackTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Check that %untrackTreasury entrypoint is not paused (e.g. glass broken)
    // 3. Remove Treasury Contract from tracked Treasuries

    verifySenderIsAdmin(s.admin);        // verify that sender is admin 
    
    // check that %untrackTreasury entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.untrackTreasuryIsPaused, error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED);

    case treasuryFactoryLambdaAction of [
        |   LambdaUntrackTreasury(treasuryContract) -> {
                
                s.trackedTreasuries := untrackTreasury(treasuryContract, s);
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Treasury Factory Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Treasury Factory Lambdas End
//
// ------------------------------------------------------------------------------
