
// define types of cash for cfmm

#define CASH_IS_TEZ
//#define CASH_IS_FA2
//#define CASH_IS_FA12


(* If the token uses the fa2 standard *)
//#define TOKEN_IS_FA2
(* To support baking *)
//#define HAS_BAKER
(* To push prices to some consumer contract once per block *)
//#define ORACLE

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
| Tez                     of tezType         // unit
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

// ----- transfer types end -----


// ----- types for entrypoint actions begin -----

type setBakerActionType is [@layout:comb] record [
    baker                   : option(key_hash); (* delegate address, None if undelegated *)
] 

type addLiquidityActionType is [@layout:comb] record [
    deadline                : timestamp;
    tokensDeposited         : nat;
    owner                   : address;
]

type removeLiquidityActionType is [@layout:comb] record [
    deadline                : timestamp;
    lpTokensBurned          : nat;
    tokensWithdrawn         : nat;
    [@annot:to] to_         : address;
]

type cashToTokenActionType is [@layout:comb] record [

    deadline                : timestamp;
    minTokensBought         : nat;
    [@annot:to] to_         : address;

#if !CASH_IS_TEZ
    cashSold                : nat;
#endif
    
]

type tokenToCashActionType is [@layout:comb] record [
    deadline                : timestamp;
    minCashBought           : nat;
    [@annot:to] to_         : address;
    tokensSold              : nat;
]


type tokenToTokenActionType is [@layout:comb] record [
    deadline                : timestamp;
    minTokensBought         : nat;
    outputCfmmContract      : address;
    [@annot:to] to_         : address;
    tokensSold              : nat
]

type onPriceActionType is [@layout:comb] record [ 
    tokenName     : string;
    cashAmount    : nat; 
    tokenAmount   : nat; 
]



// for ctez / USDM
type tezToToken is [@layout:comb] record [ 
    outputCfmmContract  : address ;     (* other cfmm contract *)
    minTokensBought     : nat ;         (* minimum amount of tokens bought *)
    [@annot:to] to_     : address ;     (* where to send the output tokens *)    
    deadline            : timestamp ;   (* time before which the request must be completed *)
]

type ctezToToken is [@layout:comb] record [ 
    [@annot:to] to_     : address ;     (* where to send the tokens *)
    minTokensBought     : nat ;         (* minimum amount of tokens that must be bought *)
    cashSold            : nat ;
    deadline            : timestamp ; 
]


type updateFa2PoolType is list (balanceOfResponseType)
type updateFa12PoolType is nat

type updateFa12CashPoolInternalActionType is updateFa12PoolType
type updateFa2CashPoolInternalActionType is updateFa2PoolType

type updateFa12TokenPoolInternalActionType is updateFa12PoolType
type updateFa2TokenPoolInternalActionType is updateFa2PoolType


// ----- types for entrypoint actions end -----

type cfmmStorage is [@layout:comb] record [
    admin                   : address;
    
    cashTokenAddress        : address;  // if cash is not tez
    cashTokenId             : nat;      // if cash is FA2
    cashPool                : nat;
    
    lpTokenAddress          : address;
    lpTokensTotal           : nat;
    pendingPoolUpdates      : nat;
    
    tokenName               : string;
    tokenAddress            : address;
    tokenPool               : nat;
    
    tokenId                 : nat;      // if token is FA2

    // for oracle
    lastOracleUpdate        : timestamp;
    consumerEntrypoint      : address;

    usdmTokenAddress        : address;
]

type cfmmAction is 
    | Default                       of unit
    | SetAdmin                      of (address)
    | SetBaker                      of setBakerActionType
    | SetLpTokenAddress             of address 

    | AddLiquidity                  of addLiquidityActionType
    | RemoveLiquidity               of removeLiquidityActionType 

    // | CashToToken                   of cashToTokenActionType
    // | TokenToCash                   of tokenToCashActionType
    // | TokenToToken                  of tokenToTokenActionType

    // if cash is not tez
    // | UpdatePools                   of unit
    // | UpdateFa12CashPoolInternal    of updateFa12CashPoolInternalActionType
    // | UpdateFa2CashPoolInternal     of updateFa2CashPoolInternalActionType
    
    // | UpdateFa12TokenPoolInternal   of updateFa12TokenPoolInternalActionType
    // | UpdateFa2TokenPoolInternal    of updateFa2TokenPoolInternalActionType
    
const noOperations : list (operation) = nil;
type return is list (operation) * cfmmStorage


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
function checkSenderIsAdmin(var s : cfmmStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function - check sender is from cash token address
function checkSenderIsCashTokenAddress(var s : cfmmStorage) : unit is
  if (Tezos.sender = s.cashTokenAddress) then unit
  else failwith("Error. Sender must be from the cash token address.");

// helper function - check sender is from token address
function checkSenderIsTokenAddress(var s : cfmmStorage) : unit is
  if (Tezos.sender = s.tokenAddress) then unit
  else failwith("Error. Sender must be from the token address.");

// helper function - check no pending pool updates
function checkNoPendingPoolUpdates(var s : cfmmStorage) : unit is
    if (s.pendingPoolUpdates > 0n) then failwith("Error. Pending pool updates must be zero.")
    else unit;

// helper function - check that deadline has not passed
function checkDeadlineHasNotPassed(const deadline : timestamp) : unit is
    if (Tezos.now >= deadline) then failwith("Error. The current time must be less than the deadline.")
    else unit;

// helper function - check that no tez is sent
function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith("This entrypoint should not receive any tez.");

// helper function - check if call is from an implicit account
function checkFromImplicitAccount(const _p : unit) : unit is
    if (Tezos.sender = Tezos.source) then unit
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



// helper function to get updateFa12TokenPoolInternal entrypoint from self address
function getUpdateFa12TokenPoolInternalEntrypoint(const contractAddress : address) : contract(updateFa12TokenPoolInternalActionType) is
  case (Tezos.get_entrypoint_opt(
      "%updateFa12TokenPoolInternal",
      contractAddress) : option(contract(updateFa12TokenPoolInternalActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. UpdateFa12TokenPoolInternal entrypoint in contract not found") : contract(updateFa12TokenPoolInternalActionType))
  ]



// helper function to get updateFa2TokenPoolInternal entrypoint from self address
function getUpdateFa2TokenPoolInternalEntrypoint(const contractAddress : address) : contract(updateFa2TokenPoolInternalActionType) is
  case (Tezos.get_entrypoint_opt(
      "%updateFa2TokenPoolInternal",
      contractAddress) : option(contract(updateFa2TokenPoolInternalActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. UpdateFa2TokenPoolInternal entrypoint in contract not found") : contract(updateFa2TokenPoolInternalActionType))
  ]



// helper function to get updateFa2CashPoolInternal entrypoint from self address
function getUpdateFa12CashPoolInternalEntrypoint(const contractAddress : address) : contract(updateFa12CashPoolInternalActionType) is
  case (Tezos.get_entrypoint_opt(
      "%updateFa12CashPoolInternal",
      contractAddress) : option(contract(updateFa12CashPoolInternalActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. UpdateFa2CashPoolInternal entrypoint in contract not found") : contract(updateFa12CashPoolInternalActionType))
  ]



// helper function to get updateFa2CashPoolInternal entrypoint from self address
function getUpdateFa2CashPoolInternalEntrypoint(const contractAddress : address) : contract(list(balanceOfResponseType)) is
  case (Tezos.get_entrypoint_opt(
      "%updateFa2CashPoolInternal",
      contractAddress) : option(contract(list(balanceOfResponseType)))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. UpdateFa2CashPoolInternal entrypoint in contract not found") : contract(list(balanceOfResponseType)))
  ]



// helper function to get cashToToken entrypoint from output CFMM contract
function getCashToTokenOutputCfmmEntrypoint(const contractAddress : address) : contract(cashToTokenActionType) is
  case (Tezos.get_entrypoint_opt(
      "%cashToToken",
      contractAddress) : option(contract(cashToTokenActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. CashToToken entrypoint in contract not found") : contract(cashToTokenActionType))
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



// ----- Transfer Helper Functions Begin -----

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

function mintOrBurnLpToken(const target : address; const quantity : int; var s : cfmmStorage) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(s.lpTokenAddress) ) )

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


function onPriceAction(const onPriceActionParams : onPriceActionType; var s : cfmmStorage) : operation is 
block {
    const updateConsumerOperation : operation = Tezos.transaction(
        onPriceActionParams,
        0mutez,
        getOnPriceActionInUsdmEntrypoint(s.usdmTokenAddress)
    );
} with (updateConsumerOperation)


// ------ Helper Functions end ------

function default(var s : cfmmStorage) : return is 
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
function setAdmin(const newAdminAddress : address; var s : cfmmStorage) : return is
block {
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    s.admin := newAdminAddress;
} with (noOperations, s)




(*  setBaker entrypoint *)
function setBaker(const setBakerParams : setBakerActionType; var s : cfmmStorage) : return is
block {
    
    checkNoAmount(Unit);            // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);          // check that sender is admin (i.e. Governance DAO contract address)
    checkNoPendingPoolUpdates(s);   // check no pending pool updates

    const delegateOperation : operation = Tezos.set_delegate(setBakerParams.baker);

} with (list[delegateOperation], s)




(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType ; var s : cfmmStorage) : return is 
block {

    // init variables for convenience
    const deadline            : timestamp           = addLiquidityParams.deadline;
    const tokensDeposited     : nat                 = addLiquidityParams.tokensDeposited;
    const owner               : address             = addLiquidityParams.owner; 
    var operations            : list(operation)    := nil;

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline);

    const tokenPool             : nat = s.tokenPool;
    const lpTokensTotal         : nat = s.lpTokensTotal;
    const lpTokensMinted        : nat = tokensDeposited;

    // update and save new totals
    s.lpTokensTotal    := lpTokensTotal + lpTokensMinted;
    s.tokenPool        := tokenPool     + tokensDeposited; 

    // send token from sender to token pool
    const sendTokenToPoolOperation : operation = transferFa2Token(
        Tezos.sender,           // from_
        Tezos.self_address,     // to_
        tokensDeposited,        // token amount
        s.tokenId,              // token id
        s.tokenAddress          // token contract address
    );
    operations := sendTokenToPoolOperation # operations;

    // mint LP Tokens and send to sender
    const mintLpTokensTokensOperation : operation = mintOrBurnLpToken(owner, int(lpTokensMinted), s);
    operations := mintLpTokensTokensOperation # operations;

} with (operations, s)




(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType; var s : cfmmStorage) : return is 
block {
    
    // init variables for convenience
    const deadline              : timestamp           = removeLiquidityParams.deadline;
    const tokensWithdrawn       : nat                 = removeLiquidityParams.tokensWithdrawn;
    const recipient             : address             = removeLiquidityParams.to_; 
    var operations              : list(operation)    := nil;    

    // check that no tez is sent
    checkNoAmount(Unit);

    var tokenPool             : nat  := s.tokenPool;
    var lpTokensTotal         : nat  := s.lpTokensTotal;
    const tokensWithdrawn     : nat   = tokensWithdrawn;

    // calculate new total of LP Tokens
    if lpTokensBurned > lpTokensTotal then failwith("Error. You cannot burn more than the total amount of LP tokens.") else skip;
    const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

    // calculate new token pool amount
    if tokensWithdrawn > tokenPool then failwith("Error. Token pool minus tokens withdrawn is negative.") else skip;
    const newTokenPool : nat = abs(tokenPool - tokensWithdrawn);

    // burn LP Token operation
    const burnLpTokenOperation : operation = mintOrBurnLpToken(Tezos.sender, (0 - lpTokensBurned), s);
    operations := burnLpTokenOperation # operations;

    // send withdrawn tokens to sender 
    const withdrawnTokensToSenderOperation : operation = transferFa2Token(
        Tezos.self_address,     // from_
        Tezos.sender,           // to_
        tokensWithdrawn,        // token amount
        s.tokenId,              // token id
        s.tokenAddress          // token contract address
    );
    operations := withdrawnTokensToSenderOperation # operations;

    // update storage with new totals
    s.tokenPool      := newTokenPool;
    s.lpTokensTotal  := newLpTokensTotal;

} with (operations, s)




(* setLpTokenAddress entrypoint *)
function setLpTokenAddress(const lpTokenAddress : address; var s : cfmmStorage) : return is 
block {
    
    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check that no tez is sent
    checkNoAmount(Unit);

    if s.lpTokenAddress =/= zeroAddress then failwith("Error. LP Token Address is already set.") else skip;
    s.lpTokenAddress := lpTokenAddress;

} with (noOperations, s)



(* cashToToken entrypoint *)
// function cashToToken(const cashToTokenParams : cashToTokenActionType; var s : cfmmStorage) : return is 
// block {
    
//     // init variables for convenience
//     const deadline              : timestamp           = cashToTokenParams.deadline;
    
//     const minTokensBought       : nat                 = cashToTokenParams.minTokensBought;
//     const recipient             : address             = cashToTokenParams.to_; 
//     var operations              : list(operation)    := nil;

// #if CASH_IS_TEZ
//     const cashSold              : nat                 = mutezToNatural(Tezos.amount);
// #else
//     const cashSold              : nat                 = cashToTokenParams.cashSold;  // if cash is not tez
// #endif

//     // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check deadline has not passed
//     checkDeadlineHasNotPassed(deadline);

//     (* We don't check that xtzPool > 0, because that is impossible unless all liquidity has been removed. *)
//     const cashPool   : nat = s.cashPool;
//     const tokenPool  : nat = s.tokenPool;

//     const tokensBought : nat = (cashSold * constFee * tokenPool) / (cashPool * constFeeDenom + (cashSold * constFee));
//     if tokensBought < minTokensBought then failwith("Error. Tokens bought must be greater than or equal to min tokens bought.") else skip;

//     if tokensBought > tokenPool then failwith("Error. Token pool minus tokens bought is negative.") else skip;
//     const newTokenPool : nat = abs(tokenPool - tokensBought);
//     const newCashPool : nat = cashPool + cashSold;

//     // update new storage
//     s.cashPool   := newCashPool;
//     s.tokenPool  := newTokenPool;


// //     todo: should be a transfer op for cash as a FA12 or FA2 token
// //
// // #if !CASH_IS_TEZ
// //     const transferTezFromSenderToCfmmOperation : operation = transferTez( (get_contract(Tezos.self_address) : contract(unit)), cashSold );
// //     operations := transferTezFromSenderToCfmmOperation # operations;
// // #endif

//     // assuming tokens is FA2 token - can add another case for FA12 token in future
//     // send tokens_withdrawn from exchange to sender
//     const withdrawTokensOperation : operation = transferFa2Token(
//         Tezos.self_address,     // from_
//         recipient,              // to_
//         tokensBought,           // token amount
//         s.tokenId,              // token id
//         s.tokenAddress          // token contract address
//     );
//     operations := withdrawTokensOperation # operations;

//     const onPriceActionParams : onPriceActionType = record [
//         tokenName   = s.tokenName;
//         cashAmount  = newCashPool;
//         tokenAmount = newTokenPool;
//     ];
//     if s.lastOracleUpdate = Tezos.now then skip else block {
//         const onPriceActionUpdateUsdmOperation : operation = onPriceAction(onPriceActionParams, s);
//         operations := onPriceActionUpdateUsdmOperation # operations;
//     }

// } with (operations, s)




// (* tokenToCash entrypoint *)
// function tokenToCash(const tokenToCashParams : tokenToCashActionType; var s : cfmmStorage) : return is 
// block {
    
//     // init variables for convenience
//     const deadline              : timestamp           = tokenToCashParams.deadline;
//     const tokensSold            : nat                 = tokenToCashParams.tokensSold;
//     const minCashBought         : nat                 = tokenToCashParams.minCashBought;
//     const recipient             : address             = tokenToCashParams.to_; 
//     var operations              : list(operation)    := nil;

//     // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check deadline has not passed
//     checkDeadlineHasNotPassed(deadline);

//     // check that no tez is sent
//     checkNoAmount(Unit);

//     (* We don't check that tokenPool > 0, because that is impossible unless all liquidity has been removed. *)
//     const cashPool   : nat = s.cashPool;
//     const tokenPool  : nat = s.tokenPool;

//     const cashBought : nat = (tokensSold * constFee * cashPool) / (tokenPool * constFeeDenom + (tokensSold * constFee));
//     if cashBought < minCashBought then failwith("Error. Cash bought must be greater than or equal to min cash bought.") else skip;

//     // assuming tokens is FA2 token - can add another case for FA12 token in future
//     // send tokens_sold from sender to cfmm
//     const sendSoldTokensToCfmmOperation : operation = transferFa2Token(
//         Tezos.sender,           // from_
//         Tezos.self_address,     // to_
//         tokensSold,             // token amount
//         s.tokenId,              // token id
//         s.tokenAddress          // token contract address
//     );
//     operations := sendSoldTokensToCfmmOperation # operations;


// #if CASH_IS_TEZ
//     const transferTezFromCfmmToSenderOperation : operation = transferTez( (Tezos.get_contract_with_error(recipient, "Error. Unable to send tez to sender.") : contract(unit) ), cashBought );
//     operations := transferTezFromCfmmToSenderOperation # operations;
// #else

//     // assuming cash is FA2 token - can add another case for FA12 token in future
//     // send cashBought from cfmm to sender
//     const sendCashBoughtFromCfmmToSenderOperation : operation = transferFa2Token(
//         Tezos.self_address,     // from_
//         recipient,              // to_
//         cashBought,             // token amount
//         s.cashTokenId,          // token id
//         s.cashTokenAddress      // token contract address
//     );
//     operations := sendCashBoughtFromCfmmToSenderOperation # operations;

// #endif

//     if cashBought > cashPool then failwith("Error. Cash pool minus cash bought is negative.") else skip;
//     const newCashPool   : nat = abs(cashPool - cashBought);
//     const newTokenPool  : nat = tokenPool + tokensSold;

//     // update new storage
//     s.cashPool   := newCashPool;
//     s.tokenPool  := newTokenPool;

//     const onPriceActionParams : onPriceActionType = record [
//         tokenName   = s.tokenName;
//         cashAmount  = newCashPool;
//         tokenAmount = newTokenPool;
//     ];
//     if s.lastOracleUpdate = Tezos.now then skip else block {
//         const onPriceActionUpdateUsdmOperation : operation = onPriceAction(onPriceActionParams, s);
//         operations := onPriceActionUpdateUsdmOperation # operations;
//     }


// } with (operations, s)




// (* tokenToToken entrypoint *)
// function tokenToToken(const tokenToTokenParams : tokenToTokenActionType; var s : cfmmStorage) : return is 
// block {

//     // init variables for convenience
//     const deadline              : timestamp           = tokenToTokenParams.deadline;
//     const tokensSold            : nat                 = tokenToTokenParams.tokensSold;
//     const minTokensBought       : nat                 = tokenToTokenParams.minTokensBought;
//     const recipient             : address             = tokenToTokenParams.to_; 
//     const outputCfmmContract    : address             = tokenToTokenParams.outputCfmmContract; 
//     var operations              : list(operation)    := nil;

//     // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check deadline has not passed
//     checkDeadlineHasNotPassed(deadline);

//     // check that no tez is sent
//     checkNoAmount(Unit);

//     (* We don't check that tokenPool > 0, because that is impossible unless all liquidity has been removed. *)
//     const cashPool   : nat = s.cashPool;
//     const tokenPool  : nat = s.tokenPool;

//     const cashBought : nat = (tokensSold * constFee * cashPool) / (tokenPool * constFeeDenom + (tokensSold * constFee));
//     if cashBought > cashPool then failwith("Error. Cash pool minus cash bought is negative.") else skip;

//     const newCashPool   : nat = abs(cashPool - cashBought);
//     const newTokenPool  : nat = tokenPool + tokensSold;

//     // update new storage
//     s.cashPool   := newCashPool;
//     s.tokenPool  := newTokenPool;    

// #if CASH_IS_TEZ

//     const sendCashToOutputCfmmContractParams : cashToTokenActionType = record [
//         minTokensBought = minTokensBought;
//         deadline        = deadline;
//         to_             = recipient;
//     ];
//     const sendCashToOutputCfmmContractOperation : operation = Tezos.transaction(
//         sendCashToOutputCfmmContractParams,
//         naturalToMutez(cashBought),
//         getCashToTokenOutputCfmmEntrypoint(outputCfmmContract)
//     );
//     operations := sendCashToOutputCfmmContractOperation # operations;


// #else

// #if CASH_IS_FA12

//     // FA12 Token - set allowance to 0 first
//     const outputCfmmContractSetApproveFa12ToZeroOperation : operation = Tezos.transaction(
//         (outputCfmmContract, 0n),
//         0mutez,
//         getFa12ApproveEntrypoint(s.cashTokenAddress)
//     );
//     operations := outputCfmmContractSetApproveFa12ToZeroOperation # operations;

//     // FA12 Token - set allowance to cashBought amount
//     const outputCfmmContractApproveFa12Operation : operation = Tezos.transaction(
//         (outputCfmmContract, cashBought),
//         0mutez,
//         getFa12ApproveEntrypoint(s.cashTokenAddress)
//     );
//     operations := outputCfmmContractApproveFa12Operation # operations;

// #else

// #endif

//     const sendCashTokensToOutputCfmmContractParams : cashToTokenActionType = record [
//         minTokensBought = minTokensBought;
//         deadline        = deadline;
//         to_             = recipient;
//         cashSold        = cashBought;
//     ];
//     const sendCashTokensToOutputCfmmContractOperation : operation = Tezos.transaction(
//         sendCashTokensToOutputCfmmContractParams, 
//         0mutez,
//         getCashToTokenOutputCfmmEntrypoint(outputCfmmContract)
//     );
//     operations := sendCashTokensToOutputCfmmContractOperation # operations;

// #endif

//     const acceptTokensFromSenderOperation : operation = transferFa2Token(
//         Tezos.sender,           // from_
//         Tezos.self_address,     // to_
//         tokensSold,             // token amount
//         s.tokenId,              // token id
//         s.tokenAddress          // token contract address
//     );
//     operations := acceptTokensFromSenderOperation # operations;

//     const onPriceActionParams : onPriceActionType = record [
//         tokenName   = s.tokenName;
//         cashAmount  = newCashPool;
//         tokenAmount = newTokenPool;
//     ];
//     if s.lastOracleUpdate = Tezos.now then skip else block {
//         const onPriceActionUpdateUsdmOperation : operation = onPriceAction(onPriceActionParams, s);
//         operations := onPriceActionUpdateUsdmOperation # operations;
//     }

// } with (operations, s)






(* updatePools entrypoint *)
// function updatePools(var s : cfmmStorage) : return is 
// block {
    
//     // check if call is from an implicit account (i.e. sender = source)
//     checkFromImplicitAccount(Unit);

//     // check that no tez is sent    
//     checkNoAmount(Unit);

//     // init variables
//     var operations : list(operation) := nil;    

// #if TOKEN_IS_FA2

//     // Token is FA2
//     const balanceOfRequestRecord : balanceOfRequestType = record [
//         owner     = Tezos.self_address;
//         token_id  = s.tokenId;
//     ];
//     var balanceOfRequests : list(balanceOfRequestType) := nil;
//     balanceOfRequests := balanceOfRequestRecord # balanceOfRequests;
    
//     const getFa2TokenBalanceParams : balanceOfParamsType = record [
//         requests = balanceOfRequests;
//         callback = getUpdateFa2TokenPoolInternalEntrypoint(Tezos.self_address);
//     ];
//     const getFa2TokenBalanceOperation : operation = Tezos.transaction(
//         getFa2TokenBalanceParams,
//         0mutez,
//         getFa2TokenBalanceOfEntrypoint(s.tokenAddress)
//     ); 
//     operations := getFa2TokenBalanceOperation # operations;

// #else

//     // Token is FA12
//     const getFa12TokenBalanceOperation : operation = Tezos.transaction(
//         ( Tezos.self_address , getUpdateFa12TokenPoolInternalEntrypoint(Tezos.self_address)),
//         0mutez,
//         getFa12TokenBalanceOfEntrypoint(s.tokenAddress)
//     ); 
//     operations := getFa12TokenBalanceOperation # operations;

// #endif


// #if CASH_IS_FA12

//     // Cash is FA12
//     const getCashFa12TokenBalanceOperation : operation = Tezos.transaction(
//         ( Tezos.self_address , getUpdateCashPoolInternalEntrypoint(Tezos.self_address)),
//         0mutez,
//         getFa12TokenBalanceOfEntrypoint(s.tokenAddress)
//     ); 
//     operations := getCashFa12TokenBalanceOperation # operations;

// #else

//     // Cash is FA2
//     const getCashFa2TokenBalanceRequest : balanceOfRequestType = record [
//         owner     = Tezos.self_address;
//         token_id  = s.cashTokenId;
//     ];
//     const getCashFa2TokenBalanceParams : balanceOfParamsType = record [
//         requests = list [getCashFa2TokenBalanceRequest];
//         callback = getUpdateFa2CashPoolInternalEntrypoint(Tezos.self_address);
//     ];
//     const getCashFa2TokenBalanceOperation : operation = Tezos.transaction(
//         getCashFa2TokenBalanceParams,
//         0mutez,
//         getFa2TokenBalanceOfEntrypoint(s.tokenAddress)
//     ); 
//     operations := getCashFa2TokenBalanceOperation # operations;

// #endif

// #if CASH_IS_TEZ
//     const pendingPoolUpdates : nat = 1n;
// #else
//     const pendingPoolUpdates : nat = 2n;
// #endif

//     s.pendingPoolUpdates := pendingPoolUpdates;

// } with (operations, s)


// // #if !CASH_IS_TEZ
// function updateFa2CashPoolInternal(const updateFa2CashPoolInternalParams : updateFa2CashPoolInternalActionType; var s : cfmmStorage) : return is 
// block {

//     // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check that sender is from the cash token address
//     checkSenderIsCashTokenAddress(s);

//     s.cashPool            := updateFa2PoolInternal(updateFa2CashPoolInternalParams);
//     s.pendingPoolUpdates  := abs(s.pendingPoolUpdates - 1n);

// } with (noOperations, s)

// function updateFa12CashPoolInternal(const updateFa12CashPoolInternalParams : updateFa12CashPoolInternalActionType; var s : cfmmStorage) : return is 
// block {

//     // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check that sender is from the cash token address
//     checkSenderIsCashTokenAddress(s);

//     s.cashPool             := updateFa12PoolInternal(updateFa12CashPoolInternalParams);
//     s.pendingPoolUpdates   := abs(s.pendingPoolUpdates - 1n);

// } with (noOperations, s)

// // #endif



// function updateFa12TokenPoolInternal(const updateFa12TokenPoolInternalParams : updateFa12TokenPoolInternalActionType; var s : cfmmStorage) : return is 
// block {
    
//     // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check that sender is from the token address
//     checkSenderIsTokenAddress(s);

//     s.tokenPool            := updateFa12PoolInternal(updateFa12TokenPoolInternalParams);
//     s.pendingPoolUpdates   := abs(s.pendingPoolUpdates - 1n);

// } with (noOperations, s)

// function updateFa2TokenPoolInternal(const updateFa2TokenPoolInternalParams : updateFa2TokenPoolInternalActionType; var s : cfmmStorage) : return is 
// block {
    
//      // check no pending pool updates
//     checkNoPendingPoolUpdates(s);

//     // check that sender is from the token address
//     checkSenderIsTokenAddress(s);

//     s.tokenPool            := updateFa2PoolInternal(updateFa2TokenPoolInternalParams);
//     s.pendingPoolUpdates   := abs(s.pendingPoolUpdates - 1n);
    
// } with (noOperations, s)


function main (const action : cfmmAction; const s : cfmmStorage) : return is 
    case action of [
        | Default(_parameters)                      -> default(s)
        | SetAdmin(parameters)                      -> setAdmin(parameters, s)
        | SetBaker(parameters)                      -> setBaker(parameters, s)
        | SetLpTokenAddress(parameters)             -> setLpTokenAddress(parameters, s)

        // | CashToToken(parameters)                   -> cashToToken(parameters, s)
        // | TokenToCash(parameters)                   -> tokenToCash(parameters, s)
        // | TokenToToken(parameters)                  -> tokenToToken(parameters, s)

        | AddLiquidity(parameters)                  -> addLiquidity(parameters, s)
        | RemoveLiquidity(parameters)               -> removeLiquidity(parameters, s)
        
        // | UpdatePools(_parameters)                  -> updatePools(s)
        
        // | UpdateFa12CashPoolInternal(parameters)    -> updateFa12CashPoolInternal(parameters, s)
        // | UpdateFa2CashPoolInternal(parameters)     -> updateFa2CashPoolInternal(parameters, s)
        // | UpdateFa12TokenPoolInternal(parameters)   -> updateFa12TokenPoolInternal(parameters, s)
        // | UpdateFa2TokenPoolInternal(parameters)    -> updateFa2TokenPoolInternal(parameters, s)
        
    ]