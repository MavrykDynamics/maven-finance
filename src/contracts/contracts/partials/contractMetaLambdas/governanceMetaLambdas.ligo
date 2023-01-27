// ------------------------------------------------------------------------------
// Meta Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction lambda *)
function lambdaExecuteGovernanceAction(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    var response : return := (nil, s);

    case governanceLambdaAction of [
        |   LambdaExecuteGovernanceAction(governanceActionBytes) -> {
                
                // verify that sender is admin or the Governance Contract address
                verifySenderIsAdminOrGovernance(s.admin, Tezos.get_self_address());

                // // Fourth Way
                const executeGovernanceAction : governanceLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(governanceLambdaActionType)) of [
                        Some(_action) -> _action
                    |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
                ];

                response := case executeGovernanceAction of [
                
                        // Break Glass
                    |   LambdaPropagateBreakGlass (_parameters)     -> propagateBreakGlass(s)
                    
                        // Housekeeping
                    |   LambdaSetAdmin(parameters)                  -> setAdmin(parameters, s)
                    |   LambdaSetGovernanceProxy(parameters)        -> setGovernanceProxy(parameters, s)
                    |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
                    |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
                    
                    |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
                    |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
                    
                    |   LambdaUpdateWhitelistDevelopers(parameters) -> updateWhitelistDevelopers(parameters, s)
                    |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
                    |   LambdaSetContractAdmin(parameters)          -> setContractAdmin(parameters, s)
                    |   LambdaSetContractGovernance(parameters)     -> setContractGovernance(parameters, s)

                    |   _                                           -> (nil, s)
                ];

                
            }
        |   _ -> skip
    ];

} with response



(*  setLambda lambda *)
function lambdaSetLambda(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block{
    
    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaSetLambda(_setLambdaParams) -> {

                skip
            }
        | _ -> skip
    ];

} with (operations, s)
// ------------------------------------------------------------------------------
// Meta Lambdas End
// ------------------------------------------------------------------------------

