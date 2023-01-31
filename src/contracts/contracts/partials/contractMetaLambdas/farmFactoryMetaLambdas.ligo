
// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block {

    var response : return := (nil, s);

    case farmFactoryLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // unpack governance action to be executed
                const executeGovernanceAction : farmFactoryLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(farmFactoryLambdaActionType)) of [
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

                        // Farm Factory Entrypoints
                    |   LambdaCreateFarm(parameters)                 -> createFarm(parameters, s)
                    |   LambdaTrackFarm(parameters)                  -> trackFarm(parameters, s)
                    |   LambdaUntrackFarm(parameters)                -> untrackFarm(parameters, s)

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
function lambdaSetLambda(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s: farmFactoryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)



(*  setProductLambda lambda *)
function lambdaSetProductLambda(const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s: farmFactoryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case farmFactoryLambdaAction of [
        | LambdaSetProductLambda(_setProductLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------
