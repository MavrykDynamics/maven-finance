// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : treasuryFactoryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : treasuryFactoryStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : treasuryFactoryUpdateConfigParamsType; var s : treasuryFactoryStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init delegation lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPauseAll", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : treasuryFactoryStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUnpauseAll", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: treasuryFactoryTogglePauseEntrypointType; const s : treasuryFactoryStorageType) : return is
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTogglePauseEntrypoint", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createTreasury entrypoint *)
function createTreasury(const createTreasuryParams : createTreasuryType; var s : treasuryFactoryStorageType) : return is 
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaCreateTreasury", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaCreateTreasury(createTreasuryParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* trackTreasury entrypoint *)
function trackTreasury (const treasuryContract : address; var s : treasuryFactoryStorageType) : return is 
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaTrackTreasury", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaTrackTreasury(treasuryContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response



(* untrackTreasury entrypoint *)
function untrackTreasury (const treasuryContract : address; var s : treasuryFactoryStorageType) : return is 
block{

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUntrackTreasury", s.lambdaLedger);

    // init treasuryFactory lambda action
    const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType = LambdaUntrackTreasury(treasuryContract);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : treasuryFactoryStorageType) : return is
block{
    
    // verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams : setLambdaType; var s : treasuryFactoryStorageType) : return is
block{
    
    // verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.treasuryLambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------