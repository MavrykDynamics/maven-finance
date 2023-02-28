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
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

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
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

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

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
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
    
    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
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

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
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

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin

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

(*  setProxyNodeAddress lambda *)
function lambdaSetProxyNodeAddress(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    // Steps Overview:    
    // 1.
    
    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case governanceProxyLambdaAction of [
        |   LambdaSetProxyNodeAddress(setProxyNodeAddressParams) -> {
                
                const setAction         : string  = setProxyNodeAddressParams.setAction; 
                const proxyNodeAddress  : address = setProxyNodeAddressParams.proxyNodeAddress; 

                if      setAction = "add"    then s.proxyNodeAddresses := Set.add(proxyNodeAddress, s.proxyNodeAddresses) 
                else if setAction = "remove" then s.proxyNodeAddresses := Set.remove(proxyNodeAddress, s.proxyNodeAddresses)
                else failwith(error_INVALID_ACTION_TYPE);
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  processGovernanceAction lambda *)
function lambdaProcessGovernanceAction(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    // Steps Overview:    
    // 1.

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case governanceProxyLambdaAction of [
        |   LambdaProcessGovernanceAction(processGovernanceActionParams) -> {

                // init variables
                const entrypointName    : string  = processGovernanceActionParams.entrypointName;
                const encodedCode       : bytes   = processGovernanceActionParams.encodedCode;

                const proxyNodeAddress  : address = getProxyNodeAddress(entrypointName, s);

                const executeGovernanceActionOperation : operation = executeGovernanceActionOperation(encodedCode, proxyNodeAddress);
                operations := executeGovernanceActionOperation # operations;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  setLambdaPointer lambda *)
function lambdaSetLambdaPointer(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is
block {

    // Steps Overview:    
    // 1.
    
    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin

    var operations : list(operation) := nil;

    case governanceProxyLambdaAction of [
        |   LambdaSetLambdaPointer(setLambdaPointerParams) -> {

                const setAction         : string            = setLambdaPointerParams.setAction; 
                const entrypointName    : string            = setLambdaPointerParams.entrypointName; 
                const proxyNodeAddress  : option(address)   = setLambdaPointerParams.proxyNodeAddress;

                if      setAction = "add"    then s := addLambdaPointer(entrypointName, proxyNodeAddress, s)
                else if setAction = "update" then s := updateLambdaPointer(entrypointName, proxyNodeAddress, s)
                else if setAction = "remove" then s := removeLambdaPointer(entrypointName, s)
                else failwith(error_INVALID_ACTION_TYPE);
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* executeGovernanceAction lambda *)
function executeGovernanceAction(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    // verify that sender is self or admin or Governance contract
    verifySenderIsSelfOrAdminOrGovernance(s);

    const lambdaName : string = case executeAction of [
      
            (* Update Lambda Function *)
        |   UpdateProxyLambda (_v)                 -> "updateProxyLambda"

            (* Governance Proxy Controls *)
        |   GovSetLambdaPointer (_v)               -> "govSetLambdaPointer"
        |   GovSetProxyNodeAddress (_v)            -> "govSetProxyNodeAddress"

            (* General Controls *)
        |   SetContractAdmin (_v)                  -> "setContractAdmin"
        |   SetContractGovernance (_v)             -> "setContractGovernance"
        |   SetContractLambda (_v)                 -> "setContractLambda"
        |   SetFactoryProductLambda (_v)           -> "setFactoryProductLambda"
        |   UpdateContractWhitelistMap (_v)        -> "updateContractWhitelistMap"
        |   UpdateContractWhitelistTokenMap (_v)   -> "updateContractWhitelistTokenMap"

            (* Governance Control *)
        |   UpdateWhitelistDevelopersSet (_v)      -> "updateWhitelistDevelopersSet"
        |   SetGovernanceProxy (_v)                -> "setGovernanceProxy"

            (* Create Contracts *)
        |   CreateFarm (_v)                        -> "createFarm"
        |   CreateAggregator (_v)                  -> "createAggregator"
        |   CreateTreasury (_v)                    -> "createTreasury"

            (* BreakGlass Configs *)
        |   PauseAllContractEntrypoint (_v)        -> "pauseAllContractEntrypoint"
        |   UnpauseAllContractEntrypoint (_v)      -> "unpauseAllContractEntrypoint"

        |   ToggleDoormanEntrypoint (_v)           -> "toggleDoormanEntrypoint"
        |   ToggleDelegationEntrypoint (_v)        -> "toggleDelegationEntrypoint"
        |   ToggleAggregatorEntrypoint (_v)        -> "toggleAggregatorEntrypoint"
        |   ToggleAggregatorFacEntrypoint (_v)     -> "toggleAggregatorFacEntrypoint"
        |   ToggleFarmEntrypoint (_v)              -> "toggleFarmEntrypoint"
        |   ToggleFarmFacEntrypoint (_v)           -> "toggleFarmFacEntrypoint"
        |   ToggleTreasuryEntrypoint (_v)          -> "toggleTreasuryEntrypoint"
        |   ToggleTreasuryFacEntrypoint (_v)       -> "toggleTreasuryFacEntrypoint"
        // |   ToggleVaultFacEntrypoint (_v)          -> "toggleVaultFacEntrypoint"
        // |   ToggleLendingContEntrypoint (_v)       -> "toggleLendingContEntrypoint"

            (* Treasury Control *)
        |   TransferTreasury (_v)                  -> "transferTreasury"
        |   MintMvkAndTransferTreasury (_v)        -> "mintMvkAndTransferTreasury"

            (* MVK Token Control *)
        |   UpdateMvkInflationRate (_v)            -> "updateMvkInflationRate"
        |   TriggerMvkInflation (_v)               -> "triggerMvkInflation"

            (* Vesting Control *)
        |   AddVestee (_v)                         -> "addVestee"
        |   UpdateVestee (_v)                      -> "updateVestee"
        |   ToggleVesteeLock (_v)                  -> "toggleVesteeLock"
        |   RemoveVestee (_v)                      -> "removeVestee"

    ];

    // Get entrypoint lambda as bytes
    const lambdaBytes : bytes = case s.proxyLambdaLedger[lambdaName] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_PROXY_LAMBDA_NOT_FOUND)
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
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case executeAction of [
        |   UpdateProxyLambda(params) -> {

                // Assign params to constants for better code readability
                const lambdaName   : string = params.lambdaName;
                const lambdaBytes  : bytes  = params.func_bytes;

                // Allow override of lambdas
                s.proxyLambdaLedger[lambdaName] := lambdaBytes

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Basic Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Proxy Control Lambdas Begin
// ------------------------------------------------------------------------------

(* govSetLambdaPointer lambda *)
function govSetLambdaPointer(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   GovSetLambdaPointer(setLambdaPointerParams) -> {
                
                const setAction         : string            = setLambdaPointerParams.setAction; 
                const entrypointName    : string            = setLambdaPointerParams.entrypointName; 
                const proxyNodeAddress  : option(address)   = setLambdaPointerParams.proxyNodeAddress;

                if      setAction = "add"    then s := addLambdaPointer(entrypointName, proxyNodeAddress, s)
                else if setAction = "update" then s := updateLambdaPointer(entrypointName, proxyNodeAddress, s)
                else if setAction = "remove" then s := removeLambdaPointer(entrypointName, s)
                else failwith(error_INVALID_ACTION_TYPE);
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* govSetProxyNodeAddress lambda *)
function govSetProxyNodeAddress(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
        |   GovSetProxyNodeAddress(setProxyNodeAddressParams) -> {

                const setAction         : string  = setProxyNodeAddressParams.setAction; 
                const proxyNodeAddress  : address = setProxyNodeAddressParams.proxyNodeAddress; 

                if      setAction = "add"    then s.proxyNodeAddresses := Set.add(proxyNodeAddress, s.proxyNodeAddresses) 
                else if setAction = "remove" then s.proxyNodeAddresses := Set.remove(proxyNodeAddress, s.proxyNodeAddresses)
                else failwith(error_INVALID_ACTION_TYPE);

            }
        |   _ -> skip
    ];

} with (operations, s)


// ------------------------------------------------------------------------------
// Governance Proxy Control Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Control Lambdas Begin
// ------------------------------------------------------------------------------

(* setContractAdmin lambda *)
function setContractAdmin(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
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
function setContractGovernance(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
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
function setContractLambda(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
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
function setFactoryProductLambda(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
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



(* updateContractWhitelistMap lambda *)
function updateContractWhitelistMap(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
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



(* updateContractWhitelistTokenMap lambda *)
function updateContractWhitelistTokenMap(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is
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




function updateWhitelistDevelopersSet(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
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



function setGovernanceProxy(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
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



// ------------------------------------------------------------------------------
// General Control Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Create Contract Lambdas Begin
// ------------------------------------------------------------------------------

function createFarm(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function createAggregator(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function createTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

// ------------------------------------------------------------------------------
// Create Contract Lambdas End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Pause/Unpause Control Lambdas Begin
// ------------------------------------------------------------------------------

function pauseAllContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
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



function unpauseAllContractEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
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



function toggleDelegationEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleDelegationEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleDelegationEntrypoint(toggleContractEntrypointParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleDoormanEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleDoormanEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleDoormanEntrypoint(toggleContractEntrypointParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleAggregatorEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleAggregatorEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleAggregatorEntrypoint(toggleContractEntrypointParams, operations);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleAggregatorFacEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleAggregatorFacEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleAggregatorFacEntrypoint(toggleContractEntrypointParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleFarmEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleFarmEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleFarmEntrypoint(toggleContractEntrypointParams, operations);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleFarmFacEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleFarmFacEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleFarmFacEntrypoint(toggleContractEntrypointParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleTreasuryEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleTreasuryEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleTreasuryEntrypoint(toggleContractEntrypointParams, operations);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleTreasuryFacEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleTreasuryFacEntrypoint(toggleContractEntrypointParams) -> {

                operations := toggleTreasuryFacEntrypoint(toggleContractEntrypointParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



// function toggleVaultFacEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
// block {

//     // verify that sender is admin or the Governance Contract address
//     verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

//     var operations : list(operation) := nil;

//     case executeAction of [
      
//         |   ToggleVaultFacEntrypoint(toggleContractEntrypointParams) -> {

//                 operations := toggleVaultFacEntrypoint(toggleContractEntrypointParams, operations, s);

//             }
//         |   _ -> skip
//     ]

// } with (operations, s)



// function toggleLendingContEntrypoint(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
// block {

//     // verify that sender is admin or the Governance Contract address
//     verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

//     var operations : list(operation) := nil;

//     case executeAction of [
      
//         |   ToggleLendingContEntrypoint(toggleContractEntrypointParams) -> {

//                 operations := toggleLendingContEntrypoint(toggleContractEntrypointParams, operations, s);

//             }
//         |   _ -> skip
//     ]

// } with (operations, s)



function transferTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function mintMvkAndTransferTreasury(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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



function updateMvkInflationRate(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   AddVestee(addVesteeParams) -> {

                operations := addVestee(addVesteeParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateVestee(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UpdateVestee(updateVesteeParams) -> {

                operations := updateVestee(updateVesteeParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function toggleVesteeLock(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   ToggleVesteeLock(toggleVesteeLockParams) -> {

                operations := toggleVesteeLock(toggleVesteeLockParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)



function removeVestee(const executeAction : executeActionType; var s : governanceProxyStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   RemoveVestee(removeVesteeParams) -> {

                operations := removeVestee(removeVesteeParams, operations, s);

            }
        |   _ -> skip
    ]

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------