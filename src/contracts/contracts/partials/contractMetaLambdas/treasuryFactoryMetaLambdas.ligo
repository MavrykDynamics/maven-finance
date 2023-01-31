
// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block {

    var response : return := (nil, s);

    case treasuryFactoryLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // unpack governance action to be executed
                const executeGovernanceAction : treasuryFactoryLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(treasuryFactoryLambdaActionType)) of [
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
                    |   LambdaUpdateWhitelistTokens(parameters)     -> updateWhitelistTokenContracts(parameters, s)
                    |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

                        // Pause / Break Glass Entrypoints
                    |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
                    |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
                    |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

                        // Treasury Factory Entrypoints
                    |   LambdaCreateTreasury(parameters)            -> createTreasury(parameters, s)
                    |   LambdaTrackTreasury(parameters)             -> trackTreasury(parameters, s)
                    |   LambdaUntrackTreasury(parameters)           -> untrackTreasury(parameters, s)

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
function lambdaSetLambda(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)



(*  setProductLambda lambda *)
function lambdaSetProductLambda(const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s: treasuryFactoryStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case treasuryFactoryLambdaAction of [
        | LambdaSetProductLambda(_setProductLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------
