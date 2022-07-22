// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// BreakGlass Types
#include "../partials/contractTypes/breakGlassTypes.ligo"

// ------------------------------------------------------------------------------

type breakGlassAction is

        // Break Glass
    |   BreakGlass                    of (unit)

        // Housekeeping Entrypoints - Glass Broken Not Required
    |   SetAdmin                      of (address)
    |   SetGovernance                 of (address)
    |   UpdateMetadata                of updateMetadataType
    |   UpdateConfig                  of breakGlassUpdateConfigParamsType    
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType
    |   MistakenTransfer              of transferActionType
    |   UpdateCouncilMemberInfo       of councilMemberInfoType
    
        // Internal Control of Council Members
    |   AddCouncilMember              of councilActionAddMemberType
    |   RemoveCouncilMember           of address
    |   ChangeCouncilMember           of councilActionChangeMemberType
    
        // Glass Broken Required
    |   PropagateBreakGlass           of (unit)
    |   SetSingleContractAdmin        of setContractAdminType
    |   SetAllContractsAdmin          of (address)
    |   PauseAllEntrypoints           of (unit)
    |   UnpauseAllEntrypoints         of (unit)
    |   RemoveBreakGlassControl       of (unit)

        // Council Signing of Actions
    |   FlushAction                   of actionIdType
    |   SignAction                    of actionIdType

        // Lambda Entrypoints
    |   SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * breakGlassStorageType

// break glass contract methods lambdas
type breakGlassUnpackLambdaFunctionType is (breakGlassLambdaActionType * breakGlassStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : breakGlassStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : breakGlassStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Council Member address
function checkSenderIsCouncilMember(var s : breakGlassStorageType) : unit is
    if Map.mem(Tezos.get_sender(), s.councilMembers) then unit 
    else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);



// Allowed Senders: Emergency Governance Contract
function checkSenderIsEmergencyGovernanceContract(var s : breakGlassStorageType) : unit is
block{

    const emergencyGovernanceAddress : address = case s.whitelistContracts["emergencyGovernance"] of [
                Some(_address) -> _address
            |   None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    
    if (Tezos.get_sender() = emergencyGovernanceAddress) then skip
    else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governnace Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : breakGlassStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {

        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", s.governanceAddress);
        const governanceSatelliteAddress : address = case generalContractsOptView of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
                ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }
    
} with unit



// Check that glass is broken
function checkGlassIsBroken(var s : breakGlassStorageType) : unit is
    if s.glassBroken = True then unit
    else failwith(error_GLASS_NOT_BROKEN);



// Helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(breakGlassUnpackLambdaFunctionType)) of [
            Some(f) -> f(breakGlassLambdaAction, s)
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
[@view] function getAdmin(const _ : unit; var s : breakGlassStorageType) : address is
    s.admin



(* View: get Glass broken variable *)
[@view] function getGlassBroken(const _ : unit; var s : breakGlassStorageType) : bool is
    s.glassBroken



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : breakGlassStorageType) : breakGlassConfigType is
    s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _ : unit; var s : breakGlassStorageType) : councilMembersType is
    s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : breakGlassStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : breakGlassStorageType) : generalContractsType is
    s.generalContracts



(* View: get an action *)
[@view] function getActionOpt(const actionId: nat; var s : breakGlassStorageType) : option(breakGlassActionRecordType) is
    Big_map.find_opt(actionId, s.actionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; var s : breakGlassStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : breakGlassStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : breakGlassStorageType) : lambdaLedgerType is
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
function breakGlass(var s : breakGlassStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBreakGlass"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setAdmin(const newAdminAddress : address; var s : breakGlassStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : breakGlassStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : breakGlassStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
  
    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorageType) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);  

} with response



(* updateCouncilMemberInfo entrypoint *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function addCouncilMember(const newCouncilMember : councilActionAddMemberType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddCouncilMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaAddCouncilMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeCouncilMember entrypoint  *)
function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveCouncilMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveCouncilMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  changeCouncilMember entrypoint  *)
function changeCouncilMember(const changeCouncilMemberParams : councilActionChangeMemberType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaChangeCouncilMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function pauseAllEntrypoints(var s : breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAllEntrypoints"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(var s : breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAllEntrypoints"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUnpauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  propagateBreakGlass entrypoint  *)
function propagateBreakGlass(var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropagateBreakGlass"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPropagateBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setSingleContractAdmin entrypoint  *)
function setSingleContractAdmin(const setSingleContractAdminParams : setContractAdminType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetSingleContractAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetSingleContractAdmin(setSingleContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setAllContractsAdmin entrypoint  *)
function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAllContractsAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAllContractsAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveBreakGlassControl"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function flushAction(const actionId: actionIdType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFlushAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setLambda(const setLambdaParams: setLambdaType; var s: breakGlassStorageType) : return is
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



(* main entrypoint *)
function main (const action : breakGlassAction; const s : breakGlassStorageType) : return is 
block {

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with(

    case action of [
        
            // Break Glass
        |   BreakGlass(_parameters)               -> breakGlass(s)
        
            // Housekeeping Entrypoints - Glass Broken Not Required
        |   SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
        |   UpdateCouncilMemberInfo(parameters)   -> updateCouncilMemberInfo(parameters, s)

            // Break Glass Council Actions - Internal Control of Council Members
        |   AddCouncilMember(parameters)          -> addCouncilMember(parameters, s)
        |   RemoveCouncilMember(parameters)       -> removeCouncilMember(parameters, s)
        |   ChangeCouncilMember(parameters)       -> changeCouncilMember(parameters, s)
        
            // Glass Broken Required
        |   PropagateBreakGlass(_parameters)      -> propagateBreakGlass(s)
        |   SetSingleContractAdmin(parameters)    -> setSingleContractAdmin(parameters, s)
        |   SetAllContractsAdmin(parameters)      -> setAllContractsAdmin(parameters, s)
        |   PauseAllEntrypoints(_parameters)      -> pauseAllEntrypoints(s)
        |   UnpauseAllEntrypoints(_parameters)    -> unpauseAllEntrypoints(s)
        |   RemoveBreakGlassControl(_parameters)  -> removeBreakGlassControl(s)

            // Council Signing of Actions
        |   FlushAction(parameters)               -> flushAction(parameters, s)
        |   SignAction(parameters)                -> signAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
)
