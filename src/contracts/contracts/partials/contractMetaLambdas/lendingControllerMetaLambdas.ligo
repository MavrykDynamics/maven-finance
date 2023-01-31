// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is 
block {

    var response : return := (nil, s);

    case lendingControllerLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // // Fourth Way
                const executeGovernanceAction : lendingControllerLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(lendingControllerLambdaActionType)) of [
                        Some(_action) -> _action
                    |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
                ];

                response := case executeGovernanceAction of [
                
                        // Break Glass
                    |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
                    |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
                    |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
                    |   LambdaUpdateWhitelistTokens(parameters)     -> updateWhitelistTokenContracts(parameters, s)

                        // Pause / Break Glass Entrypoints
                    |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
                    |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
                    |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

                        // Admin Entrypoints
                    |   LambdaSetLoanToken(parameters)              -> setLoanToken(parameters, s)
                    |   LambdaSetCollateralToken(parameters)        -> setCollateralToken(parameters, s)
                    
                        // Meta Lambdas
                    |   LambdaSetLambda(parameters)                 -> setLambda(parameters, s)

                    |   _                                           -> (nil, s)
                ];

                
            }
        |   _ -> skip
    ];

} with response



(*  setLambda lambda *)
function lambdaSetLambda(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)
// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------

