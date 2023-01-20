// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : farmStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);

} with response



(* setName entrypoint - update the metadata at a given key *)
function setName(const updatedName : string; var s : farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetName", s.lambdaLedger);

    // init treasury lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaSetName(updatedName);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateMetadata Entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : farmUpdateConfigParamsType; var s : farmStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Admin Entrypoints End
// ------------------------------------------------------------------------------



(* initFarm Entrypoint *)
function initFarm (const initFarmParams: initFarmParamsType; var s: farmStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaInitFarm", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaInitFarm(initFarmParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* closeFarm Entrypoint *)
function closeFarm (var s: farmStorageType) : return is
block{
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCloseFarm", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaCloseFarm(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Farm Admin Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s: farmStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : farmStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: farmTogglePauseEntrypointType; const s: farmStorageType) : return is
block{
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Entrypoints Begin
// ------------------------------------------------------------------------------

(* deposit Entrypoint *)
function deposit(const tokenAmount: tokenBalanceType; var s: farmStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDeposit", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaDeposit(tokenAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* withdraw Entrypoint *)
function withdraw(const tokenAmount: tokenBalanceType; var s: farmStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaWithdraw", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaWithdraw(tokenAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* Claim Entrypoint *)
function claim(const depositor: depositorType; var s: farmStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaClaim", s.lambdaLedger);

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaClaim(depositor);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Farm Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : farmStorageType) : return is
block{
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // // Fourth Way
    const executeGovernanceAction : farmLambdaActionType = case (Bytes.unpack(governanceActionBytes) : option(farmLambdaActionType)) of [
            Some(_action) -> _action
        |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const response : return = case executeGovernanceAction of [
      
            // Housekeeping
        |   LambdaSetAdmin (parameters)                 -> setAdmin(parameters, s)
        |   LambdaSetGovernance(parameters)             -> setGovernance(parameters, s)
        |   LambdaSetName(parameters)                   -> setName(parameters, s)
        |   LambdaUpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   LambdaUpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   LambdaUpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   LambdaUpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   LambdaMistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

            // Farm
        |   LambdaInitFarm (parameters)                 -> initFarm(parameters, s)
        |   LambdaCloseFarm(parameters)                 -> closeFarm(parameters, s)

            // Pause / Break Glass Entrypoints
        |   LambdaPauseAll(_parameters)                 -> pauseAll(s)
        |   LambdaUnpauseAll(_parameters)               -> unpauseAll(s)
        |   LambdaTogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

        |   _                                           -> (nil, s)
    ];

} with (response)



(* dataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataPackingHelper(const _executeGovernanceAction : farmLambdaActionType; const s : farmStorageType) : return is 
    (noOperations, s)



(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: farmStorageType) : return is
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