// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Methods
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Vault Types
#include "../partials/contractTypes/vaultTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type vaultActionType is 

    |   Default of unit

        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType

        // Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of vaultTogglePauseEntrypointType

        // Vault Entrypoints
    |   VaultDelegateTezToBaker         of vaultDelegateTezToBakerType
    |   VaultDelegateMvkToSatellite     of satelliteAddressType
    |   VaultWithdraw                   of vaultWithdrawType
    |   VaultDeposit                    of vaultDepositType 
    |   VaultEditDepositor              of vaultEditDepositorType
  
        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType

const noOperations : list (operation) = nil;
type return is list (operation) * vaultStorageType

// vault contract methods lambdas
type vaultUnpackLambdaFunctionType is (vaultLambdaActionType * vaultStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : vaultStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(const s : vaultStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );

// ------------------------------------------------------------------------------
// Misc Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %registerDeposit entrypoint in the vault controller
function registerDepositInLendingController(const contractAddress : address) : contract(vaultControllerDepositType) is
    case (Tezos.get_entrypoint_opt(
        "%registerDeposit",
        contractAddress) : option(contract(vaultControllerDepositType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. RegisterDeposit entrypoint in contract not found") : contract(vaultControllerDepositType))
        ];



// helper function to %delegateToSatellite entrypoint in the delegation contract
function getDelegateToSatelliteEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%delegateToSatellite",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. delegateToSatellite entrypoint in contract not found") : contract(address))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(vaultUnpackLambdaFunctionType)) of [
            Some(f) -> f(vaultLambdaAction, s)
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

// Vault Lambdas :
#include "../partials/contractLambdas/vault/vaultLambdas.ligo"

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
function setAdmin(const newAdminAddress : address; var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
    
    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vaultStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : vaultStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : vaultTogglePauseEntrypointType; const s : vaultStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultDelegateTezToBaker entrypoint *)
function vaultDelegateTezToBaker(const vaultDelegateParams : vaultDelegateTezToBakerType; var s : vaultStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultDelegateTezToBaker"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaVaultDelegateTezToBaker(vaultDelegateParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* vaultDelegateMvkToSatellite entrypoint *)
function vaultDelegateMvkToSatellite(const satelliteAddress : address; var s : vaultStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultDelegateMvkToSat"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaVaultDelegateMvkToSat(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response




(* vaultWithdraw entrypoint *)
function vaultWithdraw(const vaultWithdrawParams : vaultWithdrawType; var s : vaultStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultWithdraw"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaVaultWithdraw(vaultWithdrawParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* vaultDeposit entrypoint *)
function vaultDeposit(const vaultDepositParams : vaultDepositType; var s : vaultStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultDeposit"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaVaultDeposit(vaultDepositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* vaultEditDepositor entrypoint *)
function vaultEditDepositor(const vaultEditDepositorParams : vaultEditDepositorType; var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultEditDepositor"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaVaultEditDepositor(vaultEditDepositorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : vaultStorageType) : return is
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
function main (const vaultAction : vaultActionType; const s : vaultStorageType) : return is 

    case vaultAction of [

        |   Default(_params)                             -> ((nil : list(operation)), s)

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                         -> setAdmin(parameters, s) 
        |   SetGovernance(parameters)                    -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                   -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)         -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)           -> updateGeneralContracts(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)

            // Vault Entrypoints 
        |   VaultDelegateTezToBaker(parameters)          -> vaultDelegateTezToBaker(parameters, s)
        |   VaultDelegateMvkToSatellite(parameters)      -> vaultDelegateMvkToSatellite(parameters, s)
        |   VaultWithdraw(parameters)                    -> vaultWithdraw(parameters, s)
        |   VaultDeposit(parameters)                     -> vaultDeposit(parameters, s)
        |   VaultEditDepositor(parameters)               -> vaultEditDepositor(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                        -> setLambda(parameters, s)    

    ]