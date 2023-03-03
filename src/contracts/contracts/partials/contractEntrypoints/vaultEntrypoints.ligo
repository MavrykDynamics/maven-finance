// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

(* default entrypoint *)
function default(var s : vaultStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaDepositXtz", s);
    
    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDepositXtz(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);
    
} with response


// ------------------------------------------------------------------------------
// Vault Entrypoints Begin
// ------------------------------------------------------------------------------

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


(* delegateTezOrMvk entrypoint *)
// function delegateTezOrMvk(const delegateTezOrMvkParams : delegateTezOrMvkType; var s : vaultStorageType) : return is 
// block {
    
//     // get lambda bytes
//     const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaDelegateTezOrMvk", s);

//     // init vault controller lambda action
//     const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateTezOrMvk(delegateTezOrMvkParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

// } with response



(* deposit entrypoint *)
// function deposit(const depositParams : depositType; var s : vaultStorageType) : return is 
// block {

//     // get lambda bytes
//     const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaDeposit", s);

//     // init vault controller lambda action
//     const vaultLambdaAction : vaultLambdaActionType = LambdaDeposit(depositParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

// } with response



// (* withdraw entrypoint *)
// function withdraw(const withdrawParams : withdrawType; var s : vaultStorageType) : return is 
// block {

//     // get lambda bytes
//     const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaWithdraw", s);

//     // init vault controller lambda action
//     const vaultLambdaAction : vaultLambdaActionType = LambdaWithdraw(withdrawParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

// } with response



// (* onLiquidate entrypoint *)
// function onLiquidate(const onLiquidateParams : onLiquidateType; var s : vaultStorageType) : return is 
// block {

//     // get lambda bytes
//     const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaOnLiquidate", s);

//     // init vault controller lambda action
//     const vaultLambdaAction : vaultLambdaActionType = LambdaOnLiquidate(onLiquidateParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

// } with response



// (* updateDepositor entrypoint *)
// function updateDepositor(const updateDepositorParams : updateDepositorType; var s : vaultStorageType) : return is
// block {

//     // get lambda bytes
//     const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaUpdateDepositor", s);

//     // init vault controller lambda action
//     const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateDepositor(updateDepositorParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

// } with response



// (* updateTokenOperators entrypoint *)
// function updateTokenOperators(const updateTokenOperatorsParams : updateTokenOperatorsType; var s : vaultStorageType) : return is
// block {

//     // get lambda bytes
//     const lambdaBytes : bytes = getVaultLambdaFromFactory("lambdaUpdateTokenOperators", s);

//     // init vault controller lambda action
//     const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateTokenOperators(updateTokenOperatorsParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

// } with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------
