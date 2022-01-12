//
// Use Michelson pair instead for typing
//
type token_id is nat;
type token_metadata_info is record [
  token_id          : token_id;
  token_info        : map(string, bytes);
]
type token_balance is nat;
type ledger is big_map(address, token_balance);
type token_metadata is big_map(token_id, token_metadata_info);
type metadata is big_map (string, bytes);

type whitelist_contracts_type is map (string, address)
type contract_addresses_type is map (string, address)

type operator is address
type owner is address
type operators is big_map((owner * operator), unit)

type storage is record [
    admin           : address;
    
    contract_addresses   : contract_addresses_type;   // map of contract addresses
    whitelist_contracts  : whitelist_contracts_type;  // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract

    metadata        : metadata;
    token_metadata  : token_metadata;
    token_supply     : token_balance;
    ledger          : ledger;
    operators : operators

    // doormanAddress  : address;   
  ]

type transfer_destination is record[
  amount: token_balance;
  token_id: token_id;
  to_: address;
]
type transfer is record[
  from_: address;
  txs: list(transfer_destination);
]

type balance_of_request is record[
  owner: address;
  token_id: token_id;
]
type balance_of_response is record[
  request: balance_of_request;
  balance: token_balance;
]
type callback_params is record[
  balance: token_balance;
  request: balance_of_request;
]

type operator_parameter is record[
  owner: address;
  operator: address;
]
type update_operator is 
  Add_operator of operator_parameter
| Remove_operator of operator_parameter

(* define return for readability *)
type return is list (operation) * storage

(* Inputs *)
type transfer_parameters is list(transfer)
type balance_of_parameters is record[
  requests: list(balance_of_request);
  callback: contract(list(callback_params));
]
type update_operators_parameters is list(update_operator)

(* Valid entry points *)
type action is
  Transfer of transfer_parameters
| Balance_of of balance_of_parameters
| Update_operators of update_operators_parameters

(* define noop for readability *)
const no_operations : list (operation) = nil;

(* Transfer Entrypoint *)
function merge_operations(const first: list (operation); const second: list (operation)) : list (operation) is 
  List.fold( 
    function(const operations: list(operation); const operation: operation): list(operation) is operation # operations,
    first,
    second
  )

function transfer(const transfer_parameters: transfer_parameters; const store: storage): return is
  block{
    const sender_address: address = Tezos.sender;
    function make_transfer(const account: return; const transfer_param: transfer) : return is
      block {
        const owner: owner = transfer_param.from_;
        const txs: list(transfer_destination) = transfer_param.txs;

        // Validate operator
        if owner =/= sender_address and not Big_map.mem((owner, sender_address), account.1.operators) then failwith ("FA2_NOT_OPERATOR")
        else skip;
        
        function transfer_tokens(const accumulator: storage; const destination: transfer_destination): storage is
          block {
            // Validate token type
            if destination.token_id =/= 0n then failwith("FA2_TOKEN_UNDEFINED") // TODO: Check if that's the right syntax
            else skip;

            // Validate that sender has enough token
            const owner_balance: token_balance = 
              case Big_map.find_opt(owner, accumulator.ledger) of
                Some (v) -> v
              | None -> 0n
              end;
            if owner_balance < destination.amount then failwith("FA2_INSUFFICIENT_BALANCE") // TODO: See if the balance is decrease correctly if the same user send tokens to multiple destinations at once 
            else skip;

            // Update user's balances
            const owner_new_balance: token_balance = abs(owner_balance - destination.amount);
            const dest_new_balance: token_balance =  
              case Big_map.find_opt(destination.to_, accumulator.ledger) of
                Some (v) -> v + destination.amount
              | None -> destination.amount
              end;

            var updated_ledger: ledger := Big_map.update(destination.to_, Some (dest_new_balance), accumulator.ledger);
            updated_ledger := Big_map.update(owner, Some (owner_new_balance), updated_ledger);
          } with accumulator with record[ledger=updated_ledger];

          const updated_operations: list(operation) = (nil: list(operation));
          const updated_storage: storage = List.fold(transfer_tokens, txs, account.1);
      } with (
        merge_operations(updated_operations,account.0),
        updated_storage
      )
  } with List.fold(make_transfer, transfer_parameters, ((nil: list(operation)), store))

(* Balance_of Entrypoint *)
function balance_of(const balance_of_parameters: balance_of_parameters; const store: storage) : return is
  block{
    function retrieve_balance(const request: balance_of_request): balance_of_response is
      block{
        const token_balance: token_balance = 
          case Big_map.find_opt(request.owner, store.ledger) of
            Some (b) -> b
          | None -> 0n
          end;
        const response: balance_of_response = record[
          request=request;
          balance=token_balance;
        ]
      } with (response);

      const responses: list(balance_of_response) = List.map(retrieve_balance, balance_of_parameters.requests);
      const operation: operation = Tezos.transaction(responses, 0tez, balance_of_parameters.callback);
  } with (list[operation],store)


(* Update_operators Entrypoint *)
function add_operator(const operator_parameter: operator_parameter; const operators: operators): operators is
  block{
    if Tezos.sender =/= operator_parameter.owner then failwith("FA2_NOT_OWNER")
    else skip;

    const operator_key: (owner * operator) = (operator_parameter.owner, operator_parameter.operator)
  } with(Big_map.update(operator_key, Some (unit), operators))

function remove_operator(const operator_parameter: operator_parameter; const operators: operators): operators is
  block{
    if Tezos.sender =/= operator_parameter.owner then failwith("FA2_NOT_OWNER")
    else skip;

    const operator_key: (owner * operator) = (operator_parameter.owner, operator_parameter.operator)
  } with(Big_map.remove(operator_key, operators))

function update_operators(const update_operators_parameters: update_operators_parameters; const store: storage) : return is
  block{
    var updated_operators: operators := store.operators;
    for update_operator in list update_operators_parameters block {
      updated_operators := 
      case update_operator of
        Add_operator (param) -> add_operator(param, updated_operators)
      | Remove_operator (param) -> remove_operator(param, updated_operators)
      end;
    }
  } with(no_operations,store with record[operators=updated_operators])

(* Main entrypoint *)
function main (const action : action; var store : storage) : return is
  block {
    skip
  } with case action of
      Transfer(params) -> transfer(params, store)
    | Balance_of(params) -> balance_of(params, store)
    | Update_operators(params) -> update_operators(params, store)
  end;