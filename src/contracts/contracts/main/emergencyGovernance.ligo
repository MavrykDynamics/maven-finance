// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// EmergencyGovernance types
#include "../partials/types/emergencyGovernanceTypes.ligo"

// ------------------------------------------------------------------------------

type emergencyGovernanceAction is 

    // Housekeeping Entrypoints
    SetAdmin                  of (address)
  | SetGovernance             of (address)
  | UpdateMetadata            of updateMetadataType
  | UpdateConfig              of emergencyUpdateConfigParamsType    
  | UpdateGeneralContracts    of updateGeneralContractsParams
  | UpdateWhitelistContracts  of updateWhitelistContractsParams

    // Emergency Governance Entrypoints
  | TriggerEmergencyControl   of triggerEmergencyControlType
  | VoteForEmergencyControl   of (unit)
  | DropEmergencyGovernance   of (unit)

    // Lambda Entrypoints
  | SetLambda                 of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * emergencyGovernanceStorage


// emergencyGovernance contract methods lambdas
type emergencyGovernanceUnpackLambdaFunctionType is (emergencyGovernanceLambdaActionType * emergencyGovernanceStorage) -> return



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
// Error Codes Begin
//
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
//
// Error Codes End
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

function checkSenderIsAllowed(var s : emergencyGovernanceStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(var s : emergencyGovernanceStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsMvkTokenContract(var s : emergencyGovernanceStorage) : unit is
block{
  if (Tezos.sender = s.mvkTokenAddress) then skip
  else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);
} with unit



function checkSenderIsDoormanContract(var s : emergencyGovernanceStorage) : unit is
block{
  const generalContractsOptView : option (option(address)) = Tezos.call_view ("generalContractOpt", "doorman", s.governanceAddress);
  const doormanAddress: address = case generalContractsOptView of [
      Some (_optionContract) -> case _optionContract of [
              Some (_contract)    -> _contract
          |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
          ]
  |   None -> failwith (error_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);
} with unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function triggerBreakGlass(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%breakGlass",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith(error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND) : contract(unit))
  ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferTez(const to_ : contract(unit); const amt : tez) : operation is Tezos.transaction(unit, amt, to_)

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(emergencyGovernanceUnpackLambdaFunctionType)) of [
        Some(f) -> f(emergencyGovernanceLambdaAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
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
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Emergency Governance Lambdas:
#include "../partials/contractLambdas/emergencyGovernance/emergencyGovernanceLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function admin(const _: unit; var s : emergencyGovernanceStorage) : address is
  s.admin



(* View: config *)
[@view] function config (const _: unit; var s : emergencyGovernanceStorage) : emergencyConfigType is
  s.config



(* View: get general contracts *)
[@view] function generalContracts (const _: unit; var s : emergencyGovernanceStorage) : generalContractsType is
  s.generalContracts



(* View: get whitelist contracts *)
[@view] function whitelistContracts (const _: unit; const s: emergencyGovernanceStorage): whitelistContractsType is 
    s.whitelistContracts



(* View: get emergency governance *)
[@view] function emergencyGovernanceOpt (const recordId: nat; var s : emergencyGovernanceStorage) : option(emergencyGovernanceRecordType) is
  Big_map.find_opt(recordId, s.emergencyGovernanceLedger)



(* View: get current emergency governance id *)
[@view] function currentEmergencyGovernanceId (const _: unit; var s : emergencyGovernanceStorage) : nat is
  s.currentEmergencyGovernanceId



(* View: get next emergency governance id *)
[@view] function nextEmergencyGovernanceId (const _: unit; var s : emergencyGovernanceStorage) : nat is
  s.nextEmergencyGovernanceId



(* View: get a lambda *)
[@view] function lambdaOpt(const lambdaName: string; var s : emergencyGovernanceStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function lambdaLedger(const _: unit; var s : emergencyGovernanceStorage) : lambdaLedgerType is
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
function setAdmin(const newAdminAddress : address; var s : emergencyGovernanceStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : emergencyGovernanceStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : emergencyGovernanceStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : emergencyUpdateConfigParamsType; var s : emergencyGovernanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: emergencyGovernanceStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: emergencyGovernanceStorage): return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

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
function triggerEmergencyControl(const triggerEmergencyControlParams : triggerEmergencyControlType; var s : emergencyGovernanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTriggerEmergencyControl"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaTriggerEmergencyControl(triggerEmergencyControlParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



(* voteForEmergencyControl entrypoint  *)
function voteForEmergencyControl(var s : emergencyGovernanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForEmergencyControl"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init emergencyGovernance lambda action
    const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType = LambdaVoteForEmergencyControl(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, emergencyGovernanceLambdaAction, s);  

} with response



 (* dropEmergencyGovernance entrypoint  *)
function dropEmergencyGovernance(var s : emergencyGovernanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropEmergencyGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setLambda(const setLambdaParams: setLambdaType; var s: emergencyGovernanceStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------

function main (const action : emergencyGovernanceAction; const s : emergencyGovernanceStorage) : return is 

    case action of [

        // Housekeeping Entrypoints
      | SetAdmin(parameters)                  -> setAdmin(parameters, s)
      | SetGovernance(parameters)             -> setGovernance(parameters, s)
      | UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
      | UpdateConfig(parameters)              -> updateConfig(parameters, s)
      | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
      | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)

        // Emergency Governance Entrypoints
      | TriggerEmergencyControl(parameters)   -> triggerEmergencyControl(parameters, s)
      | VoteForEmergencyControl(_parameters)  -> voteForEmergencyControl(s)
      | DropEmergencyGovernance(_parameters)  -> dropEmergencyGovernance(s)

        // Lambda Entrypoints
      | SetLambda(parameters)                 -> setLambda(parameters, s)
  ]