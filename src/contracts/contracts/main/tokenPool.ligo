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

type ownerAddressType   is address;

type tokenBalanceType   is nat;
type tokenAmountType    is nat;
type tokenIdType        is nat;

// type mintOrBurnParamsType is (int * address);
type mintOrBurnParamsType is [@layout:comb] record [
    quantity  : int;
    target    : address;
]

// Token balance_of entrypoint inputs
type balanceOfRequestType is [@layout:comb] record[
  owner     : ownerAddressType;
  token_id  : tokenIdType;
]
type balanceOfResponseType is [@layout:comb] record[
  request  : balanceOfRequestType;
  balance  : tokenBalanceType;
]
type balanceOfParamsType is [@layout:comb] record[
  requests: list(balanceOfRequestType);
  callback: contract(list(balanceOfResponseType));
]
type getBalanceParamsType is address * contract(nat)

// ----- transfer types begin -----


type fa12ApproveType is (address * nat)
type transferDestination is [@layout:comb] record[
  to_       : address;
  token_id  : nat;
  amount    : tokenAmountType;
]
type transfer is [@layout:comb] record[
  from_     : address;
  txs       : list(transferDestination);
]
type fa2TransferType  is list(transfer)
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  tokenContractAddress    : address;
  tokenId                 : nat;
]

type tokenType       is
    |   Tez                     of tezType         // unit
    |   Fa12                    of fa12TokenType   // address
    |   Fa2                     of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

// ----- transfer types end -----

type tokenRecordType is [@layout:comb] record [
    
    tokenName                   : nat;
    tokenContractAddress        : address;
    tokenId                     : nat;
    tokenPoolTotal              : nat;

    lpTokensTotal               : nat;
    lpTokenContractAddress      : address;
    lpTokenId                   : nat;
    
]


// ----- types for entrypoint actions begin -----

type addLiquidityActionType is [@layout:comb] record [
    tokenName               : string;
    tokensDeposited         : nat;
    owner                   : address;
]

type removeLiquidityActionType is [@layout:comb] record [
    lpTokensBurned          : nat;
    tokenName               : string;
    tokensWithdrawn         : nat;
    [@annot:to] to_         : address;
]


// ----- types for entrypoint actions end -----

type tokenPoolStorage is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    // config                  : tokenPoolConfigType;

    governanceAddress       : address;
    
    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;

    // breakGlassConfig        : tokenPoolBreakGlassConfigType;
    
    tokenLedger             : big_map(string, tokenRecord);

    lambdaLedger            : lambdaLedgerType;   
]

type tokenPoolAction is 
    
    |   Default                       of unit
    |   SetAdmin                      of (address)

    |   AddLiquidity                  of addLiquidityActionType
    |   RemoveLiquidity               of removeLiquidityActionType 

    |   Transfer                      of transferActionType

const noOperations : list (operation) = nil;
type return is list (operation) * tokenPoolStorage


// ----- constants begin -----

const zeroAddress           : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy    : nat      = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division
const constFee              : nat      = 9995n;  // 0.05% fee
const constFeeDenom         : nat      = 10000n;

// ----- constants end -----


// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );


// helper function - check sender is admin
function checkSenderIsAdmin(var s : tokenPoolStorage) : unit is
  if (Tezos.get_sender() = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function - check sender is from cash token address
function checkSenderIsCashTokenAddress(var s : tokenPoolStorage) : unit is
  if (Tezos.get_sender() = s.cashTokenAddress) then unit
  else failwith("Error. Sender must be from the cash token address.");

// helper function - check sender is from token address
function checkSenderIsTokenAddress(var s : tokenPoolStorage) : unit is
  if (Tezos.get_sender() = s.tokenAddress) then unit
  else failwith("Error. Sender must be from the token address.");

// helper function - check that no tez is sent
function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith("This entrypoint should not receive any tez.");

// helper function - check if call is from an implicit account
function checkFromImplicitAccount(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.source) then unit
    else failwith("Error. Call must be from an implicit account.");



// helper function to get mintOrBurn entrypoint from USDM contract
function getUsdmMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%mintOrBurn",
      tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
        Some(contr) -> contr
    | None -> (failwith("Error. MintOrBurn entrypoint in token contract not found") : contract(mintOrBurnParamsType))
  ]



// helper function to get mintOrBurn entrypoint from LQT contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%mintOrBurn",
      tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
  ]



// helper function to get balance_of entrypoint from FA2 Token contract
function getFa2TokenBalanceOfEntrypoint(const tokenContractAddress : address) : contract(balanceOfParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%balance_of",
      tokenContractAddress) : option(contract(balanceOfParamsType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. Balance_of entrypoint in FA2 Token contract not found") : contract(balanceOfParamsType))
  ]



// helper function to get balance_of entrypoint from FA2 Token contract
function getFa12TokenBalanceOfEntrypoint(const tokenContractAddress : address) : contract(getBalanceParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%getBalance",
      tokenContractAddress) : option(contract(getBalanceParamsType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. GetBalance entrypoint in FA2 Token contract not found") : contract(getBalanceParamsType))
  ]



// helper function to get FA12 token approve entrypoint from contract
function getFa12ApproveEntrypoint(const tokenContractAddress : address) : contract(fa12ApproveType) is
  case (Tezos.get_entrypoint_opt(
      "%approve",
      tokenContractAddress) : option(contract(fa12ApproveType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. CashToToken entrypoint in contract not found") : contract(fa12ApproveType))
  ]




// helper function to update USDM contract on price action
function getOnPriceActionInUsdmEntrypoint(const tokenContractAddress : address) : contract(onPriceActionType) is
  case (Tezos.get_entrypoint_opt(
      "%onPriceAction",
      tokenContractAddress) : option(contract(onPriceActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. OnPriceAction entrypoint in token contract not found") : contract(onPriceActionType))
  ]


function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address; var s : tokenPoolStorage) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )

// ----- Transfer Helper Functions End -----

// helper function to update FA12 Token Pool Type
function updateFa12PoolInternal(const poolUpdate : updateFa12PoolType) : nat is poolUpdate

// helper function to update FA2 Token Pool Type
(* We trust the FA2 to provide the expected balance. there are no BFS shenanigans to worry about unless the token contract misbehaves. *)
function updateFa2PoolInternal(const poolUpdateParams : updateFa2PoolType) : nat is 
    case poolUpdateParams of [
        nil -> failwith("Error. Invalid FA2 balance response.")
        | x # _xs -> x.balance
    ]


function onPriceAction(const onPriceActionParams : onPriceActionType; var s : tokenPoolStorage) : operation is 
block {
    const updateConsumerOperation : operation = Tezos.transaction(
        onPriceActionParams,
        0mutez,
        getOnPriceActionInUsdmEntrypoint(s.usdmTokenAddress)
    );
} with (updateConsumerOperation)


// ------ Helper Functions end ------

function default(var s : tokenPoolStorage) : return is 
block {

#if CASH_IS_TEZ

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    const newCashPoolAmount : nat = s.cashPool + mutezToNatural(Tezos.amount);
    s.cashPool := newCashPoolAmount;

#else

    failwith("Error. Tez deposits are not accepted.");

#endif

} with (noOperations, s)




(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : tokenPoolStorage) : return is
block {
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    s.admin := newAdminAddress;
} with (noOperations, s)



(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType ; var s : tokenPoolStorage) : return is 
block {

    // init variables for convenience
    const tokenName           : nat                 = addLiquidityParams.tokenName;
    const tokensDeposited     : nat                 = addLiquidityParams.tokensDeposited;
    const owner               : address             = addLiquidityParams.owner; 
    var operations            : list(operation)    := nil;

    // check that no tez is sent
    checkNoAmount(Unit);

    // Get Token Record
    var tokenRecord : tokenRecordType := case s.tokenLedger[tokenName] of [
            Some(_record) -> _record 
        |   None          -> failwith("error_TOKEN_RECORD_NOT_FOUND")
    ];

    // update pool totals
    tokenRecord.tokenPoolTotal  := tokenRecord.tokenPoolTotal + tokensDeposited;
    tokenRecord.lpTokensTotal   := tokenRecord.lpTokensTotal + tokensDeposited;

    const tokenId                   : nat       = tokenRecord.tokenId;
    const tokenContractAddress      : address   = tokenRecord.tokenContractAddress;
    const lpTokenContractAddress    : address   = tokenRecord.lpTokenContractAddress;

    // Update Token Ledger
    s.tokenLedger[tokenName] := tokenRecord;

    // send token from sender to token pool
    const sendTokenToPoolOperation : operation = transferFa2Token(
        Tezos.get_sender(),               // from_
        Tezos.get_self_address(),         // to_
        tokensDeposited,            // token amount
        tokenId,                    // token id
        tokenContractAddress        // token contract address
    );
    operations := sendTokenToPoolOperation # operations;

    // mint LP Tokens and send to sender
    const mintLpTokensTokensOperation : operation = mintOrBurnLpToken(owner, int(lpTokensMinted), lpTokenContractAddress, s);
    operations := mintLpTokensTokensOperation # operations;

} with (operations, s)




(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType; var s : tokenPoolStorage) : return is 
block {
    
    // init variables for convenience
    const tokensName            : nat                 = addLiquidityParams.tokenName;
    const tokensWithdrawn       : nat                 = removeLiquidityParams.tokensWithdrawn;
    const recipient             : address             = removeLiquidityParams.to_; 
    var operations              : list(operation)    := nil;    

    // check that no tez is sent
    checkNoAmount(Unit);

    // Get Token Record
    var tokenRecord : tokenRecordType := case s.tokenLedger[tokenName] of [
            Some(_record) -> _record 
        |   None          -> failwith("error_TOKEN_RECORD_NOT_FOUND")
    ];
    
    const tokenId                   : nat       = tokenRecord.tokenId;
    const tokenContractAddress      : address   = tokenRecord.tokenContractAddress;
    const tokenPool                 : nat       = tokenRecord.tokenPoolTotal;
    
    const lpTokenContractAddress    : address   = tokenRecord.lpTokenContractAddress;
    const lpTokensTotal             : nat       = tokenRecord.lpTokensTotal;
    const lpTokensBurned            : nat       = tokensWithdrawn;

    // calculate new total of LP Tokens
    if lpTokensBurned > lpTokensTotal then failwith("Error. You cannot burn more than the total amount of LP tokens.") else skip;
    const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

    // calculate new token pool amount
    if tokensWithdrawn > tokenPool then failwith("Error. Token pool minus tokens withdrawn is negative.") else skip;
    const newTokenPool : nat = abs(tokenPool - tokensWithdrawn);

    // burn LP Token operation
    const burnLpTokenOperation : operation = mintOrBurnLpToken(Tezos.get_sender(), (0 - lpTokensBurned), lpTokenContractAddress, s);
    operations := burnLpTokenOperation # operations;

    // send withdrawn tokens to sender 
    const withdrawnTokensToSenderOperation : operation = transferFa2Token(
        Tezos.get_self_address(),     // from_
        Tezos.get_sender(),           // to_
        tokensWithdrawn,        // token amount
        tokenId,                // token id
        tokenContractAddress    // token contract address
    );
    operations := withdrawnTokensToSenderOperation # operations;

    // update pool totals
    tokenRecord.tokenPoolTotal  := newTokenPool;
    tokenRecord.lpTokensTotal   := newLpTokensTotal;

    // Update Token Ledger
    s.tokenLedger[tokenName] := tokenRecord;

} with (operations, s)



(* transfer entrypoint *)
function transfer(const transferTokenParams : transferActionType; var s : treasuryStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send transfer operation from Treasury account to user account

    if not checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
    else skip;

    // break glass check
    checkTransferIsNotPaused(s);

    var operations : list(operation) := nil;

    // const txs : list(transferDestinationType)   = transferTokenParams.txs;
    const txs : list(transferDestinationType)   = transferTokenParams;
    
    const whitelistTokenContracts   : whitelistTokenContractsType   = s.whitelistTokenContracts;

    function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
    block {

        const token        : tokenType        = destination.token;
        const to_          : ownerType        = destination.to_;
        const amt          : tokenAmountType  = destination.amount;
        const from_        : address          = Tezos.get_self_address(); // token pool
        
        const transferTokenOperation : operation = case token of [
            | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address"): contract(unit)), amt * 1mutez)
            | Fa12(token) -> if not checkInWhitelistTokenContracts(token, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa12Token(from_, to_, amt, token)
            | Fa2(token)  -> if not checkInWhitelistTokenContracts(token.tokenContractAddress, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
        ];

        accumulator := transferTokenOperation # accumulator;

    } with accumulator;

    const emptyOperation : list(operation) = list[];
    operations := List.fold(transferAccumulator, txs, emptyOperation);

} with (operations, s)




function main (const action : tokenPoolAction; const s : tokenPoolStorage) : return is 

    case action of [

        |   Default(_parameters)                      -> default(s)
        |   SetAdmin(parameters)                      -> setAdmin(parameters, s)

        |   AddLiquidity(parameters)                  -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)               -> removeLiquidity(parameters, s)

        |   Transfer(parameters)                      -> transfer(parameters, s)
        
        
    ]