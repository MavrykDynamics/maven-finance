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

                s := case setLambdaPointerParams of [
                    |   AddLambdaPointer(_v)    -> addLambdaPointer(_v, s)
                    |   UpdateLambdaPointer(_v) -> updateLambdaPointer(_v, s)
                    |   RemoveLambdaPointer(_v) -> removeLambdaPointer(_v, s)
                ]
                
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
    verifySenderIsAdmin(s.admin);  // verify that sender is admin

    var operations : list(operation) := nil;

    case governanceProxyLambdaAction of [
        |   LambdaProcessGovernanceAction(processGovernanceActionParams) -> {

                // init variables
                const entrypointName    : string  = processGovernanceActionParams.entrypointName;
                const encodedCode       : bytes   = processGovernanceActionParams.encodedCode;

                const proxyNodeAddress : address = getProxyNodeAddress(entrypointName, s);

                const executeGovernanceActionOperation : operation = executeGovernanceActionOperation(encodedCode, proxyNodeAddress);
                operations := executeGovernanceActionOperation # operations;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------