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

// Token Pool Types
#include "../partials/contractTypes/tokenPoolRewardTypes.ligo"

// Token Pool Reward Types
#include "../partials/contractTypes/tokenPoolRewardTypes.ligo"

// ------------------------------------------------------------------------------


type tokenPoolRewardAction is 

    |   Default                        of unit

        // Housekeeping Entrypoints    
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    // |   UpdateWhitelistContracts        of updateWhitelistContractsType
    // |   UpdateGeneralContracts          of updateGeneralContractsType
    // |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType

        // BreakGlass Entrypoints   
    // |   PauseAll                        of (unit)
    // |   UnpauseAll                      of (unit)
    // |   TogglePauseEntrypoint           of tokenPoolRewardTogglePauseEntrypointType

        // Rewards Entrypoints
    // |   OnClaimRewards                  of onClaimRewardsActionType
    
const noOperations : list (operation) = nil;
type return is list (operation) * tokenPoolRewardStorageType


// tokenPoolReward contract methods lambdas
type tokenPoolRewardUnpackLambdaFunctionType is (tokenPoolRewardLambdaActionType * tokenPoolRewardStorageType) -> return



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
function checkSenderIsAdmin(var s : tokenPoolRewardStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Vault Controller Contract
// function checkSenderIsVaultControllerContract(var s : tokenPoolRewardStorageType) : unit is
// block{

//     const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vaultController", s.governanceAddress);
//     const vaultControllerAddress : address = case generalContractsOptView of [
//             Some (_optionContract) -> case _optionContract of [
//                     Some (_contract)    -> _contract
//                 |   None                -> failwith (error_VAULT_CONTROLLER_CONTRACT_NOT_FOUND)
//             ]
//         |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
//     ];

//     if (Tezos.get_sender() = vaultControllerAddress) then skip
//     else failwith(error_ONLY_VAULT_CONTROLLER_CONTRACT_ALLOWED);

// } with unit



// helper function to get mintOrBurn entrypoint from LQT contract
// function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
//     case (Tezos.get_entrypoint_opt(
//         "%mintOrBurn",
//         tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
//                 Some(contr) -> contr
//             |   None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
//         ]



// function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address; var s : tokenPoolRewardStorageType) : operation is 
// block {

//     const mintOrBurnParams : mintOrBurnParamsType = record [
//         quantity = quantity;
//         target   = target;
//     ];

// } with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )



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
function unpackLambda(const lambdaBytes : bytes; const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(tokenPoolRewardUnpackLambdaFunctionType)) of [
            Some(f) -> f(tokenPoolRewardLambdaAction, s)
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
// [@view] function viewGetTokenRecordByName(const tokenName : string; var s : tokenPoolRewardStorageType) : option(tokenRecordType) is
//     Big_map.find_opt(tokenName, s.tokenLedger)



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
function setAdmin(const newAdminAddress : address; var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : tokenPoolRewardStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenPoolRewardStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

} with response



// (* updateConfig entrypoint *)
// function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : tokenPoolRewardStorageType) : return is 
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateConfig(updateConfigParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

// } with response



(* updateWhitelistContracts entrypoint *)
// function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : tokenPoolRewardStorageType) : return is
// block {
    
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

// } with response



// (* updateGeneralContracts entrypoint *)
// function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : tokenPoolRewardStorageType) : return is
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

// } with response



// (* updateWhitelistTokenContracts entrypoint *)
// function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : tokenPoolRewardStorageType) : return is
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);  

// } with response


// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
// function pauseAll(var s : tokenPoolRewardStorageType) : return is
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaPauseAll(unit);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

// } with response



// (* unpauseAll entrypoint *)
// function unpauseAll(var s : tokenPoolRewardStorageType) : return is
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaUnpauseAll(unit);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

// } with response



// (*  togglePauseEntrypoint entrypoint  *)
// function togglePauseEntrypoint(const targetEntrypoint : tokenPoolRewardTogglePauseEntrypointType; const s : tokenPoolRewardStorageType) : return is
// block{
  
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);

// } with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Rewards Entrypoints Begin
// ------------------------------------------------------------------------------

(* transfer entrypoint *)
// function transfer(const transferParams : transferActionType; var s : tokenPoolRewardStorageType) : return is 
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaTransfer"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init token pool lambda action
//     const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType = LambdaTransfer(transferParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, tokenPoolRewardLambdaAction, s);
    
// } with response

// ------------------------------------------------------------------------------
// Rewards Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : tokenPoolRewardAction; const s : tokenPoolRewardStorageType) : return is 

    case action of [

        |   Default(_params)                              -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                   -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        // |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        // |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        // |   UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)

            // Rewards Entrypoints
        // |   OnClaimRewards(parameters)                  -> onclaimRewards(parameters, s)
           
    ]