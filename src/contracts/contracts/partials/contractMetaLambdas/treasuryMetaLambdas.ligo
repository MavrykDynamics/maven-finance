
// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    var response : return := (nil, s);

    case treasuryLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // unpack governance action to be executed
                const executeGovernanceAction : treasuryLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(treasuryLambdaActionType)) of [
                        Some(_action) -> _action
                    |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
                ];

                response := case executeGovernanceAction of [
                
                        // Housekeeping
                    |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
                    |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
                    |   LambdaSetBaker(parameters)                  -> setBaker(parameters, s)
                    |   LambdaSetName(parameters)                   -> setName(parameters, s)
                    |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
                    |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
                    |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
                    |   LambdaUpdateWhitelistTokens(parameters)     -> updateWhitelistTokenContracts(parameters, s)

                        // Pause / Break Glass Entrypoints
                    |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
                    |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
                    |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

                        // Treasury
                    |   LambdaTransfer(parameters)                  -> transfer(parameters, s)
                    |   LambdaMintMvkAndTransfer(parameters)        -> mintMvkAndTransfer(parameters, s)
                    |   LambdaUpdateMvkOperators(parameters)        -> updateMvkOperators(parameters, s)
                    |   LambdaStakeMvk(parameters)                  -> stakeMvk(parameters, s)
                    |   LambdaUnstakeMvk(parameters)                -> unstakeMvk(parameters, s)
                    
                        // Meta Lambda
                    |   LambdaSetLambda(parameters)                 -> setLambda(parameters, s)

                    |   _                                           -> (nil, s)
                ];

            }
        |   _ -> skip
    ];

} with response



(*  setLambda lambda *)
function lambdaSetLambda(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------
