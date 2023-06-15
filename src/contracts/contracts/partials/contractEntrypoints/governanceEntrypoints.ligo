// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass entrypoint *)
function breakGlass(var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaBreakGlass", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response



(*  propagateBreakGlass entrypoint *)
function propagateBreakGlass(const propagateBreakGlassParams : set(address); var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPropagateBreakGlass", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaPropagateBreakGlass(propagateBreakGlassParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetAdmin", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response




(*  setGovernanceProxy entrypoint *)
function setGovernanceProxy(const newGovernanceProxyAddress : address; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetGovernanceProxy", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetGovernanceProxy(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateMetadata", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceUpdateConfigParamsType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateConfig", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateGeneralContracts", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistContracts", s.lambdaLedger);

    // init farmFactory lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);  

} with response



// (*  updateWhitelistDevelopers entrypoint *)
function updateWhitelistDevelopers(const developer : address; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateWhitelistDevelopers", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistDevelopers(developer);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaMistakenTransfer", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);  

} with response



// (*  setContractAdmin entrypoint *)
function setContractAdmin(const setContractAdminParams : setContractAdminType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetContractAdmin", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractAdmin(setContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  setContractGovernance entrypoint *)
function setContractGovernance(const setContractGovernanceParams : setContractGovernanceType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaSetContractGovernance", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractGovernance(setContractGovernanceParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  updateSatelliteSnapshot entrypoint *)
function updateSatelliteSnapshot(const updateSatelliteSnapshotParams : updateSatelliteSnapshotType; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateSatelliteSnapshot", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateSatelliteSnapshot(updateSatelliteSnapshotParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  startNextRound entrypoint *)
function startNextRound(const executePastProposal : bool; var s : governanceStorageType) : return is
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaStartNextRound", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaStartNextRound(executePastProposal);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* propose entrypoint *)
function propose(const newProposal : newProposalType ; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaPropose", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaPropose(newProposal);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateProposalData entrypoint *)
function updateProposalData(const proposalData : updateProposalType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaUpdateProposalData", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateProposalData(proposalData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* lockProposal entrypoint *)
function lockProposal(const proposalId : nat; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaLockProposal", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaLockProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* proposalRoundVote entrypoint *)
function proposalRoundVote(const proposalId : nat; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaProposalRoundVote", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProposalRoundVote(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* votingRoundVote entrypoint *)
function votingRoundVote(const voteType : votingRoundVoteType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaVotingRoundVote", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaVotingRoundVote(voteType);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* executeProposal entrypoint *)
function executeProposal(const proposalId : actionIdType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaExecuteProposal", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaExecuteProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* processProposalPayment entrypoint *)
function processProposalPayment(const proposalID: actionIdType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaProcessProposalPayment", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProcessProposalPayment(proposalID);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* processProposalSingleData entrypoint *)
function processProposalSingleData(const proposalId : actionIdType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaProcessProposalSingleData", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProcessProposalSingleData(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* distributeProposalRewards entrypoint *)
function distributeProposalRewards(const claimParams: distributeProposalRewardsType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDistributeProposalRewards", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaDistributeProposalRewards(claimParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* dropProposal entrypoint *)
function dropProposal(const proposalId : actionIdType; var s : governanceStorageType) : return is 
block {

    // get lambda bytes
    const lambdaBytes : bytes = getLambdaBytes("lambdaDropProposal", s.lambdaLedger);

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaDropProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceStorageType) : return is
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