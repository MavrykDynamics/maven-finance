
// define types of cash for cfmm

#define CASH_IS_TEZ

type tokenBalanceType   is nat;
type tokenAmountType    is nat;

// type mintOrBurnParamsType is (int * address);
type mintOrBurnParamsType is [@layout:comb] record [
    quantity  : int;
    target    : address;
]

// ----- transfer types begin -----

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

type addLiquidityActionType is [@layout:comb] record [
    cashDeposited           : nat;
    deadline                : timestamp;
    maxTokensDeposited      : nat;
    minLpTokensMinted       : nat;
    owner                   : address;
]

type removeLiquidityActionType is [@layout:comb] record [
    deadline                : timestamp;
    lpTokensBurned          : nat;
    minCashWithdrawn        : nat;
    minTokensWithdrawn      : nat;
    [@annot:to] to_         : address;
]

type cashToTokenActionType is [@layout:comb] record [
    cashSold                : nat;
    deadline                : timestamp;
    minTokensBought         : nat;
    [@annot:to] to_         : address;
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

// oracle update consumer 
type updateConsumerActionType   is contract(nat * nat);
type updateConsumerParams       is contract(nat * nat);


// for ctez / zUSD
type tezToToken is [@layout:comb] record [ 
    outputCfmmContract  : address ;     (* other cfmm contract *)
    minTokensBought     : nat ;         (* minimum amount of tokens bought *)
    [@annot:to] to_     : address ;     (* where to send the output tokens *)    
    deadline            : timestamp ;   (* time before which the request must be completed *)
]

type ctezToToken is [@layout:comb] record [ 
    [@annot:to] to_     : address ;  (* where to send the tokens *)
    minTokensBought     : nat ;      (* minimum amount of tokens that must be bought *)
    cashSold            : nat ;
    deadline            : timestamp ; 
]


type update_fa12_pool is nat
type update_fa2_pool is list (address * nat * nat)

type update_cash_pool_internal  is update_fa2_pool
type update_token_pool_internal is update_fa12_pool

// ----- types for entrypoint actions end -----

type cfmmStorage is [@layout:comb] record [
    admin                   : address;
    
    cashTokenAddress        : address;  // if cash is not tez
    cashTokenId             : nat;      // if cash is FA2
    cashPool                : nat;
    
    lpTokenAddress          : address;
    lpTokensTotal           : nat;
    pendingPoolUpdates      : nat;
    
    tokenAddress            : address;
    tokenPool               : nat;
    
    tokenId                 : nat;      // if token is FA2

    // for oracle
    lastOracleUpdate        : timestamp;
    consumerEntrypoint      : address;
]

type cfmmAction is 
    | Default                   of unit
    | AddLiquidity              of addLiquidityActionType
    | RemoveLiquidity           of removeLiquidityActionType 
    | SetLpTokenAddress         of address 
    | CashToToken               of cashToTokenActionType
    | TokenToCash               of tokenToCashActionType
    | TokenToToken              of tokenToTokenActionType

    // if cash is not tez
    | UpdateCashPoolInternal    of update_cash_pool_internal

    | UpdatePools of unit
    | UpdateTokenPoolInternal   of update_token_pool_internal
    
    // for oracle
    | UpdateConsumer            of updateConsumerActionType

const noOperations : list (operation) = nil;
type return is list (operation) * cfmmStorage


// ----- constants begin -----

const zeroAddress          : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy   : nat      = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division

// ----- constants end -----


// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;

// let ceildiv (numerator : nat) (denominator : nat) : nat = abs ((- numerator) / (int denominator))
// function ceildiv (const numerator : nat) is
//   (function (const denominator : nat) is
//        abs
//          (Operator.div
//             (Operator.neg (numerator), int (denominator))))

function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );


// helper function - check sender is admin
function checkSenderIsAdmin(var s : cfmmStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function - check no pending pool updates
function checkNoPendingPoolUpdates(var s : cfmmStorage) : unit is
    if (s.pendingPoolUpdates > 0n) then failwith("Error. Pending pool updates must be zero.")
    else unit;

// helper function - check that deadline has not passed
function checkDeadlineHasNotPassed(const deadline : timestamp; var s : cfmmStorage) : unit is
    if (Tezos.now > deadline) then failwith("Error. The current time must be less than the deadline.")
    else unit;

// helper function - check that no tez is sent
function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith("This entrypoint should not receive any tez.");


// helper function to get mintOrBurn entrypoint from zUSD contract
function getZUsdMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%mintOrBurn",
      tokenContractAddress) : option(contract(mintOrBurnParamsType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. MintOrBurn entrypoint in token contract not found") : contract(mintOrBurnParamsType))
  end;

// helper function to get mintOrBurn entrypoint from LQT contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%mintOrBurn",
      tokenContractAddress) : option(contract(mintOrBurnParamsType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
  end;

// helper function to get oracleconsumer
function getOracleConsumer(const contractAddress : address) : contract(updateConsumerParams) is
  case (Tezos.get_contract_opt(contractAddress) : option(contract(updateConsumerParams))) of
    Some(contr) -> contr
  | None -> (failwith("Error. Cannot get CFMM price entrypoint from consumer.") : contract(updateConsumerParams))
  end;


// ----- Transfer Helper Functions Begin -----

function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
            end;
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
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of
            Some (c) -> c
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        end;
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

function mintOrBurnLpToken(const target : address; const quantity : int; var s : cfmmStorage) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(s.lpTokenAddress) ) )

// ----- Transfer Helper Functions End -----


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




(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType ; var s : cfmmStorage) : return is 
block {

    // init variables for convenience
    const deadline            : timestamp           = addLiquidityParams.deadline;
    const maxTokensDeposited  : nat                 = addLiquidityParams.maxTokensDeposited;
    const minLpTokensMinted   : nat                 = addLiquidityParams.minLpTokensMinted;
    const owner               : address             = addLiquidityParams.owner; 
    var operations            : list(operation)    := nil;

#if !CASH_IS_TEZ
    const cashDeposited       : nat                 = addLiquidityParams.cashDeposited; 
#endif

#if CASH_IS_TEZ
    const cashDeposited       : nat                 = mutezToNatural(Tezos.amount);
#endif

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline, s);

    const cashPool              : nat = s.cashPool;
    const tokenPool             : nat = s.tokenPool;
    const lpTokensTotal         : nat = s.lpTokensTotal;

    const lpTokensMinted        : nat = (cashDeposited * lpTokensTotal) / cashPool;
    const tokensDeposited       : nat = ceildiv((cashDeposited * tokenPool), cashPool);

    // check that max tokens deposited must be greater than or equal to tokens deposited
    if tokensDeposited > maxTokensDeposited then failwith("Error. Max tokens deposited must be greater than or equal to tokens deposited.")
    else skip;
    
    // check that LP Tokens Minted must be greater than min LP Tokens minted
    if lpTokensMinted < minLpTokensMinted then failwith("Error. LP Tokens Minted must be greater than min LP Tokens minted")
    else skip;

    // update and save new totals
    s.lpTokensTotal    := lpTokensTotal + lpTokensMinted;
    s.tokenPool        := tokenPool     + tokensDeposited; 
    s.cashPool         := cashPool      + cashDeposited; 

    const sendTokenToCfmmOperation : operation = transferFa2Token(
        Tezos.sender,           // from_
        Tezos.self_address,     // to_
        tokensDeposited,        // token amount
        s.tokenId,              // token id
        s.tokenAddress          // token contract address
    );
    operations := sendTokenToCfmmOperation # operations;

#if CASH_IS_TEZ

    const sendTezToCfmmOperation : operation = transferTez( (get_contract(Tezos.self_address) : contract(unit)), cashDeposited);
    operations := sendTezToCfmmOperation # operations;

#else

    // assuming cash is FA2 token - can add another case for FA12 token in future
    const sendCashFa2TokenOperation : operation = transferFa2Token(
        Tezos.sender,           // from_
        Tezos.self_address,     // to_
        cashDeposited,          // token amount
        s.cashTokenId,          // token id
        s.cashTokenAddress      // token contract address
    );
    operations := sendCashFa2TokenOperation # operations;

#endif

    const mintLpTokensTokensOperation : operation = mintOrBurnLpToken(owner, int(lpTokensMinted), s);
    operations := mintLpTokensTokensOperation # operations;

} with (operations, s)




(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType; var s : cfmmStorage) : return is 
block {
    
    // init variables for convenience
    const deadline              : timestamp           = removeLiquidityParams.deadline;
    const lpTokensBurned        : nat                 = removeLiquidityParams.lpTokensBurned;
    const minCashWithdrawn      : nat                 = removeLiquidityParams.minCashWithdrawn;
    const minTokensWithdrawn    : nat                 = removeLiquidityParams.minTokensWithdrawn;
    const recipient             : address             = removeLiquidityParams.to_; 
    var operations            : list(operation)      := nil;    

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline, s);

    // check that no tez is sent
    checkNoAmount(Unit);

    var cashPool              : nat  := s.cashPool;
    var tokenPool             : nat  := s.tokenPool;
    var lpTokensTotal         : nat  := s.lpTokensTotal;

    const cashWithdrawn       : nat   = (lpTokensBurned * cashPool) / lpTokensTotal;
    const tokensWithdrawn     : nat   = (lpTokensBurned * tokenPool) / lpTokensTotal;

    // check that cash withdrawn is greater than min cash withdrawn
    if cashWithdrawn < minCashWithdrawn then failwith("Error. The amount of cash withdrawn must be greater than or equal to min cash withdrawn.") else skip;

    // check that tokens withdrawn is greater than min tokens withdrawn
    if tokensWithdrawn < minTokensWithdrawn then failwith("Error. The amount of tokens withdrawn must be greater than or equal to min tokens withdrawn.") else skip;

    // calculate new total of LP Tokens
    if lpTokensBurned > lpTokensTotal then failwith("Error. You cannot burn more than the total amount of LP tokens.") else skip;
    const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

    // calculate new token pool amount
    if tokensWithdrawn > tokenPool then failwith("Error. Token pool minus tokens withdrawn is negative.") else skip;
    const newTokenPool : nat = abs(tokenPool - tokensWithdrawn);

    // calculate new cash pool amount
    if cashWithdrawn > cashPool then failwith("Error. Cash pool minus cash withdrawn is negative.") else skip;
    const newCashPool : nat = abs(cashPool - cashWithdrawn);

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


#if CASH_IS_TEZ

    const withdrawTezToSenderOperation : operation = transferTez(recipient, cashWithdrawn);
    operations := withdrawTezToSenderOperation # operations;

#else

    // assuming cash is FA2 token - can add another case for FA12 token in future
    const withdrawCashTokenToSenderOperation : operation = transferFa2Token(
        Tezos.self_address,     // from_
        recipient,              // to_
        cashWithdrawn,          // token amount
        s.cashTokenId,          // token id
        s.cashTokenAddress      // token contract address
    );
    operations := withdrawCashTokenToSenderOperation # operations;

#endif

    // update storage with new totals
    s.cashPool       := newCashPool;
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

    if s.lpTokenAddress =/= zeroaddress then failwith("Error. LP Token Address is already set.") else skip;
    s.lpTokenAddress := lpTokenAddress;

} with (noOperations, s)




function cashToToken(const _cashToTokenParams : cashToTokenActionType; var s : cfmmStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip


} with (noOperations, s)





function tokenToCash(const _tokenToCashParams : tokenToCashActionType; var s : cfmmStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)





function tokenToToken(const _tokenToToken : tokenToTokenActionType; var s : cfmmStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)




function updatePools(var s : cfmmStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip

(* Update the token pool and potentially the cash pool if cash is a token. *)
//     if Tezos.sender <> Tezos.source then
//         (failwith error_CALL_NOT_FROM_AN_IMPLICIT_ACCOUNT : result)
//     else if Tezos.amount > 0mutez then
//       (failwith error_AMOUNT_MUST_BE_ZERO : result)
//     else
//       let cfmm_update_token_pool_internal : update_token_pool_internal contract = Tezos.self "%updateTokenPoolInternal"  in
// #if !CASH_IS_TEZ
//       let cfmm_update_cash_pool_internal : update_cash_pool_internal contract = Tezos.self "%updateCashPoolInternal"  in
// #endif
// #if TOKEN_IS_FA2
//       let token_balance_of : balance_of contract = (match
//         (Tezos.get_entrypoint_opt "%balance_of" storage.tokenAddress : balance_of contract option) with
//         | None -> (failwith error_INVALID_FA2_TOKEN_CONTRACT_MISSING_BALANCE_OF : balance_of contract)
//         | Some contract -> contract) in
//       let op = Tezos.transaction ([(Tezos.self_address, storage.tokenId)], cfmm_update_token_pool_internal) 0mutez token_balance_of in
// #else
//       let token_get_balance : get_balance contract = (match
//         (Tezos.get_entrypoint_opt "%getBalance" storage.tokenAddress : get_balance contract option) with
//         | None -> (failwith error_INVALID_FA12_TOKEN_CONTRACT_MISSING_GETBALANCE : get_balance contract)
//         | Some contract -> contract) in
//       let op = Tezos.transaction (Tezos.self_address, cfmm_update_token_pool_internal) 0mutez token_get_balance in
// #endif
//       let op_list = [ op ] in
// #if CASH_IS_FA12
//       let cash_get_balance : get_balance contract = (match
//         (Tezos.get_entrypoint_opt "%getBalance" storage.cashAddress : get_balance contract option) with
//         | None -> (failwith error_INVALID_FA12_CASH_CONTRACT_MISSING_GETBALANCE : get_balance contract)
//         | Some contract -> contract) in
//       let op_cash = Tezos.transaction (Tezos.self_address, cfmm_update_cash_pool_internal) 0mutez cash_get_balance in
//       let op_list = op_cash :: op_list in
// #endif
// #if CASH_IS_FA2
//       let cash_balance_of : balance_of contract = (match
//         (Tezos.get_entrypoint_opt "%balance_of" storage.cashAddress : balance_of contract option) with
//         | None -> (failwith error_INVALID_FA2_CASH_CONTRACT_MISSING_GETBALANCE : balance_of contract)
//         | Some contract -> contract) in
//       let op_cash = Tezos.transaction ([(Tezos.self_address, storage.cashId)], cfmm_update_cash_pool_internal) 0mutez cash_balance_of in
//       let op_list = op_cash :: op_list in
// #endif
// #if CASH_IS_TEZ
//     let pendingPoolUpdates = 1n in
// #else
//     let pendingPoolUpdates = 2n in
// #endif
//       (op_list, {storage with pendingPoolUpdates = pendingPoolUpdates})




} with (noOperations, s)



function updateCashPoolInternal(const _parameters : update_cash_pool_internal; var s : cfmmStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)




function updateTokenPoolInternal(const _parameters : update_token_pool_internal; var s : cfmmStorage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)


function updateConsumer(const updateConsumerParams : updateConsumerActionType; var s : cfmmStorage) : return is 
block {

    // init operations
    var operations : list(operation) := nil;
    
    if s.lastOracleUpdate = Tezos.now then skip
    else block {

        const updateConsumerOperation : operation = Tezos.transaction(
            updateConsumerParams,
            0mutez,
            getOracleConsumer(s.consumerEntrypoint)
        );
        operations := updateConsumerOperation # operations;

    }

} with (operations, s)

function main (const action : cfmmAction; const s : cfmmStorage) : return is 
    case action of
        | Default(_parameters)                  -> default(s)
        | SetLpTokenAddress(parameters)         -> setLpTokenAddress(parameters, s)

        | CashToToken(parameters)               -> cashToToken(parameters, s)
        | TokenToCash(parameters)               -> tokenToCash(parameters, s)
        | TokenToToken(parameters)              -> tokenToToken(parameters, s)

        | AddLiquidity(parameters)              -> addLiquidity(parameters, s)
        | RemoveLiquidity(parameters)           -> removeLiquidity(parameters, s)
        
        | UpdatePools(_parameters)              -> updatePools(s)
        | UpdateCashPoolInternal(parameters)    -> updateCashPoolInternal(parameters, s)
        | UpdateTokenPoolInternal(parameters)   -> updateTokenPoolInternal(parameters, s)
        | UpdateConsumer(parameters)            -> updateConsumer(parameters, s)
    end