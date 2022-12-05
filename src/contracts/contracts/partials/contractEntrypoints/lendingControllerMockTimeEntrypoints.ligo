// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : lendingControllerStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s);
    
    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : lendingControllerStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : lendingControllerUpdateConfigParamsType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : lendingControllerStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : lendingControllerStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : lendingControllerStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : lendingControllerTogglePauseEntrypointType; const s : lendingControllerStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Admin Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLoanToken entrypoint *)
function setLoanToken(const setLoanTokenParams : setLoanTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetLoanToken", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetLoanToken(setLoanTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* setCollateralToken entrypoint *)
function setCollateralToken(const setCollateralTokenParams : setCollateralTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetCollateralToken", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetCollateralToken(setCollateralTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* registerVaultCreation entrypoint *)
function registerVaultCreation(const registerVaultCreationParams : registerVaultCreationActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterVaultCreation", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterVaultCreation(registerVaultCreationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Admin Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Entrypoints Begin
// ------------------------------------------------------------------------------

(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaAddLiquidity", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaAddLiquidity(addLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType ; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveLiquidity", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRemoveLiquidity(removeLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Token Pool Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Entrypoints Begin
// ------------------------------------------------------------------------------

(* closeVault entrypoint *)
function closeVault(const closeVaultParams : closeVaultActionType; var s : lendingControllerStorageType) : return is 
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCloseVault", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCloseVault(closeVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerDepositActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterDeposit", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterDeposit(registerDepositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response




(* registerWithdrawal entrypoint *)
function registerWithdrawal(const registerWithdrawalParams : registerWithdrawalActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterWithdrawal", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterWithdrawal(registerWithdrawalParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* markForLiquidation entrypoint *)
function markForLiquidation(const markForLiquidationParams : markForLiquidationActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMarkForLiquidation", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaMarkForLiquidation(markForLiquidationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* liquidateVault entrypoint *)
function liquidateVault(const liquidateVaultParams : liquidateVaultActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaLiquidateVault", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaLiquidateVault(liquidateVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* borrow entrypoint *)
function borrow(const borrowParams : borrowActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaBorrow", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaBorrow(borrowParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response



(* repay entrypoint *)
function repay(const repayParams : repayActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRepay", s);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRepay(repayParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vault Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultDepositStakedMvk entrypoint *)
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams : vaultDepositStakedMvkActionType; var s : lendingControllerStorageType) : return is 
block {
 
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVaultDepositStakedMvk", s);
 
     // init lending controller lambda action
     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams);
 
     // init response
     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* vaultWithdrawStakedMvk entrypoint *)
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVaultWithdrawStakedMvk", s); 

     // init lending controller lambda action
     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams);
 
     // init response
     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints End
// ------------------------------------------------------------------------------



// ---------------------------------------------- --------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : lendingControllerStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------