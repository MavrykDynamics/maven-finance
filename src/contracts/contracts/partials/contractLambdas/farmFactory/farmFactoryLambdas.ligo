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
    
    checkSenderIsAdmin(s);

    case farmFactoryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
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



(*  UpdateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorage): return is
block {

    // check that source is admin or factory
    checkSenderOrSourceIsCouncil(s);

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

    checkSenderIsAdmin(s);

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

    checkSenderIsAdmin(s);

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
                
                // Add FarmFactory Address to whitelistContracts of created farm
                const councilAddress : address = case s.whitelistContracts["council"] of [ 
                        Some (_address) -> _address
                    |   None            -> failwith("Council contract not found in whitelist contracts")
                ];
                const farmWhitelistContract : whitelistContractsType = map[
                    ("farmFactory")  -> (Tezos.self_address: address);
                    ("council")      -> (councilAddress: address)
                ];

                // Add FarmFactory Address to doormanContracts of created farm
                const doormanAddress : address = case s.generalContracts["doorman"] of [ 
                        Some (_address) -> _address
                    |   None            -> failwith("Doorman contract not found in general contracts")
                ];
                const farmGeneralContracts : generalContractsType = map[
                    ("doorman") -> (doormanAddress: address)
                ];

                // Create needed records for farm contract
                const farmDepositors : big_map(depositor, depositorRecord) = Big_map.empty;
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
                const farmLambdaLedger : big_map(string, bytes) = Big_map.empty;

                // Check wether the farm is infinite or its total blocks has been set
                if not farmInfinite and createFarmParams.plannedRewards.totalBlocks = 0n then failwith("This farm should be either infinite or have a specified duration") else skip;

                // Originate a farm 
                const originatedFarmStorage : farmStorage = record[
                    admin                   = s.admin;                   // If governance is the admin, it makes sense that the factory passes its admin to the farm it creates
                    mvkTokenAddress         = s.mvkTokenAddress;
                    metadata                = farmMetadata;

                    config                  = farmConfig;
                    
                    whitelistContracts      = farmWhitelistContract;      
                    generalContracts        = farmGeneralContracts;

                    breakGlassConfig        = farmBreakGlassConfig;

                    lastBlockUpdate         = Tezos.level;
                    accumulatedMVKPerShare  = 0n;
                    claimedRewards          = farmClaimedRewards;
                    depositors              = farmDepositors;
                    open                    = True ;
                    init                    = True;
                    initBlock               = Tezos.level;

                    lambdaLedger            = farmLambdaLedger;
                ];

                // Do we want to send tez to the farm contract?
                const farmOrigination : (operation * address) = createFarmFunc(
                    (None: option(key_hash)), 
                    0tez,
                    originatedFarmStorage
                );

                s.trackedFarms := Set.add(farmOrigination.1, s.trackedFarms);

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
                        True  -> (failwith("The provided farm contract already exists in the trackedFarms set"): set(address))
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
                    |   False -> (failwith("The provided farm contract does not exist in the trackedFarms set"): set(address))
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
