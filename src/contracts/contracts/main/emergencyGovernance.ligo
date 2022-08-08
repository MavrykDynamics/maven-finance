// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// EmergencyGovernance types
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"

// ------------------------------------------------------------------------------

type emergencyGovernanceAction is 

        // Housekeeping Entrypoints
        SetAdmin                  of (address)
    |   SetGovernance             of (address)
    |   UpdateMetadata            of updateMetadataType
    |   UpdateConfig              of emergencyUpdateConfigParamsType    
    |   UpdateGeneralContracts    of updateGeneralContractsType
    |   UpdateWhitelistContracts  of updateWhitelistContractsType
    |   MistakenTransfer          of transferActionType

        // Emergency Governance Entrypoints
    |   TriggerEmergencyControl   of triggerEmergencyControlType
    |   VoteForEmergencyControl   of (unit)
    |   DropEmergencyGovernance   of (unit)

        // Lambda Entrypoints
    |   SetLambda                 of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * emergencyGovernanceStorageType

// emergencyGovernance contract methods lambdas
type emergencyGovernanceUnpackLambdaFunctionType is (emergencyGovernanceLambdaActionType * emergencyGovernanceStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg" : address);

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : emergencyGovernanceStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : emergencyGovernanceStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: MVK Token Contract
function checkSenderIsMvkTokenContract(var s : emergencyGovernanceStorageType) : unit is    
    if (Tezos.get_sender() = s.mvkTokenAddress) then unit
    else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);



// Allowed Senders: Doorman Contract
function checkSenderIsDoormanContract(var s : emergencyGovernanceStorageType) : unit is
block{

    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = doormanAddress) then skip
    else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : emergencyGovernanceStorageType) : unit is
block{
    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }
} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %breakGlass entrypoint on specified contract
function triggerBreakGlass(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%breakGlass",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND) : contract(unit))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(emergencyGovernanceUnpackLambdaFunctionType)) of [
            Some(f) -> f(emergencyGovernanceLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Emergency Governance Lambdas:
#include "../partials/contractLambdas/emergencyGovernance/emergencyGovernanceLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : emergencyGovernanceStorageType) : address is
    s.admin



(* View: config *)
[@view] function getConfig (const _ : unit; var s : emergencyGovernanceStorageType) : emergencyConfigType is
    s.config



(* View: get general contracts *)
[@view] function getGeneralContracts (const _ : unit; var s : emergencyGovernanceStorageType) : generalContractsType is
    s.generalContracts



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : emergencyGovernanceStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get emergency governance *)
[@view] function getEmergencyGovernanceOpt (const recordId : nat; var s : emergencyGovernanceStorageType) : option(emergencyGovernanceRecordType) is
    Big_map.find_opt(recordId, s.emergencyGovernanceLedger)



(* View: get current emergency governance id *)
[@view] function getCurrentEmergencyGovernanceId (const _ : unit; var s : emergencyGovernanceStorageType) : nat is
    s.currentEmergencyGovernanceId



(* View: get next emergency governance id *)
[@view] function getNextEmergencyGovernanceId (const _ : unit; var s : emergencyGovernanceStorageType) : nat is
    s.nextEmergencyGovernanceId



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : emergencyGovernanceStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : emergencyGovernanceStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : emergencyGovernanceStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : emergencyGovernanceStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : emergencyGovernanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : emergencyUpdateConfigParamsType; var s : emergencyGovernanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : emergencyGovernanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : emergencyGovernanceStorageType) : return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : emergencyGovernanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Emergency Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* triggerEmergencyControl entrypoint  *)
function triggerEmergencyControl(const triggerEmergencyControlParams : triggerEmergencyControlType; var s : emergencyGovernanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTriggerEmergencyControl"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaTriggerEmergencyControl(triggerEmergencyControlParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* voteForEmergencyControl entrypoint  *)
function voteForEmergencyControl(var s : emergencyGovernanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForEmergencyControl"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaVoteForEmergencyControl(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



 (* dropEmergencyGovernance entrypoint  *)
function dropEmergencyGovernance(var s : emergencyGovernanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropEmergencyGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaDropEmergencyGovernance(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Emergency Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : emergencyGovernanceStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
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

function main (const action : emergencyGovernanceAction; const s : emergencyGovernanceStorageType) : return is 

    case action of [

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)

            // Emergency Governance Entrypoints
        |   TriggerEmergencyControl(parameters)   -> triggerEmergencyControl(parameters, s)
        |   VoteForEmergencyControl(_parameters)  -> voteForEmergencyControl(s)
        |   DropEmergencyGovernance(_parameters)  -> dropEmergencyGovernance(s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
