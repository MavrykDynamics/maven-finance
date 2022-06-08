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
    
    checkSenderIsAllowed(s); 
    
    case treasuryFactoryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case treasuryFactoryLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
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



(* updateConfig lambda *)
function lambdaUpdateConfig(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorage) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case treasuryFactoryLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : treasuryFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : treasuryFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigTreasuryNameMaxLength (_v)     -> s.config.treasuryNameMaxLength         := updateConfigNewValue
                    | Empty (_v)                           -> skip
                ];
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
    
    case treasuryFactoryLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s);

    case treasuryFactoryLambdaAction of [
        | LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsGovernanceSatelliteContract(s);

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

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorage): return is
block {

    checkSenderIsAllowed(s);

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

    checkSenderIsAllowed(s);

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
        | LambdaToggleTrackTreasury(_parameters) -> {
                
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
        | LambdaCreateTreasury(createTreasuryParams) -> {
                
                // Check treasury name length
                if String.length(createTreasuryParams.name) > s.config.treasuryNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
                // Add TreasuryFactory Address and Governance proxy Address to whitelistContracts of created treasury
                const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                const governanceProxyAddress: address = case governanceProxyAddressView of [
                    Some (value) -> value
                | None -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];
                const treasuryWhitelistContracts : whitelistContractsType = map[
                    ("treasuryFactory") -> (Tezos.self_address: address);
                    ("governanceProxy") -> (governanceProxyAddress);
                ];
                const treasuryWhitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;
                const treasuryGeneralContracts : generalContractsType = map[];

                const treasuryBreakGlassConfig: treasuryBreakGlassConfigType = record[
                    transferIsPaused           = False;
                    mintMvkAndTransferIsPaused = False;
                    stakeMvkIsPaused           = False;
                    unstakeMvkIsPaused         = False;
                ];

                // Prepare Treasury Metadata
                const treasuryMetadata: metadata = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createTreasuryParams.metadata)
                ]);
                const treasuryLambdaLedger : map(string, bytes) = s.treasuryLambdaLedger;

                const originatedTreasuryStorage : treasuryStorage = record[
                    admin                     = s.admin;                         // admin will be the governance contract
                    mvkTokenAddress           = s.mvkTokenAddress;
                    governanceAddress         = s.governanceAddress;
                    name                      = createTreasuryParams.name;
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

                // Add the treasury to the governance general contracts map
                if createTreasuryParams.addToGeneralContracts then {
                    const updateGeneralMapRecord : updateGeneralContractsParams = record [
                        generalContractName    = createTreasuryParams.name;
                        generalContractAddress = treasuryOrigination.1;
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
                      True  -> (failwith(error_TREASURY_ALREADY_TRACKED): set(address))
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
                    | False -> (failwith(error_TREASURY_NOT_TRACKED): set(address))
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