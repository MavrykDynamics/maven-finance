// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceFinancialStorageType) : return is
block {
    
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response




(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceProxyAddress : address; var s : governanceFinancialStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernance", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetGovernance(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceFinancialStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceFinancialUpdateConfigParamsType; var s : governanceFinancialStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);
    
} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceFinancialStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceFinancialStorageType) : return is
block {
        
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init farmFactory lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);  

} with response



// (*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : governanceFinancialStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistTokenContracts", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceFinancialStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Financial Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* requestTokens entrypoint *)
function requestTokens(const requestTokensParams : councilActionRequestTokensType; var s : governanceFinancialStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRequestTokens", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaRequestTokens(requestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* requestMint entrypoint *)
function requestMint(const requestMintParams : councilActionRequestMintType; var s : governanceFinancialStorageType) : return is 
block {
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaRequestMint", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaRequestMint(requestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* setContractBaker entrypoint *)
function setContractBaker(const setContractBakerParams : councilActionSetContractBakerType; var s : governanceFinancialStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetContractBaker", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetContractBaker(setContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* dropFinancialRequest entrypoint *)
function dropFinancialRequest(const requestId : nat; var s : governanceFinancialStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDropFinancialRequest", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaDropFinancialRequest(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* voteForRequest entrypoint *)
function voteForRequest(const voteForRequest : voteForRequestType; var s : governanceFinancialStorageType) : return is 
block {
  
    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVoteForRequest", s.lambdaLedger);

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaVoteForRequest(voteForRequest);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);
  
} with response

// ------------------------------------------------------------------------------
// Financial Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceFinancialStorageType) : return is
block{
    
    // verify that sender is admin
    verifySenderIsAdmin(s.admin);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
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