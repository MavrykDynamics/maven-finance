// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// MvkToken Types
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury Types
#include "../partials/types/treasuryTypes.ligo"

type treasuryAction is 
    | Default                        of unit

    // Housekeeping Config Entrypoints
    | SetAdmin                       of (address)
    | UpdateMetadata                  of (string * bytes)
    | UpdateWhitelistContracts       of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts         of updateGeneralContractsParams

    // Pause / Break Glass Entrypoints
    | PauseAll                       of (unit)
    | UnpauseAll                     of (unit)
    | TogglePauseTransfer            of (unit)
    | TogglePauseMintMvkAndTransfer  of (unit)

    // Main Entrypoints
    | Transfer                       of transferActionType
    | MintMvkAndTransfer             of mintMvkAndTransferType

const noOperations : list (operation) = nil;
type return is list (operation) * treasuryStorage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : treasuryStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsAllowed(const s: treasuryStorage): unit is
block {
    // First check because a treasury without a factory should still be accessible
    if Tezos.sender = s.admin 
    then skip
    else{
        const treasuryFactoryAddress: address = case s.whitelistContracts["treasuryFactory"] of [
            Some (_address) -> _address
        |   None -> (failwith("Only Admin or Factory contract allowed"): address)
        ];
        if Tezos.sender = treasuryFactoryAddress then skip else failwith("Only Admin or Factory contract allowed");
    };
} with(unit)

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

////
// BREAK GLASS CHECKS
////

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkTransferIsNotPaused(var s : treasuryStorage) : unit is
    if s.breakGlassConfig.transferIsPaused then failwith("Transfer entrypoint is paused.")
    else unit;

function checkMintMvkAndTransferIsNotPaused(var s : treasuryStorage) : unit is
    if s.breakGlassConfig.mintMvkAndTransferIsPaused then failwith("MintMvkAndTransfer entrypoint is paused.")
    else unit;

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
  } with (noOperations, s)

// admin helper functions end ---------------------------------------------------------

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintParams) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintParams))) of [
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintParams))
  ];

(* Helper function to mint mvk/smvk tokens *)
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
  | None -> (failwith("onStakeChange entrypoint in Delegation Contract not found") : contract(updateSatelliteBalanceParams))
  ];


////
// TRANSFER HELPER FUNCTIONS
///
function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of [
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
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
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : treasuryStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    s.admin := newAdminAddress;

} with (noOperations, s)

(*  update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : treasuryStorage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
} with (noOperations, s)

////
// Pause Functions
///
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

function togglePauseTransfer(var s : treasuryStorage) : return is
block {
    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else s.breakGlassConfig.transferIsPaused := True;

} with (noOperations, s)

function togglePauseMintMvkAndTransfer(var s : treasuryStorage) : return is
block {
    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

} with (noOperations, s)


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

(* mint and transfer entrypoint *)
// type mintAndTransferType is record [to_ : address; amt : nat;]
function mintMvkAndTransfer(const mintMvkAndTransfer : mintMvkAndTransferType ; var s : treasuryStorage) : return is 
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

    const to_    : address   = mintMvkAndTransfer.to_;
    const amt    : nat       = mintMvkAndTransfer.amt;

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


function main (const action : treasuryAction; const s : treasuryStorage) : return is 
    case action of [
        | Default(_params)                              -> ((nil : list(operation)), s)
        
        // Housekeeping Config Entrypoints
        | SetAdmin(parameters)                          -> setAdmin(parameters, s)
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters.0, parameters.1, s)
        | UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)
        | UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)

        // Pause / Break Glass Entrypoints
        | PauseAll (_parameters)                        -> pauseAll(s)
        | UnpauseAll (_parameters)                      -> unpauseAll(s)
        | TogglePauseTransfer (_parameters)             -> togglePauseTransfer(s)
        | TogglePauseMintMvkAndTransfer (_parameters)   -> togglePauseMintMvkAndTransfer(s)
        
        // Main Entrypoints
        | Transfer(parameters)                          -> transfer(parameters, s)
        | MintMvkAndTransfer(parameters)                -> mintMvkAndTransfer(parameters, s)
    ]
