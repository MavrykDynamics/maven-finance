// ------------------------------------------------------------------------------
// Common Types 
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// ------------------------------------------------------------------------------
// Functional Types 
// ------------------------------------------------------------------------------

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"


// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvkToken Types
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury Types
#include "../partials/types/treasuryTypes.ligo"

// ------------------------------------------------------------------------------

type treasuryAction is 

    | Default                        of unit

    // Housekeeping Entrypoints
    | SetAdmin                       of (address)
    | SetGovernance                  of (address)
    | SetBaker                       of option(key_hash)
    | UpdateMetadata                 of updateMetadataType
    | UpdateWhitelistContracts       of updateWhitelistContractsParams
    | UpdateGeneralContracts         of updateGeneralContractsParams
    | UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsParams

    // Pause / Break Glass Entrypoints
    | PauseAll                       of (unit)
    | UnpauseAll                     of (unit)
    | TogglePauseTransfer            of (unit)
    | TogglePauseMintMvkAndTransfer  of (unit)

    // Treasury Entrypoints
    | Transfer                       of transferActionType
    | MintMvkAndTransfer             of mintMvkAndTransferType

    // Lambda Entrypoints
    | SetLambda                      of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * treasuryStorage

// treasury contract methods lambdas
type treasuryUnpackLambdaFunctionType is (treasuryLambdaActionType * treasuryStorage) -> return



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



function checkSenderIsAdmin(var s : treasuryStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsAllowed(const s: treasuryStorage): unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdminOrGovernanceFinancial(const s: treasuryStorage): unit is
    block{
        const governanceFinancialAddress: address = case s.whitelistContracts["governanceFinancial"] of [
              Some (_address) -> _address
          |   None -> (failwith(error_ONLY_ADMIN_OR_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED): address)
        ];
        if (Tezos.sender = s.admin or Tezos.sender = governanceFinancialAddress) then skip
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
    } with(unit)



function checkSenderIsGovernanceOrFactory(const s: treasuryStorage): unit is
block {
    
    // First check because a treasury without a factory should still be accessible
    if Tezos.sender = s.admin or Tezos.sender = s.governanceAddress
    then skip
    else{
        const treasuryFactoryAddress: address = case s.whitelistContracts["treasuryFactory"] of [
              Some (_address) -> _address
          |   None -> (failwith(error_TREASURY_FACTORY_CONTRACT_NOT_FOUND): address)
        ];
        if Tezos.sender = treasuryFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkTransferIsNotPaused(var s : treasuryStorage) : unit is
    if s.breakGlassConfig.transferIsPaused then failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



function checkMintMvkAndTransferIsNotPaused(var s : treasuryStorage) : unit is
    if s.breakGlassConfig.mintMvkAndTransferIsPaused then failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintParams) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintParams))) of [
          Some(contr) -> contr
        | None -> (failwith(error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(mintParams))
      ];



// Helper function to mint mvk/smvk tokens 
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
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)



function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of [
                Some (c) -> c
              | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND): contract(fa12TransferType))
            ];
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))



function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: fa2TransferType = list[
            record[
                from_ = from_;
                txs = list[
                    record[
                        to_      = to_;
                        token_id = tokenId;
                        amount   = tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(fa2TransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of [
             Some (c) -> c
           | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND): contract(fa2TransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(treasuryUnpackLambdaFunctionType)) of [
        Some(f) -> f(treasuryLambdaAction, s)
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

// Treasury Lambdas:
#include "../partials/contractLambdas/treasury/treasuryLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _: unit; var s : treasuryStorage) : treasuryBreakGlassConfigType is
  s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : treasuryStorage) : whitelistContractsType is
  s.whitelistContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _: unit; var s : treasuryStorage) : whitelistTokenContractsType is
  s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : treasuryStorage) : generalContractsType is
  s.generalContracts



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : treasuryStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : treasuryStorage) : lambdaLedgerType is
  s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Entrypoints Begin
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
function setAdmin(const newAdminAddress : address; var s : treasuryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : treasuryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);

} with response



(* setBaker entrypoint *)
function setBaker(const keyHash : option(key_hash); var s : treasuryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetBaker"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetBaker(keyHash);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : treasuryStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s: treasuryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : treasuryStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* togglePauseTransfer entrypoint *)
function togglePauseTransfer(var s : treasuryStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTogglePauseTransfer(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* togglePauseMintMvkAndTransfer entrypoint *)
function togglePauseMintMvkAndTransfer(var s : treasuryStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseMintMvkAndTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTogglePauseMintTransfer(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Entrypoints Begin
// ------------------------------------------------------------------------------

(* transfer entrypoint *)
function transfer(const transferTokenParams : transferActionType; var s : treasuryStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTransfer(transferTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* mintMvkAndTransfer entrypoint *)
function mintMvkAndTransfer(const mintMvkAndTransferParams : mintMvkAndTransferType ; var s : treasuryStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMintMvkAndTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaMintMvkAndTransfer(mintMvkAndTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Treasury Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: treasuryStorage): return is
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
function main (const action : treasuryAction; const s : treasuryStorage) : return is 
    
    case action of [

        | Default(_params)                              -> ((nil : list(operation)), s)
        
          // Housekeeping Entrypoints
        | SetAdmin(parameters)                          -> setAdmin(parameters, s)
        | SetGovernance(parameters)                     -> setGovernance(parameters, s)
        | SetBaker(parameters)                          -> setBaker(parameters, s)
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        | UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)

          // Pause / Break Glass Entrypoints
        | PauseAll (_parameters)                        -> pauseAll(s)
        | UnpauseAll (_parameters)                      -> unpauseAll(s)
        | TogglePauseTransfer (_parameters)             -> togglePauseTransfer(s)
        | TogglePauseMintMvkAndTransfer (_parameters)   -> togglePauseMintMvkAndTransfer(s)
        
          // Treasury Entrypoints
        | Transfer(parameters)                          -> transfer(parameters, s)
        | MintMvkAndTransfer(parameters)                -> mintMvkAndTransfer(parameters, s)

          // Lambda Entrypoints
        | SetLambda(parameters)                         -> setLambda(parameters, s)
    ]
