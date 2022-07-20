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
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

// ----- transfer types end -----


// ----- types for entrypoint actions begin -----

type setBakerActionType is [@layout:comb] record [
    baker                   : option(key_hash); (* delegate address, None if undelegated *)
] 

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

type onPriceActionType is [@layout:comb] record [ 
    tokenName     : string;
    cashAmount    : nat; 
    tokenAmount   : nat; 
]



// for ctez / USDM
// type tezToToken is [@layout:comb] record [ 
//     outputCfmmContract  : address ;     (* other cfmm contract *)
//     minTokensBought     : nat ;         (* minimum amount of tokens bought *)
//     [@annot:to] to_     : address ;     (* where to send the output tokens *)    
//     deadline            : timestamp ;   (* time before which the request must be completed *)
// ]

// type ctezToToken is [@layout:comb] record [ 
//     [@annot:to] to_     : address ;     (* where to send the tokens *)
//     minTokensBought     : nat ;         (* minimum amount of tokens that must be bought *)
//     cashSold            : nat ;
//     deadline            : timestamp ; 
// ]

type updateFa12PoolType is nat
type updateFa12TokenPoolInternalActionType is updateFa12PoolType

// ----- types for entrypoint actions end -----

type cfmmStorage is [@layout:comb] record [
    admin                   : address;
    
    // Cash Details
    cashPool                : nat;      // no cashTokenAddress or cashTokenId as cash is Tez
    
    // Token Details - no token id as token is FA12
    tokenName               : string;
    tokenAddress            : address;
    tokenPool               : nat;

    // LP Token Details
    lpTokenAddress          : address;
    lpTokensTotal           : nat;
    pendingPoolUpdates      : nat;

    // for oracle
    lastOracleUpdate        : timestamp;
    usdmTokenControllerAddress        : address;

    // treasury
    treasuryAddress         : address;
]

type cfmmAction is 
    | Default                       of unit
    | SetAdmin                      of address
    | SetBaker                      of setBakerActionType
    | SetLpTokenAddress             of address 
    | SetTreasuryAddress            of address 

    | AddLiquidity                  of addLiquidityActionType
    | RemoveLiquidity               of removeLiquidityActionType 

    | CashToToken                   of cashToTokenActionType
    | TokenToCash                   of tokenToCashActionType
    | TokenToToken                  of tokenToTokenActionType

    | UpdatePools                   of unit
    | UpdateFa12TokenPoolInternal   of updateFa12TokenPoolInternalActionType
    
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
  if (Tezos.get_sender() = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function - check sender is from token address
function checkSenderIsTokenAddress(var s : cfmmStorage) : unit is
  if (Tezos.get_sender() = s.tokenAddress) then unit
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



// helper function to get balance_of entrypoint from FA12 Token contract
function getFa12TokenBalanceOfEntrypoint(const tokenContractAddress : address) : contract(getBalanceParamsType) is
  case (Tezos.get_entrypoint_opt(
      "%getBalance",
      tokenContractAddress) : option(contract(getBalanceParamsType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. GetBalance entrypoint in FA12 Token contract not found") : contract(getBalanceParamsType))
  ]



// helper function to get updateFa12TokenPoolInternal entrypoint from self address
function getUpdateFa12TokenPoolInternalEntrypoint(const contractAddress : address) : contract(updateFa12TokenPoolInternalActionType) is
  case (Tezos.get_entrypoint_opt(
      "%updateFa12TokenPoolInternal",
      contractAddress) : option(contract(updateFa12TokenPoolInternalActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. UpdateFa12TokenPoolInternal entrypoint in contract not found") : contract(updateFa12TokenPoolInternalActionType))
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
            ]
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


function onPriceAction(const onPriceActionParams : onPriceActionType; var s : cfmmStorage) : operation is 
block {
    const onPriceActionOperation : operation = Tezos.transaction(
        onPriceActionParams,
        0mutez,
        getOnPriceActionInUsdmEntrypoint(s.usdmTokenControllerAddress)
    );
} with (onPriceActionOperation)


// ------ Helper Functions end ------

function default(var s : cfmmStorage) : return is 
block {

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    const newCashPoolAmount : nat = s.cashPool + mutezToNatural(Tezos.amount);
    s.cashPool := newCashPoolAmount;

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




(*  setTreasuryAddress entrypoint *)
function setTreasuryAddress(const newTreasuryAddress : address; var s : cfmmStorage) : return is
block {
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    s.treasuryAddress := newTreasuryAddress;
} with (noOperations, s)




(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType ; var s : cfmmStorage) : return is 
block {

    // init variables for convenience
    const deadline            : timestamp           = addLiquidityParams.deadline;
    const maxTokensDeposited  : nat                 = addLiquidityParams.maxTokensDeposited;
    const minLpTokensMinted   : nat                 = addLiquidityParams.minLpTokensMinted;
    const owner               : address             = addLiquidityParams.owner; 

    const cashDeposited       : nat                 = mutezToNatural(Tezos.amount);
    var operations            : list(operation)    := nil;

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline);

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

    // send token from sender to cfmm
    const sendTokenToCfmmOperation : operation = transferFa12Token(
        Tezos.get_sender(),           // from_
        Tezos.get_self_address(),     // to_
        tokensDeposited,        // token amount
        s.tokenAddress          // token contract address
    );
    operations := sendTokenToCfmmOperation # operations;

    // send tez from sender to cfmm
    // const sendTezToCfmmOperation : operation = transferTez( (get_contract(Tezos.get_self_address()) : contract(unit)), cashDeposited);
    // operations := sendTezToCfmmOperation # operations;

    // mint LP Tokens and send to sender
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
    var operations              : list(operation)    := nil;    

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline);

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
    const burnLpTokenOperation : operation = mintOrBurnLpToken(Tezos.get_sender(), (0 - lpTokensBurned), s);
    operations := burnLpTokenOperation # operations;

    // send withdrawn tokens to sender 
    const withdrawnTokensToSenderOperation : operation = transferFa12Token(
        Tezos.get_self_address(),     // from_
        Tezos.get_sender(),           // to_
        tokensWithdrawn,        // token amount
        s.tokenAddress          // token contract address
    );
    operations := withdrawnTokensToSenderOperation # operations;

    // withdraw tez to sender
    const withdrawTezToSenderOperation : operation = transferTez( (Tezos.get_contract_with_error(recipient, "Error. Unable to send tez to sender.") : contract(unit)), cashWithdrawn);
    operations := withdrawTezToSenderOperation # operations;

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

    if s.lpTokenAddress =/= zeroAddress then failwith("Error. LP Token Address is already set.") else skip;
    s.lpTokenAddress := lpTokenAddress;

} with (noOperations, s)



(* cashToToken entrypoint *)
function cashToToken(const cashToTokenParams : cashToTokenActionType; var s : cfmmStorage) : return is 
block {
    
    // init variables for convenience
    const deadline              : timestamp           = cashToTokenParams.deadline;
    
    const minTokensBought       : nat                 = cashToTokenParams.minTokensBought;
    const recipient             : address             = cashToTokenParams.to_; 
    const cashSold              : nat                 = mutezToNatural(Tezos.amount);

    var operations              : list(operation)    := nil;

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline);

    (* We don't check that xtzPool > 0, because that is impossible unless all liquidity has been removed. *)
    const cashPool   : nat = s.cashPool;
    const tokenPool  : nat = s.tokenPool;

    const tokensBought : nat = (cashSold * constFee * tokenPool) / (cashPool * constFeeDenom + (cashSold * constFee));
    if tokensBought < minTokensBought then failwith("Error. Tokens bought must be greater than or equal to min tokens bought.") else skip;

    if tokensBought > tokenPool then failwith("Error. Token pool minus tokens bought is negative.") else skip;
    const newTokenPool : nat = abs(tokenPool - tokensBought);
    const newCashPool : nat = cashPool + cashSold;

    // update new storage
    s.cashPool   := newCashPool;
    s.tokenPool  := newTokenPool;

    // send tokens_withdrawn from exchange to sender
    const withdrawTokensOperation : operation = transferFa12Token(
        Tezos.get_self_address(),     // from_
        recipient,              // to_
        tokensBought,           // token amount
        s.tokenAddress          // token contract address
    );
    operations := withdrawTokensOperation # operations;

    const onPriceActionParams : onPriceActionType = record [
        tokenName   = s.tokenName;
        cashAmount  = newCashPool;
        tokenAmount = newTokenPool;
    ];
    if s.lastOracleUpdate = Tezos.now then skip else block {
        const onPriceActionUpdateUsdmOperation : operation = onPriceAction(onPriceActionParams, s);
        operations := onPriceActionUpdateUsdmOperation # operations;
    }

} with (operations, s)




(* tokenToCash entrypoint *)
function tokenToCash(const tokenToCashParams : tokenToCashActionType; var s : cfmmStorage) : return is 
block {
    
    // init variables for convenience
    const deadline              : timestamp           = tokenToCashParams.deadline;
    const tokensSold            : nat                 = tokenToCashParams.tokensSold;
    const minCashBought         : nat                 = tokenToCashParams.minCashBought;
    const recipient             : address             = tokenToCashParams.to_; 
    var operations              : list(operation)    := nil;

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline);

    // check that no tez is sent
    checkNoAmount(Unit);

    (* We don't check that tokenPool > 0, because that is impossible unless all liquidity has been removed. *)
    const cashPool   : nat = s.cashPool;
    const tokenPool  : nat = s.tokenPool;

    const cashBought : nat = (tokensSold * constFee * cashPool) / (tokenPool * constFeeDenom + (tokensSold * constFee));
    if cashBought < minCashBought then failwith("Error. Cash bought must be greater than or equal to min cash bought.") else skip;

    // send tokens_sold from sender to cfmm
    const sendSoldTokensToCfmmOperation : operation = transferFa12Token(
        Tezos.get_sender(),           // from_
        Tezos.get_self_address(),     // to_
        tokensSold,             // token amount
        s.tokenAddress          // token contract address
    );
    operations := sendSoldTokensToCfmmOperation # operations;

    // send cashBought from cfmm to sender
    const transferTezFromCfmmToSenderOperation : operation = transferTez( (Tezos.get_contract_with_error(recipient, "Error. Unable to send tez to sender.") : contract(unit) ), cashBought );
    operations := transferTezFromCfmmToSenderOperation # operations;

    if cashBought > cashPool then failwith("Error. Cash pool minus cash bought is negative.") else skip;
    const newCashPool   : nat = abs(cashPool - cashBought);
    const newTokenPool  : nat = tokenPool + tokensSold;

    // update new storage
    s.cashPool   := newCashPool;
    s.tokenPool  := newTokenPool;

    const onPriceActionParams : onPriceActionType = record [
        tokenName   = s.tokenName;
        cashAmount  = newCashPool;
        tokenAmount = newTokenPool;
    ];
    if s.lastOracleUpdate = Tezos.now then skip else block {
        const onPriceActionUpdateUsdmOperation : operation = onPriceAction(onPriceActionParams, s);
        operations := onPriceActionUpdateUsdmOperation # operations;
    }

} with (operations, s)




(* tokenToToken entrypoint *)
function tokenToToken(const tokenToTokenParams : tokenToTokenActionType; var s : cfmmStorage) : return is 
block {

    // init variables for convenience
    const deadline              : timestamp           = tokenToTokenParams.deadline;
    const tokensSold            : nat                 = tokenToTokenParams.tokensSold;
    const minTokensBought       : nat                 = tokenToTokenParams.minTokensBought;
    const recipient             : address             = tokenToTokenParams.to_; 
    const outputCfmmContract    : address             = tokenToTokenParams.outputCfmmContract; 
    var operations              : list(operation)    := nil;

    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check deadline has not passed
    checkDeadlineHasNotPassed(deadline);

    // check that no tez is sent
    checkNoAmount(Unit);

    (* We don't check that tokenPool > 0, because that is impossible unless all liquidity has been removed. *)
    const cashPool   : nat = s.cashPool;
    const tokenPool  : nat = s.tokenPool;

    const cashBought : nat = (tokensSold * constFee * cashPool) / (tokenPool * constFeeDenom + (tokensSold * constFee));
    if cashBought > cashPool then failwith("Error. Cash pool minus cash bought is negative.") else skip;

    const newCashPool   : nat = abs(cashPool - cashBought);
    const newTokenPool  : nat = tokenPool + tokensSold;

    // update new storage
    s.cashPool   := newCashPool;
    s.tokenPool  := newTokenPool;    

    // cash is tez
    const sendCashToOutputCfmmContractParams : cashToTokenActionType = record [
        minTokensBought = minTokensBought;
        deadline        = deadline;
        to_             = recipient;
    ];
    const sendCashToOutputCfmmContractOperation : operation = Tezos.transaction(
        sendCashToOutputCfmmContractParams,
        naturalToMutez(cashBought),
        getCashToTokenOutputCfmmEntrypoint(outputCfmmContract)
    );
    operations := sendCashToOutputCfmmContractOperation # operations;

    // accept tokens from sender
    const acceptTokensFromSenderOperation : operation = transferFa12Token(
        Tezos.get_sender(),           // from_
        Tezos.get_self_address(),     // to_
        tokensSold,             // token amount
        s.tokenAddress          // token contract address
    );
    operations := acceptTokensFromSenderOperation # operations;

    const onPriceActionParams : onPriceActionType = record [
        tokenName   = s.tokenName;
        cashAmount  = newCashPool;
        tokenAmount = newTokenPool;
    ];
    if s.lastOracleUpdate = Tezos.now then skip else block {
        const onPriceActionUpdateUsdmOperation : operation = onPriceAction(onPriceActionParams, s);
        operations := onPriceActionUpdateUsdmOperation # operations;
    }

} with (operations, s)




(* updatePools entrypoint *)
function updatePools(var s : cfmmStorage) : return is 
block {
    
    // check if call is from an implicit account (i.e. sender = source)
    checkFromImplicitAccount(Unit);

    // check that no tez is sent    
    checkNoAmount(Unit);

    // init variables
    var operations : list(operation) := nil;    

    // Token is FA12
    const getFa12TokenBalanceOperation : operation = Tezos.transaction(
        ( Tezos.get_self_address() , getUpdateFa12TokenPoolInternalEntrypoint(Tezos.get_self_address())),
        0mutez,
        getFa12TokenBalanceOfEntrypoint(s.tokenAddress)
    ); 
    operations := getFa12TokenBalanceOperation # operations;

    // set pending pool updates
    const pendingPoolUpdates : nat = 1n;
    s.pendingPoolUpdates := pendingPoolUpdates;

} with (operations, s)




(* updateFa12TokenPoolInternal entrypoint *)
function updateFa12TokenPoolInternal(const updateFa12TokenPoolInternalParams : updateFa12TokenPoolInternalActionType; var s : cfmmStorage) : return is 
block {
    
    // check no pending pool updates
    checkNoPendingPoolUpdates(s);

    // check that sender is from the token address
    checkSenderIsTokenAddress(s);

    s.tokenPool            := updateFa12PoolInternal(updateFa12TokenPoolInternalParams);
    s.pendingPoolUpdates   := abs(s.pendingPoolUpdates - 1n);

} with (noOperations, s)



function main (const action : cfmmAction; const s : cfmmStorage) : return is 
    case action of [
        | Default(_parameters)                      -> default(s)
        | SetAdmin(parameters)                      -> setAdmin(parameters, s)
        | SetBaker(parameters)                      -> setBaker(parameters, s)
        | SetLpTokenAddress(parameters)             -> setLpTokenAddress(parameters, s)
        | SetTreasuryAddress(parameters)            -> setTreasuryAddress(parameters, s)

        | CashToToken(parameters)                   -> cashToToken(parameters, s)
        | TokenToCash(parameters)                   -> tokenToCash(parameters, s)
        | TokenToToken(parameters)                  -> tokenToToken(parameters, s)

        | AddLiquidity(parameters)                  -> addLiquidity(parameters, s)
        | RemoveLiquidity(parameters)               -> removeLiquidity(parameters, s)
        
        | UpdatePools(_parameters)                  -> updatePools(s)
        | UpdateFa12TokenPoolInternal(parameters)   -> updateFa12TokenPoolInternal(parameters, s)
        
    ]