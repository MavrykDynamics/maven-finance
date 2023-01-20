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
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);
    
    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : lendingControllerStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : lendingControllerUpdateConfigParamsType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : lendingControllerStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s.lambdaLedger);

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : lendingControllerStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : lendingControllerTogglePauseEntrypointType; const s : lendingControllerStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetLoanToken", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetLoanToken(setLoanTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* setCollateralToken entrypoint *)
function setCollateralToken(const setCollateralTokenParams : setCollateralTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetCollateralToken", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetCollateralToken(setCollateralTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* registerVaultCreation entrypoint *)
function registerVaultCreation(const registerVaultCreationParams : registerVaultCreationActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterVaultCreation", s.lambdaLedger);

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaAddLiquidity", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaAddLiquidity(addLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType ; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRemoveLiquidity", s.lambdaLedger);

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
    const lambdaBytes : bytes = getLambdaBytes("lambdaCloseVault", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCloseVault(closeVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerDepositActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterDeposit", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterDeposit(registerDepositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response




(* registerWithdrawal entrypoint *)
function registerWithdrawal(const registerWithdrawalParams : registerWithdrawalActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRegisterWithdrawal", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterWithdrawal(registerWithdrawalParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* markForLiquidation entrypoint *)
function markForLiquidation(const markForLiquidationParams : markForLiquidationActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMarkForLiquidation", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaMarkForLiquidation(markForLiquidationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* liquidateVault entrypoint *)
function liquidateVault(const liquidateVaultParams : liquidateVaultActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaLiquidateVault", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaLiquidateVault(liquidateVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* borrow entrypoint *)
function borrow(const borrowParams : borrowActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaBorrow", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaBorrow(borrowParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response



(* repay entrypoint *)
function repay(const repayParams : repayActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRepay", s.lambdaLedger);

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRepay(repayParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vault Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked Token Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultDepositStakedToken entrypoint *)
function vaultDepositStakedToken(const vaultDepositStakedTokenParams : vaultDepositStakedTokenActionType; var s : lendingControllerStorageType) : return is 
block {
 
     // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVaultDepositStakedToken", s.lambdaLedger);
 
     // init lending controller lambda action
     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultDepositStakedToken(vaultDepositStakedTokenParams);
 
     // init response
     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* vaultWithdrawStakedToken entrypoint *)
function vaultWithdrawStakedToken(const vaultWithdrawStakedTokenParams : vaultWithdrawStakedTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVaultWithdrawStakedToken", s.lambdaLedger);

    // init lending controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultWithdrawStakedToken(vaultWithdrawStakedTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vault Staked Token Entrypoints End
// ------------------------------------------------------------------------------



// ---------------------------------------------- --------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : lendingControllerStorageType) : return is
block{
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // // Fourth Way
    const executeGovernanceAction : lendingControllerLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(lendingControllerLambdaActionType)) of [
            Some(_action) -> _action
        |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const response : return = case executeGovernanceAction of [
      
            // Housekeeping
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
        
        |   _                                           -> (nil, s)
    ];

} with (response)



(* dataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataPackingHelper(const _executeGovernanceAction : lendingControllerLambdaActionType; const s : lendingControllerStorageType) : return is 
    (noOperations, s)



(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : lendingControllerStorageType) : return is
block{
    
    // verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
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