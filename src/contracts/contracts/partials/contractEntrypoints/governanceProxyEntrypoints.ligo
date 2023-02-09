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



// ------------------------------------------------------------------------------
// Main Entrypoints Begin
// ------------------------------------------------------------------------------

(* setProxyNodeAddress entrypoint *)
function setProxyNodeAddress(const setProxyNodeAddressParams : setProxyNodeAddressActionType; var s : governanceProxyStorageType) : return is 
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetProxyNodeAddress", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetProxyNodeAddress(setProxyNodeAddressParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : governanceProxyStorageType) : return is 
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

    // reference: type governanceProxyProxyLambdaFunctionType is (executeActionType * governanceProxyStorageType) -> return
    const response : return = case (Bytes.unpack(executeGovernanceActionLambdaBytes) : option(governanceProxyProxyLambdaFunctionType)) of [
            Some(f) -> f(governanceAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with response



(* processGovernanceAction entrypoint *)
function processGovernanceAction(const processGovernanceActionParams : processGovernanceActionType; var s : governanceProxyStorageType) : return is 
block {
    
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaProcessGovernanceAction", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaProcessGovernanceAction(processGovernanceActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Main Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Helper Entrypoints Begin
// ------------------------------------------------------------------------------

(* dataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataPackingHelper(const _governanceAction : executeActionType; const s : governanceProxyStorageType) : return is 
    (noOperations, s)

// ------------------------------------------------------------------------------
// Helper Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambdaPointer entrypoint *)
function setLambdaPointer(const setLambdaPointerParams : setLambdaPointerActionType; var s : governanceProxyStorageType) : return is 
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetLambdaPointer", s.lambdaLedger);

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetLambdaPointer(setLambdaPointerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



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