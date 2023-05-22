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



function checkSenderIsAdmin(const s : cmtaTokenStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit


function verifySenderIsAdmin(const ledgerKey : ledgerKeyType; const s : cmtaTokenStorageType) : unit is 
block {

    const administratorCheck : nat = case s.administrators of [
            Some (_v) -> _v
        |   None      -> failwith(error_ADMINISTRATOR_NOT_FOUND)
    ];

    if administratorCheck = IS_ADMIN then skip else failwith(error_NOT_ADMIN);

} with unit



function verifyTokenDoesNotExist(const token_id : nat; const s : cmtaTokenStorageType) : unit is
block {

    case s.token_context[token_id] of [
            Some(_v) -> failwith(error_TOKEN_EXISTS)
        |   None     -> skip
    ];

} with unit



function verifyNoScheduledSnapshot(const token_context : tokenContextType) : unit is 
block {

    case token_context.next_snapshot of [
            Some (_v) -> failwith(error_SNAPSHOT_ALREADY_SCHEDULED)
        |   None      -> skip
    ];

} with unit



function verifySnapshotInFuture(const snapshot_timestamp : timestamp) : unit is
block {

    if Tezos.get_now() < snapshot_timestamp then skip else failwith(error_SNAPSHOT_IN_PAST);

} with unit



function verifyTokenIsDefined(const token_id : nat; const s : cmtaTokenStorageType) : unit is
block {

    case s.token_metadata[token_id] of [
            Some (_v) -> skip
        |   None      -> failwith(error_TOKEN_UNDEFINED)
    ];

} with unit


function verifySufficientBalance(const recipient_ledger_key : ledgerKeyType; const amount : nat; const s : cmtaTokenStorageType) : unit is
block {

    const ledger_balance : nat = case s.ledger[recipient_ledger_key] of [
            Some(_v) -> _v
        |   None     -> 0n
    ];

    if ledger_balance < amount then failwith(error_INSUFFICIENT_BALANCE) else skip;

} with unit



function bootstrap_snapshot(const params : (tokenContextType * nat); var s : cmtaTokenStorageType) : (tokenContextType * cmtaTokenStorageType) is 
block {

    const token_context : tokenContextType = params.0;
    const token_id      : nat              = params.1;

    case token_context.next_snapshot of [
            Some(next_snapshot_timestamp) -> {

                if next_snapshot_timestamp < Tezos.get_now() then block {

                    // check if there is a current snapshot set, if there is, set it to the next snapshot timestamp
                    case token_context.current_snapshot of [
                            Some(current_snapshot_timestamp) -> {

                                const snapshot_lookup_key : snapshotLookupKeyType = record [
                                    token_id            = token_id;
                                    snapshot_timestamp  = current_snapshot_timestamp;
                                ];

                                s.snapshot_lookup[snapshot_lookup_key] := next_snapshot_timestamp;

                            }
                        |   None -> skip
                    ];

                    token_context.current_snapshot  := Some(next_snapshot_timestamp);
                    token_context.next_snapshot     := (None : option(timestamp));

                    // update token context
                    s.token_context[token_id] := token_context;

                }    
            }
        |   None -> skip
    ];

} with (token_context, s)



function set_snapshot_ledger(const params : (tokenContextType * nat * address); var s : cmtaTokenStorageType) : cmtaTokenStorageType is
block {

    const token_context  : tokenContextType = params.0;
    const token_id       : nat              = params.1;
    const ownerAddress   : address          = params.2;

    case token_context.current_snapshot of [
            Some (current_snapshot_timestamp) -> {

                const snapshot_ledger_key : snapshotLedgerKeyType = record [
                    token_id            = token_id;
                    owner               = ownerAddress;
                    snapshot_timestamp  = current_snapshot_timestamp;
                ];

                case s.snapshot_ledger[snapshot_ledger_key] of [
                        Some (_v) -> {
                            
                            const ledger_key : ledgerKeyType = record [
                                owner       = ownerAddress;
                                token_id    = token_id;
                            ];

                            const ledger_value : nat = case s.ledger[ledger_key] of [
                                    Some (_v) -> _v
                                |   None      -> 0n
                            ];

                            // set snapshot ledger value
                            s.snapshot_ledger[snapshot_ledger_key] := ledger_value;

                        }
                    |   None -> skip
                ];

            }
        |   None -> skip
    ];

} with s



function set_snapshot_total_supply(const params : (tokenContextType * nat); var s : cmtaTokenStorageType) : cmtaTokenStorageType is
block {

    const token_context : tokenContextType = params.0;
    const token_id      : nat              = params.1;

    case token_context.current_snapshot of [
            Some (current_snapshot_timestamp) -> {

                const snapshot_lookup_key : snapshotLookupKeyType = record [
                    token_id            = token_id;
                    snapshot_timestamp  = current_snapshot_timestamp;
                ];

                const total_supply : nat = case s.total_supply[token_id] of [
                        Some (_v) -> _v
                    |   None      -> 0n;
                ];

                // set snapshot total supply
                s.snapshot_total_supply[snapshot_lookup_key] := total_supply;

            }   
        |   None -> skip
    ];

}

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
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : cmtaTokenStorageType) : address is
    s.admin



(* get: operator *)
[@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const s : cmtaTokenStorageType) : option(unit) is
    Big_map.find_opt(operator, s.operators)



(* maximumSupply View *)
[@view] function getMaximumSupply(const _ : unit; const s : cmtaTokenStorageType) : tokenBalanceType is
    s.maximumSupply



(* get: balance View *)
[@view] function get_balance(const userAndId : ownerType * nat; const s : cmtaTokenStorageType) : tokenBalanceType is
    case Big_map.find_opt(userAndId.0, s.ledger) of [
            Some (_v) -> _v
        |   None      -> 0n
    ]



(* total_supply View *)
[@view] function total_supply(const _tokenId : nat; const _s : cmtaTokenStorageType) : tokenBalanceType is
    _s.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _s : cmtaTokenStorageType) : list(nat) is
    list[0n]



(* check if operator *)
[@view] function is_operator(const operator : (ownerType * operatorType * nat); const s : cmtaTokenStorageType) : bool is
    Big_map.mem(operator, s.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId : nat; const s : cmtaTokenStorageType) : tokenMetadataInfoType is
    case Big_map.find_opt(tokenId, s.token_metadata) of [
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
// function setAdmin(const newAdminAddress : address; var s : cmtaTokenStorageType) : return is
// block {

//   checkSenderIsAllowed(s);
//   s.admin := newAdminAddress;

// } with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Owner Entrypoints Begin
// ------------------------------------------------------------------------------

(* initialise_token entrypoint *)
function initialise_token(const initialiseTokenParams : list(tokenIdType); const s : cmtaTokenStorageType) : return is
block{

    for token_id in list initialiseTokenParams block {

        verifyTokenDoesNotExist(token_id, s);

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = token_id;
        ];

        // verify sender is admin
        verifySenderIsAdmin(administrator_ledger_key, s);

        // add new token context
        const new_token_context : tokenContextType = record [
            is_paused                       = False;
            validate_transfer_rule_contract = (None : option(address));
            current_snapshot                = (None : option(timestamp));
            next_snapshot                   = (None : option(timestamp));
        ];

        s.token_context[token_id] := new_token_context;
    }

} with (noOperations, s)



(* mint entrypoint *)
function mint(const token_amounts : list(tokenAmountType); var s : cmtaTokenStorageType) : return is
block {


    for token_amount in list token_amounts block {

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = token_amount.token_id;
        ];

        const recipient_ledger_key : ledgerKeyType = record [
            owner       = token_amount.address;
            token_id    = token_amount.token_id;
        ];

        verifySenderIsAdmin(administrator_ledger_key, s);

        verifyTokenIsDefined(token_amount.token_id, s);

        var token_context : tokenContextType := case s.token_context[token_amount.token_id] of [
                Some (_v) -> _v
            |   None      -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        const bootstrap_snapshot : (tokenContextType * cmtaTokenStorageType) = bootstrap_snapshot((token_context, token_amount.token_id), s);
        token_context  := bootstrap_snapshot.0;
        s              := bootstrap_snapshot.1;

        s := set_snapshot_total_supply((token_context, token_amount.token_id), s);
        s := set_snapshot_ledger((token_context, token_amount.token_id, token_amount.address), s);

        s.ledger[recipient_ledger_key] := case s.ledger[recipient_ledger_key] of [
                Some(_v) -> _v + token_amount.amount
            |   None     -> token_amount.amount
        ];

        s.total_supply[token_amount.token_id] := case s.total_supply[token_id] of [
                Some (_v) -> _v + token_amount.amount
            |   None      -> token_amount.amount
        ];

    }

} with (noOperations, s)



(* burn entrypoint *)
function burn(const token_amounts : list(tokenAmountType); var s : cmtaTokenStorageType) : return is
block {


    for token_amount in list token_amounts block {

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = token_amount.token_id;
        ];

        const recipient_ledger_key : ledgerKeyType = record [
            owner       = token_amount.address;
            token_id    = token_amount.token_id;
        ];

        verifySenderIsAdmin(administrator_ledger_key, s);

        verifySufficientBalance(recipient_ledger_key, token_amount.amount, s);

        var token_context : tokenContextType := case s.token_context[token_amount.token_id] of [
                Some (_v) -> _v
            |   None      -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        const bootstrap_snapshot : (tokenContextType * cmtaTokenStorageType) = bootstrap_snapshot((token_context, token_amount.token_id), s);
        token_context  := bootstrap_snapshot.0;
        s              := bootstrap_snapshot.1;

        s := set_snapshot_total_supply((token_context, token_amount.token_id), s);
        s := set_snapshot_ledger((token_context, token_amount.token_id, token_amount.address), s);

        s.ledger[recipient_ledger_key] := case s.ledger[recipient_ledger_key] of [
                Some(_v) -> if _v > token_amount.amount then abs(_v - token_amount.amount) else 0n
            |   None     -> 0n
        ];

        s.total_supply[token_amount.token_id] := case s.total_supply[token_id] of [
                Some (_v) -> if _v > token_amount.amount then abs(_v - token_amount.amount) else 0n
            |   None      -> 0n
        ];

        const recipient_balance : nat = case s.ledger[recipient_ledger_key] of [
                Some(_v) -> _v
            |   None     -> 0n
        ];

        if recipient_balance = 0n then remove recipient_ledger_key from map s.ledger else skip;

    }

} with (noOperations, s)



(* pause entrypoint 
    - Allows to pause tokens, only a token administrator can do this
*)
function pause(const pauseParams : list(tokenIdType); const s : cmtaTokenStorageType) : return is
block{

    for token_id in list pauseParams block {

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = token_id;
        ];

        // verify sender is admin
        verifySenderIsAdmin(administrator_ledger_key, s);

        var token_context : tokenContextType := case s.token_context[token_id] of [
                Some (_context) -> _context
            |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        token_context.is_paused := True;

        s.token_context[token_id] := token_context;
    }

} with (noOperations, s)



(* unpause entrypoint 
    - Allows to unpause tokens, only a token administrator can do this
*)
function unpause(const unpauseParams : list(tokenIdType); const s : cmtaTokenStorageType) : return is
block{

    for token_id in list unpauseParams block {

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = token_id;
        ];

        // verify sender is admin
        verifySenderIsAdmin(administrator_ledger_key, s);

        var token_context : tokenContextType := case s.token_context[token_id] of [
                Some (_context) -> _context
            |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        token_context.is_paused := False;

        s.token_context[token_id] := token_context;
    }

} with (noOperations, s)




(* set_rule_engines entrypoint 
    - Allows to specify the rules contract for a specific token, only a token administrator can do this
*)
function set_rule_engines(const setRuleEnginesParams : list(ruleType); const s : cmtaTokenStorageType) : return is
block{

    for rule in list setRuleEnginesParams block {

        const rule_token_id : nat = rule.token_id;

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = rule_token_id;
        ];

        // verify sender is admin
        verifySenderIsAdmin(administrator_ledger_key, s);

        // get and update token context
        var token_context : tokenContextType := case s.token_context[rule_token_id] of [
                Some (_context) -> _context
            |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
        ];

        token_context.validate_transfer_rule_contract := option(rule.rule_contract);

        s.token_context[rule_token_id] := token_context;
        
    };

} with (noOperations, s)



(* schedule_snapshot entrypoint 
    - Schedules a snapshot for the future for a specific token. Only one snapshot can be scheduled, repeated call will fail, to re-schedule you need to unschedule using the `unschedule_snapshot` entry point first. Only token administrator can do this.
*)
function schedule_snapshot(const token_id : nat; const snapshot_timestamp : timestamp; const s : cmtaTokenStorageType) : return is
block{

    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = token_id;
    ];

    // verify sender is admin
    verifySenderIsAdmin(administrator_ledger_key, s);

    // get token context
    var token_context : tokenContextType := case s.token_context[token_id] of [
            Some (_context) -> _context
        |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
    ];

    verifyNoScheduledSnapshot(token_context);

    verifySnapshotInFuture(snapshot_timestamp);

    token_context.next_snapshot := Some(snapshot_timestamp);

    s.token_context[token_id] := token_context;

} with (noOperations, s)



(* unschedule_snapshot entrypoint 
    - Unschedules the scheduled snapshot for the given token_id. Only token administrator can do this.
*)
function unschedule_snapshot(const token_id : nat; const s : cmtaTokenStorageType) : return is
block{

    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = token_id;
    ];

    // verify is admin
    verifySenderIsAdmin(administrator_ledger_key, s);

    // get token context
    var token_context : tokenContextType := case s.token_context[token_id] of [
            Some (_context) -> _context
        |   None            -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
    ];

    token_context.next_snapshot := (None : option(timestamp));

    s.token_context[token_id] := token_context;

} with (noOperations, s)



(* delete_snapshot entrypoint 
    - Deletes a snapshot for the given snapshot lookup key (consisting of token_id = sp.TNat, snapshot_timestamp = sp.TTimestamp). Only token administrator can do this.
*)
function delete_snapshot(const snapshot_lookup_key : snapshotLookupKeyType; const s : cmtaTokenStorageType) : return is
block{

    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = snapshot_lookup_key.token_id;
    ];

    // verify is admin
    verifySenderIsAdmin(administrator_ledger_key, s);

    remove snapshot_lookup_key from map s.snapshot_lookup

} with (noOperations, s)



(* kill entrypoint 
    - Wipes irreversibly the storage and ultimately kills the contract such that it can no longer be used. All tokens on it will be affected. Only special admin of token id 0 can do this.
*)
function kill(const s : cmtaTokenStorageType) : return is
block{

    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = 0n;
    ];

    // verify is admin
    verifySenderIsAdmin(administrator_ledger_key, s);

    s.ledger            := (big_map[] : ledgerType);
    s.administrators    := (big_map[] : administratorsType);
    s.token_metadata    := (big_map[] : metadataType);
    s.total_supply      := (big_map[] : totalSupplyType);
    s.operators         := (big_map[] : operatorsType);
    s.token_context     := (big_map[] : tokenContextType);
    s.identities        := (big_map[] : identityType);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Owner Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Open Entrypoints Begin
// ------------------------------------------------------------------------------

(* set_identity entrypoint 
    - Allows a user to set the own identity
*)
function set_identity(const identity : bytes; const s : cmtaTokenStorageType) : return is
block{

    s.identities[Tezos.get_sender] := identity;

} with (noOperations, s)


(* transfer entrypoint *)
function transfer(const transferParams : fa2TransferType; const s : cmtaTokenStorageType) : return is
block{

    function makeTransfer(const account : return; const transferParam : transfer) : return is
        block {

            const owner : ownerType = transferParam.from_;
            const txs : list(transferDestination) = transferParam.txs;
            
            function transferTokens(const accumulator : cmtaTokenStorageType; const destination : transferDestination) : cmtaTokenStorageType is
            block {

                const token_id      : tokenIdType = destination.token_id;
                const tokenAmount   : tokenBalanceType = destination.amount;
                const receiver      : ownerType = destination.to_;

                const from_user : ledgerKeyType = record [
                    owner       = owner;
                    token_id    = token_id;
                ];

                const to_user : ledgerKeyType = record [
                    owner       = receiver;
                    token_id    = token_id;
                ];

                const operator_key : operatorKeyType = record [
                    token_id    = token_id;
                    owner       = owner;
                    operator    = receiver;
                ];

                const token_context : tokenContextType = case s.token_context[token_id] of [
                        Some(_v) -> _v
                    |   None     -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
                ];

                case token_context.validate_transfer_rule_contract of [
                        Some(_v) -> _v
                    |   None     -> failwith()
                ];

                // const ownerBalance  : tokenBalanceType = get_balance((owner, 0n), accumulator);
                // const receiverBalance   : tokenBalanceType = get_balance((receiver, 0n), accumulator);

                // // Validate operator
                // checkOperator(owner, token_id, account.1.operators);

                // // Validate token type
                // checkTokenId(token_id);

                // // Validate that sender has enough token
                // checkBalance(ownerBalance,tokenAmount);

                // // Update users' balances
                // var ownerNewBalance     : tokenBalanceType := ownerBalance;
                // var receiverNewBalance  : tokenBalanceType := receiverBalance;

                // if owner =/= receiver then {
                //     ownerNewBalance     := abs(ownerBalance - tokenAmount);
                //     receiverNewBalance  := receiverBalance + tokenAmount;
                // }
                // else skip;

                // var updatedLedger : ledgerType := Big_map.update(owner, Some (ownerNewBalance), accumulator.ledger);
                // updatedLedger := Big_map.update(receiver, Some (receiverNewBalance), updatedLedger);


            } with accumulator with record[ledger=updatedLedger];

            const updatedOperations : list(operation) = (nil: list(operation));
            const updatedStorage : cmtaTokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferParams, ((nil: list(operation)), s))



// ------------------------------------------------------------------------------
// Open Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Entrypoints Begin
// ------------------------------------------------------------------------------

(* assertMetadata entrypoint *)
// function assertMetadata(const assertMetadataParams : assertMetadataType; const s : cmtaTokenStorageType) : return is
// block{

//     const metadataKey  : string  = assertMetadataParams.key;
//     const metadataHash : bytes   = assertMetadataParams.hash;
//     case Big_map.find_opt(metadataKey, s.metadata) of [
//             Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
//         |   None     -> failwith("METADATA_NOT_FOUND")
//     ]

// } with (noOperations, s)



// (* balance_of entrypoint *)
// function balanceOf(const balanceOfParams : balanceOfType; const s : cmtaTokenStorageType) : return is
// block{

//     function retrieveBalance(const request : balanceOfRequestType) : balanceOfResponse is
//         block{

//             const requestOwner : ownerType = request.owner;
//             const tokenBalance : tokenBalanceType = 
//             case Big_map.find_opt(requestOwner, s.ledger) of [
//                     Some (b) -> b
//                 |   None     -> 0n
//             ];
//             const response : balanceOfResponse = record[request=request;balance=tokenBalance];

//         } with (response);

//       const requests   : list(balanceOfRequestType) = balanceOfParams.requests;
//       const callback   : contract(list(balanceOfResponse)) = balanceOfParams.callback;
//       const responses  : list(balanceOfResponse) = List.map(retrieveBalance, requests);
//       const operation  : operation = Tezos.transaction(responses, 0tez, callback);

// } with (list[operation],s)



// (* update_operators entrypoint *)
// function updateOperators(const updateOperatorsParams : updateOperatorsType; const s : cmtaTokenStorageType) : return is
// block{

//     var updatedOperators : operatorsType := List.fold(
//         function(const operators : operatorsType; const updateOperator : updateOperatorVariantType) : operatorsType is
//             case updateOperator of [
//                     Add_operator (param)    -> addOperator(param, operators)
//                 |   Remove_operator (param) -> removeOperator(param, operators)
//             ]
//         ,
//         updateOperatorsParams,
//         s.operators
//     )

// } with (noOperations, s with record[operators=updatedOperators])

// ------------------------------------------------------------------------------
// FA2 Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : action; const s : cmtaTokenStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any tez amount  

} with(
    
    case action of [

            // Housekeeping Entrypoints
            SetAdmin (params)                   -> setAdmin(params, s)
        
            // Owner Entrypoints
        |   Initialise_token (params)           -> initialise_token(params, s)
        |   Mint (params)                       -> mint(params, s)
        |   Burn (params)                       -> burn(params, s)
        |   Pause (params)                      -> pause(params, s)
        |   Unpause (params)                    -> unpause(params, s)
        |   Set_rule_engines (params)           -> set_rule_engines(params, s)
        |   Schedule_snapshot (params)          -> schedule_snapshot(params, s)
        |   Unschedule_snapshot (params)        -> unschedule_snapshot(params, s)
        |   Delete_snapshot (params)            -> delete_snapshot(params, s)
        |   Kill (_params)                      -> kill(s)

            // Open Entrypoints
        |   Set_identity (params)               -> set_identity(params, s)
        |   Transfer (params)                   -> transfer(params, s)

            // FA2 Entrypoints
        |   AssertMetadata (params)             -> assertMetadata(params, s)
        
        |   Balance_of (params)                 -> balanceOf(params, s)
        |   Update_operators (params)           -> updateOperators(params, s)
    ]

)
