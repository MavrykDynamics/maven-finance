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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

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
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address) 
    
    case farmFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin

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
    
    checkSenderIsAdmin(s); // check that sender is admin
    
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
    
    checkSenderIsAdmin(s); // check that sender is admin
    
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

                // Check that sender is admin or from the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam : transferDestinationType; const operationList : list(operation)) : list(operation) is
                    block{

                        const transferTokenOperation : operation = case transferParam.token of [
                            |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                            |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                            |   Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                        ];

                    } with (transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  UpdateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is
block {

    checkSenderIsCouncil(s); // check that sender is the Council Contract

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaUpdateBlocksPerMinute(newBlocksPerMinute) -> {
                
                // Update blocksPerMinute in each farm within trackedFarms
                for farmAddress in set s.trackedFarms 
                block {
                    case (Tezos.get_entrypoint_opt("%updateBlocksPerMinute", farmAddress) : option(contract(nat))) of [
                            Some(contr) -> operations := Tezos.transaction(newBlocksPerMinute, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

                s.config.blocksPerMinute := newBlocksPerMinute;

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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createFarmIsPaused then skip
                else s.breakGlassConfig.createFarmIsPaused := True;

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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
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

    checkSenderIsAdmin(s); // check that sender is admin

    case farmFactoryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        CreateFarm (_v)           -> s.breakGlassConfig.createFarmIsPaused := _v
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

    checkSenderIsAdmin(s);          // check that sender is admin
    checkCreateFarmIsNotPaused(s);  // check that %createFarm entrypoint is not paused (e.g. glass broken)

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        |   LambdaCreateFarm(createFarmParams) -> {

                // Check farm name length
                if String.length(createFarmParams.name) > s.config.farmNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Get Council Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "council", s.governanceAddress);
                const councilAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_VESTING_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];
                
                // Add FarmFactory Address and Council Address to whitelistContracts map of created Farm
                const farmWhitelistContract : whitelistContractsType = map[
                    ("farmFactory")  -> (Tezos.get_self_address() : address);
                    ("council")      -> (councilAddress : address)
                ];
                
                // Init empty General Contracts map (local contract scope, to be used if necessary)
                const farmGeneralContracts : generalContractsType = map[];

                // Create needed records for Farm contract
                const farmClaimedRewards : claimedRewardsType = record[
                    paid   = 0n;
                    unpaid = 0n;
                ];
                const farmForceRewardFromTransfer : bool  = createFarmParams.forceRewardFromTransfer;
                const farmInfinite : bool                 = createFarmParams.infinite;
                const farmTotalRewards : nat              = createFarmParams.plannedRewards.totalBlocks * createFarmParams.plannedRewards.currentRewardPerBlock;
                
                // Init Farm's planned rewards
                const farmPlannedRewards : plannedRewardsType = record[
                    totalBlocks             = createFarmParams.plannedRewards.totalBlocks;
                    currentRewardPerBlock   = createFarmParams.plannedRewards.currentRewardPerBlock;
                    totalRewards            = farmTotalRewards;
                ];

                // Init Farm's LP Token
                const farmLPToken : lpTokenType  = record[
                    tokenAddress        = createFarmParams.lpToken.tokenAddress;
                    tokenId             = createFarmParams.lpToken.tokenId;
                    tokenStandard       = createFarmParams.lpToken.tokenStandard;
                    tokenBalance        = 0n;
                ];

                // Init break glass config
                const farmBreakGlassConfig : farmBreakGlassConfigType = record[
                    depositIsPaused     = False;
                    withdrawIsPaused    = False;
                    claimIsPaused       = False;
                ];

                // Init Farm config
                const farmConfig : farmConfigType = record[
                    lpToken                     = farmLPToken;
                    infinite                    = farmInfinite;
                    forceRewardFromTransfer     = farmForceRewardFromTransfer;
                    blocksPerMinute             = s.config.blocksPerMinute;
                    plannedRewards              = farmPlannedRewards;
                ];

                // Prepare Farm Metadata
                const farmMetadata: metadataType = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createFarmParams.metadata);
                ]); 
                const farmLambdaLedger : lambdaLedgerType = s.farmLambdaLedger;

                // Check whether the farm is infinite or its total blocks has been set
                if not farmInfinite and createFarmParams.plannedRewards.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;

                // Originate a farm 
                const originatedfarmStorageType : farmStorageType = record [

                    admin                   = s.admin;                   // admin will be the Farm Factory admin (i.e. Governance Proxy contract)
                    mvkTokenAddress         = s.mvkTokenAddress;
                    governanceAddress       = s.governanceAddress;
                    metadata                = farmMetadata;

                    name                    = createFarmParams.name;
                    config                  = farmConfig;
                    
                    whitelistContracts      = farmWhitelistContract;      
                    generalContracts        = farmGeneralContracts;

                    breakGlassConfig        = farmBreakGlassConfig;

                    lastBlockUpdate         = Tezos.get_level();
                    accumulatedRewardsPerShare  = 0n;
                    claimedRewards          = farmClaimedRewards;
                    depositors              = big_map[];
                    open                    = True ;
                    init                    = True;
                    initBlock               = Tezos.get_level();

                    lambdaLedger            = farmLambdaLedger;
                ];

                // Create operation to originate Farm
                const farmOrigination : (operation * address) = createFarmFunc(
                    (None: option(key_hash)), 
                    0tez,
                    originatedfarmStorageType
                );

                // Add newly created Farm to tracked Farms
                s.trackedFarms := Set.add(farmOrigination.1, s.trackedFarms);

                // Add newly created Farm to the Governance Contract - General Contracts map
                if createFarmParams.addToGeneralContracts then {

                    const updateGeneralMapRecord : updateGeneralContractsType = record [
                        generalContractName    = createFarmParams.name;
                        generalContractAddress = farmOrigination.1;
                    ];

                    const updateContractGeneralMapEntrypoint: contract(updateGeneralContractsType)    = case (Tezos.get_entrypoint_opt("%updateGeneralContracts", s.governanceAddress) : option(contract(updateGeneralContractsType))) of [
                            Some (contr) -> contr
                        |   None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
                    ];

                    // updateContractGeneralMap operation
                    const updateContractGeneralMapOperation : operation = Tezos.transaction(
                        updateGeneralMapRecord,
                        0tez, 
                        updateContractGeneralMapEntrypoint
                    );

                    operations := updateContractGeneralMapOperation # operations;

                }
                else skip;

                operations := farmOrigination.0 # operations;

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
    
    checkSenderIsAdmin(s);          // check that sender is admin
    checkTrackFarmIsNotPaused(s);   // check that %trackFarm entrypoint is not paused (e.g. glass broken)

    case farmFactoryLambdaAction of [
        |   LambdaTrackFarm(farmContract) -> {
                
                s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
                        True  -> (failwith(error_FARM_ALREADY_TRACKED) : set(address))
                    |   False -> Set.add(farmContract, s.trackedFarms)
                ];

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

    checkSenderIsAdmin(s);          // check that sender is admin
    checkUntrackFarmIsNotPaused(s);   // check that %untrackFarm entrypoint is not paused (e.g. glass broken)

    case farmFactoryLambdaAction of [
        |   LambdaUntrackFarm(farmContract) -> {
                
                s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
                        True  -> Set.remove(farmContract, s.trackedFarms)
                    |   False -> (failwith(error_FARM_NOT_TRACKED) : set(address))
                ];

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
