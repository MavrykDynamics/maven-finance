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
    
        // Vault Entrypoints
    |   VaultDelegateTezToBaker         of vaultDelegateTezToBakerType
    |   VaultDelegateMvkToSatellite     of satelliteAddressType
    |   VaultWithdraw                   of vaultWithdrawType
    |   VaultDeposit                    of vaultDepositType 
    |   VaultUpdateDepositor            of vaultUpdateDepositorType
  
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

// helper function to %registerDeposit entrypoint in the Lending Controller
function getRegisterDepositEntrypointInLendingController(const contractAddress : address) : contract(registerDepositActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerDeposit",
        contractAddress) : option(contract(registerDepositActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerDepositActionType))
        ];



// helper function to %registerWithdrawal entrypoint in the vault controller
function getRegisterWithdrawalEntrypointInLendingController(const contractAddress : address) : contract(registerWithdrawalActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerWithdrawal",
        contractAddress) : option(contract(registerWithdrawalActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerWithdrawalActionType))
        ];



// helper function to %delegateToSatellite entrypoint in the delegation contract
function getDelegateToSatelliteEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%delegateToSatellite",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(address))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get collateral token record from Lending Controller through on-chain view
function getCollateralTokenRecord(const tokenContractAddress : address; const s : vaultStorageType) : collateralTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // check collateral token contract address exists in Lending Controller collateral token ledger
    const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByAddressOpt", tokenContractAddress, lendingControllerAddress);
    const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
            Some (_opt)    -> _opt
        |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND)
    ];
    const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
            Some(_record)  -> _record
        |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];

} with collateralTokenRecord



// helper function to register deposit in lending controller
function registerDepositInLendingController(const amount : nat; const tokenType : tokenType; const s : vaultStorageType) : operation is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    const registerDepositOperation : operation = case tokenType of [

        |   Tez(_tez) -> block{

                // create register deposit params
                const registerDepositParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = "tez";
                ];
                
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerDepositOperation

        |   Fa12(token) -> block{

                // get collateral token record from Lending Controller
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecord(token, s);

                // create register deposit params
                const registerDepositParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                    
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerDepositOperation

        |   Fa2(token) -> block{

                // get collateral token record from Lending Controller
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecord(token.tokenContractAddress, s);

                // create register deposit params
                const registerDepositParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                    
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerDepositOperation

    ];

} with registerDepositOperation



// helper function to process vault transfer (for deposit/withdrawal)
function processVaultTransfer(const from_ : address; const to_ : address; const amount : nat; const tokenType : tokenType) : operation is 
block {

    const processVaultTransferOperation : operation = case tokenType of [
        |   Tez(_tez)   -> transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez to vault.") : contract(unit)), amount * 1mutez)
        |   Fa12(token) -> {
                checkNoAmount(unit);
                const transferOperation : operation = transferFa12Token(from_, to_, amount, token)
            } with transferOperation
        |   Fa2(token)  -> {
                checkNoAmount(unit);
                const transferOperation : operation = transferFa2Token(from_, to_, amount, token.tokenId, token.tokenContractAddress)
            } with transferOperation
    ];

} with processVaultTransferOperation



// helper function to register withdrawal in lending controller
function registerWithdrawalInLendingController(const amount : nat; const tokenType : tokenType; const s : vaultStorageType) : operation is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    const registerWithdrawalOperation : operation = case tokenType of [

        |   Tez(_tez) -> block{

                // create register withdrawal params
                const registerWithdrawalParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = "tez";
                ];
                
                // create register withdrawal operation
                const registerWithdrawalOperation : operation = Tezos.transaction(
                    registerWithdrawalParams,
                    0mutez,
                    getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerWithdrawalOperation

        |   Fa12(token) -> block{

                // get collateral token record from Lending Controller
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecord(token, s);

                // create register deposit params
                const registerWithdrawalParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                    
                // create register deposit operation
                const registerWithdrawalOperation : operation = Tezos.transaction(
                    registerWithdrawalParams,
                    0mutez,
                    getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerWithdrawalOperation

        |   Fa2(token) -> block{

                // get collateral token record from Lending Controller
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecord(token.tokenContractAddress, s);

                // create register deposit params
                const registerWithdrawalParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                    
                // create register deposit operation
                const registerWithdrawalOperation : operation = Tezos.transaction(
                    registerWithdrawalParams,
                    0mutez,
                    getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerWithdrawalOperation

    ];

} with registerWithdrawalOperation

// ------------------------------------------------------------------------------
// Contract Helper Functions End
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

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
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



(* vaultUpdateDepositor entrypoint *)
function vaultUpdateDepositor(const vaultUpdateDepositorParams : vaultUpdateDepositorType; var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultUpdateDepositor"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaVaultUpdateDepositor(vaultUpdateDepositorParams);

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
        
            // Vault Entrypoints 
        |   VaultDelegateTezToBaker(parameters)          -> vaultDelegateTezToBaker(parameters, s)
        |   VaultDelegateMvkToSatellite(parameters)      -> vaultDelegateMvkToSatellite(parameters, s)
        |   VaultWithdraw(parameters)                    -> vaultWithdraw(parameters, s)
        |   VaultDeposit(parameters)                     -> vaultDeposit(parameters, s)
        |   VaultUpdateDepositor(parameters)             -> vaultUpdateDepositor(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                        -> setLambda(parameters, s)    

    ]