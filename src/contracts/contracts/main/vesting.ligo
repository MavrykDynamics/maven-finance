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

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Vesting types
#include "../partials/types/vestingTypes.ligo"

// ------------------------------------------------------------------------------

type vestingAction is 
    
    // Housekeeping Entrypoints
    | SetAdmin                      of (address)
    | UpdateMetadata                of (string * bytes)
    | UpdateWhitelistContracts      of updateWhitelistContractsParams
    | UpdateGeneralContracts        of updateGeneralContractsParams
    
    // Internal Vestee Control Entrypoints
    | AddVestee                     of (addVesteeType)
    | RemoveVestee                  of (address)
    | UpdateVestee                  of (updateVesteeType)
    | ToggleVesteeLock              of (address)

    // Vestee Entrypoints
    | Claim                         of (unit)

    // Lambda Entrypoints
    | SetLambda                     of setLambdaType


const noOperations   : list (operation) = nil;
type return is list (operation) * vestingStorage


// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const one_day        : int              = 86_400;
const thirty_days    : int              = one_day * 30;

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

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 1n;

[@inline] const error_MINT_ENTRYPOINT_NOT_FOUND                                              = 2n;
[@inline] const error_VESTEE_NOT_FOUND                                                       = 3n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 4n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 5n;

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

function checkSenderIsAdmin(var s : vestingStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



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
// Entrypoint / General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintParams) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintParams))) of [
    Some(contr) -> contr
  | None -> (failwith(error_MINT_ENTRYPOINT_NOT_FOUND) : contract(mintParams))
  ];



(* Helper function to mint mvk tokens *)
function mintTokens(
  const to_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );

// ------------------------------------------------------------------------------
// Entrypoint / General Helper Functions End
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

// Vesting Lambdas:
#include "../partials/contractLambdas/vesting/vestingLambdas.ligo"

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

(* View: get total vesting remainder of vestee *)
[@view] function getVesteeBalance(const vesteeAddress : address; var s : vestingStorage) : nat is 
    case s.vesteeLedger[vesteeAddress] of [ 
          Some(_record) -> _record.totalRemainder
        | None          -> failwith(error_VESTEE_NOT_FOUND)
    ];



(* View: get vestee record *)
[@view] function getVesteeOpt(const vesteeAddress : address; var s : vestingStorage) : option(vesteeRecordType) is 
    Big_map.find_opt(vesteeAddress, s.vesteeLedger)



(* View: get total vested amount *)
[@view] function getTotalVested(const _ : unit; var s : vestingStorage) : nat is 
    s.totalVestedAmount

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
function setAdmin(const newAdminAddress : address; var s : vestingStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * vestingStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : vestingStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((string * bytes * vestingStorage) -> return )) of [
      | Some(f) -> f(metadataKey, metadataHash, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: vestingStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistContractsParams * vestingStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: vestingStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateGeneralContractsParams * vestingStorage) -> return )) of [
      | Some(f) -> f(updateGeneralContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addVestee entrypoint *)
function addVestee(const addVesteeParams : addVesteeType; var s : vestingStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((addVesteeType * vestingStorage) -> return )) of [
      | Some(f) -> f(addVesteeParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)



(*  removeVestee entrypoint *)
function removeVestee(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * vestingStorage) -> return )) of [
      | Some(f) -> f(vesteeAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)



(*  updateVestee entrypoint *)
function updateVestee(const updateVesteeParams : updateVesteeType; var s : vestingStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateVesteeType * vestingStorage) -> return )) of [
      | Some(f) -> f(updateVesteeParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  toggleVesteeLock entrypoint *)
function toggleVesteeLock(const vesteeAddress : address; var s : vestingStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaToggleVesteeLock"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * vestingStorage) -> return )) of [
      | Some(f) -> f(vesteeAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vestee Entrypoints Begin
// ------------------------------------------------------------------------------

(* claim entrypoint *)
function claim(var s : vestingStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((vestingStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Vestee Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: vestingStorage): return is
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
function main (const action : vestingAction; const s : vestingStorage) : return is
  block{
    
    checkNoAmount(unit); // entrypoints should not receive any tez amount  

  } with (case action of [

        // Housekeeping Entrypoints
      | SetAdmin(parameters)                    -> setAdmin(parameters, s)  
      | UpdateMetadata(parameters)              -> updateMetadata(parameters.0, parameters.1, s)
      | UpdateWhitelistContracts(parameters)    -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts(parameters)      -> updateGeneralContracts(parameters, s)

        // Internal Vestee Control Entrypoints
      | AddVestee(parameters)                   -> addVestee(parameters, s)
      | RemoveVestee(parameters)                -> removeVestee(parameters, s)
      | UpdateVestee(parameters)                -> updateVestee(parameters, s)        
      | ToggleVesteeLock(parameters)            -> toggleVesteeLock(parameters, s)

        // Vestee Entrypoints
      | Claim(_parameters)                      -> claim(s)

        // Lambda Entrypoints
      | SetLambda(parameters)                   -> setLambda(parameters, s)
  ])