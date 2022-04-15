// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// BreakGlass Types
#include "../partials/types/breakGlassTypes.ligo"

type breakGlassAction is
    // Break Glass
    | BreakGlass                    of (unit)
    
    // Council members
    | UpdateCouncilMemberInfo of councilMemberInfoType

    // Housekeeping Entrypoints - Glass Broken Not Required
    | SetAdmin                      of (address)
    | UpdateMetadata                of (string * bytes)
    | UpdateConfig                  of breakGlassUpdateConfigParamsType    
    | UpdateWhitelistContracts      of updateWhitelistContractsParams
    | UpdateGeneralContracts        of updateGeneralContractsParams
    
    // Internal control of council members
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
// Helper Functions Begin
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(var s : breakGlassStorage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");



function checkSenderIsCouncilMember(var s : breakGlassStorage) : unit is
    if Map.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith("Only council members can call this entrypoint.");



function checkSenderIsEmergencyGovernanceContract(var s : breakGlassStorage) : unit is
block{
  const emergencyGovernanceAddress : address = case s.whitelistContracts["emergencyGovernance"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Emergency Governance Contract is not found.")
  ];
  if (Tezos.sender = emergencyGovernanceAddress) then skip
    else failwith("Error. Only the Emergency Governance Contract can call this entrypoint.");
} with unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
      else failwith("This entrypoint should not receive any tez.");



function checkGlassIsBroken(var s : breakGlassStorage) : unit is
    if s.glassBroken = True then unit
      else failwith("Error. Glass has not been broken");



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
  | None -> (failwith("setAdmin entrypoint in Contract Address not found") : contract(address))
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

(*  update the info of a council member *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorage) : return is
block {
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateCouncilMemberInfo Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilMemberInfoType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(councilMemberInfo, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass updateCouncilMemberInfo Lambda.")
    ];
} with (res.0, res.1)

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
      | None     -> failwith("Error. breakGlass Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack BreakGlass breakGlass Lambda.")
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
      | None     -> failwith("Error. setAdmin Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass setAdmin Lambda.")
    ];

} with (res.0, res.1)



(*  update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : breakGlassStorage) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateConfig Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassUpdateConfigParamsType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(updateConfigParams, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass updateConfig Lambda.")
    ];

} with (res.0, res.1)



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: breakGlassStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: breakGlassStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

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
      | None     -> failwith("Error. addCouncilMember Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilAddMemberType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newCouncilMember, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass addCouncilMember Lambda.")
    ];

} with (res.0, res.1)



(*  removeCouncilMember entrypoint  *)
function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. removeCouncilMember Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(councilMemberAddress, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass removeCouncilMember Lambda.")
    ];

} with (res.0, res.1)



(*  changeCouncilMember entrypoint  *)
function changeCouncilMember(const changeCouncilMemberParams : councilChangeMemberType; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaChangeCouncilMember"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. changeCouncilMember Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilChangeMemberType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(changeCouncilMemberParams, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass changeCouncilMember Lambda.")
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
      | None     -> failwith("Error. pauseAllEntrypoints Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack BreakGlass pauseAllEntrypoints Lambda.")
    ];

} with (res.0, res.1)



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(var s : breakGlassStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAllEntrypoints"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. unpauseAllEntrypoints Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack BreakGlass unpauseAllEntrypoints Lambda.")
    ];

} with (res.0, res.1)



(*  setSingleContractAdmin entrypoint  *)
function setSingleContractAdmin(const newAdminAddress : address; const targetContractAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetSingleContractAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. setSingleContractAdmin Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, targetContractAddress, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass setSingleContractAdmin Lambda.")
    ];

} with (res.0, res.1)



(*  setAllContractsAdmin entrypoint  *)
function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAllContractsAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. setAllContractsAdmin Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * breakGlassStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass setAllContractsAdmin Lambda.")
    ];

} with (res.0, res.1)



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(var s : breakGlassStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveBreakGlassControl"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. removeBreakGlassControl Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((breakGlassStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack BreakGlass removeBreakGlassControl Lambda.")
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
      | None     -> failwith("Error. flushAction Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((flushActionType * breakGlassStorage) -> return )) of [
      | Some(f) -> f(actionId, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass flushAction Lambda.")
    ];

} with (res.0, res.1)



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. signAction Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * breakGlassStorage) -> return )) of [
      | Some(f) -> f(actionId, s)
      | None    -> failwith("Error. Unable to unpack BreakGlass signAction Lambda.")
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



function main (const action : breakGlassAction; const s : breakGlassStorage) : return is 
    block {
        checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    } with(
        case action of [
            
            // Break Glass
            | BreakGlass(_parameters)               -> breakGlass(s)
            
            // Council members
            | UpdateCouncilMemberInfo(parameters) -> updateCouncilMemberInfo(parameters, s)

            // Housekeeping Entrypoints - Glass Broken Not Required
            | SetAdmin(parameters)                  -> setAdmin(parameters, s)
            | UpdateMetadata(parameters)            -> updateMetadata(parameters.0, parameters.1, s)  
            | UpdateConfig(parameters)              -> updateConfig(parameters, s)
            | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
            | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)

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