// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkNoAmount(Unit);                // entrypoint should not receive any tez amount  
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address     // check that sender is admin or the Governance Contract address   

    case governanceProxyLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkNoAmount(Unit);                // entrypoint should not receive any tez amount  
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address     // check that sender is admin or the Governance Contract address   

    case governanceProxyLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    checkNoAmount(Unit);      // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);    // check that sender is admin
    
    case governanceProxyLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkNoAmount(Unit);      // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);    // check that sender is admin
    
    case governanceProxyLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    checkNoAmount(Unit);      // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);    // check that sender is admin
    
    case governanceProxyLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    checkNoAmount(Unit);      // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);    // check that sender is admin

    case governanceProxyLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];


} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent


    var operations : list(operation) := nil;

    case governanceProxyLambdaAction of [
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
                    } with (transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Basic Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceLambdaProxy lambda *)
function executeGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    (* ids to match governanceLambdaIndex.json - id 0 is executeGovernanceLambdaProxy *)
    const id : nat = case executeAction of [
      
            (* Update Lambda Function *)
        |   UpdateProxyLambda (_v)                 -> 1n

            (* General Controls *)
        |   SetContractAdmin (_v)                  -> 2n
        |   SetContractGovernance (_v)             -> 3n
        |   SetContractName (_v)                   -> 4n
        |   SetContractLambda (_v)                 -> 5n
        |   SetFactoryProductLambda (_v)           -> 6n
        |   UpdateContractMetadata (_v)            -> 7n
        |   UpdateContractWhitelistMap (_v)        -> 8n
        |   UpdateContractGeneralMap (_v)          -> 9n
        |   UpdateContractWhitelistTokenMap (_v)   -> 10n
        
            (* Update Configs *)
        |   UpdateContractConfig (_v)              -> 11n

            (* BreakGlass Configs *)
        |   PauseAllContractEntrypoint (_v)        -> 12n
        |   UnpauseAllContractEntrypoint (_v)      -> 13n
        |   ToggleContractEntrypoint (_v)          -> 14n

            (* Governance Control *)
        |   UpdateWhitelistDevelopersSet (_v)      -> 15n
        |   SetGovernanceProxy (_v)                -> 16n

            (* Farm Control *)
        |   CreateFarm (_v)                        -> 17n
        |   TrackFarm (_v)                         -> 18n
        |   UntrackFarm (_v)                       -> 19n
        |   InitFarm (_v)                          -> 20n
        |   CloseFarm (_v)                         -> 21n

            (* Treasury Control *)
        |   CreateTreasury (_v)                    -> 22n
        |   TrackTreasury (_v)                     -> 23n
        |   UntrackTreasury (_v)                   -> 24n
        |   TransferTreasury (_v)                  -> 25n
        |   MintMvkAndTransferTreasury (_v)        -> 26n
        |   UpdateMvkOperatorsTreasury (_v)        -> 27n
        |   StakeMvkTreasury (_v)                  -> 28n
        |   UnstakeMvkTreasury (_v)                -> 29n

            (* Aggregator Control *)
        |   CreateAggregator (_v)                  -> 30n
        |   TrackAggregator (_v)                   -> 31n
        |   UntrackAggregator (_v)                 -> 32n

            (* MVK Token Control *)
        |   UpdateMvkInflationRate (_v)            -> 34n
        |   TriggerMvkInflation (_v)               -> 35n

            (* Vesting Control *)
        |   AddVestee (_v)                         -> 36n
        |   RemoveVestee (_v)                      -> 37n
        |   UpdateVestee (_v)                      -> 38n
        |   ToggleVesteeLock (_v)                  -> 39n
    ];

    // Get entrypoint lambda as bytes
    const lambdaBytes : bytes = case s.proxyLambdaLedger[id] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // Reference: type governanceProxyProxyLambdaFunctionType is (executeActionType * governanceProxyStorageType) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyProxyLambdaFunctionType)) of [
        |   Some(f) -> f(executeAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
  
} with (res.0, s)



(* updateProxyLambda lambda *)
function updateProxyLambda(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    case executeAction of [
        |   UpdateProxyLambda(params) -> {

                // Assign params to constants for better code readability
                const lambdaId     : nat   = params.id;
                const lambdaBytes  : bytes = params.func_bytes;

                // Allow override of lambdas
                s.proxyLambdaLedger[lambdaId] := lambdaBytes

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Basic Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Control Lambdas Begin
// ------------------------------------------------------------------------------

(* setContractAdmin lambda *)
function setContractAdmin(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   SetContractAdmin(setContractAdminParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress  : address   = setContractAdminParams.targetContractAddress;
                const newAdminAddress        : address   = setContractAdminParams.newContractAdmin;

                // Create operation to set new admin on specified contract
                const setNewAdminOperation : operation = Tezos.transaction(
                    newAdminAddress,
                    0tez, 
                    getSetAdminEntrypoint(targetContractAddress)
                );

                operations := setNewAdminOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* setContractGovernance lambda *)
function setContractGovernance(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   SetContractGovernance(setContractGovernanceParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress  : address   = setContractGovernanceParams.targetContractAddress;
                const newGovernanceAddress   : address   = setContractGovernanceParams.newContractGovernance;

                //  Create operation to set new governance address on specified contract
                const setNewGovernanceOperation : operation = Tezos.transaction(
                    newGovernanceAddress,
                    0tez, 
                    getSetGovernanceEntrypoint(targetContractAddress)
                );

                operations := setNewGovernanceOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* setContractLambda lambda *)
function setContractLambda(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   SetContractLambda(setContractLambdaParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress   : address   = setContractLambdaParams.targetContractAddress;
                const targetLambdaName        : string    = setContractLambdaParams.name;
                const lambdaBytes             : bytes     = setContractLambdaParams.func_bytes;

                // Create setLambdaParam
                const setLambdaParams : setLambdaType      = record[
                    name        = targetLambdaName;
                    func_bytes  = lambdaBytes
                ];

                // Create operation to set new lambda on a specified contract
                const setLambdaOperation : operation = Tezos.transaction(
                    setLambdaParams,
                    0tez, 
                    getSetLambdaEntrypoint(targetContractAddress)
                );

                operations := setLambdaOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* setFactoryProductLambda lambda *)
function setFactoryProductLambda(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   SetFactoryProductLambda(setContractLambdaParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress   : address   = setContractLambdaParams.targetContractAddress;
                const targetLambdaName        : string    = setContractLambdaParams.name;
                const lambdaBytes             : bytes     = setContractLambdaParams.func_bytes;

                // Create setLambdaParam
                const setLambdaParams : setLambdaType      = record[
                    name        = targetLambdaName;
                    func_bytes  = lambdaBytes
                ];

                // Create operation to set new product lambda on a specified Factory contract
                const setLambdaOperation : operation = Tezos.transaction(
                    setLambdaParams,
                    0tez, 
                    getSetProductLambdaEntrypoint(targetContractAddress)
                );

                operations := setLambdaOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* updateContractMetadata lambda *)
function updateContractMetadata(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateContractMetadata(updateContractMetadataParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress  : address   = updateContractMetadataParams.targetContractAddress;
                const metadataKey            : string    = updateContractMetadataParams.metadataKey;
                const metadataHash           : bytes     = updateContractMetadataParams.metadataHash;

                const updateMetadataRecord : updateMetadataType = record [
                    metadataKey  = metadataKey;
                    metadataHash = metadataHash;
                ];

                // Create operation to update contract metadata on a specified Contract
                const updateContractMetadataOperation : operation = Tezos.transaction(
                    updateMetadataRecord,
                    0tez, 
                    getUpdateMetadataEntrypoint(targetContractAddress)
                );

                operations := updateContractMetadataOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* updateContractWhitelistMap lambda *)
function updateContractWhitelistMap(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateContractWhitelistMap(updateContractWhitelistMapParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress     : address   = updateContractWhitelistMapParams.targetContractAddress;
                const whitelistContractName     : string    = updateContractWhitelistMapParams.whitelistContractName;
                const whitelistContractAddress  : address   = updateContractWhitelistMapParams.whitelistContractAddress;

                const updateWhitelistMapRecord : updateWhitelistContractsType = record [
                    whitelistContractName    = whitelistContractName;
                    whitelistContractAddress = whitelistContractAddress;
                ];

                // Create operation to update contract whitelist map on a specified contract
                const updateContractWhitelistMapOperation : operation = Tezos.transaction(
                    updateWhitelistMapRecord,
                    0tez, 
                    getUpdateWhitelistContractsEntrypoint(targetContractAddress)
                );

                operations := updateContractWhitelistMapOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* updateContractGeneralMap lambda *)
function updateContractGeneralMap(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateContractGeneralMap(updateContractGeneralMapParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress     : address   = updateContractGeneralMapParams.targetContractAddress;
                const generalContractName       : string    = updateContractGeneralMapParams.generalContractName;
                const generalContractAddress    : address   = updateContractGeneralMapParams.generalContractAddress;

                const updateGeneralMapRecord : updateGeneralContractsType = record [
                    generalContractName    = generalContractName;
                    generalContractAddress = generalContractAddress;
                ];

                // Create operation to update contract general map on a specified contract
                const updateContractGeneralMapOperation : operation = Tezos.transaction(
                    updateGeneralMapRecord,
                    0tez, 
                    getUpdateGeneralContractsEntrypoint(targetContractAddress)
                );

                operations := updateContractGeneralMapOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* updateContractWhitelistTokenMap lambda *)
function updateContractWhitelistTokenMap(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   
 
    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateContractWhitelistTokenMap(updateContractWhitelistTokenMapParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress     : address   = updateContractWhitelistTokenMapParams.targetContractAddress;
                const tokenContractName         : string    = updateContractWhitelistTokenMapParams.tokenContractName;
                const tokenContractAddress      : address   = updateContractWhitelistTokenMapParams.tokenContractAddress;

                const updateWhitelistTokenMapRecord : updateWhitelistTokenContractsType = record [
                    tokenContractName    = tokenContractName;
                    tokenContractAddress = tokenContractAddress;
                ];

                // Create operation to update contract whitelist token map on a specified contract
                const updateContractWhitelistTokenMapOperation : operation = Tezos.transaction(
                    updateWhitelistTokenMapRecord,
                    0tez, 
                    getUpdateWhitelistTokenContractsEntrypoint(targetContractAddress)
                );

                operations := updateContractWhitelistTokenMapOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* setContractName lambda *)
function setContractName(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   SetContractName(updateContractNameParams) -> {

                // assign params to constants for better code readability
                const targetContractAddress     : address   = updateContractNameParams.targetContractAddress;
                const updatedName               : string    = updateContractNameParams.contractName;

                // Create operation to set contract name on a specified contract
                const setNameOperation : operation = Tezos.transaction(
                    updatedName,
                    0tez, 
                    getSetContractNameEntrypoint(targetContractAddress)
                );

                operations := setNameOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// General Control Lambdas End
// ------------------------------------------------------------------------------

function updateContractConfig(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateContractConfig(updateContractConfigParams) -> {

                operations  := case updateContractConfigParams of [
                        UpdateGovernanceConfig (_v)             -> updateGovernanceConfig(_v, operations, s)
                    |   UpdateGovernanceFinancialConfig (_v)    -> updateGovernanceFinancialConfig(_v, operations, s)
                    |   UpdateGovernanceSatelliteConfig (_v)    -> updateGovernanceSatelliteConfig(_v, operations, s)
                    |   UpdateDelegationConfig (_v)             -> updateDelegationConfig(_v, operations, s)
                    |   UpdateEmergencyConfig (_v)              -> updateEmergencyConfig(_v, operations, s)
                    |   UpdateBreakGlassConfig (_v)             -> updateBreakGlassConfig(_v, operations, s)
                    |   UpdateCouncilConfig (_v)                -> updateCouncilConfig(_v, operations, s)
                    |   UpdateFarmConfig (_v)                   -> updateFarmConfig(_v, operations)
                    |   UpdateFarmFactoryConfig (_v)            -> updateFarmFactoryConfig(_v, operations, s)
                    |   UpdateAggregatorConfig (_v)             -> updateAggregatorConfig(_v, operations)
                    |   UpdateAggregatorFactoryConfig (_v)      -> updateAggregatorFactoryConfig(_v, operations, s)
                    |   UpdateTreasuryFactoryConfig (_v)        -> updateTreasuryFactoryConfig(_v, operations, s)
                    |   UpdateDoormanConfig (_v)                -> updateDoormanConfig(_v, operations, s)
                ]

            }
        |   _ -> skip
    ]

} with (operations, s)



function pauseAllContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   PauseAllContractEntrypoint(targetContractAddress) -> {

                // Create operation to pause all entrypoints in a specified contract
                const pauseAllEntrypointOperation : operation = Tezos.transaction(
                    unit,
                    0tez, 
                    getPauseAllEntrypoint(targetContractAddress)
                );

                operations := pauseAllEntrypointOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function unpauseAllContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UnpauseAllContractEntrypoint(targetContractAddress) -> {

                // Create operation to unpause all entrypoints in a specified contract
                const unpauseAllEntrypointOperation : operation = Tezos.transaction(
                    unit,
                    0tez, 
                    getUnpauseAllEntrypoint(targetContractAddress)
                );

                operations := unpauseAllEntrypointOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleContractEntrypoint(toggleContractEntrypointParams) -> {

                operations  := case toggleContractEntrypointParams of [
                        ToggleAggregatorEntrypoint (_v)     -> toggleAggregatorEntrypoint(_v, operations)
                    |   ToggleAggregatorFacEntrypoint (_v)  -> toggleAggregatorFacEntrypoint(_v, operations, s)
                    |   ToggleDelegationEntrypoint (_v)     -> toggleDelegationEntrypoint(_v, operations, s)
                    |   ToggleDoormanEntrypoint (_v)        -> toggleDoormanEntrypoint(_v, operations, s)
                    |   ToggleFarmEntrypoint (_v)           -> toggleFarmEntrypoint(_v, operations)
                    |   ToggleFarmFacEntrypoint (_v)        -> toggleFarmFacEntrypoint(_v, operations, s)
                    |   ToggleTreasuryEntrypoint (_v)       -> toggleTreasuryEntrypoint(_v, operations)
                    |   ToggleTreasuryFacEntrypoint (_v)    -> toggleTreasuryFacEntrypoint(_v, operations, s)
                ]

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateWhitelistDevelopersSet(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UpdateWhitelistDevelopersSet(developer) -> {

                // Create operation to update whitelist developers set in the Governance contract
                const updateWhitelistDevelopersSetOperation : operation = Tezos.transaction(
                    (developer),
                    0tez, 
                    getUpdateWhitelistDevelopersEntrypoint(s.governanceAddress)
                );

                operations := updateWhitelistDevelopersSetOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function setGovernanceProxy(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   SetGovernanceProxy(newGovernanceProxyAddress) -> {

                // Find and get setGovernanceProxy entrypoint of governance contract
                const setGovernanceProxyEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%setGovernanceProxy",
                    s.governanceAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_SET_GOVERNANCE_PROXY_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to set a new Governance Proxy Address in the Governance contract
                const setGovernanceProxyOperation : operation = Tezos.transaction(
                    (newGovernanceProxyAddress),
                    0tez, 
                    setGovernanceProxyEntrypoint
                );

                operations := setGovernanceProxyOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function createFarm(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CreateFarm(createFarmParams) -> {

                // Find and get farmFactory contract address from the generalContracts map
                const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get createFarm entrypoint of farmFactory contract
                const createFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createFarm",
                    farmFactoryAddress) : option(contract(createFarmType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(createFarmType))
                    ];

                // Create operation to create a farm
                const createFarmOperation : operation = Tezos.transaction(
                    (createFarmParams),
                    0tez, 
                    createFarmEntrypoint
                );

                operations := createFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function trackFarm(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackFarm(trackFarmParams) -> {

                // Find and get farmFactory contract address from the generalContracts map
                const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get trackFarm entrypoint of farmFactory contract
                const trackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%trackFarm",
                    farmFactoryAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to track a farm
                const trackFarmOperation : operation = Tezos.transaction(
                    (trackFarmParams),
                    0tez, 
                    trackFarmEntrypoint
                );

                operations := trackFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackFarm(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackFarm(untrackFarmParams) -> {

                // Find and get farmFactory contract address from the generalContracts map
                const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get untrack entrypoint of farmFactory contract
                const untrackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%untrackFarm",
                    farmFactoryAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to untrack a farm
                const untrackFarmOperation : operation = Tezos.transaction(
                    (untrackFarmParams),
                    0tez, 
                    untrackFarmEntrypoint
                );

                operations := untrackFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function initFarm(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   InitFarm(initFarmParams) -> {

                // assign params to constants for better code readability
                const targetFarmAddress       : address             = initFarmParams.targetFarmAddress;
                const farmInitConfig          : initFarmParamsType  = initFarmParams.farmConfig;

                // Find and get initFarm entrypoint of farm contract
                const initFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%initFarm",
                    targetFarmAddress) : option(contract(initFarmParamsType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(initFarmParamsType))
                    ];

                // Create operation to init a farm
                const initFarmOperation : operation = Tezos.transaction(
                    (farmInitConfig),
                    0tez, 
                    initFarmEntrypoint
                );

                operations := initFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function closeFarm(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CloseFarm(farmAddress) -> {

                // Find and get closeFarm entrypoint of farm contract
                const closeFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%closeFarm",
                    farmAddress) : option(contract(unit))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(unit))
                    ];

                // Create operation to close a farm
                const closeFarmOperation : operation = Tezos.transaction(
                    (unit),
                    0tez, 
                    closeFarmEntrypoint
                );

                operations := closeFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function createTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CreateTreasury(createTreasuryParams) -> {

                // Find and get treasuryFactory contract address from the generalContracts map
                const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get createTreasury entrypoint of treasuryFactory contract
                const createTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createTreasury",
                    treasuryFactoryAddress) : option(contract(createTreasuryType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(createTreasuryType))
                    ];

                // Create operation to create a new treasury
                const createTreasuryOperation : operation = Tezos.transaction(
                    (createTreasuryParams),
                    0tez, 
                    createTreasuryEntrypoint
                );

                operations := createTreasuryOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function trackTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackTreasury(trackTreasuryParams) -> {

                // Find and get treasuryFactory contract address from the generalContracts map
                const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get trackTreasury entrypoint of treasuryFactory contract
                const trackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%trackTreasury",
                    treasuryFactoryAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to track a treasury
                const trackTreasuryOperation : operation = Tezos.transaction(
                    (trackTreasuryParams),
                    0tez, 
                    trackTreasuryEntrypoint
                );

                operations := trackTreasuryOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackTreasury(untrackTreasuryParams) -> {

                // Find and get treasuryFactory contract address from the generalContracts map
                const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get untrackTreasury entrypoint of treasuryFactory contract
                const untrackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%untrackTreasury",
                    treasuryFactoryAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to untrack a treasury
                const untrackTreasuryOperation : operation = Tezos.transaction(
                    (untrackTreasuryParams),
                    0tez, 
                    untrackTreasuryEntrypoint
                );

                operations := untrackTreasuryOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function transferTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TransferTreasury(transferTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address               = transferTreasuryParams.targetTreasuryAddress;
                const treasuryTransfer        : transferActionType    = transferTreasuryParams.treasuryTransfer;


                // Find and get transfer entrypoint of treasury contract
                const transferEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%transfer",
                    targetTreasuryAddress) : option(contract(transferActionType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
                    ];

                // Create operation to make a transfer from a specified Treasury Contract
                const transferOperation : operation = Tezos.transaction(
                    (treasuryTransfer),
                    0tez, 
                    transferEntrypoint
                );

                operations := transferOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateMvkOperatorsTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UpdateMvkOperatorsTreasury(updateMvkOperatorsTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address                  = updateMvkOperatorsTreasuryParams.targetTreasuryAddress;
                const updatedOperators        : updateOperatorsType    = updateMvkOperatorsTreasuryParams.treasuryUpdatedOperators;


                // Find and get update_operators entrypoint of treasury contract
                const updateEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%updateMvkOperators",
                    targetTreasuryAddress) : option(contract(updateOperatorsType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(updateOperatorsType))
                    ];

                // Create operation to update operators in a specified Treasury contract
                const updateOperation : operation = Tezos.transaction(
                    (updatedOperators),
                    0tez, 
                    updateEntrypoint
                );

                operations := updateOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function mintMvkAndTransferTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   MintMvkAndTransferTreasury(mintMvkAndTransferTreasuryParams) -> {

            // assign params to constants for better code readability
            const targetTreasuryAddress   : address                  = mintMvkAndTransferTreasuryParams.targetTreasuryAddress;
            const treasuryMint            : mintMvkAndTransferType   = mintMvkAndTransferTreasuryParams.treasuryMint;


            // Find and get mintMvkAndTransfer entrypoint of treasury contract
            const mintEntrypoint = case (Tezos.get_entrypoint_opt(
                "%mintMvkAndTransfer",
                targetTreasuryAddress) : option(contract(mintMvkAndTransferType))) of [
                        Some(contr) -> contr
                    |   None        -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
                ];

            // Create operation to mint MVK and transfer from a specified Treasury contract
            const mintOperation : operation = Tezos.transaction(
                (treasuryMint),
                0tez, 
                mintEntrypoint
            );

            operations := mintOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function stakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   StakeMvkTreasury(stakeMvkTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address       = stakeMvkTreasuryParams.targetTreasuryAddress;
                const treasuryStake           : nat           = stakeMvkTreasuryParams.stakeAmount;

                // Find and get stake entrypoint of treasury contract
                const stakeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%stakeMvk",
                    targetTreasuryAddress) : option(contract(nat))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(nat))
                    ];

                // Create operation to stake MVK in a specified Treasury Contract
                const stakeOperation : operation = Tezos.transaction(
                    (treasuryStake),
                    0tez, 
                    stakeEntrypoint
                );

                operations := stakeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function unstakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UnstakeMvkTreasury(unstakeMvkTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address       = unstakeMvkTreasuryParams.targetTreasuryAddress;
                const treasuryUnstake         : nat           = unstakeMvkTreasuryParams.unstakeAmount;


                // Find and get unstake entrypoint of treasury contract
                const unstakeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%unstakeMvk",
                    targetTreasuryAddress) : option(contract(nat))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(nat))
                    ];

                // Create operation to unstake MVK in a specified Treasury Contract
                const unstakeOperation : operation = Tezos.transaction(
                    (treasuryUnstake),
                    0tez, 
                    unstakeEntrypoint
                );

                operations := unstakeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function createAggregator(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CreateAggregator(createAggregatorParams) -> {

                // Find and get aggregatorFactory contract address
                const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get createAggregator entrypoint of aggregatorFactory contract
                const createAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createAggregator",
                    aggregatorFactoryAddress) : option(contract(createAggregatorParamsType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(createAggregatorParamsType))
                    ];

                // Create operation to create a new aggregator
                const createAggregatorOperation : operation = Tezos.transaction(
                    (createAggregatorParams),
                    0tez, 
                    createAggregatorEntrypoint
                );

                operations := createAggregatorOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function trackAggregator(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackAggregator(trackAggregatorParams) -> {

                // Find and get aggregatorFactory contract address
                const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get trackAggregator entrypoint of aggregatorFactory contract
                const trackAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%trackAggregator",
                    aggregatorFactoryAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to track aggregator
                const trackAggregatorOperation : operation = Tezos.transaction(
                    (trackAggregatorParams),
                    0tez, 
                    trackAggregatorEntrypoint
                );

                operations := trackAggregatorOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackAggregator(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackAggregator(untrackAggregatorParams) -> {

                // Find and get aggregatorFactory contract address
                const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get trackAggregator entrypoint of aggregatorFactory contract
                const untrackAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%untrackAggregator",
                    aggregatorFactoryAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to untrack aggregator
                const untrackAggregatorOperation : operation = Tezos.transaction(
                    (untrackAggregatorParams),
                    0tez, 
                    untrackAggregatorEntrypoint
                );

                operations := untrackAggregatorOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateMvkInflationRate(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UpdateMvkInflationRate(newInflationRate) -> {

                // Find and get updateInflationRate entrypoint of MVK Token contract
                const updateInflationRateEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%updateInflationRate",
                    s.mvkTokenAddress) : option(contract(nat))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UPDATE_INFLATION_RATE_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(nat))
                    ];

                // Create operation to update the inflation rate in the MVK Token Contract
                const updateInflationRateOperation : operation = Tezos.transaction(
                    (newInflationRate),
                    0tez, 
                    updateInflationRateEntrypoint
                );

                operations := updateInflationRateOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function triggerMvkInflation(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TriggerMvkInflation(_parameter) -> {

            // Find and get updateInflationRate entrypoint of MVK Token contract
            const triggerInflationEntrypoint = case (Tezos.get_entrypoint_opt(
                "%triggerInflation",
                s.mvkTokenAddress) : option(contract(unit))) of [
                        Some(contr) -> contr
                    |   None        -> (failwith(error_TRIGGER_INFLATION_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(unit))
                ];

            // Create operation to trigger inflation in the MVK Token Contract
            const triggerInflationOperation : operation = Tezos.transaction(
                (unit),
                0tez, 
                triggerInflationEntrypoint
            );

            operations := triggerInflationOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function addVestee(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   AddVestee(addVesteeParams) -> {

                // Find and get vesting contract address from the generalContracts map
                const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Find and get addVestee entrypoint of Vesting contract
                const addVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%addVestee",
                    vestingAddress) : option(contract(addVesteeType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
                    ];

                // Create operation to add a new vestee
                const addVesteeOperation : operation = Tezos.transaction(
                    (addVesteeParams),
                    0tez, 
                    addVesteeEntrypoint
                );

                operations := addVesteeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function removeVestee(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   RemoveVestee(vesteeAddress) -> {

                // Find and get vesting contract address from the generalContracts map
                const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Find and get removeVestee entrypoint of Vesting contract
                const removeVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%removeVestee",
                    vestingAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to remove a vestee
                const removeVesteeOperation : operation = Tezos.transaction(
                    (vesteeAddress),
                    0tez, 
                    removeVesteeEntrypoint
                );

                operations := removeVesteeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateVestee(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UpdateVestee(updateVesteeParams) -> {

                // Find and get vesting contract address from the generalContracts map
                const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Find and get removeVestee entrypoint of Vesting contract
                const updateVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%updateVestee",
                    vestingAddress) : option(contract(updateVesteeType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
                    ];

                // Create operation to update a vestee
                const updateVesteeOperation : operation = Tezos.transaction(
                    (updateVesteeParams),
                    0tez, 
                    updateVesteeEntrypoint
                );

                operations := updateVesteeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleVesteeLock(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    checkSenderIsAdminOrGovernance(s); // check that sender is admin or the Governance Contract address   

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleVesteeLock(vesteeAddress) -> {

                // Find and get vesting contract address from the generalContracts map
                const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Find and get removeVestee entrypoint of Vesting contract
                const toggleVesteeLockEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%toggleVesteeLock",
                    vestingAddress) : option(contract(address))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
                    ];

                // Create operation to lock or unlock a vestee
                const toggleVesteeLockOperation : operation = Tezos.transaction(
                    (vesteeAddress),
                    0tez, 
                    toggleVesteeLockEntrypoint
                );

                operations := toggleVesteeLockOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------