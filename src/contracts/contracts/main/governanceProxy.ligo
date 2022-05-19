// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Type for updateConfig
#include "../partials/types/delegationTypes.ligo"

// Farm Type
#include "../partials/types/farmTypes.ligo"

// Treasury Type for mint and transfers
#include "../partials/types/treasuryTypes.ligo"

// Break Glass Type
#include "../partials/types/breakGlassTypes.ligo"

// Emergency Governance Type
#include "../partials/types/emergencyGovernanceTypes.ligo"

// Council Type
#include "../partials/types/councilTypes.ligo"

// Governance Type
#include "../partials/types/governanceTypes.ligo"

// Governance Financial Type
#include "../partials/types/governanceFinancialTypes.ligo"

// Farm Type
#include "../partials/types/farmTypes.ligo"

// FarmFactory Type
#include "../partials/types/farmFactoryTypes.ligo"

// Treasury Type
#include "../partials/types/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../partials/types/treasuryFactoryTypes.ligo"

// Governance Proxy Types
#include "../partials/types/governanceProxyTypes.ligo"

// ------------------------------------------------------------------------------

type governanceProxyAction is 
  // Housekeeping Entrypoints
    SetAdmin                        of (address)
  | SetGovernance                   of (address)
  | UpdateMetadata                  of updateMetadataType
  | UpdateWhitelistContracts        of updateWhitelistContractsParams
  | UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams
  | UpdateGeneralContracts          of updateGeneralContractsParams

  // Main entrypoints
  | SetProxyLambda                  of setProxyLambdaType
  | ExecuteGovernanceAction         of (bytes)
  | DataPackingHelper               of executeActionType

  // Lambda Entrypoints
  | SetLambda                   of setLambdaType

const noOperations : list (operation) = nil;
type return is list (operation) * governanceProxyStorage

// proxy lambdas -> executing proposals to external contracts within MAVRYK system
type governanceProxyLambdaFunctionType is (executeActionType * governanceProxyStorage) -> return



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

function checkSenderIsAdmin(var s : governanceProxyStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkSenderIsAdminOrGovernance(var s : governanceProxyStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
    


function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_IN_CONTRACT_NOT_FOUND) : contract(address))
      ];


// governance proxy lamba helper function to get setGovernance entrypoint
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
      "%setGovernance",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_IN_CONTRACT_NOT_FOUND) : contract(address))
      ];



// governance proxy lamba helper function to get setLambda entrypoint
function getSetLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
  case (Tezos.get_entrypoint_opt(
      "%setLambda",
      contractAddress) : option(contract(setLambdaType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
      ];



// governance proxy lamba helper function to get setProductLambda entrypoint
function getSetProductLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
  case (Tezos.get_entrypoint_opt(
      "%setProductLambda",
      contractAddress) : option(contract(setLambdaType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
      ];



// governance proxy lamba helper function to get updateMetadata entrypoint
function getUpdateMetadataEntrypoint(const contractAddress : address) : contract(updateMetadataType) is
case (Tezos.get_entrypoint_opt(
      "%updateMetadata",
      contractAddress) : option(contract(updateMetadataType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND) : contract(updateMetadataType))
      ];



// governance proxy lamba helper function to get updateWhitelistContracts entrypoint
function getUpdateWhitelistContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistContractsParams) is
case (Tezos.get_entrypoint_opt(
      "%updateWhitelistContracts",
      contractAddress) : option(contract(updateWhitelistContractsParams))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistContractsParams))
      ];



// governance proxy lamba helper function to get updateGeneralContracts entrypoint
function getUpdateGeneralContractsEntrypoint(const contractAddress : address) : contract(updateGeneralContractsParams) is
case (Tezos.get_entrypoint_opt(
      "%updateGeneralContracts",
      contractAddress) : option(contract(updateGeneralContractsParams))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsParams))
      ];



// governance proxy lamba helper function to get updateWhitelistTokenContracts entrypoint
function getUpdateWhitelistTokenContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistTokenContractsParams) is
case (Tezos.get_entrypoint_opt(
      "%updateWhitelistTokenContracts",
      contractAddress) : option(contract(updateWhitelistTokenContractsParams))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistTokenContractsParams))
      ];

// ------------------------------------------------------------------------------
// Entrypoint Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

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

// Governance Proxy Lambdas:
#include "../partials/contractLambdas/governanceProxy/governanceProxyLambdas.ligo"

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

(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : governanceProxyStorage) : whitelistContractsType is
  s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : governanceProxyStorage) : generalContractsType is
  s.generalContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _: unit; var s : governanceProxyStorage) : whitelistTokenContractsType is
  s.whitelistTokenContracts



(* View: get a proxy lambda *)
[@view] function getProxyLambdaOpt(const lambdaIndex: nat; var s : governanceProxyStorage) : option(bytes) is
  Big_map.find_opt(lambdaIndex, s.proxyLambdaLedger)

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

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceProxyStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : governanceProxyStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);

} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceProxyStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: governanceProxyStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: governanceProxyStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateWhitelistTokenContracts(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: governanceProxyStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------

(* setProxyLambda entrypoint *)
function setProxyLambda(const setProxyLambdaParams: setProxyLambdaType; var s : governanceProxyStorage) : return is 
block {
    
    checkSenderIsAdminOrGovernance(s); // governance contract will also be the admin in most cases unless break glass
    
    // assign params to constants for better code readability
    const lambdaId      = setProxyLambdaParams.id;
    const lambdaBytes   = setProxyLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.proxyLambdaLedger[lambdaId] := lambdaBytes;

} with (noOperations, s)



(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : governanceProxyStorage) : return is 
block {
    
    checkSenderIsAdminOrGovernance(s); // governance contract will also be the admin in most cases unless break glass

    const governanceAction : executeActionType = case (Bytes.unpack(governanceActionBytes) : option(executeActionType)) of [
        Some(_action) -> _action
      | None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const executeGovernanceActionLambdaBytes : bytes = case s.proxyLambdaLedger[0n] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return
    const response : return = case (Bytes.unpack(executeGovernanceActionLambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
        Some(f) -> f(governanceAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with response



(* dataDataPackingHelper entrypoint *)
function dataDataPackingHelper(const _governanceAction : executeActionType; var s : governanceProxyStorage) : return is 
  (noOperations, s)


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: governanceProxyStorage): return is
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
function main (const action : governanceProxyAction; const s : governanceProxyStorage) : return is 
  block {

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

  } with (

    case action of [
      // Housekeeping entrypoints
        SetAdmin(parameters)                      -> setAdmin(parameters, s)
      | SetGovernance(parameters)                 -> setGovernance(parameters, s)
      | UpdateMetadata(parameters)                -> updateMetadata(parameters, s)
      | UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
      | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
      | UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)

      // Main entrypoints
      | SetProxyLambda(parameters)                -> setProxyLambda(parameters, s)
      | ExecuteGovernanceAction(parameters)       -> executeGovernanceAction(parameters, s)
      | DataPackingHelper(parameters)             -> dataDataPackingHelper(parameters, s)

        // Lambda Entrypoints
      | SetLambda(parameters)                     -> setLambda(parameters, s)

    ]
  )