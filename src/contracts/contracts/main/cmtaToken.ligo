// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// General Contracts : generalContractsType, updateGeneralContractsParams
#include "../partials/contractTypes/cmtaTokenTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Housekeeping Entrypoints
        Set_administrator         of 
        
        // Owner Entrypoints
    |   Initialise_token          of list(tokenIdType)
    |   Mint                      of mintType
    |   Burn                      of nat

    |   Pause                     of list(tokenIdType)
    |   Unpause                   of list(tokenIdType)
    |   Set_rule_engines          of setRuleEngineType

    |   Schedule_snapshot         of (tokenIdType * snapshotTimestampType)
    |   Unschedule_snapshot       of tokenIdType
    |   Delete_snapshot           of snapshotLookupKeyType
    |   Kill                      of unit 
    
        // FA2 Entrypoints
    |   AssertMetadata            of assertMetadataType
    |   Transfer                  of fa2TransferType
    |   Balance_of                of balanceOfType
    |   Update_operators          of updateOperatorsType
    
    
type return is list (operation) * cmtaTokenStorageType
const noOperations : list (operation) = nil;


cameLIGO - functional prog
a => b
  b => c
    c => d
    . ... 


    ..
     .. 

declarative prog

a1 => b1

b1 => c1

c => d


// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const IS_ADMIN : nat = 1n;
const IS_PROPOSED_ADMIN : nat = 2n;

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

function checkSenderIsAllowed(var s : cmtaTokenStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const store : cmtaTokenStorageType) : unit is
    if Tezos.get_sender() =/= store.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Helper Functions Begin
// ------------------------------------------------------------------------------

function checkTokenId(const tokenId : tokenIdType) : unit is
    if tokenId =/= 0n then failwith("FA2_TOKEN_UNDEFINED")
    else unit



function checkBalance(const spenderBalance : tokenBalanceType; const tokenAmount: tokenBalanceType) : unit is
    if spenderBalance < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE")
    else unit



function checkOwnership(const owner : ownerType) : unit is
    if Tezos.get_sender() =/= owner then failwith("FA2_NOT_OWNER")
    else unit



function checkOperator(const owner : ownerType; const token_id : tokenIdType; const operators : operatorsType) : unit is
    if owner = Tezos.get_sender() or Big_map.mem((owner, Tezos.get_sender(), token_id), operators) then unit
    else failwith ("FA2_NOT_OPERATOR")



// mergeOperations helper function - used in transfer entrypoint
function mergeOperations(const first : list (operation); const second : list (operation)) : list (operation) is 
List.fold( 
    function(const operations : list(operation); const operation : operation) : list(operation) is operation # operations,
    first,
    second
)



// addOperator helper function - used in update_operators entrypoint
function addOperator(const operatorParameter : operatorParameterType; const operators : operatorsType) : operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey : (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.update(operatorKey, Some (unit), operators))



// removeOperator helper function - used in update_operators entrypoint
function removeOperator(const operatorParameter : operatorParameterType; const operators : operatorsType) : operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey : (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.remove(operatorKey, operators))

// ------------------------------------------------------------------------------
// FA2 Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var store : cmtaTokenStorageType) : address is
    store.admin



(* get: operator *)
[@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const store : cmtaTokenStorageType) : option(unit) is
    Big_map.find_opt(operator, store.operators)



(* maximumSupply View *)
[@view] function getMaximumSupply(const _ : unit; const store : cmtaTokenStorageType) : tokenBalanceType is
    store.maximumSupply



(* get: balance View *)
[@view] function get_balance(const userAndId : ownerType * nat; const store : cmtaTokenStorageType) : tokenBalanceType is
    case Big_map.find_opt(userAndId.0, store.ledger) of [
            Some (_v) -> _v
        |   None      -> 0n
    ]



(* total_supply View *)
[@view] function total_supply(const _tokenId : nat; const _store : cmtaTokenStorageType) : tokenBalanceType is
    _store.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _store : cmtaTokenStorageType) : list(nat) is
    list[0n]



(* check if operator *)
[@view] function is_operator(const operator : (ownerType * operatorType * nat); const store : cmtaTokenStorageType) : bool is
    Big_map.mem(operator, store.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId : nat; const store : cmtaTokenStorageType) : tokenMetadataInfoType is
    case Big_map.find_opt(tokenId, store.token_metadata) of [
            Some (_metadata)  -> _metadata
        |   None -> record[
                token_id    = tokenId;
                token_info  = map[]
            ]
    ]

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
function setAdmin(const newAdminAddress : address; var store : cmtaTokenStorageType) : return is
block {

  checkSenderIsAllowed(store);
  store.admin := newAdminAddress;

} with (noOperations, store)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Owner Entrypoints Begin
// ------------------------------------------------------------------------------

(* initialise_token entrypoint *)
function initialise_token(const initialiseTokenParams : list(tokenIdType); const store : cmtaTokenStorageType) : return is
block{

    skip

} with (noOperations, store)



(* mint entrypoint *)
function mint(const mintParams : mintType; var store : cmtaTokenStorageType) : return is
block {

    const recipientAddress  : ownerType         = mintParams.0;
    const mintedTokens      : tokenBalanceType  = mintParams.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    if checkInWhitelistContracts(Tezos.get_sender(), store.whitelistContracts) or Tezos.get_sender() = Tezos.get_self_address() then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    // Check if the minted token exceed the maximumSupply defined in the cmtaTokenStorageType
    const tempTotalSupply : tokenBalanceType = store.totalSupply + mintedTokens;
    if tempTotalSupply > store.maximumSupply then failwith(error_MAXIMUM_SUPPLY_EXCEEDED) 
    else skip;

    // Update sender's balance
    const senderNewBalance : tokenBalanceType = get_balance((recipientAddress, 0n), store) + mintedTokens;

    // Update cmtaTokenStorageType
    store.totalSupply := store.totalSupply + mintedTokens;
    store.ledger := Big_map.update(recipientAddress, Some(senderNewBalance), store.ledger);

} with (noOperations, store)



(* burn entrypoint *)
function burn(const burnTokenAmount : nat; var store : cmtaTokenStorageType) : return is
block {

    const senderAddress : ownerType = Tezos.get_sender();

    // Get sender's balance
    const senderBalance : tokenBalanceType = get_balance((senderAddress, 0n), store);

    // Validate that sender has enough tokens to burn
    checkBalance(senderBalance, burnTokenAmount);

    const senderNewBalance : tokenBalanceType = abs(senderBalance - burnTokenAmount);

    // Update cmtaTokenStorageType
    store.totalSupply           := abs(store.totalSupply - burnTokenAmount);
    store.ledger[senderAddress] := senderNewBalance;

} with (noOperations, store)



(* pause entrypoint *)
function pause(const pauseParams : list(tokenIdType); const store : cmtaTokenStorageType) : return is
block{

    for tokenId in list pauseParams block {

        const ledgerKey : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = tokenId;
        ];

        // verify is admin

        var tokenContext : tokenContextType := case s.tokenContext[ruleTokenId] of [
                Some (_context) -> _context
            |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        tokenContext.is_paused := True;

        s.tokenContext[ruleTokenId] := tokenContext;
    }

} with (noOperations, store)



(* unpause entrypoint *)
function unpause(const unpauseParams : list(tokenIdType); const store : cmtaTokenStorageType) : return is
block{

    for tokenId in list unpauseParams block {

        const ledgerKey : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = tokenId;
        ];

        // verify is admin

        var tokenContext : tokenContextType := case s.tokenContext[ruleTokenId] of [
                Some (_context) -> _context
            |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        tokenContext.is_paused := False;

        s.tokenContext[ruleTokenId] := tokenContext;
    }

} with (noOperations, store)




(* set_rule_engines entrypoint *)
function set_rule_engines(const setRuleEnginesParams : list(ruleType); const store : cmtaTokenStorageType) : return is
block{

    for rule in list setRuleEnginesParams block {

        const ruleTokenId : nat = rule.token_id;

        const ledgerKey : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = ruleTokenId;
        ];

        // verify is admin

        var tokenContext : tokenContextType := case s.tokenContext[ruleTokenId] of [
                Some (_context) -> _context
            |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        tokenContext.validate_transfer_rule_contract := option(rule.rule_contract);

        s.tokenContext[ruleTokenId] := tokenContext;
        
    };

} with (noOperations, store)

// ------------------------------------------------------------------------------
// Owner Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Entrypoints Begin
// ------------------------------------------------------------------------------

(* assertMetadata entrypoint *)
function assertMetadata(const assertMetadataParams : assertMetadataType; const store : cmtaTokenStorageType) : return is
block{

    const metadataKey  : string  = assertMetadataParams.key;
    const metadataHash : bytes   = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, store.metadata) of [
            Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
        |   None     -> failwith("METADATA_NOT_FOUND")
    ]

} with (noOperations, store)



(* transfer entrypoint *)
function transfer(const transferParams : fa2TransferType; const store : cmtaTokenStorageType) : return is
block{

    function makeTransfer(const account : return; const transferParam : transfer) : return is
        block {

            const owner : ownerType = transferParam.from_;
            const txs : list(transferDestination) = transferParam.txs;
            
            function transferTokens(const accumulator : cmtaTokenStorageType; const destination : transferDestination) : cmtaTokenStorageType is
            block {

                const tokenId : tokenIdType = destination.token_id;
                const tokenAmount : tokenBalanceType = destination.amount;
                const receiver : ownerType = destination.to_;
                const ownerBalance : tokenBalanceType = get_balance((owner, 0n), accumulator);
                const receiverBalance : tokenBalanceType = get_balance((receiver, 0n), accumulator);

                // Validate operator
                checkOperator(owner, tokenId, account.1.operators);

                // Validate token type
                checkTokenId(tokenId);

                // Validate that sender has enough token
                checkBalance(ownerBalance,tokenAmount);

                // Update users' balances
                var ownerNewBalance     : tokenBalanceType := ownerBalance;
                var receiverNewBalance  : tokenBalanceType := receiverBalance;

                if owner =/= receiver then {
                    ownerNewBalance     := abs(ownerBalance - tokenAmount);
                    receiverNewBalance  := receiverBalance + tokenAmount;
                }
                else skip;

                var updatedLedger : ledgerType := Big_map.update(owner, Some (ownerNewBalance), accumulator.ledger);
                updatedLedger := Big_map.update(receiver, Some (receiverNewBalance), updatedLedger);

            } with accumulator with record[ledger=updatedLedger];

            const updatedOperations : list(operation) = (nil: list(operation));
            const updatedStorage : cmtaTokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferParams, ((nil: list(operation)), store))



(* balance_of entrypoint *)
function balanceOf(const balanceOfParams : balanceOfType; const store : cmtaTokenStorageType) : return is
block{

    function retrieveBalance(const request : balanceOfRequestType) : balanceOfResponse is
        block{

            const requestOwner : ownerType = request.owner;
            const tokenBalance : tokenBalanceType = 
            case Big_map.find_opt(requestOwner, store.ledger) of [
                    Some (b) -> b
                |   None     -> 0n
            ];
            const response : balanceOfResponse = record[request=request;balance=tokenBalance];

        } with (response);

      const requests   : list(balanceOfRequestType) = balanceOfParams.requests;
      const callback   : contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses  : list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation  : operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation],store)



(* update_operators entrypoint *)
function updateOperators(const updateOperatorsParams : updateOperatorsType; const store : cmtaTokenStorageType) : return is
block{

    var updatedOperators : operatorsType := List.fold(
        function(const operators : operatorsType; const updateOperator : updateOperatorVariantType) : operatorsType is
            case updateOperator of [
                    Add_operator (param)    -> addOperator(param, operators)
                |   Remove_operator (param) -> removeOperator(param, operators)
            ]
        ,
        updateOperatorsParams,
        store.operators
    )

} with (noOperations, store with record[operators=updatedOperators])

// ------------------------------------------------------------------------------
// FA2 Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : action; const store : cmtaTokenStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any tez amount  

} with(
    
    case action of [

            // Housekeeping Entrypoints
            SetAdmin (params)                   -> setAdmin(params, store)
        
            // Owner Entrypoints
        |   Initialise_token (params)           -> initialise_token(params, store)
        |   Mint (params)                       -> mint(params, store)
        |   Burn (params)                       -> burn(params, store)

        |   Pause (params)                      -> pause(params, store)
        |   Unpause (params)                    -> unpause(params, store)
        |   Set_rule_engines (params)           -> set_rule_engines(params, store)

        |   Schedule_snapshot (params)          -> schedule_snapshot(params, store)
        |   Unschedule_snapshot (params)        -> unschedule_snapshot(params, store)
        |   Delete_snapshot (params)            -> delete_snapshot(params, store)
        |   Kill (_params)                      -> kill(store)

            // FA2 Entrypoints
        |   AssertMetadata (params)             -> assertMetadata(params, store)
        |   Transfer (params)                   -> transfer(params, store)
        |   Balance_of (params)                 -> balanceOf(params, store)
        |   Update_operators (params)           -> updateOperators(params, store)
    ]

)
