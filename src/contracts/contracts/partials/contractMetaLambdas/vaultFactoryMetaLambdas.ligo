
// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is 
block {

    var response : return := (nil, s);

    case vaultFactoryLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // unpack governance action to be executed
                const executeGovernanceAction : vaultFactoryLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(vaultFactoryLambdaActionType)) of [
                        Some(_action) -> _action
                    |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
                ];

                response := case executeGovernanceAction of [
                
                        // Housekeeping
                    |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
                    |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
                    |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
                    |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
                    |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
                    |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
                    |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

                        // Pause / Break Glass Entrypoints
                    |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
                    |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
                    |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

                        // Vault Factory Entrypoints
                    |   LambdaCreateVault(parameters)               -> createVault(parameters, s)
                    
                        // Meta Lambda
                    |   LambdaSetLambda(parameters)                 -> setLambda(parameters, s)
                    |   LambdaSetProductLambda(parameters)          -> setProductLambda(parameters, s)

                    |   _                                           -> (nil, s)
                ];

            }
        |   _ -> skip
    ];

} with response



(*  setLambda lambda *)
function lambdaSetLambda(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s: vaultFactoryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case vaultFactoryLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)



(*  setProductLambda lambda *)
function lambdaSetProductLambda(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s: vaultFactoryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case vaultFactoryLambdaAction of [
        | LambdaSetProductLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------
