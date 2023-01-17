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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 
    
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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case treasuryFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block {

    checkSenderIsAdmin(s); // check that sender is admin 

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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)
    
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

    checkSenderIsAdmin(s); // check that sender is admin 
    
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
    
    checkSenderIsAdmin(s); // check that sender is admin 

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

                // Check if the sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam : transferDestinationType; const operationList : list(operation)) : list(operation) is
                    block{

                        const transferTokenOperation : operation = case transferParam.token of [
                            |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                            |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                            |   Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                        ];

                    } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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
                    case (Tezos.get_entrypoint_opt("%pauseAll", treasuryAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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
                    case (Tezos.get_entrypoint_opt("%unpauseAll", treasuryAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
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

    checkSenderIsAdmin(s); // check that sender is admin

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

    checkSenderIsAdmin(s);              // check that sender is admin
    checkCreateTreasuryIsNotPaused(s);  // check that %createTreasury entrypoint is not paused (e.g. glass broken)

    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        |   LambdaCreateTreasury(createTreasuryParams) -> {
                
                // Check treasury name length
                if String.length(createTreasuryParams.name) > s.config.treasuryNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Get Governance Proxy Contract Address from the Governance Contract
                const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                const governanceProxyAddress : address = case governanceProxyAddressView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Add TreasuryFactory Address and Governance Proxy Address to whitelistContracts of created treasury
                const treasuryWhitelistContracts : whitelistContractsType = map[
                    ("treasuryFactory") -> (Tezos.get_self_address() : address);
                    ("governanceProxy") -> (governanceProxyAddress);
                ];

                // Add whitelisted tokens (on Treasury Factory) to created treasury 
                const treasuryWhitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

                // Init empty General Contracts map (local contract scope, to be used if necessary)
                const treasuryGeneralContracts : generalContractsType = map[];

                // Init break glass config
                const treasuryBreakGlassConfig: treasuryBreakGlassConfigType = record[
                    transferIsPaused           = False;
                    mintMvkAndTransferIsPaused = False;
                    stakeMvkIsPaused           = False;
                    unstakeMvkIsPaused         = False;
                ];

                // Prepare Treasury Metadata
                const treasuryMetadata: metadataType = Big_map.literal (list [
                    ("", ("74657a6f732d73746f726167653a64617461" : bytes));
                    ("data", createTreasuryParams.metadata);
                ]); 

                // Init Treasury lambdas (stored on Treasury Factory)
                const treasuryLambdaLedger : lambdaLedgerType = s.treasuryLambdaLedger;

                // Prepare Treasury storage
                const originatedTreasuryStorage : treasuryStorageType = record [
                    
                    admin                     = s.admin;                         // admin will be the Treasury Factory admin (i.e. Governance Proxy contract)
                    metadata                  = treasuryMetadata;
                    name                      = createTreasuryParams.name;

                    mvkTokenAddress           = s.mvkTokenAddress;
                    governanceAddress         = s.governanceAddress;

                    whitelistContracts        = treasuryWhitelistContracts;      
                    whitelistTokenContracts   = treasuryWhitelistTokenContracts;      
                    generalContracts          = treasuryGeneralContracts;

                    breakGlassConfig          = treasuryBreakGlassConfig;

                    lambdaLedger              = treasuryLambdaLedger;
                ];

                // Create operation to originate Treasury
                const treasuryOrigination: (operation * address) = createTreasuryFunc(
                    (None: option(key_hash)), 
                    0tez,
                    originatedTreasuryStorage
                );

                // Add newly created Treasury to tracked Treasuries
                s.trackedTreasuries := Set.add(treasuryOrigination.1, s.trackedTreasuries);

                // Add the treasury to the Governance Contract - General Contracts map
                if createTreasuryParams.addToGeneralContracts then {
                    
                    const updateGeneralMapRecord : updateGeneralContractsType = record [
                        generalContractName    = createTreasuryParams.name;
                        generalContractAddress = treasuryOrigination.1;
                    ];

                    const updateContractGeneralMapEntrypoint: contract(updateGeneralContractsType) = case (Tezos.get_entrypoint_opt("%updateGeneralContracts", s.governanceAddress) : option(contract(updateGeneralContractsType))) of [
                            Some (contr) -> contr
                        |   None         -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
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

    checkSenderIsAdmin(s);              // check that sender is admin
    checkTrackTreasuryIsNotPaused(s);   // check that %trackTreasury entrypoint is not paused (e.g. glass broken)

    case treasuryFactoryLambdaAction of [
        |   LambdaTrackTreasury(treasuryContract) -> {
                
                s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
                        True  -> (failwith(error_TREASURY_ALREADY_TRACKED) : set(address))
                    |   False -> Set.add(treasuryContract, s.trackedTreasuries)
                ];

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

    checkSenderIsAdmin(s);               // check that sender is admin
    checkUntrackTreasuryIsNotPaused(s);  // check that %untrackTreasury entrypoint is not paused (e.g. glass broken)

    case treasuryFactoryLambdaAction of [
        |   LambdaUntrackTreasury(treasuryContract) -> {
                
                s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
                        True  -> Set.remove(treasuryContract, s.trackedTreasuries)
                    |   False -> (failwith(error_TREASURY_NOT_TRACKED) : set(address))
                ];
                
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
