
// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is 
block {

    var response : return := (nil, s);

    case aggregatorLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // unpack governance action to be executed
                const executeGovernanceAction : aggregatorLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(aggregatorLambdaActionType)) of [
                        Some(_action) -> _action
                    |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
                ];

                response := case executeGovernanceAction of [
                
                        // Housekeeping
                    |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
                    |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
                    |   LambdaSetName(parameters)                   -> setName(parameters, s)
                    |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
                    |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
                    |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
                    |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
                    |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

                        // Oracle Entrypoints
                    |   LambdaAddOracle (parameters)                -> addOracle(parameters, s)
                    |   LambdaRemoveOracle(parameters)              -> removeOracle(parameters, s)

                        // Pause / Break Glass Entrypoints
                    |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
                    |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
                    |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

                        // Meta Lambda
                    |   LambdaSetLambda(parameters)                 -> setLambda(parameters, s)

                    |   _                                           -> (nil, s)
                ];

            }
        |   _ -> skip
    ];

} with response



(*  setLambda lambda *)
function lambdaSetLambda(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------
