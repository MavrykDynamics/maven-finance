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

// Vault Types
#include "../partials/contractTypes/vaultTypes.ligo"

// VaultFactory Types
#include "../partials/contractTypes/vaultFactoryTypes.ligo"

// LendingController Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

// helper function to create vault 
type createVaultFuncType is (option(key_hash) * tez * vaultStorageType) -> (operation * address)
const createVaultFunc : createVaultFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/vault.tz"
        ;
          PAIR } |}
: createVaultFuncType)];

type vaultFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of vaultFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint       of vaultFactoryTogglePauseEntrypointType

        // Vault Factory Entrypoints
    |   CreateVault                  of createVaultType
    
        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType
    |   SetProductLambda            of setLambdaType


type return is list (operation) * vaultFactoryStorageType
const noOperations: list (operation) = nil;

// vault factory contract methods lambdas
type vaultFactoryUnpackLambdaFunctionType is (vaultFactoryLambdaActionType * vaultFactoryStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : vaultFactoryStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


// Allowed Senders: Admin
function checkSenderIsAdmin(const s : vaultFactoryStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Council Contract
function checkSenderIsCouncil(const s : vaultFactoryStorageType) : unit is
block {

    const councilAddress : address = case s.whitelistContracts["council"] of [
            Some (_address) -> _address
        |   None            -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND) : address)
    ];

    if Tezos.get_sender() = councilAddress then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with (unit)



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : vaultFactoryStorageType) : unit is
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
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %createVault entrypoint is not paused
function checkCreateVaultIsNotPaused(var s : vaultFactoryStorageType) : unit is
    if s.breakGlassConfig.createVaultIsPaused then failwith(error_CREATE_VAULT_ENTRYPOINT_IN_VAULT_FACTORY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %registerVaultCreation entrypoint in Lending Controller Creation
function getRegisterVaultCreationEntrypointInLendingController(const contractAddress : address) : contract(registerVaultCreationActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerVaultCreation",
        contractAddress) : option(contract(registerVaultCreationActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_VAULT_CREATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerVaultCreationActionType))
        ]
// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------

(* Get loan token record from lending controller contract *)
function getLoanTokenRecordFromLendingController(const loanTokenName : string; const s : vaultFactoryStorageType) : loanTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get loan token record of user from Lending Controlelr contract
    const getLoanTokenRecordOptView : option (option (loanTokenRecordType)) = Tezos.call_view ("getLoanTokenRecordOpt", loanTokenName, lendingControllerAddress);
    const loanTokenRecord : loanTokenRecordType = case getLoanTokenRecordOptView of [
            Some (_viewResult)  -> case _viewResult of [
                    Some (_record)  -> _record
                |   None            -> failwith (error_LOAN_TOKEN_RECORD_NOT_FOUND)
            ]
        |   None                -> failwith (error_GET_LOAN_TOKEN_RECORD_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND)
    ];

} with loanTokenRecord



(* verify vault handle is unique in Lending Controller contract s.vaults *)
function verifyVaultHandleIsUnique(const vaultHandle : vaultHandleType;  const s : vaultFactoryStorageType) : unit is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get vault from Lending Controller contract
    const getVaultOptView : option (loanTokenRecordType) = Tezos.call_view ("getVaultOpt", vaultHandle, lendingControllerAddress);
    const vaultIsUnique : unit = case getVaultOptView of [
            Some (_vaultExists) -> failwith (error_VAULT_ALREADY_EXISTS)
        |   None                -> unit
    ];

} with vaultIsUnique

// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

function registerVaultCreationOperation(const vaultOwner : address; const vaultId : nat; const vaultAddress : address; const loanTokenName : string; const s : vaultFactoryStorageType) : operation is
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
    
    const registerVaultCreationParams : registerVaultCreationActionType = record [ 
        vaultOwner     = vaultOwner;
        vaultId        = vaultId;
        vaultAddress   = vaultAddress;
        loanTokenName  = loanTokenName;
    ];

    const registerVaultCreationOperation : operation = Tezos.transaction(
        registerVaultCreationParams,
        0tez,
        getRegisterVaultCreationEntrypointInLendingController(lendingControllerAddress)
    );

} with registerVaultCreationOperation

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(vaultFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(vaultFactoryLambdaAction, s)
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

// Vault Factory Lambdas:
#include "../partials/contractLambdas/vaultFactory/vaultFactoryLambdas.ligo"

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
[@view] function getAdmin(const _ : unit; var s : vaultFactoryStorageType) : address is
    s.admin



(* View: checkFarmExists *)
// [@view] function checkVaultExists (const farmContract : address; const s: vaultFactoryStorageType) : bool is 
//     Set.mem(farmContract, s.trackedFarms)



(* View: get config *)
[@view] function getConfig (const _ : unit; const s : vaultFactoryStorageType) : vaultFactoryConfigType is 
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig (const _ : unit; const s : vaultFactoryStorageType) : vaultFactoryBreakGlassConfigType is 
    s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : vaultFactoryStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts (const _ : unit; const s : vaultFactoryStorageType) : generalContractsType is 
    s.generalContracts



(* View: get tracked farms *)
// [@view] function getTrackedFarms (const _ : unit; const s : vaultFactoryStorageType) : set(address) is 
//     s.trackedFarms



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : vaultFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : vaultFactoryStorageType) : lambdaLedgerType is
    s.lambdaLedger



(* View: get a vault lambda *)
[@view] function vaultLambdaOpt(const lambdaName : string; var s : vaultFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.vaultLambdaLedger)



(* View: get the vault lambda ledger *)
[@view] function vaultLambdaLedger(const _ : unit; var s : vaultFactoryStorageType) : lambdaLedgerType is
    s.vaultLambdaLedger

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
function setAdmin(const newAdminAddress : address; var s : vaultFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vaultFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vaultFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : vaultFactoryUpdateConfigParamsType; var s : vaultFactoryStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : vaultFactoryStorageType) : return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : vaultFactoryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : vaultFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s : vaultFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : vaultFactoryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : vaultFactoryTogglePauseEntrypointType; const s : vaultFactoryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault Factory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createVault entrypoint *)
function createVault(const createVaultParams : createVaultType; var s : vaultFactoryStorageType) : return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vaultFactory lambda action
    const vaultFactoryLambdaAction : vaultFactoryLambdaActionType = LambdaCreateVault(createVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultFactoryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// vault Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : vaultFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams : setLambdaType; var s : vaultFactoryStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.vaultLambdaLedger[lambdaName] := lambdaBytes;

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
function main (const action : vaultFactoryAction; var s : vaultFactoryStorageType) : return is
block{
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with (

    case action of [
        
            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)             -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)               -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)     -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)           -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                  -> pauseAll(s)
        |   UnpauseAll (_parameters)                -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)      -> togglePauseEntrypoint(parameters, s)

            // Vault Factory Entrypoints
        |   CreateVault (params)                    -> createVault(params, s)
    
            // Lambda Entrypoints
        |   SetLambda (parameters)                  -> setLambda(parameters, s)
        |   SetProductLambda (parameters)           -> setProductLambda(parameters, s)
    ]
)
