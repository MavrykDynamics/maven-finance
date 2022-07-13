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

// MvkToken types for transfer
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Vesting types
#include "../partials/contractTypes/vestingTypes.ligo"

// ------------------------------------------------------------------------------

type vestingAction is 
    
      // Housekeeping Entrypoints
      SetAdmin                      of (address)
    | SetGovernance                 of (address)
    | UpdateMetadata                of updateMetadataType
    | UpdateWhitelistContracts      of updateWhitelistContractsType
    | UpdateGeneralContracts        of updateGeneralContractsType
    | MistakenTransfer              of transferActionType
    
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
type return is list (operation) * vestingStorageType

// vesting contract methods lambdas
type vestingUnpackLambdaFunctionType is (vestingLambdaActionType * vestingStorageType) -> return



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
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : vestingStorageType) : unit is
  if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
  else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : vestingStorageType) : unit is
  if (Tezos.get_sender() = s.admin) then unit
  else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Admin, Council Contract
function checkSenderIsCouncilOrAdmin(var s : vestingStorageType) : unit is
block{
    const councilAddress: address = case s.whitelistContracts["council"] of [
          Some (_address) -> _address
      |   None -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND): address)
    ];
    if Tezos.get_sender() = councilAddress or Tezos.get_sender() = s.admin then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED);
} with (unit)



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : vestingStorageType) : unit is
block{
  if Tezos.get_sender() = s.admin then skip
  else {
    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", s.governanceAddress);
    const governanceSatelliteAddress: address = case generalContractsOptView of [
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



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
  if (Tezos.get_amount() = 0tez) then unit
  else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint / General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %mint entrypoint from MVK Token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintType))) of [
          Some(contr) -> contr
        | None -> (failwith(error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(mintType))
      ];



// helper function to mint mvk tokens 
function mintTokens(
  const to_           : address;
  const amount_       : nat;
  const tokenAddress  : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );

// ------------------------------------------------------------------------------
// Entrypoint / General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(vestingUnpackLambdaFunctionType)) of [
        Some(f) -> f(vestingLambdaAction, s)
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

(* View: get admin variable *)
[@view] function getAdmin(const _: unit; var s : vestingStorageType) : address is
  s.admin



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : vestingStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : vestingStorageType) : generalContractsType is 
    s.generalContracts



(* View: get total vested amount *)
[@view] function getTotalVestedAmount(const _: unit; var s : vestingStorageType) : nat is 
    s.totalVestedAmount



(* View: get total vesting remainder of vestee *)
[@view] function getVesteeBalance(const vesteeAddress : address; var s : vestingStorageType) : nat is 
    case s.vesteeLedger[vesteeAddress] of [ 
          Some(_record) -> _record.totalRemainder
        | None          -> failwith(error_VESTEE_NOT_FOUND)
    ];



(* View: get vestee record *)
[@view] function getVesteeOpt(const vesteeAddress : address; var s : vestingStorageType) : option(vesteeRecordType) is 
    Big_map.find_opt(vesteeAddress, s.vesteeLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : vestingStorageType) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : vestingStorageType) : lambdaLedgerType is
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

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : vestingStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vestingStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vestingStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: vestingStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: vestingStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: vestingStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addVestee entrypoint *)
function addVestee(const addVesteeParams : addVesteeType; var s : vestingStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaAddVestee(addVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  
    
} with response



(*  removeVestee entrypoint *)
function removeVestee(const vesteeAddress : address; var s : vestingStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaRemoveVestee(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  
    
} with response



(*  updateVestee entrypoint *)
function updateVestee(const updateVesteeParams : updateVesteeType; var s : vestingStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaUpdateVestee(updateVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response



(*  toggleVesteeLock entrypoint *)
function toggleVesteeLock(const vesteeAddress : address; var s : vestingStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaToggleVesteeLock"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaToggleVesteeLock(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Internal Vestee Control Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vestee Entrypoints Begin
// ------------------------------------------------------------------------------

(* claim entrypoint *)
function claim(var s : vestingStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vesting lambda action
    const vestingLambdaAction : vestingLambdaActionType = LambdaClaim(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vestingLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vestee Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: vestingStorageType): return is
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
function main (const action : vestingAction; const s : vestingStorageType) : return is
  block{
    
    checkNoAmount(unit); // entrypoints should not receive any tez amount  

  } with (case action of [

        // Housekeeping Entrypoints
      | SetAdmin(parameters)                    -> setAdmin(parameters, s)  
      | SetGovernance(parameters)               -> setGovernance(parameters, s)
      | UpdateMetadata(parameters)              -> updateMetadata(parameters, s)
      | UpdateWhitelistContracts(parameters)    -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts(parameters)      -> updateGeneralContracts(parameters, s)
      | MistakenTransfer(parameters)            -> mistakenTransfer(parameters, s)

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
