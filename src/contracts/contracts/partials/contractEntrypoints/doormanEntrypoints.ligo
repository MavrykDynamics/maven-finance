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
    const lambdaBytes : bytes = getLambdaBytes("lambdaStake", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaStake(stakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  unstake entrypoint *)
function unstake(const unstakeAmount : nat; var s : doormanStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnstake", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnstake(unstakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  compound entrypoint *)
function compound(const userAddress : address; var s : doormanStorageType) : return is
block{
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCompound", s.lambdaLedger);

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaCompound(userAddress);

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



(* onVaultWithdrawStakedMvk entrypoint *)
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

(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : doormanStorageType) : return is
block{
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // First way
    // const executeGovernanceAction : executeGovernanceActionType = case (Bytes.unpack(governanceActionBytes) : option(executeGovernanceActionType)) of [
    //         Some(_action) -> _action
    //     |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    // ];

    // const response : return = case executeGovernanceAction of [
      
    //         // Housekeeping
    //     |   GovSetAdmin (parameters)                 -> setAdmin(parameters, s)
    //     |   GovSetGovernance(parameters)             -> setGovernance(parameters, s)
    //     |   GovUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
    //     |   GovUpdateConfig(parameters)              -> updateConfig(parameters, s)
    //     |   GovUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
    //     |   GovUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
    //     |   GovMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
    //     |   GovMigrateFunds(parameters)              -> migrateFunds(parameters, s)

    //         // Pause / Break Glass Entrypoints
    //     |   GovPauseAll(_parameters)                 -> pauseAll(s)
    //     |   GovUnpauseAll(_parameters)               -> unpauseAll(s)
    //     |   GovTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

    //         // Doorman Entrypoints
    //     |   GovCompound(parameters)                  -> compound(parameters, s)
    // ];

    
    
    // Second Way
    // const executeGovernanceAction : doormanAction = case (Bytes.unpack(governanceActionBytes) : option(doormanAction)) of [
    //         Some(_action) -> _action
    //     |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    // ];

    // const response : return = case executeGovernanceAction of [
      
    //         // Housekeeping
    //     |   SetAdmin (parameters)                 -> setAdmin(parameters, s)
    //     |   SetGovernance(parameters)             -> setGovernance(parameters, s)
    //     |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
    //     |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
    //     |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
    //     |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
    //     |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
    //     |   MigrateFunds(parameters)              -> migrateFunds(parameters, s)

    //         // Pause / Break Glass Entrypoints
    //     |   PauseAll(_parameters)                 -> pauseAll(s)
    //     |   UnpauseAll(_parameters)               -> unpauseAll(s)
    //     |   TogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

    //         // Doorman Entrypoints
    //     |   Compound(parameters)                  -> compound(parameters, s)

    //     |   _                                     -> (nil, s)
    // ];


    // Third Way
    // const governanceActionBytes  : bytes  = executeGovernanceActionParams.data;
    // const entrypointName         : string = executeGovernanceActionParams.entrypointName;

    // if entrypointName = "setAdmin" then {

    //     const unpackedData : address = case (Bytes.unpack(governanceActionBytes) : option(address)) of [
    //             Some(_address) -> _address
    //         |   None           -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    //     ];

    // }



    // // Fourth Way
    const executeGovernanceAction : doormanLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(doormanLambdaActionType)) of [
            Some(_action) -> _action
        |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const response : return = case executeGovernanceAction of [
      
            // Housekeeping
        |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
        |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
        |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
        |   LambdaMigrateFunds(parameters)              -> migrateFunds(parameters, s)

            // Pause / Break Glass Entrypoints
        |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
        |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
        |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

            // Doorman Entrypoints
        |   LambdaCompound(parameters)                  -> compound(parameters, s)
        
        |   _                                           -> (nil, s)
    ];


    // Fifth Way
    // const executeGovernanceAction : doormanLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(doormanLambdaActionType)) of [
    //         Some(_action) -> _action
    //     |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    // ];

    // const response : return = case executeGovernanceAction of [
      
    //         // Housekeeping
    //     |   LambdaSetAdmin (parameters)                 -> _setAdmin(parameters, s)
    //     |   LambdaSetGovernance(parameters)             -> _setGovernance(parameters, s)
    //     |   LambdaUpdateMetadata(parameters)            -> _updateMetadata(parameters, s)
    //     |   LambdaUpdateConfig(parameters)              -> _updateConfig(parameters, s)
    //     |   LambdaUpdateWhitelistContracts(parameters)  -> _updateWhitelistContracts(parameters, s)
    //     |   LambdaUpdateGeneralContracts(parameters)    -> _updateGeneralContracts(parameters, s)
    //     |   LambdaMistakenTransfer(parameters)          -> _mistakenTransfer(parameters, s)
    //     |   LambdaMigrateFunds(parameters)              -> _migrateFunds(parameters, s)

    //         // Pause / Break Glass Entrypoints
    //     |   LambdaPauseAll(_parameters)                 -> _pauseAll(_parameters, s)
    //     |   LambdaUnpauseAll(_parameters)               -> _unpauseAll(_parameters, s)
    //     |   LambdaTogglePauseEntrypoint(parameters)     -> _togglePauseEntrypoint(parameters, s)

    //         // Doorman Entrypoints
    //     |   LambdaCompound(parameters)                  -> _compound(parameters, s)
        
    //     |   _                                           -> (nil, s)
    // ];

} with (response)



(* dataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataPackingHelper(const _executeGovernanceAction : doormanLambdaActionType; const s : doormanStorageType) : return is 
    (noOperations, s)



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