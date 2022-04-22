// ------------------------------------------------------------------------------
//
// Treasury Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s); 
    
    case treasuryFactoryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorage) : return is
block {

    checkSenderIsAdmin(s); 
    
    case treasuryFactoryLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);
    
    case treasuryFactoryLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);
    
    case farmFactoryLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s);

    case treasuryFactoryLambdaAction of [
        | LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
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
function lambdaPauseAll(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    var operations: list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createTreasuryIsPaused then skip
                else s.breakGlassConfig.createTreasuryIsPaused := True;

                if s.breakGlassConfig.trackTreasuryIsPaused then skip
                else s.breakGlassConfig.trackTreasuryIsPaused := True;

                if s.breakGlassConfig.untrackTreasuryIsPaused then skip
                else s.breakGlassConfig.untrackTreasuryIsPaused := True;

                for treasuryAddress in set s.trackedTreasuries
                block {
                    case (Tezos.get_entrypoint_opt("%pauseAll", treasuryAddress): option(contract(unit))) of [
                        Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                    |   None -> skip
                    ];
                };

            }
        | _ -> skip
    ];

} with (operations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    var operations: list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
                else skip;

                if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
                else skip;

                if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
                else skip;

                for treasuryAddress in set s.trackedTreasuries
                block {
                    case (Tezos.get_entrypoint_opt("%unpauseAll", treasuryAddress): option(contract(unit))) of [
                        Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                    |   None -> skip
                    ];
                };

            }
        | _ -> skip
    ];

} with (operations, s)



(* togglePauseCreateTreasury lambda *)
function lambdaTogglePauseCreateTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case treasuryFactoryLambdaAction of [
        | LambdaTogglePauseCreateTreasury(_parameters) -> {
                
                if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
                else s.breakGlassConfig.createTreasuryIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseTrackTreasury lambda *)
function lambdaTogglePauseTrackTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case treasuryFactoryLambdaAction of [
        | LambdaToggleTrackTreasury(newAdminAddress) -> {
                
                if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
                else s.breakGlassConfig.trackTreasuryIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseUntrackTreasury lambda *)
function lambdaTogglePauseUntrackTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case treasuryFactoryLambdaAction of [
        | LambdaToggleUntrackTreasury(_parameters) -> {
                
                if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
                else s.breakGlassConfig.untrackTreasuryIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createTreasury lambda *)
function lambdaCreateTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkCreateTreasuryIsNotPaused(s);

    var operations: list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        | LambdaCreateTreasury(treasuryName) -> {
                
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

                operations := treasuryOrigination.0 # operations;

            }
        | _ -> skip
    ];

} with(operations, s)



(* trackTreasury lambda *)
function lambdaTrackTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackTreasuryIsNotPaused(s);

    case treasuryFactoryLambdaAction of [
        | LambdaTrackTreasury(treasuryContract) -> {
                
                s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
                    True  -> (failwith("Error. The provided treasury contract already exists in the trackedTreasuries set"): set(address))
                    | False -> Set.add(treasuryContract, s.trackedTreasuries)
                ];

            }
        | _ -> skip
    ];

} with(noOperations, s)



(* untrackTreasury lambda *)
function lambdaUntrackTreasury(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackTreasuryIsNotPaused(s);

    case treasuryFactoryLambdaAction of [
        | LambdaUntrackTreasury(treasuryContract) -> {
                
                s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
                    True  -> Set.remove(treasuryContract, s.trackedTreasuries)
                    | False -> (failwith("Error. The provided treasury contract does not exist in the trackedTreasuries set"): set(address))
                ];
                
            }
        | _ -> skip
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