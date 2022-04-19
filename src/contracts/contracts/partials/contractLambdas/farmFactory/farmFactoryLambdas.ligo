// ------------------------------------------------------------------------------
//
// Farm Factory Lambdas Begin
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const newAdminAddress : address; var s : farmFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const metadataKey : string; const metadataHash : bytes; var s : farmFactoryStorage) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsParams; var s : farmFactoryStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsParams; var s : farmFactoryStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(*  UpdateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const newBlocksPerMinute : nat; var s : farmFactoryStorage): return is
block {

    // check that source is admin or factory
    checkSenderOrSourceIsCouncil(s);

    var operations : list(operation) := nil;

    for farmAddress in set s.trackedFarms 
    block {
        case (Tezos.get_entrypoint_opt("%updateBlocksPerMinute", farmAddress): option(contract(nat))) of [
                Some(contr) -> operations := Tezos.transaction(newBlocksPerMinute, 0tez, contr) # operations
            |   None        -> skip
        ];
    };

    s.config.blocksPerMinute := newBlocksPerMinute;

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(var s : farmFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to True
    if s.breakGlassConfig.createFarmIsPaused then skip
    else s.breakGlassConfig.createFarmIsPaused := True;

    if s.breakGlassConfig.trackFarmIsPaused then skip
    else s.breakGlassConfig.trackFarmIsPaused := True;

    if s.breakGlassConfig.untrackFarmIsPaused then skip
    else s.breakGlassConfig.untrackFarmIsPaused := True;

    var operations : list(operation) := nil;

    for farmAddress in set s.trackedFarms 
    block {
        case (Tezos.get_entrypoint_opt("%pauseAll", farmAddress): option(contract(unit))) of [
                Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
            |   None        -> skip
        ];
    };

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(var s : farmFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to False
    if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
    else skip;

    if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
    else skip;

    if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
    else skip;

    var operations: list(operation) := nil;

    for farmAddress in set s.trackedFarms 
    block {
        case (Tezos.get_entrypoint_opt("%unpauseAll", farmAddress): option(contract(unit))) of [
                Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
            |   None        -> skip
        ];
    };

} with (operations, s)



(*  togglePauseCreateFarm lambda *)
function lambdaTogglePauseCreateFarm(var s : farmFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
    else s.breakGlassConfig.createFarmIsPaused := True;

} with (noOperations, s)



(*  togglePauseUntrackFarm lambda *)
function lambdaTogglePauseUntrackFarm(var s : farmFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
    else s.breakGlassConfig.untrackFarmIsPaused := True;

} with (noOperations, s)



(*  togglePauseTrackFarm lambda *)
function lambdaTogglePauseTrackFarm(var s : farmFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
    else s.breakGlassConfig.trackFarmIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Factory Lambdas Begin
// ------------------------------------------------------------------------------

(* createFarm lambda *)
function lambdaCreateFarm(const createFarmParams : createFarmType; var s : farmFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkCreateFarmIsNotPaused(s);

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
    const farmDelegators : big_map(delegator, delegatorRecord) = Big_map.empty;
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
    const farmMetadataDescription   : string   = "MAVRYK Farm Contract";
    const farmMetadataVersion       : string   = "v1.0.0";
    
    const farmMetadataLPAddress     : address  = farmLPToken.tokenAddress;
    const farmMetadataLPOrigin      : string   = createFarmParams.lpTokenOrigin;
    const farmMetadataToken0Symbol  : string   = createFarmParams.tokenPair.token0.symbol;
    const farmMetadataToken1Symbol  : string   = createFarmParams.tokenPair.token1.symbol ;

    const farmMetadataName          : string   = "MAVRYK " ^ farmMetadataToken0Symbol ^ "-" ^ farmMetadataToken1Symbol ^ " Farm";
    const farmMetadataAuthors       : string   = "MAVRYK Dev Team <contact@mavryk.finance>";

    const farmMetadataPlain : farmMetadataType = record[
        name                    = farmMetadataName;
        description             = farmMetadataDescription;
        version                 = farmMetadataVersion;

        liquidityPairToken      = record[
            tokenAddress        = farmMetadataLPAddress;
            origin              = farmMetadataLPOrigin;
            token0              = createFarmParams.tokenPair.token0;
            token1              = createFarmParams.tokenPair.token1;
        ];
        
        authors                 = farmMetadataAuthors;
    ];
    const farmMetadata : metadata = Big_map.literal (list [
        ("", Bytes.pack(farmMetadataPlain));
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
        delegators              = farmDelegators;
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

} with(list[farmOrigination.0], s)



(* trackFarm lambda *)
function lambdaTrackFarm (const farmContract : address; var s : farmFactoryStorage): return is 
block{
    
    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackFarmIsNotPaused(s);

    s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
        True -> (failwith("The provided farm contract already exists in the trackedFarms set"): set(address))
    |   False -> Set.add(farmContract, s.trackedFarms)
    ];

} with(noOperations, s)



(* untrackFarm lambda *)
function lambdaUntrackFarm (const farmContract : address; var s : farmFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackFarmIsNotPaused(s);

    s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
        True -> Set.remove(farmContract, s.trackedFarms)
    |   False -> (failwith("The provided farm contract does not exist in the trackedFarms set"): set(address))
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
