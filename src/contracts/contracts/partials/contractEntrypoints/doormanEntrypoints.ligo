// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : doormanStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);

} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : doormanStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : doormanUpdateConfigParamsType; var s : doormanStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init delegation lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  migrateFunds entrypoint *)
function migrateFunds(const destinationAddress : address; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMigrateFunds", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaMigrateFunds(destinationAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  
    
} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : doormanTogglePauseEntrypointType; const s : doormanStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Doorman Entrypoints Begin
// ------------------------------------------------------------------------------

(*  stake entrypoint *)
function stake(const stakeAmount : nat; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaStakeMvn", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaStakeMvn(stakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  unstakeMvn entrypoint *)
function unstakeMvn(const unstakeAmount : nat; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnstakeMvn", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnstakeMvn(unstakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  exit entrypoint *)
function exit(var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaExit", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaExit(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  compound entrypoint *)
function compound(const userAddresses : set(address); var s : doormanStorageType) : return is
block{
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCompound", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaCompound(userAddresses);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* farmClaim entrypoint *)
function farmClaim(const farmClaim : farmClaimType; var s : doormanStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaFarmClaim", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaFarmClaim(farmClaim);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* onVaultDepositStake entrypoint *)
function onVaultDepositStake(const onVaultDepositStakeParams : onVaultDepositStakeType; var s: doormanStorageType): return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaOnVaultDepositStake", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaOnVaultDepositStake(onVaultDepositStakeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* onVaultWithdrawStake entrypoint *)
function onVaultWithdrawStake(const onVaultWithdrawStakeParams : onVaultWithdrawStakeType; var s: doormanStorageType): return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaOnVaultWithdrawStake", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaOnVaultWithdrawStake(onVaultWithdrawStakeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* onVaultLiquidateStake\ entrypoint *)
function onVaultLiquidateStake(const onVaultLiquidateStakeParams : onVaultLiquidateStakeType; var s: doormanStorageType): return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaOnVaultLiquidateStake", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaOnVaultLiquidateStake(onVaultLiquidateStakeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Doorman Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : doormanStorageType) : return is
block{
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
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