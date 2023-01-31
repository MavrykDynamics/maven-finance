
// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    var response : return := (nil, s);

    case vestingLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // unpack governance action to be executed
                const executeGovernanceAction : vestingLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(vestingLambdaActionType)) of [
                        Some(_action) -> _action
                    |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
                ];

                response := case executeGovernanceAction of [
                
                        // Housekeeping
                    |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
                    |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
                    |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
                    |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
                    |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
                    |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

                        // Internal Vestee Control Entrypoints
                    |   LambdaAddVestee(parameters)                 -> addVestee(parameters, s)
                    |   LambdaRemoveVestee(parameters)              -> removeVestee(parameters, s)
                    |   LambdaUpdateVestee(parameters)              -> updateVestee(parameters, s)
                    |   LambdaToggleVesteeLock(parameters)          -> toggleVesteeLock(parameters, s)
                    
                        // Meta Lambda
                    |   LambdaSetLambda(parameters)                 -> setLambda(parameters, s)

                    |   _                                           -> (nil, s)
                ];

            }
        |   _ -> skip
    ];

} with response



(*  setLambda lambda *)
function lambdaSetLambda(const vestingLambdaAction : vestingLambdaActionType; var s: vestingStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case vestingLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------
