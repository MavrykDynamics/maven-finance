// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

(* default entrypoint *)
function default(var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaDepositMvrk", s);
    
    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDepositMvrk(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);
    
} with response



(* vaultAction entrypoint *)
function initVaultAction(const initVaultActionParams : initVaultActionType; var s : vaultStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaInitVaultAction", s);

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaInitVaultAction(initVaultActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------
