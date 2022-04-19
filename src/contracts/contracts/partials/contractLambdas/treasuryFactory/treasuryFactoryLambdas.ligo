// ------------------------------------------------------------------------------
//
// Treasury Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const newAdminAddress: address; var s: treasuryFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const metadataKey: string; const metadataHash: bytes; var s : treasuryFactoryStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryFactoryStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to True
    if s.breakGlassConfig.createTreasuryIsPaused then skip
    else s.breakGlassConfig.createTreasuryIsPaused := True;

    if s.breakGlassConfig.trackTreasuryIsPaused then skip
    else s.breakGlassConfig.trackTreasuryIsPaused := True;

    if s.breakGlassConfig.untrackTreasuryIsPaused then skip
    else s.breakGlassConfig.untrackTreasuryIsPaused := True;

    var operations: list(operation) := nil;

    for treasuryAddress in set s.trackedTreasuries
    block {
        case (Tezos.get_entrypoint_opt("%pauseAll", treasuryAddress): option(contract(unit))) of [
            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
        |   None -> skip
        ];
    };

} with (operations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to False
    if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
    else skip;

    if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
    else skip;

    if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
    else skip;

    var operations: list(operation) := nil;

    for treasuryAddress in set s.trackedTreasuries
    block {
        case (Tezos.get_entrypoint_opt("%unpauseAll", treasuryAddress): option(contract(unit))) of [
            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
        |   None -> skip
        ];
    };

} with (operations, s)



(* togglePauseCreateTreasury lambda *)
function lambdaTogglePauseCreateTreasury(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
    else s.breakGlassConfig.createTreasuryIsPaused := True;

} with (noOperations, s)



(* togglePauseTrackTreasury lambda *)
function lambdaTogglePauseTrackTreasury(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
    else s.breakGlassConfig.trackTreasuryIsPaused := True;

} with (noOperations, s)



(* togglePauseUntrackTreasury lambda *)
function lambdaTogglePauseUntrackTreasury(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
    else s.breakGlassConfig.untrackTreasuryIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createTreasury lambda *)
function lambdaCreateTreasury(const treasuryName: string; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkCreateTreasuryIsNotPaused(s);

    // Add TreasuryFactory Address to whitelistContracts of created treasury
    const treasuryWhitelistContracts : whitelistContractsType = map[
        ("treasuryFactory") -> (Tezos.self_address: address);
        ("governance") -> (s.admin : address);
    ];
    const treasuryWhitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

    const delegationAddress: address = case s.generalContracts["delegation"] of [ 
        Some (_address) -> _address
    |   None -> failwith("Delegation contract not found in general contracts")
    ];
    const treasuryGeneralContracts : generalContractsType = map[
        ("delegation") -> (delegationAddress : address);
    ];

    const treasuryBreakGlassConfig: treasuryBreakGlassConfigType = record[
        transferIsPaused           = False;
        mintMvkAndTransferIsPaused = False;
    ];

    // Prepare Treasury Metadata
    const treasuryMetadataDescription: string = "MAVRYK Treasury Contract";
    const treasuryMetadataVersion: string = "v1.0.0";
    const treasuryMetadataName: string = "MAVRYK " ^ treasuryName ^ " Treasury";
    const treasuryMetadataAuthors: string = "MAVRYK Dev Team <contact@mavryk.finance>";
    const treasuryMetadataPlain: treasuryMetadataType = record[
        name                    = treasuryMetadataName;
        description             = treasuryMetadataDescription;
        version                 = treasuryMetadataVersion;
        authors                 = treasuryMetadataAuthors;
    ];
    const treasuryMetadata: metadata = Big_map.literal (list [
        ("", Bytes.pack(treasuryMetadataPlain));
    ]);
    const treasuryLambdaLedger : big_map(string, bytes) = Big_map.empty;

    const originatedTreasuryStorage : treasuryStorage = record[
        admin                     = s.admin;                         // admin will be the governance contract
        mvkTokenAddress           = s.mvkTokenAddress;
        metadata                  = treasuryMetadata;

        breakGlassConfig          = treasuryBreakGlassConfig;

        whitelistContracts        = treasuryWhitelistContracts;      // whitelist of contracts that can access restricted entrypoints
        whitelistTokenContracts   = treasuryWhitelistTokenContracts;      
        generalContracts          = treasuryGeneralContracts;

        lambdaLedger              = treasuryLambdaLedger;
    ];

    const treasuryOrigination: (operation * address) = createTreasuryFunc(
        (None: option(key_hash)), 
        0tez,
        originatedTreasuryStorage
    );

    s.trackedTreasuries := Set.add(treasuryOrigination.1, s.trackedTreasuries);

} with(list[treasuryOrigination.0], s)



(* trackTreasury lambda *)
function lambdaTrackTreasury (const treasuryContract: address; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackTreasuryIsNotPaused(s);

    s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
          True  -> (failwith("Error. The provided treasury contract already exists in the trackedTreasuries set"): set(address))
        | False -> Set.add(treasuryContract, s.trackedTreasuries)
    ];

} with(noOperations, s)



(* untrackTreasury lambda *)
function lambdaUntrackTreasury (const treasuryContract: address; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackTreasuryIsNotPaused(s);

    s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
          True  -> Set.remove(treasuryContract, s.trackedTreasuries)
        | False -> (failwith("Error. The provided treasury contract does not exist in the trackedTreasuries set"): set(address))
    ];

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Treasury Factory Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Treasury Factory Lambdas End
//
// ------------------------------------------------------------------------------