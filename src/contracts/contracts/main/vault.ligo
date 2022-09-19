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
    |   DelegateTezToBaker              of delegateTezToBakerType
    |   DelegateMvkToSatellite          of satelliteAddressType
    |   Withdraw                        of withdrawType
    |   Deposit                         of depositType 
    |   UpdateDepositor                 of updateDepositorType
  
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

// helper function to get break glass config from lending controller 
function getBreakGlassConfigFromLendingController(const s : vaultStorageType) : lendingControllerBreakGlassConfigType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // get break glass config from lending controller
    const getBreakGlassConfigView : option (lendingControllerBreakGlassConfigType) = Tezos.call_view ("getBreakGlassConfig", unit, lendingControllerAddress);
    const breakGlassConfig : lendingControllerBreakGlassConfigType = case getBreakGlassConfigView of [
            Some (_breakGlassConfig) -> _breakGlassConfig
        |   None                     -> failwith(error_BREAK_GLASS_CONFIG_NOT_FOUND_IN_LENDING_CONTROLLER)
    ];

} with breakGlassConfig



// helper function to get collateral token record by name from Lending Controller through on-chain view
function getCollateralTokenRecordByName(const tokenName : string; const s : vaultStorageType) : collateralTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // check collateral token contract address exists in Lending Controller collateral token ledger
    const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByNameOpt", tokenName, lendingControllerAddress);
    const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
            Some (_opt)    -> _opt
        |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_NAME_OPT_VIEW_NOT_FOUND)
    ];
    const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
            Some(_record)  -> _record
        |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];

} with collateralTokenRecord



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



// helper function to register deposit in lending controller
function registerDepositInLendingController(const amount : nat; const tokenName : string; const tokenType : tokenType; const s : vaultStorageType) : operation is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    const registerDepositOperation : operation = case tokenType of [

        |   Tez(_tez) -> block{

                // create register deposit params
                const registerDepositParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = tokenName;
                ];
                
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerDepositOperation

        |   Fa12(_token) -> block{

                // create register deposit params
                const registerDepositParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = tokenName;
                ];
                    
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerDepositOperation

        |   Fa2(_token) -> block{

                // create register deposit params
                const registerDepositParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = tokenName;
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



// helper function to register withdrawal in lending controller
function registerWithdrawalInLendingController(const amount : nat; const tokenName : string; const tokenType : tokenType; const s : vaultStorageType) : operation is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    const registerWithdrawalOperation : operation = case tokenType of [

        |   Tez(_tez) -> block{

                // create register withdrawal params
                const registerWithdrawalParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = tokenName;
                ];
                
                // create register withdrawal operation
                const registerWithdrawalOperation : operation = Tezos.transaction(
                    registerWithdrawalParams,
                    0mutez,
                    getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerWithdrawalOperation

        |   Fa12(_token) -> block{

                // create register deposit params
                const registerWithdrawalParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = tokenName;
                ];
                    
                // create register deposit operation
                const registerWithdrawalOperation : operation = Tezos.transaction(
                    registerWithdrawalParams,
                    0mutez,
                    getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
                );

            } with registerWithdrawalOperation

        |   Fa2(_token) -> block{

                // create register deposit params
                const registerWithdrawalParams : registerDepositActionType = record [
                    handle          = s.handle;
                    amount          = amount;
                    tokenName       = tokenName;
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
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that vaultDelegateTezToBaker is not paused in Lending Controller
function checkVaultDelegateTezToBakerIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    

    const checkEntrypointPaused : unit = if breakGlassConfig.vaultDelegateTezToBakerIsPaused then failwith(error_VAULT_DELEGATE_TEZ_TO_BAKER_IN_LENDING_CONTROLLER_CONTRACT_PAUSED) else unit;

} with checkEntrypointPaused
    


// helper function to check that vaultDelegateMvkToSat is not paused in Lending Controller
function checkVaultDelegateMvkToSatIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    

    const checkEntrypointPaused : unit = if breakGlassConfig.vaultDelegateMvkToSatelliteIsPaused then failwith(error_VAULT_DELEGATE_MVK_TO_SAT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED) else unit;

} with checkEntrypointPaused
    


// helper function to check that vaultWithdraw is not paused in Lending Controller
function checkVaultWithdrawIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    

    const checkEntrypointPaused : unit = if breakGlassConfig.vaultWithdrawIsPaused then failwith(error_VAULT_WITHDRAW_IN_LENDING_CONTROLLER_CONTRACT_PAUSED) else unit;

} with checkEntrypointPaused



// helper function to check that %vaultDeposit is not paused
function checkVaultDepositIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    

    const checkEntrypointPaused : unit = if breakGlassConfig.vaultDepositIsPaused then failwith(error_VAULT_DEPOSIT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED) else unit;

} with checkEntrypointPaused



// helper function to check that the vaultUpdateDepositor entrypoint is not paused in Lending Controller
function checkVaultUpdateDepositorIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    

    const checkEntrypointPaused : unit = if breakGlassConfig.vaultUpdateDepositorIsPaused then failwith(error_VAULT_UPDATE_DEPOSITOR_IN_LENDING_CONTROLLER_CONTRACT_PAUSED) else unit;

} with checkEntrypointPaused

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
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

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : vaultStorageType) : address is
    s.admin



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : vaultStorageType) : address is
    s.governanceAddress



(* View: get vault handle *)
[@view] function getVaultHandle(const _ : unit; var s : vaultStorageType) : vaultHandleType is
    s.handle



(* View: get vault depositors *)
[@view] function getVaultDepositors(const _ : unit; var s : vaultStorageType) : depositorsType is
    s.depositors



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : vaultStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : vaultStorageType) : lambdaLedgerType is
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

(* delegateTezToBaker entrypoint *)
function delegateTezToBaker(const delegateParams : delegateTezToBakerType; var s : vaultStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDelegateTezToBaker"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateTezToBaker(delegateParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* delegateMvkToSatellite entrypoint *)
function delegateMvkToSatellite(const satelliteAddress : address; var s : vaultStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDelegateMvkToSat"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDelegateMvkToSat(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response




(* withdraw entrypoint *)
function withdraw(const withdrawParams : withdrawType; var s : vaultStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdraw"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaWithdraw(withdrawParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* deposit entrypoint *)
function deposit(const depositParams : depositType; var s : vaultStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDeposit"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaDeposit(depositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultLambdaAction, s);

} with response



(* updateDepositor entrypoint *)
function updateDepositor(const updateDepositorParams : updateDepositorType; var s : vaultStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateDepositor"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultLambdaAction : vaultLambdaActionType = LambdaUpdateDepositor(updateDepositorParams);

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
        |   DelegateTezToBaker(parameters)               -> delegateTezToBaker(parameters, s)
        |   DelegateMvkToSatellite(parameters)           -> delegateMvkToSatellite(parameters, s)
        |   Withdraw(parameters)                         -> withdraw(parameters, s)
        |   Deposit(parameters)                          -> deposit(parameters, s)
        |   UpdateDepositor(parameters)                  -> updateDepositor(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                        -> setLambda(parameters, s)    

    ]