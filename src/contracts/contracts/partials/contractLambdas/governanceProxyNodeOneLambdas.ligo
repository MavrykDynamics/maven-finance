// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case governanceProxyNodeLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case governanceProxyNodeLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin

    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];


} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent


    var operations : list(operation) := nil;

    case governanceProxyNodeLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the Governance Satellite Contract
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
// Basic Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceLambdaProxy lambda *)
function executeGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

            (* Track / Untrack Control *)
        |   TrackContract (_v)                     -> 29n
        |   UntrackContract (_v)                   -> 30n
    ];

    // Get entrypoint lambda as bytes
    const lambdaBytes : bytes = case s.proxyLambdaLedger[id] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // Reference: type governanceProxyNodeProxyLambdaFunctionType is (executeActionType * governanceProxyNodeStorageType) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyNodeProxyLambdaFunctionType)) of [
        |   Some(f) -> f(executeAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
  
} with (res.0, s)



(* updateProxyLambda lambda *)
function updateProxyLambda(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

// // ------------------------------------------------------------------------------
// // Basic Lambdas End
// // ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Control Lambdas Begin
// ------------------------------------------------------------------------------

(* setContractAdmin lambda *)
function setContractAdmin(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function setContractGovernance(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function setContractLambda(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function setFactoryProductLambda(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function updateContractMetadata(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function updateContractWhitelistMap(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function updateContractGeneralMap(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
function updateContractWhitelistTokenMap(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);
 
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
function setContractName(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

function updateContractConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateContractConfig(updateContractConfigParams) -> {

                operations := case updateContractConfigParams of [
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



function pauseAllContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function unpauseAllContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function toggleContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleContractEntrypoint(toggleContractEntrypointParams) -> {

                operations := case toggleContractEntrypointParams of [
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



function updateWhitelistDevelopersSet(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function setGovernanceProxy(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function trackContract(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackContract(trackContractParams) -> {

                operations := case trackContractParams of [
                        TrackFarm (_v)          -> trackFarm(_v, operations, s)
                    |   TrackTreasury (_v)      -> trackTreasury(_v, operations, s)
                    |   TrackAggregator (_v)    -> trackAggregator(_v, operations, s)
                ]
            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackContract(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackContract(trackContractParams) -> {

                operations := case trackContractParams of [
                        UntrackFarm (_v)          -> untrackFarm(_v, operations, s)
                    |   UntrackTreasury (_v)      -> untrackTreasury(_v, operations, s)
                    |   UntrackAggregator (_v)    -> untrackAggregator(_v, operations, s)
                ]
            }
        |   _ -> skip
    ]

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------