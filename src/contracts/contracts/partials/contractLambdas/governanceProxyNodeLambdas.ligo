// ------------------------------------------------------------------------------
//
// Governance Proxy Node Lambdas Begin
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

(* executeGovernanceAction lambda *)
function executeGovernanceAction(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    const lambdaName : string = case executeAction of [
      
            (* Update Lambda Function *)
        |   UpdateProxyLambda (_v)                 -> "updateProxyLambda"

            (* Housekeeping *)
        |   SetContractName (_v)                   -> "setContractName"
        |   UpdateContractMetadata (_v)            -> "updateContractMetadata"
        |   UpdateContractGeneralMap (_v)          -> "updateContractGeneralMap"

            (* Config Control *)
        |   UpdateGovernanceConfig (_v)             -> "updateGovernanceConfig"
        |   UpdateGovernanceFinancialConfig (_v)    -> "updateGovernanceFinancialConfig"
        |   UpdateGovernanceSatelliteConfig (_v)    -> "updateGovernanceSatelliteConfig"
        |   UpdateDoormanConfig (_v)                -> "updateDoormanConfig"
        |   UpdateDelegationConfig (_v)             -> "updateDelegationConfig"
        |   UpdateEmergencyConfig (_v)              -> "updateEmergencyConfig"
        |   UpdateBreakGlassConfig (_v)             -> "updateBreakGlassConfig"
        |   UpdateCouncilConfig (_v)                -> "updateCouncilConfig"
        |   UpdateFarmConfig (_v)                   -> "updateFarmConfig"
        |   UpdateFarmFactoryConfig (_v)            -> "updateFarmFactoryConfig"
        |   UpdateAggregatorConfig (_v)             -> "updateAggregatorConfig"
        |   UpdateAggregatorFactoryConfig (_v)      -> "updateAggregatorFactoryConfig"
        |   UpdateTreasuryFactoryConfig (_v)        -> "updateTreasuryFactoryConfig"
        |   UpdateVaultFactoryConfig (_v)           -> "updateVaultFactoryConfig"
        |   UpdateLendingControllerConfig (_v)      -> "updateLendingControllerConfig"

            (* Farm Control *)
        |   InitFarm (_v)                           -> "initFarm"
        |   TrackFarm (_v)                          -> "trackFarm"
        |   UntrackFarm (_v)                        -> "untrackFarm"
        |   CloseFarm (_v)                          -> "closeFarm"

            (* Treasury Control *)
        |   TrackTreasury (_v)                      -> "trackTreasury"
        |   UntrackTreasury (_v)                    -> "untrackTreasury"
        |   UpdateMvkOperatorsTreasury (_v)         -> "updateMvkOperatorsTreasury"
        |   StakeMvkTreasury (_v)                   -> "stakeMvkTreasury"
        |   UnstakeMvkTreasury (_v)                 -> "unstakeMvkTreasury"

            (* Aggregator Control *)
        |   TrackAggregator (_v)                    -> "trackAggregator"
        |   UntrackAggregator (_v)                  -> "untrackAggregator"

            (* Lending Controller Control *)
        |   SetLoanToken (_v)                      -> "setLoanToken"
        |   SetCollateralToken (_v)                -> "setCollateralToken"

    ];

    // Get entrypoint lambda as bytes
    const lambdaBytes : bytes = case s.proxyLambdaLedger[lambdaName] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_PROXY_LAMBDA_NOT_FOUND)
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
                const lambdaName   : string  = params.lambdaName;
                const lambdaBytes  : bytes   = params.func_bytes;

                // Allow override of lambdas
                s.proxyLambdaLedger[lambdaName] := lambdaBytes

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// // ------------------------------------------------------------------------------
// // Basic Lambdas End
// // ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Gov Proxy Node Lambdas Begin
// ------------------------------------------------------------------------------

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



// function updateContractConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
// block {

//     // verify that sender is admin or the Governance Contract address
//     verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

//     var operations : list(operation) := nil;

//     case executeAction of [
//         |   UpdateContractConfig(updateContractConfigParams) -> {

//                 operations := case updateContractConfigParams of [
//                         UpdateGovernanceConfig (_v)             -> updateGovernanceConfig(_v, operations, s)
//                     |   UpdateGovernanceFinancialConfig (_v)    -> updateGovernanceFinancialConfig(_v, operations, s)
//                     |   UpdateGovernanceSatelliteConfig (_v)    -> updateGovernanceSatelliteConfig(_v, operations, s)
//                     |   UpdateDelegationConfig (_v)             -> updateDelegationConfig(_v, operations, s)
//                     |   UpdateEmergencyConfig (_v)              -> updateEmergencyConfig(_v, operations, s)
//                     |   UpdateBreakGlassConfig (_v)             -> updateBreakGlassConfig(_v, operations, s)
//                     |   UpdateCouncilConfig (_v)                -> updateCouncilConfig(_v, operations, s)
//                     |   UpdateFarmConfig (_v)                   -> updateFarmConfig(_v, operations)
//                     |   UpdateFarmFactoryConfig (_v)            -> updateFarmFactoryConfig(_v, operations, s)
//                     |   UpdateAggregatorConfig (_v)             -> updateAggregatorConfig(_v, operations)
//                     |   UpdateAggregatorFactoryConfig (_v)      -> updateAggregatorFactoryConfig(_v, operations, s)
//                     |   UpdateTreasuryFactoryConfig (_v)        -> updateTreasuryFactoryConfig(_v, operations, s)
//                     |   UpdateDoormanConfig (_v)                -> updateDoormanConfig(_v, operations, s)
//                 ]

//             }
//         |   _ -> skip
//     ]

// } with (operations, s)



function updateGovernanceConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateGovernanceConfig(updateContractConfigParams) -> {

                operations := updateGovernanceConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateGovernanceFinancialConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateGovernanceFinancialConfig(updateContractConfigParams) -> {

                operations := updateGovernanceFinancialConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateGovernanceSatelliteConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateGovernanceSatelliteConfig(updateContractConfigParams) -> {

                operations := updateGovernanceSatelliteConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateDoormanConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateDoormanConfig(updateContractConfigParams) -> {

                operations := updateDoormanConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateDelegationConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateDelegationConfig(updateContractConfigParams) -> {

                operations := updateDelegationConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateEmergencyConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateEmergencyConfig(updateContractConfigParams) -> {

                operations := updateEmergencyConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateBreakGlassConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateBreakGlassConfig(updateContractConfigParams) -> {

                operations := updateBreakGlassConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateCouncilConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateCouncilConfig(updateContractConfigParams) -> {

                operations := updateCouncilConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateFarmConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateFarmConfig(updateContractConfigParams) -> {

                operations := updateFarmConfig(updateContractConfigParams, operations);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateFarmFactoryConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateFarmFactoryConfig(updateContractConfigParams) -> {

                operations := updateFarmFactoryConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateAggregatorConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateAggregatorConfig(updateContractConfigParams) -> {

                operations := updateAggregatorConfig(updateContractConfigParams, operations);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateAggregatorFactoryConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateAggregatorFactoryConfig(updateContractConfigParams) -> {

                operations := updateAggregatorFactoryConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateTreasuryFactoryConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateTreasuryFactoryConfig(updateContractConfigParams) -> {

                operations := updateTreasuryFactoryConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateVaultFactoryConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateVaultFactoryConfig(updateContractConfigParams) -> {

                operations := updateVaultFactoryConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateLendingControllerConfig(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   UpdateLendingControllerConfig(updateContractConfigParams) -> {

                operations := updateLendingControllerConfig(updateContractConfigParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)







function initFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function trackFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackFarm(trackContractParams) -> {

                operations := trackFarm(trackContractParams, operations, s);
                
            }
        |   _ -> skip
    ]

} with (operations, s)


function untrackFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackFarm(untrackContractParams) -> {

                operations := untrackFarm(untrackContractParams, operations, s);
                
            }
        |   _ -> skip
    ]

} with (operations, s)



function closeFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function trackTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackTreasury(trackContractParams) -> {

                operations := trackTreasury(trackContractParams, operations, s);
                
            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackTreasury(untrackContractParams) -> {

                operations := untrackTreasury(untrackContractParams, operations, s);
                
            }
        |   _ -> skip
    ]

} with (operations, s)



function updateMvkOperatorsTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function stakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function unstakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function trackAggregator(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackAggregator(trackContractParams) -> {

                operations := trackAggregator(trackContractParams, operations, s);
                
            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackAggregator(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackAggregator(untrackContractParams) -> {

                operations := untrackAggregator(untrackContractParams, operations, s);
                
            }
        |   _ -> skip
    ]

} with (operations, s)

// ------------------------------------------------------------------------------
// Gov Proxy Node Lambdas End
// ------------------------------------------------------------------------------


function setLoanToken(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   SetLoanToken(setLoanTokenParams) -> {

                // Find and get lending controller contract address from the generalContracts map
                const lendingControllerAddress : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

                // Find and get setLoanToken entrypoint of lending controller contract
                const setLoanTokenEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%setLoanToken",
                    lendingControllerAddress) : option(contract(setLoanTokenActionType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_SET_LOAN_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(setLoanTokenActionType))
                    ];

                // Create operation to set loan token
                const setLoanTokenOperation : operation = Tezos.transaction(
                    (setLoanTokenParams),
                    0tez, 
                    setLoanTokenEntrypoint
                );

                operations := setLoanTokenOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function setCollateralToken(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   SetCollateralToken(setCollateralTokenParams) -> {

                // Find and get lending controller contract address from the generalContracts map
                const lendingControllerAddress : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

                // Find and get setCollateralToken entrypoint of lending controller contract
                const setCollateralTokenEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%setCollateralToken",
                    lendingControllerAddress) : option(contract(setCollateralTokenActionType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_SET_COLLATERAL_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(setCollateralTokenActionType))
                    ];

                // Create operation to set collateral token
                const setCollateralTokenOperation : operation = Tezos.transaction(
                    (setCollateralTokenParams),
                    0tez, 
                    setCollateralTokenEntrypoint
                );

                operations := setCollateralTokenOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Proxy Node Lambdas End
//
// ------------------------------------------------------------------------------