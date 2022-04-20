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
    | UpdateMetadata                of (string * bytes)
    | UpdateConfig                  of breakGlassUpdateConfigParamsType    
    | UpdateWhitelistContracts      of updateWhitelistContractsParams
    | UpdateGeneralContracts        of updateGeneralContractsParams
    | UpdateCouncilMemberInfo       of councilMemberInfoType
    
    // Internal Control of Council Members
    | AddCouncilMember of councilAddMemberType
    | RemoveCouncilMember of address
    | ChangeCouncilMember of councilChangeMemberType
    
    // Glass Broken Required
    | SetSingleContractAdmin        of (address * address)   
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


// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ONLY_COUNCIL_MEMBERS_ALLOWED                                           = 1n;
[@inline] const error_ONLY_EMERGENCY_CONTRACT_ALLOWED                                        = 2n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 3n;
[@inline] const error_GLASS_NOT_BROKEN                                                       = 4n;

[@inline] const error_EMERGENCY_CONTRACT_NOT_FOUND                                           = 5n;
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_CONTRACT_NOT_FOUND                             = 6n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 7n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 8n;

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
      | None -> failwith(error_EMERGENCY_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = emergencyGovernanceAddress) then skip
    else failwith(error_ONLY_EMERGENCY_CONTRACT_ALLOWED);
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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : breakGlassStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((string * bytes * breakGlassStorage) -> return )) of [
      | Some(f) -> f(metadataKey, metadataHash, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassUpdateConfigParamsType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(updateConfigParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: breakGlassStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistContractsParams * breakGlassStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: breakGlassStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateGeneralContractsParams * breakGlassStorage) -> return )) of [
      | Some(f) -> f(updateGeneralContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateCouncilMemberInfo entrypoint *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilMemberInfoType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(councilMemberInfo, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilAddMemberType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newCouncilMember, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  removeCouncilMember entrypoint  *)
function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(councilMemberAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  changeCouncilMember entrypoint  *)
function changeCouncilMember(const changeCouncilMemberParams : councilChangeMemberType; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaChangeCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilChangeMemberType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(changeCouncilMemberParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(var s : breakGlassStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAllEntrypoints"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  setSingleContractAdmin entrypoint  *)
function setSingleContractAdmin(const newAdminAddress : address; const targetContractAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetSingleContractAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, targetContractAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  setAllContractsAdmin entrypoint  *)
function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAllContractsAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveBreakGlassControl"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((flushActionType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(actionId, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * breakGlassStorage) -> return )) of [
      | Some(f) -> f(actionId, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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
            | UpdateMetadata(parameters)            -> updateMetadata(parameters.0, parameters.1, s)  
            | UpdateConfig(parameters)              -> updateConfig(parameters, s)
            | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
            | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
            | UpdateCouncilMemberInfo(parameters) -> updateCouncilMemberInfo(parameters, s)

            // Break Glass Council Actions - Internal Control of Council Members
            | AddCouncilMember(parameters)          -> addCouncilMember(parameters, s)
            | RemoveCouncilMember(parameters)       -> removeCouncilMember(parameters, s)
            | ChangeCouncilMember(parameters)       -> changeCouncilMember(parameters, s)
            
            // Glass Broken Required
            | SetSingleContractAdmin(parameters)    -> setSingleContractAdmin(parameters.0, parameters.1, s)
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