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

// Token Pool Types
#include "../partials/contractTypes/tokenPoolTypes.ligo"

// ------------------------------------------------------------------------------


type tokenPoolAction is 

        // Housekeeping Entrypoints    
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of vaultControllerUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsParams
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams

        // BreakGlass Entrypoints   
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of tokenPoolTogglePauseEntrypointType

        // Token Pool Entrypoints
    |   AddLiquidity                    of addLiquidityActionType
    |   RemoveLiquidity                 of removeLiquidityActionType 

        // Lending Entrypoints
    |   OnBorrow                        of onBorrowActionType
    |   OnRepay                         of onRepayActionType
    // |   Transfer                      of transferActionType

const noOperations : list (operation) = nil;
type return is list (operation) * tokenPoolStorageType


// tokenPool contract methods lambdas
type tokenPoolUnpackLambdaFunctionType is (tokenPoolLambdaActionType * tokenPoolStorageTypeType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const zeroAddress           : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy    : nat      = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division
const constFee              : nat      = 9995n;  // 0.05% fee
const constFeeDenom         : nat      = 10000n;

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

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : tokenPoolStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Vault Controller Contract
function checkSenderIsVaultControllerContract(var s : tokenPoolStorageTypeType) : unit is
block{

    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vaultController", s.governanceAddress);
    const vaultControllerAddress : address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_VAULT_CONTROLLER_CONTRACT_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    if (Tezos.get_sender() = vaultControllerAddress) then skip
    else failwith(error_ONLY_VAULT_CONTROLLER_CONTRACT_ALLOWED);

} with unit



// helper function to get mintOrBurn entrypoint from LQT contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
        ]



function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address; var s : tokenPoolStorageType) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageTypeType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(tokenPoolUnpackLambdaFunctionType)) of [
            Some(f) -> f(tokenPoolLambdaAction, s)
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
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get stablecoin token in token ledger *)
[@view] function viewGetTokenRecordByName(const tokenName : string; var s : tokenPoolStorageType) : option(tokenRecordType) is
    Big_map.find_opt(tokenName, s.tokenLedger)



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
function setAdmin(const newAdminAddress : address; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaSetAdmin(setAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : tokenPoolStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : tokenPoolStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);  

} with response


// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : tokenPoolTogglePauseEntrypointType; const s : tokenPoolStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Entrypoints Begin
// ------------------------------------------------------------------------------

(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType ; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddLiquidity"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaAddLiquidity(addLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response




(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType; var s : tokenPoolStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveLiquidity"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaRemoveLiquidity(removeLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Token Pool Entrypoints End
// ------------------------------------------------------------------------------



(* transfer entrypoint *)
// function transfer(const transferTokenParams : transferActionType; var s : treasuryStorageType) : return is 
// block {
    
//     // Steps Overview:
//     // 1. Check that sender is in whitelist (governance)
//     // 2. Send transfer operation from Treasury account to user account

//     if not checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
//     else skip;

//     // break glass check
//     checkTransferIsNotPaused(s);

//     var operations : list(operation) := nil;

//     // const txs : list(transferDestinationType)   = transferTokenParams.txs;
//     const txs : list(transferDestinationType)   = transferTokenParams;
    
//     const whitelistTokenContracts   : whitelistTokenContractsType   = s.whitelistTokenContracts;

//     function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
//     block {

//         const token        : tokenType        = destination.token;
//         const to_          : ownerType        = destination.to_;
//         const amt          : tokenAmountType  = destination.amount;
//         const from_        : address          = Tezos.get_self_address(); // token pool
        
//         const transferTokenOperation : operation = case token of [
//             | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address"): contract(unit)), amt * 1mutez)
//             | Fa12(token) -> if not checkInWhitelistTokenContracts(token, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa12Token(from_, to_, amt, token)
//             | Fa2(token)  -> if not checkInWhitelistTokenContracts(token.tokenContractAddress, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
//         ];

//         accumulator := transferTokenOperation # accumulator;

//     } with accumulator;

//     const emptyOperation : list(operation) = list[];
//     operations := List.fold(transferAccumulator, txs, emptyOperation);

// } with (operations, s)


// ------------------------------------------------------------------------------
// Lending Entrypoints Begin
// ------------------------------------------------------------------------------

(* onBorrow entrypoint *)
function onBorrow(const onBorrowParams : onBorrowActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnBorrow"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaOnBorrow(onBorrowParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response



(* onRepay entrypoint *)
function onRepay(const onRepayParams : onRepayActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnRepay"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaOnRepay(onRepayParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Lending Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : tokenPoolAction; const s : tokenPoolStorageType) : return is 

    case action of [

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                   -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)

            // Token Pool Entrypoints
        |   AddLiquidity(parameters)                    -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)                 -> removeLiquidity(parameters, s)

            // Lending Entrypoints
        |   OnBorrow(parameters)                        -> onBorrow(parameters, s)
        |   OnRepay(parameters)                         -> onRepay(parameters, s)
        // |   Transfer(parameters)                      -> transfer(parameters, s)
           
    ]