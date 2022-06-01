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

// BreakGlass Types
#include "../partials/types/breakGlassTypes.ligo"

// ------------------------------------------------------------------------------

type breakGlassAction is

    // Break Glass
    | BreakGlass                    of (unit)

    // Housekeeping Entrypoints - Glass Broken Not Required
    | SetAdmin                      of (address)
    | SetGovernance                 of (address)
    | UpdateMetadata                of updateMetadataType
    | UpdateConfig                  of breakGlassUpdateConfigParamsType    
    | UpdateWhitelistContracts      of updateWhitelistContractsParams
    | UpdateGeneralContracts        of updateGeneralContractsParams
    | UpdateCouncilMemberInfo       of councilMemberInfoType
    
    // Internal Control of Council Members
    | AddCouncilMember              of councilAddMemberType
    | RemoveCouncilMember           of address
    | ChangeCouncilMember           of councilChangeMemberType
    
    // Glass Broken Required
    | PropagateBreakGlass           of (unit)
    | SetSingleContractAdmin        of setSingleContractAdminType
    | SetAllContractsAdmin          of (address)               
    | PauseAllEntrypoints           of (unit)             
    | UnpauseAllEntrypoints         of (unit)
    | RemoveBreakGlassControl       of (unit)

    // Council Signing of Actions
    | FlushAction                   of flushActionType
    | SignAction                    of signActionType

    // Lambda Entrypoints
    | SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * breakGlassStorage

// break glass contract methods lambdas
type breakGlassUnpackLambdaFunctionType is (breakGlassLambdaActionType * breakGlassStorage) -> return



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

function checkSenderIsAllowed(var s : breakGlassStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(var s : breakGlassStorage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsCouncilMember(var s : breakGlassStorage) : unit is
    if Map.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);



function checkSenderIsEmergencyGovernanceContract(var s : breakGlassStorage) : unit is
block{
  const emergencyGovernanceAddress : address = case s.whitelistContracts["emergencyGovernance"] of [
      Some(_address) -> _address
      | None -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = emergencyGovernanceAddress) then skip
    else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);
} with unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
      else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkGlassIsBroken(var s : breakGlassStorage) : unit is
    if s.glassBroken = True then unit
      else failwith(error_GLASS_NOT_BROKEN);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith(error_SET_ADMIN_ENTRYPOINT_IN_CONTRACT_NOT_FOUND) : contract(address))
  ];

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(breakGlassUnpackLambdaFunctionType)) of [
        Some(f) -> f(breakGlassLambdaAction, s)
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


// BreakGlass Lambdas:
#include "../partials/contractLambdas/breakGlass/breakGlassLambdas.ligo"


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
[@view] function admin(const _: unit; var s : breakGlassStorage) : address is
  s.admin



(* View: get Glass broken variable *)
[@view] function glassBroken(const _: unit; var s : breakGlassStorage) : bool is
  s.glassBroken



(* View: get config *)
[@view] function config(const _: unit; var s : breakGlassStorage) : breakGlassConfigType is
  s.config



(* View: get council members *)
[@view] function councilMembers(const _: unit; var s : breakGlassStorage) : councilMembersType is
  s.councilMembers



(* View: get whitelist contracts *)
[@view] function whitelistContracts(const _: unit; var s : breakGlassStorage) : whitelistContractsType is
  s.whitelistContracts



(* View: get general contracts *)
[@view] function generalContracts(const _: unit; var s : breakGlassStorage) : generalContractsType is
  s.generalContracts



(* View: get an action *)
[@view] function actionOpt(const actionId: nat; var s : breakGlassStorage) : option(actionRecordType) is
  Big_map.find_opt(actionId, s.actionsLedger)



(* View: get the action counter *)
[@view] function actionCounter(const _: unit; var s : breakGlassStorage) : nat is
  s.actionCounter



(* View: get a lambda *)
[@view] function lambdaOpt(const lambdaName: string; var s : breakGlassStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function lambdaLedger(const _: unit; var s : breakGlassStorage) : lambdaLedgerType is
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
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass entrypoint *)
function breakGlass(var s : breakGlassStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBreakGlass"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : breakGlassStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : breakGlassStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : breakGlassStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
  
    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: breakGlassStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: breakGlassStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(* updateCouncilMemberInfo entrypoint *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateCouncilMemberInfo(councilMemberInfo);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Break Glass Council Actions Begin - Internal Control of Council Members
// ------------------------------------------------------------------------------

(*  addCouncilMember entrypoint  *)
function addCouncilMember(const newCouncilMember : councilAddMemberType; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaAddCouncilMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeCouncilMember entrypoint  *)
function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveCouncilMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  changeCouncilMember entrypoint  *)
function changeCouncilMember(const changeCouncilMemberParams : councilChangeMemberType; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaChangeCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaChangeCouncilMember(changeCouncilMemberParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Council Actions End - Internal Control of Council Members
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAllEntrypoints entrypoint  *)
function pauseAllEntrypoints(var s : breakGlassStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAllEntrypoints"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(var s : breakGlassStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAllEntrypoints"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUnpauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  propagateBreakGlass entrypoint  *)
function propagateBreakGlass(var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropagateBreakGlass"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPropagateBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setSingleContractAdmin entrypoint  *)
function setSingleContractAdmin(const setSingleContractAdminParams : setSingleContractAdminType; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetSingleContractAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetSingleContractAdmin(setSingleContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setAllContractsAdmin entrypoint  *)
function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAllContractsAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAllContractsAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveBreakGlassControl"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveBreakGlassControl(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction entrypoint  *)
function flushAction(const actionId: flushActionType; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFlushAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSignAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council signing of actions Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: breakGlassStorage): return is
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



(* main entrypoint *)
function main (const action : breakGlassAction; const s : breakGlassStorage) : return is 
    block {

        checkNoAmount(Unit); // entrypoints should not receive any tez amount  

    } with(

        case action of [
            
            // Break Glass
            | BreakGlass(_parameters)               -> breakGlass(s)
            
            // Housekeeping Entrypoints - Glass Broken Not Required
            | SetAdmin(parameters)                  -> setAdmin(parameters, s)
            | SetGovernance(parameters)             -> setGovernance(parameters, s)
            | UpdateMetadata(parameters)            -> updateMetadata(parameters, s)  
            | UpdateConfig(parameters)              -> updateConfig(parameters, s)
            | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
            | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
            | UpdateCouncilMemberInfo(parameters)   -> updateCouncilMemberInfo(parameters, s)

            // Break Glass Council Actions - Internal Control of Council Members
            | AddCouncilMember(parameters)          -> addCouncilMember(parameters, s)
            | RemoveCouncilMember(parameters)       -> removeCouncilMember(parameters, s)
            | ChangeCouncilMember(parameters)       -> changeCouncilMember(parameters, s)
            
            // Glass Broken Required
            | PropagateBreakGlass(_parameters)      -> propagateBreakGlass(s)
            | SetSingleContractAdmin(parameters)    -> setSingleContractAdmin(parameters, s)
            | SetAllContractsAdmin(parameters)      -> setAllContractsAdmin(parameters, s)
            | PauseAllEntrypoints(_parameters)      -> pauseAllEntrypoints(s)
            | UnpauseAllEntrypoints(_parameters)    -> unpauseAllEntrypoints(s)
            | RemoveBreakGlassControl(_parameters)  -> removeBreakGlassControl(s)

            // Council Signing of Actions
            | FlushAction(parameters)               -> flushAction(parameters, s)
            | SignAction(parameters)                -> signAction(parameters, s)

            // Lambda Entrypoints
            | SetLambda(parameters)                 -> setLambda(parameters, s)
        ]
    )