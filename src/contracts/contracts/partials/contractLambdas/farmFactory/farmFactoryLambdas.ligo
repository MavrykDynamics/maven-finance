// ------------------------------------------------------------------------------
//
// Farm Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {
    
    checkSenderIsAllowed(s);

    case farmFactoryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case farmFactoryLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage) : return is
block {
    
    checkSenderIsAdmin(s); 
    
    case farmFactoryLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case farmFactoryLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : farmFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : farmFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigFarmNameMaxLength (_v)     -> s.config.farmNameMaxLength         := updateConfigNewValue
                    | Empty (_v)                       -> skip
                ];
            }
        | _ -> skip
    ];
  
} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case farmFactoryLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case farmFactoryLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s: farmFactoryStorage): return is
block {

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
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



(*  UpdateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    // check that source is admin or factory
    checkSenderIsCouncil(s);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        | LambdaUpdateBlocksPerMinute(newBlocksPerMinute) -> {
                
                for farmAddress in set s.trackedFarms 
                block {
                    case (Tezos.get_entrypoint_opt("%updateBlocksPerMinute", farmAddress): option(contract(nat))) of [
                            Some(contr) -> operations := Tezos.transaction(newBlocksPerMinute, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

                s.config.blocksPerMinute := newBlocksPerMinute;

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
function lambdaPauseAll(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    checkSenderIsAllowed(s);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createFarmIsPaused then skip
                else s.breakGlassConfig.createFarmIsPaused := True;

                if s.breakGlassConfig.trackFarmIsPaused then skip
                else s.breakGlassConfig.trackFarmIsPaused := True;

                if s.breakGlassConfig.untrackFarmIsPaused then skip
                else s.breakGlassConfig.untrackFarmIsPaused := True;

                for farmAddress in set s.trackedFarms 
                block {
                    case (Tezos.get_entrypoint_opt("%pauseAll", farmAddress): option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        | _ -> skip
    ];

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    checkSenderIsAllowed(s);

    var operations: list(operation) := nil;

    case farmFactoryLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
                else skip;

                if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
                else skip;

                if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
                else skip;

                for farmAddress in set s.trackedFarms 
                block {
                    case (Tezos.get_entrypoint_opt("%unpauseAll", farmAddress): option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        | _ -> skip
    ];
    
} with (operations, s)



(*  togglePauseCreateFarm lambda *)
function lambdaTogglePauseCreateFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case farmFactoryLambdaAction of [
        | LambdaTogglePauseCreateFarm(_parameters) -> {
                
                if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
                else s.breakGlassConfig.createFarmIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseUntrackFarm lambda *)
function lambdaTogglePauseUntrackFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case farmFactoryLambdaAction of [
        | LambdaTogglePauseUntrackFarm(_parameters) -> {
                
                if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
                else s.breakGlassConfig.untrackFarmIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseTrackFarm lambda *)
function lambdaTogglePauseTrackFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case farmFactoryLambdaAction of [
        | LambdaTogglePauseTrackFarm(_parameters) -> {
                
                if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
                else s.breakGlassConfig.trackFarmIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Factory Lambdas Begin
// ------------------------------------------------------------------------------

(* createFarm lambda *)
function lambdaCreateFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkCreateFarmIsNotPaused(s);

    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        | LambdaCreateFarm(createFarmParams) -> {

                // Check farm name length
                if String.length(createFarmParams.name) > s.config.farmNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
                // Add FarmFactory Address to whitelistContracts of created farm
                const councilAddress : address = case s.whitelistContracts["council"] of [ 
                        Some (_address) -> _address
                    |   None            -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
                ];
                const farmWhitelistContract : whitelistContractsType = map[
                    ("farmFactory")  -> (Tezos.self_address: address);
                    ("council")      -> (councilAddress: address)
                ];
                const farmGeneralContracts : generalContractsType = map[];

                // Create needed records for farm contract
                const farmClaimedRewards : claimedRewards = record[
                    paid=0n;
                    unpaid=0n;
                ];
                const farmForceRewardFromTransfer : bool  = createFarmParams.forceRewardFromTransfer;
                const farmInfinite : bool                 = createFarmParams.infinite;
                const farmTotalRewards : nat              = createFarmParams.plannedRewards.totalBlocks * createFarmParams.plannedRewards.currentRewardPerBlock;
                const farmPlannedRewards : plannedRewards = record[
                    totalBlocks             = createFarmParams.plannedRewards.totalBlocks;
                    currentRewardPerBlock   = createFarmParams.plannedRewards.currentRewardPerBlock;
                    totalRewards            = farmTotalRewards;
                ];
                const farmLPToken : lpToken  = record[
                    tokenAddress        = createFarmParams.lpToken.tokenAddress;
                    tokenId             = createFarmParams.lpToken.tokenId;
                    tokenStandard       = createFarmParams.lpToken.tokenStandard;
                    tokenBalance        = 0n;
                ];
                const farmBreakGlassConfig : farmBreakGlassConfigType = record[
                    depositIsPaused     = False;
                    withdrawIsPaused    = False;
                    claimIsPaused       = False;
                ];
                const farmConfig : farmConfigType = record[
                    lpToken                     = farmLPToken;
                    infinite                    = farmInfinite;
                    forceRewardFromTransfer     = farmForceRewardFromTransfer;
                    blocksPerMinute             = s.config.blocksPerMinute;
                    plannedRewards              = farmPlannedRewards;
                ];

                // Prepare Farm Metadata
                const farmMetadata: metadata = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createFarmParams.metadata);
                ]); 
                const farmLambdaLedger : map(string, bytes) = s.farmLambdaLedger;

                // Check wether the farm is infinite or its total blocks has been set
                if not farmInfinite and createFarmParams.plannedRewards.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;

                // Originate a farm 
                const originatedFarmStorage : farmStorage = record[
                    admin                   = s.admin;                   // If governance proxy is the admin, it makes sense that the factory passes its admin to the farm it creates
                    mvkTokenAddress         = s.mvkTokenAddress;
                    governanceAddress       = s.governanceAddress;
                    metadata                = farmMetadata;

                    name                    = createFarmParams.name;
                    config                  = farmConfig;
                    
                    whitelistContracts      = farmWhitelistContract;      
                    generalContracts        = farmGeneralContracts;

                    breakGlassConfig        = farmBreakGlassConfig;

                    lastBlockUpdate         = Tezos.level;
                    accumulatedRewardsPerShare  = 0n;
                    claimedRewards          = farmClaimedRewards;
                    depositors              = big_map[];
                    open                    = True ;
                    init                    = True;
                    initBlock               = Tezos.level;

                    lambdaLedger            = farmLambdaLedger;
                ];

                // Originate the farm
                const farmOrigination : (operation * address) = createFarmFunc(
                    (None: option(key_hash)), 
                    0tez,
                    originatedFarmStorage
                );

                s.trackedFarms := Set.add(farmOrigination.1, s.trackedFarms);

                // Add the farm to the governance general contracts map
                if createFarmParams.addToGeneralContracts then {
                    const updateGeneralMapRecord : updateGeneralContractsParams = record [
                        generalContractName    = createFarmParams.name;
                        generalContractAddress = farmOrigination.1;
                    ];

                    const updateContractGeneralMapEntrypoint: contract(updateGeneralContractsParams)    = case (Tezos.get_entrypoint_opt("%updateGeneralContracts", s.governanceAddress): option(contract(updateGeneralContractsParams))) of [
                        Some (contr) -> contr
                    |   None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsParams))
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
        | _ -> skip
    ];

} with(operations, s)



(* trackFarm lambda *)
function lambdaTrackFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is 
block{
    
    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackFarmIsNotPaused(s);

    case farmFactoryLambdaAction of [
        | LambdaTrackFarm(farmContract) -> {
                
                s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
                        True  -> (failwith(error_FARM_ALREADY_TRACKED): set(address))
                    |   False -> Set.add(farmContract, s.trackedFarms)
                ];

            }
        | _ -> skip
    ];

} with(noOperations, s)



(* untrackFarm lambda *)
function lambdaUntrackFarm(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackFarmIsNotPaused(s);

    case farmFactoryLambdaAction of [
        | LambdaUntrackFarm(farmContract) -> {
                
                s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
                        True  -> Set.remove(farmContract, s.trackedFarms)
                    |   False -> (failwith(error_FARM_NOT_TRACKED): set(address))
                ];

            }
        | _ -> skip
    ];

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Farm Factory Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Farm Factory Lambdas End
//
// ------------------------------------------------------------------------------
