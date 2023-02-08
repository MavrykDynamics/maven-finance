// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceProxyNodeStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);  
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : governanceProxyNodeStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);

} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceProxyNodeStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceProxyNodeStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);  

} with response



(*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : governanceProxyNodeStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceProxyNodeStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceProxyNodeStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyNodeLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------

(* setProxyLambda entrypoint *)
function setProxyLambda(const setProxyLambdaParams : setProxyLambdaType; var s : governanceProxyNodeStorageType) : return is 
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // governance contract will also be the admin in most cases unless break glass
    
    // assign params to constants for better code readability
    const lambdaId      = setProxyLambdaParams.id;
    const lambdaBytes   = setProxyLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.proxyLambdaLedger[lambdaId] := lambdaBytes;

} with (noOperations, s)



(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : governanceProxyNodeStorageType) : return is 
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // governance contract will also be the admin in most cases unless break glass

    const governanceAction : executeActionType = case (Bytes.unpack(governanceActionBytes) : option(executeActionType)) of [
            Some(_action) -> _action
        |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const executeGovernanceActionLambdaBytes : bytes = case s.proxyLambdaLedger[0n] of [
            Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceProxyNodeProxyLambdaFunctionType is (executeActionType * governanceProxyNodeStorageType) -> return
    const response : return = case (Bytes.unpack(executeGovernanceActionLambdaBytes) : option(governanceProxyNodeProxyLambdaFunctionType)) of [
            Some(f) -> f(governanceAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with response



(* dataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataPackingHelper(const _governanceAction : executeActionType; const s : governanceProxyNodeStorageType) : return is 
    (noOperations, s)


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceProxyNodeStorageType) : return is
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