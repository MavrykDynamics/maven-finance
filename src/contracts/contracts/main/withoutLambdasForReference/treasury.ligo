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

// MvkToken Types
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury Types
#include "../partials/types/treasuryTypes.ligo"

// ------------------------------------------------------------------------------

type treasuryAction is 

    | Default                        of unit

    // Housekeeping Entrypoints
    | SetAdmin                       of (address)
    | UpdateMetadata                  of (string * bytes)
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


// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED                                 = 1n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 2n;

[@inline] const error_TRANSFER_ENTRYPOINT_IS_PAUSED                                          = 3n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IS_PAUSED                             = 4n;
[@inline] const error_MINT_ENTRYPOINT_NOT_FOUND                                              = 5n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_NOT_FOUND_IN_DELEGATION_CONTRACT            = 6n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND                         = 7n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND                          = 8n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 9n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 10n;

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
block {
    
    // First check because a treasury without a factory should still be accessible
    if Tezos.sender = s.admin 
    then skip
    else{
        const treasuryFactoryAddress: address = case s.whitelistContracts["treasuryFactory"] of [
            Some (_address) -> _address
        |   None -> (failwith(error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED): address)
        ];
        if Tezos.sender = treasuryFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED);
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
    if s.breakGlassConfig.transferIsPaused then failwith(error_TRANSFER_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkMintMvkAndTransferIsNotPaused(var s : treasuryStorage) : unit is
    if s.breakGlassConfig.mintMvkAndTransferIsPaused then failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IS_PAUSED)
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
  | None -> (failwith(error_MINT_ENTRYPOINT_NOT_FOUND) : contract(mintParams))
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



// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(updateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
    "%onStakeChange",
    delegationAddress) : option(contract(updateSatelliteBalanceParams))) of [
      Some(contr) -> contr
    | None        -> (failwith(error_ON_STAKE_CHANGE_ENTRYPOINT_NOT_FOUND_IN_DELEGATION_CONTRACT) : contract(updateSatelliteBalanceParams))
  ];

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
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND): contract(fa12TransferType))
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
        |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND): contract(fa2TransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
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
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    s.admin := newAdminAddress;

} with (noOperations, s)



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : treasuryStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s: treasuryStorage) : return is
block {
    
    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    // set all pause configs to True
    if s.breakGlassConfig.transferIsPaused then skip
    else s.breakGlassConfig.transferIsPaused := True;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then skip
    else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

} with (noOperations, s)



(* unpauseAll entrypoint *)
function unpauseAll(var s : treasuryStorage) : return is
block {
    
    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    // set all pause configs to False
    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else skip;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else skip;

} with (noOperations, s)



(* togglePauseTransfer entrypoint *)
function togglePauseTransfer(var s : treasuryStorage) : return is
block {

    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else s.breakGlassConfig.transferIsPaused := True;

} with (noOperations, s)



(* togglePauseMintMvkAndTransfer entrypoint *)
function togglePauseMintMvkAndTransfer(var s : treasuryStorage) : return is
block {

    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Entrypoints Begin
// ------------------------------------------------------------------------------

(* transfer entrypoint *)
function transfer(const transferTokenParams : transferActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send transfer operation from Treasury account to user account
    // 3. Update user's satellite details in Delegation contract

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    // break glass check
    checkTransferIsNotPaused(s);

    // const txs : list(transferDestinationType)   = transferTokenParams.txs;
    const txs : list(transferDestinationType)   = transferTokenParams;
    
    const delegationAddress : address = case s.generalContracts["delegation"] of [
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    ];
    
    const mvkTokenAddress : address = s.mvkTokenAddress;

    function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
    block {

        const token        : tokenType        = destination.token;
        const to_          : owner            = destination.to_;
        const amt          : tokenAmountType  = destination.amount;
        const from_        : address          = Tezos.self_address; // treasury
        
        const transferTokenOperation : operation = case token of [
            | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address. Cannot transfer XTZ"): contract(unit)), amt)
            | Fa12(token) -> transferFa12Token(from_, to_, amt, token)
            | Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
        ];

        accumulator := transferTokenOperation # accumulator;

        // update user's satellite balance if MVK is transferred
        const checkIfMvkToken : bool = case token of [
              Tez -> False
            | Fa12(_token) -> False
            | Fa2(token) -> block {
                    var mvkBool : bool := False;
                    if token.tokenContractAddress = mvkTokenAddress then mvkBool := True else mvkBool := False;                
                } with mvkBool        
        ];

        if checkIfMvkToken = True then block {
            
            const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                (to_),
                0mutez,
                updateSatelliteBalance(delegationAddress)
            );

            accumulator := updateSatelliteBalanceOperation # accumulator;

        } else skip;    

    } with accumulator;

    const emptyOperation : list(operation) = list[];
    const operations : list(operation) = List.fold(transferAccumulator, txs, emptyOperation);

} with (operations, s)



(* mintMvkAndTransfer entrypoint *)
function mintMvkAndTransfer(const mintMvkAndTransferParams : mintMvkAndTransferType ; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send mint operation to MVK Token Contract
    // 3. Update user's satellite details in Delegation contract

    // break glass check
    checkMintMvkAndTransferIsNotPaused(s);

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    const to_    : address   = mintMvkAndTransferParams.to_;
    const amt    : nat       = mintMvkAndTransferParams.amt;

    const mvkTokenAddress : address = s.mvkTokenAddress;

    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
    ];

    const mintMvkTokensOperation : operation = mintTokens(
        to_,                // to address
        amt,                // amount of mvk Tokens to be minted
        mvkTokenAddress     // mvkTokenAddress
    ); 

    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
        (to_),
        0mutez,
        updateSatelliteBalance(delegationAddress)
    );

    operations := mintMvkTokensOperation # operations;
    operations := updateSatelliteBalanceOperation # operations;

} with (operations, s)

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

function main (const action : treasuryAction; const s : treasuryStorage) : return is 
    
    case action of [

        | Default(_params)                              -> ((nil : list(operation)), s)
        
          // Housekeeping Entrypoints
        | SetAdmin(parameters)                          -> setAdmin(parameters, s)
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters.0, parameters.1, s)
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
