// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceProxyStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : governanceProxyStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);

} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceProxyStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceProxyStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : governanceProxyStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceProxyStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceProxyStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------

(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const executeGovernanceActionParams : executeGovernanceActionType; var s : governanceProxyStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaExecuteGovernanceAction", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaExecuteGovernanceAction(executeGovernanceActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(* processGovernanceAction entrypoint *)
function processGovernanceAction(const processGovernanceActionParams : processGovernanceActionType; var s : governanceProxyStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaProcessGovernanceAction", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaProcessGovernanceAction(processGovernanceActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setProxyLambda entrypoint *)
function setProxyLambda(const setProxyLambdaParams : setProxyLambdaType; var s : governanceProxyStorageType) : return is 
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // governance contract will also be the admin in most cases unless break glass
    
    // assign params to constants for better code readability
    const lambdaId      = setProxyLambdaParams.id;
    const lambdaBytes   = setProxyLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.proxyLambdaLedger[lambdaId] := lambdaBytes;

} with (noOperations, s)



(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceProxyStorageType) : return is
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