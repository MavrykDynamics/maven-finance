// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// CMTA Token Types
#include "../partials/contractTypes/cmtaTokenTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Housekeeping Entrypoints
        Set_token_metadata        of tokenMetadataListType
    |   Propose_administrator     of (tokenIdType, address)
    |   Set_administrator         of tokenIdType
    |   Remove_administrator      of (tokenIdType, address)
        
        // Owner Entrypoints
    |   Initialise_token          of list(tokenIdType)
    |   Mint                      of list(tokenAmountType)
    |   Burn                      of list(tokenAmountType)
    |   Pause                     of list(tokenIdType)
    |   Unpause                   of list(tokenIdType)
    |   Set_rule_engines          of setRuleEngineType
    |   Schedule_snapshot         of (tokenIdType * snapshotTimestampType)
    |   Unschedule_snapshot       of tokenIdType
    |   Delete_snapshot           of snapshotLookupKeyType
    |   Kill                      of unit 
    
        // Open FA2 Entrypoints
    |   Set_identity              of bytes
    |   Transfer                  of fa2TransferType

        // Base FA2 Entrypoints
    |   Balance_of                of balanceOfType
    |   Update_operators          of updateOperatorsType
    
    
type return is list (operation) * cmtaTokenStorageType
const noOperations : list (operation) = nil;


// ------------------------------------------------------------------------------
// Constants Begin
// ------------------------------------------------------------------------------

const IS_ADMIN : nat = 1n;
const IS_PROPOSED_ADMIN : nat = 2n;

// ------------------------------------------------------------------------------
// Constants End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function verifySenderIsAdmin(const ledgerKey : ledgerKeyType; const s : cmtaTokenStorageType) : unit is 
block {

    const administratorCheck : nat = case s.administrators of [
            Some (_v) -> _v
        |   None      -> failwith(error_ADMINISTRATOR_NOT_FOUND)
    ];

    if administratorCheck = IS_ADMIN then skip else failwith(error_NOT_ADMIN);

} with unit



function verifySenderIsProposedAdmin(const ledgerKey : ledgerKeyType; const s : cmtaTokenStorageType) : unit is 
block {

    const administratorCheck : nat = case s.administrators of [
            Some (_v) -> _v
        |   None      -> failwith(error_ADMINISTRATOR_NOT_FOUND)
    ];

    if administratorCheck = IS_PROPOSED_ADMIN then skip else failwith(error_NOT_ADMIN);

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



function verifyTokenContextIsNotPaused(const token_context : tokenContextType) : unit is 
block {

    if token_context.is_paused = True then failwith(error_TOKEN_PAUSED) else skip;

} with unit



function verifySufficientBalance(const ledger_key : ledgerKeyType; const amount : nat; const s : cmtaTokenStorageType) : unit is
block {

    const ledger_balance : nat = case s.ledger[ledger_key] of [
            Some(_v) -> _v
        |   None     -> 0n
    ];

    if ledger_balance < amount then failwith(error_INSUFFICIENT_BALANCE) else skip;

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Private Lambdas Begin
// ------------------------------------------------------------------------------

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
// Private Lambdas End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// FA2 Helper Functions Begin
// ------------------------------------------------------------------------------

function verifyIsOwner(const owner : ownerType) : unit is
    if Tezos.get_sender() =/= owner then failwith("FA2_NOT_OWNER")
    else unit



function verifySenderIsOwnerOrOperator(const owner : ownerType; const token_id : tokenIdType; const operators : operatorsType) : unit is
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
function addOperator(const operatorParameter : operatorParameterType; const operators : operatorsType; const s : cmtaTokenStorageType) : operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const token_Id  : tokenIdType   = operatorParameter.token_id;

    verifyTokenIsDefined(token_id, s);

    verifyIsOwner(owner);

    const operatorKey : (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.update(operatorKey, Some (unit), operators))



// removeOperator helper function - used in update_operators entrypoint
function removeOperator(const operatorParameter : operatorParameterType; const operators : operatorsType; const s : cmtaTokenStorageType) : operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    verifyTokenIsDefined(token_id, s);
    
    verifyIsOwner(owner);

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

(* view_total_supply
    - Given a token id allows the consumer to view the current total supply.
*)
[@view] function view_total_supply(const token_id : nat; var s : cmtaTokenStorageType) : nat is
    s.total_supply[token_id]



(* view_balance_of
    - Given a ledger key (consisting of token_id = sp.TNat, owner = sp.TAddress) allows the 
      consumer to view the current balance.
*)
[@view] function view_balance_of(const ledger_key : ledgerKeyType; var s : cmtaTokenStorageType) : nat is
    s.ledger[ledger_key]



(* view_current_snapshot
    - Given a token id allows the consumer to view the current snapshot timestamp. Can be null.
*)
[@view] function view_current_snapshot(const token_id : nat; var s : cmtaTokenStorageType) : option(timestamp) is
    case Big_map.find_opt(token_id, s.ledger) of [
            Some (_v) -> _v.current_snapshot
        |   None      -> (None : option(timestamp))
    ]



(* view_next_snapshot
    - Given a token id allows the consumer to view the next snapshot timestamp. Can be null.
*)
[@view] function view_next_snapshot(const token_id : nat; var s : cmtaTokenStorageType) : option(timestamp) is
    case Big_map.find_opt(token_id, s.ledger) of [
            Some (_v) -> _v.next_snapshot
        |   None      -> (None : option(timestamp))
    ]



(* view_snapshot_total_supply
    - Given the snapshot lookup key (consisting of token_id = sp.TNat, snapshot_timestamp = sp.TTimestamp) allows 
      the consumer to retrieve the total supply in nat of a given snapshot.
*)
[@view] function view_snapshot_total_supply(const snapshot_lookup_key : snapshotLookupKeyType; var s : cmtaTokenStorageType) : nat is
block {

    var snapshot_total_supply : nat := 0n;
    case s.snapshot_total_supply[snapshot_lookup_key] of [
            Some (_total_supply) -> snapshot_total_supply := _total_supply
        |   None -> block {

                var keep_loop : bool := True;
                var current_snapshot_lookup_key : snapshotLookupKeyType := snapshot_lookup_key;

                while keep_look = True block {
                    case s.snapshot_lookup[current_snapshot_lookup_key] of [
                            Some (_timestamp) -> {

                                current_snapshot_lookup_key := record [
                                    token_id            = current_snapshot_lookup_key.token_id;
                                    snapshot_timestamp  = _timestamp
                                ];

                                case s.snapshot_total_supply[current_snapshot_lookup_key] of [
                                        Some (_v) -> keep_loop := False
                                    |   None      -> skip
                                ];

                            }
                        |   None -> keep_loop := False
                    ]
                }

                case s.snapshot_total_supply[current_snapshot_lookup_key] of [
                        Some (_v) -> snapshot_total_supply := _v
                    |   None      -> skip
                ];

            }
    ];

} with snapshot_total_supply



(* view_snapshot_balance_of
    - Given the snapshot ledger key (consisting of token_id = sp.TNat, owner = sp.TAddress, snapshot_timestamp = sp.TTimestamp) allows 
      the consumer to retrieve the balance in nat of a given snapshot.
*)
[@view] function view_snapshot_balance_of(const snapshot_ledger_key : snapshotLedgerKeyType; var s : cmtaTokenStorageType) : nat is
block {

    var snapshot_balance_of : nat := 0n;
    case s.snapshot_ledger[snapshot_ledger_key] of [
            Some (_balance) -> snapshot_balance_of := _balance
        |   None -> block {

                var keep_loop : bool := True;
                var current_snapshot_lookup_key : snapshotLookupKeyType := record [
                    token_id            = snapshot_ledger_key.token_id;
                    snapshot_timestamp  = snapshot_ledger_key.snapshot_timestamp;
                ];
                var current_snapshot_ledger_key : snapshotLedgerKeyType := record [
                    token_id            = snapshot_ledger_key.token_id;
                    owner               = snapshot_ledger_key.owner;
                    snapshot_timestamp  = current_snapshot_lookup_key.snapshot_timestamp;
                ]

                while keep_look = True block {
                    case s.snapshot_lookup[current_snapshot_lookup_key] of [
                            Some (_timestamp) -> {

                                current_snapshot_lookup_key := record [
                                    token_id            = snapshot_ledger_key.token_id;
                                    snapshot_timestamp  = _timestamp
                                ];

                                current_snapshot_ledger_key := record [
                                    token_id            = snapshot_ledger_key.token_id;
                                    owner               = snapshot_ledger_key.owner;
                                    snapshot_timestamp  = current_snapshot_lookup_key.snapshot_timestamp;
                                ]

                                case s.snapshot_ledger[current_snapshot_ledger_key] of [
                                        Some (_v) -> keep_loop := False
                                    |   None      -> skip
                                ];

                            }
                        |   None -> keep_loop := False
                    ]
                }

                case s.snapshot_ledger[current_snapshot_ledger_key] of [
                        Some (_v) -> snapshot_balance_of := _v
                    |   None      -> skip
                ];

            }
    ];

} with snapshot_balance_of



(* get: operator *)
// [@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const s : cmtaTokenStorageType) : option(unit) is
//     Big_map.find_opt(operator, s.operators)


// (* check if operator *)
// [@view] function is_operator(const operator : (ownerType * operatorType * nat); const s : cmtaTokenStorageType) : bool is
//     Big_map.mem(operator, s.operators)


// (* get: metadata *)
// [@view] function token_metadata(const tokenId : nat; const s : cmtaTokenStorageType) : tokenMetadataInfoType is
//     case Big_map.find_opt(tokenId, s.token_metadata) of [
//             Some (_metadata)  -> _metadata
//         |   None -> record[
//                 token_id    = tokenId;
//                 token_info  = map[]
//             ]
//     ]

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

(*  set_token_metadata entrypoint 
    - The definition of a new token requires its metadata to be set. Only the administrators of a certain token 
      can edit existing. 
    - If no token metadata is set for a given ID the sender will become admin of that token automatically if that sender 
      was super administrator (token 0 admin)
*)
function set_token_metadata(const token_metadata_list : list(tokenMetadataType); var s : cmtaTokenStorageType) : return is
block {

    for token_metadata in list token_metadata_list block {

        const administrator_ledger_key : ledgerKeyType = record [
            owner       = Tezos.get_sender();
            token_id    = token_metadata.token_id;
        ];

        case s.token_metadata[token_metadata.token_id] of [
                Some(_v) -> {
                    // verify sender is admin
                    verifySenderIsAdmin(administrator_ledger_key, s);
                }
            |   None -> {

                    const super_administrator_ledger_key : ledgerKeyType = record [
                        owner       = Tezos.get_sender();
                        token_id    = 0n;
                    ];

                    // verify sender is admin
                    verifySenderIsAdmin(super_administrator_ledger_key, s);

                    s.administrators[administrator_ledger_key] := IS_ADMIN;
                }
        ];

        s.token_metadata[token_metadata.token_id] := token_metadata;

    }

} with (noOperations, s)



(*  propose_administrator entrypoint 
    - This kicks off the adding of a new administrator for a specific token. First you propose and then the proposed admin 
      can set him/herself with the set_administrator endpoint
*)
function propose_administrator(const token_id : nat; const proposed_administrator : address; var s : cmtaTokenStorageType) : return is
block {

    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = token_id;
    ];    

    const proposed_administrator_ledger_key : ledgerKeyType = record [
        owner       = proposed_administrator;
        token_id    = token_id;
    ];    

    // verify sender is admin
    verifySenderIsAdmin(administrator_ledger_key, s);

    s.administrators[proposed_administrator_ledger_key] := IS_PROPOSED_ADMIN;

} with (noOperations, s)



(*  set_administrator entrypoint 
    - Only a proposed admin can call this entrypoint. If the sender is correct the new admin is set
*)
function set_administrator(const token_id : nat; var s : cmtaTokenStorageType) : return is
block {
    
    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = token_id;
    ];    

    // verify sender is proposed admin
    verifySenderIsProposedAdmin(administrator_ledger_key, s);

    s.administrators[administrator_ledger_key] := IS_ADMIN;
  
} with (noOperations, s)



(*  remove_administrator entrypoint 
    - This removes a administrator entry entirely from the map
*)
function remove_administrator(const token_id : nat; const administrator_to_remove : address; var s : cmtaTokenStorageType) : return is
block {
    
    const administrator_ledger_key : ledgerKeyType = record [
        owner       = Tezos.get_sender();
        token_id    = token_id;
    ];    

    const administrator_to_remove_ledger_key : ledgerKeyType = record [
        owner       = administrator_to_remove;
        token_id    = token_id;
    ];    

    // verify sender is admin
    verifySenderIsAdmin(administrator_ledger_key, s);

    remove administrator_to_remove_key from map s.administrators;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Owner Entrypoints Begin
// ------------------------------------------------------------------------------

(* initialise_token entrypoint
    - Initialise the token with the required additional token context, can only be called once per token and 
      only one of its admin can call this
 *)
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



(* mint entrypoint 
   - Allows to mint new tokens to the defined recipient address, only a token administrator can do this
*)
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



(* burn entrypoint 
    - Allows to burn tokens on the defined recipient address, only a token administrator can do this
*)
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
function transfer(const transfers : fa2TransferType; const s : cmtaTokenStorageType) : return is
block{

    function makeTransfer(const account : return; const transfer : transferType) : return is
        block {

            const owner : ownerType  = transfer.from_;
            const txs : list(txType) = transfer.txs;
            
            function transferTokens(const accumulator : cmtaTokenStorageType; const tx : txType) : cmtaTokenStorageType is
            block {

                const token_id      : tokenIdType       = tx.token_id;
                const token_amount  : tokenBalanceType  = tx.amount;
                const receiver      : ownerType         = tx.to_;

                const from_user : ledgerKeyType = record [
                    owner       = owner;
                    token_id    = token_id;
                ];

                const to_user : ledgerKeyType = record [
                    owner       = receiver;
                    token_id    = token_id;
                ];

                const token_context : tokenContextType = case accumulator.token_context[token_id] of [
                        Some(_v) -> _v
                    |   None     -> failwith(error_TOKEN_CONTEXT_NOT_FOUND)
                ];

                // verify if transfer is valid based on rule contract
                case token_context.validate_transfer_rule_contract of [
                        Some(_rule_contract) -> {
                            
                            const validation_transfer : validationTransferType = record [
                                from_       = owner;
                                to_         = receiver;
                                token_id    = token_id;
                                amount      = token_amount;
                            ];

                            const is_transfer_valid_view : option (bool) = Tezos.call_view ("view_is_transfer_valid", validation_transfer, _rule_contract);
                            const is_transfer_valid : bool = case is_transfer_valid_view of [
                                    Some (_bool) -> if _bool = True then skip else failwith(error_CANNOT_TRANSFER)
                                |   None         -> failwith (error_VIEW_IS_TRANSFER_VALID_NOT_FOUND)
                            ];
                        }
                    |   None     -> failwith()
                ];

                verifySenderIsOwnerOrOperator(owner, token_id, account.1.operators);

                verifyTokenIsDefined(token_id, accumulator);

                verifyTokenContextIsNotPaused(token_context);

                if token_amount > 0n then block {
                    
                    verifySufficientBalance(from_user, token_amount, accumulator);

                    const bootstrap_snapshot : (tokenContextType * cmtaTokenStorageType) = bootstrap_snapshot((token_context, token_id), accumulator);
                    token_context  := bootstrap_snapshot.0;
                    accumulator    := bootstrap_snapshot.1;

                    accumulator    := set_snapshot_ledger((token_context, token_id, receiver), s);
                    accumulator    := set_snapshot_ledger((token_context, token_id, owner), s);

                    if token_amount >= 0n then block {
                        
                        accumulator.ledger[from_user] := case accumulator.ledger[from_user] of [
                            Some (_balance) -> abs(_balance - tx.amount)
                            None            -> failwith(error_USER_NOT_FOUND)
                        ]; 

                        accumulator.ledger[to_user] := case accumulator.ledger[to_user] of [
                            Some (_balance) -> abs(_balance + tx.amount)
                            None            -> tx.amount
                        ]; 
                    }

                    const from_user_balance : nat = case accumulator.ledger[from_user] of [
                        Some (_balance) -> _balance
                        None            -> 0n
                    ]; 

                    if from_user_balance = 0n then remove from_user from map accumulator.ledger else skip;

                } else skip;

            } with accumulator with record[ledger = updatedLedger];

            const updatedOperations : list(operation) = (nil: list(operation));
            const updatedStorage : cmtaTokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transfers, ((nil: list(operation)), s))

// ------------------------------------------------------------------------------
// Open Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Entrypoints Begin
// ------------------------------------------------------------------------------

(* balance_of entrypoint *)
function balance_of(const balance_of_requests : balanceOfType; const s : cmtaTokenStorageType) : return is
block{

    function retrieveBalance(const request : balanceOfRequestType) : balanceOfResponse is
        block{

            const ledger_key : ledgerKeyType = record [
                token_id    = request.token_id;
                owner       = request.owner;
            ]

            verifyTokenIsDefined(request.token_id, s);

            const token_balance : tokenBalanceType = case Big_map.find_opt(request.owner, s.ledger) of [
                    Some (b) -> b
                |   None     -> 0n
            ];

            const response : balanceOfResponse = record[
                request = request;
                balance = token_balance
            ];

        } with (response);

      const requests   : list(balanceOfRequestType) = balance_of_requests.requests;
      const callback   : contract(list(balanceOfResponse)) = balance_of_requests.callback;
      const responses  : list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation  : operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation],s)



(* update_operators entrypoint
    - As per FA2 standard, allows a token owner to set an operator who will be allowed to perform transfers on her/his behalf
 *)
function update_operators(const updateOperatorsParams : updateOperatorsType; const s : cmtaTokenStorageType) : return is
block{

    var updatedOperators : operatorsType := List.fold(
        function(const operators : operatorsType; const updateOperator : updateOperatorVariantType) : operatorsType is
            case updateOperator of [
                    Add_operator (param)    -> addOperator(param, operators, s)
                |   Remove_operator (param) -> removeOperator(param, operators, s)
            ]
        ,
        updateOperatorsParams,
        s.operators
    )

} with (noOperations, s with record[operators = updatedOperators])

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
            Set_token_metadata (params)         -> set_token_metadata(params, s)
        |   Propose_administrator (params)      -> propose_administrator(params, s)
        |   Set_administrator (params)          -> set_administrator(params, s)
        |   Remove_administrator (params)       -> remove_administrator(params, s)
        
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

            // Base FA2 Entrypoints
        |   Update_operators (params)           -> update_operators(params, s)
        |   Balance_of (params)                 -> balance_of(params, s)
    ]

)
