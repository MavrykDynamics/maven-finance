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
    admin                 : address;
    contract_addresses    : contract_addresses_type;   // map of contract addresses
    whitelist_contracts   : whitelist_contracts_type;  // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
    metadata              : metadata;
    token_metadata        : token_metadata;
    total_supply          : token_balance;
    ledger                : ledger;
    operators             : operators
  ]

(* define return for readability *)
type return is list (operation) * storage
(* define noop for readability *)
const no_operations : list (operation) = nil;

////
// INPUTS
////
(* Transfer entrypoint inputs *)
type transfer_destination is michelson_pair(address, "to_", michelson_pair(token_id, "token_id", token_balance, "amount"), "")
type transfer is michelson_pair(address, "from_", list(transfer_destination), "txs")
type transfer_parameters is list(transfer)
(* Balance_of entrypoint inputs *)
type balance_of_request is michelson_pair(owner, "owner", token_id, "token_id")
type balance_of_response is michelson_pair(balance_of_request, "request", token_balance, "balance")
type callback_params is michelson_pair(balance_of_request, "request", token_balance, "balance")
type balance_of_parameters is michelson_pair(list(balance_of_request), "requests", contract(list(callback_params)), "callback")
(* Update_operators entrypoint inputs *)
type operator_parameter is michelson_pair(owner, "owner", michelson_pair(operator, "operator", token_id, "token_id"), "")
type update_operator is 
  Add_operator of operator_parameter
| Remove_operator of operator_parameter
type update_operators_parameters is list(update_operator)
(* AssertMetadata entrypoint inputs *)
type assert_metadata_parameters is michelson_pair(string, "key", bytes, "hash")
(* Total_supply entrypoint inputs *)
type total_supply_parameters is contract(token_balance)
(* Mint entrypoint inputs *)
type mint_parameters is (owner * token_balance)
(* Burn entrypoint inputs *)
type burn_parameters is (owner * token_balance)
(* On_stake_change entrypoint inputs *)
type stake_type is 
  Stake of unit
| Unstake of unit
type on_stake_change_parameters is (owner * token_balance * stake_type)
(* Update_whitelist_contract entrypoint inputs *)
type update_whitelist_contracts_parameters is (string * address)
(* Update_contract_addresses entrypoint inputs *)
type update_contract_addresses_parameters is (string * address)
(* Update_token_total_supply_for_doorman entrypoint inputs *)
type update_mvk_doorman_total_supply_parameters is token_balance

////
// ENTRYPOINTS
////
type action is
  Transfer of transfer_parameters
| Balance_of of balance_of_parameters
| Update_operators of update_operators_parameters
| Assert_metadata of assert_metadata_parameters
| Total_supply of total_supply_parameters
| Mint of mint_parameters
| Burn of burn_parameters
| On_stake_change of on_stake_change_parameters
| Update_whitelist_contracts of update_whitelist_contracts_parameters
| Update_contract_addresses of update_contract_addresses_parameters
| Update_mvk_doorman_total_supply of update_mvk_doorman_total_supply_parameters

////
// FUNCTIONS
////
(* Helper functions *)
function get_balance(const owner : owner; const store : storage) : token_balance is
  case Big_map.find_opt(owner, store.ledger) of
    Some (v) -> v
  | None -> 0n
  end

(* Helper function to validate *)
function validate_token_id(const token_id: token_id): unit is
  if token_id =/= 0n then failwith("FA2_TOKEN_UNDEFINED") // TODO: Check if that's the right syntax
  else unit

function validate_spender_balance(const spender_balance: token_balance; const token_amount: token_balance): unit is
  if spender_balance < token_amount then failwith("FA2_INSUFFICIENT_BALANCE") // TODO: See if the balance is decrease correctly if the same user send tokens to multiple destinations at once 
  else unit

function validate_ownership(const owner: owner): unit is
  if Tezos.sender =/= owner then failwith("FA2_NOT_OWNER")
  else unit

function validate_operator(const operator: operator; const owner: owner; const store: storage): unit is
  if owner =/= operator and not Big_map.mem((owner, operator), store.operators) then failwith ("FA2_NOT_OPERATOR")
  else unit

function validate_sender_is_doorman_contract(const store: storage): unit is
  case Map.find_opt("doorman", store.contract_addresses) of
    Some (v) -> if v =/= Tezos.sender then failwith("ACCESS_NOT_ALLOWED") else unit
  | None -> failwith("DOORMAN_CONTRACT_NOT_FOUND")
  end

function validate_sender_is_admin(const store: storage): unit is
  if Tezos.sender =/= store.admin then failwith("ACCESS_NOT_ALLOWED")
  else unit

function validate_address_in_whitelist_contracts(const contract_address: address; const store : storage): unit is
  case Map.find_opt(contract_address, store.ledger) of
    Some (_v) -> unit
  | None -> failwith("ACCESS_NOT_ALLOWED")
  end

function validate_no_amount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("NO_AMOUNT_ALLOWED")
  else unit

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
        const owner: owner = transfer_param.0;
        const txs: list(transfer_destination) = transfer_param.1;

        // Validate operator
        validate_operator(sender_address, owner, account.1);
        
        function transfer_tokens(const accumulator: storage; const destination: transfer_destination): storage is
          block {
            const token_id: token_id = destination.1.0;
            const token_amount: token_balance = destination.1.1;
            const receiver: owner = destination.0;
            const owner_balance: token_balance = get_balance(owner, accumulator);
            const receiver_balance: token_balance = get_balance(receiver, accumulator);

            // Validate token type
            validate_token_id(token_id);

            // Validate that sender has enough token
            validate_spender_balance(owner_balance,token_amount);

            // Update users' balances
            const owner_new_balance: token_balance = abs(owner_balance - token_amount);
            const receiver_new_balance: token_balance = receiver_balance + token_amount;

            var updated_ledger: ledger := Big_map.update(receiver, Some (receiver_new_balance), accumulator.ledger);
            updated_ledger := Big_map.update(owner, Some (owner_new_balance), updated_ledger);
          } with accumulator with record[ledger=updated_ledger];

          const updated_operations: list(operation) = (nil: list(operation));
          const updated_storage: storage = List.fold(transfer_tokens, txs, account.1);
      } with (merge_operations(updated_operations,account.0), updated_storage)
  } with List.fold(make_transfer, transfer_parameters, ((nil: list(operation)), store))

(* Balance_of Entrypoint *)
function balance_of(const balance_of_parameters: balance_of_parameters; const store: storage) : return is
  block{
    function retrieve_balance(const request: balance_of_request): balance_of_response is
      block{
        const request_owner: owner = request.0;
        const token_balance: token_balance = 
          case Big_map.find_opt(request_owner, store.ledger) of
            Some (b) -> b
          | None -> 0n
          end;
        const response: balance_of_response = (request, token_balance);
      } with (response);
      const requests: list(balance_of_request) = balance_of_parameters.0;
      const callback: contract(list(callback_params)) = balance_of_parameters.1;
      const responses: list(balance_of_response) = List.map(retrieve_balance, requests);
      const operation: operation = Tezos.transaction(responses, 0tez, callback);
  } with (list[operation],store)

(* Total_supply Entrypoint *)
function total_supply(const total_supply_parameters: total_supply_parameters; const store: storage) : return is
  (list[Tezos.transaction(store.total_supply, 0tez, total_supply_parameters)], store)

(* Update_operators Entrypoint *)
function add_operator(const operator_parameter: operator_parameter; const operators: operators): operators is
  block{
    const owner: owner = operator_parameter.0;
    const operator: operator = operator_parameter.1.0;
    const token_id: token_id = operator_parameter.1.1;

    validate_token_id(token_id);
    validate_ownership(owner);

    const operator_key: (owner * operator) = (owner, operator)
  } with(Big_map.update(operator_key, Some (unit), operators))

function remove_operator(const operator_parameter: operator_parameter; const operators: operators): operators is
  block{
    const owner: owner = operator_parameter.0;
    const operator: operator = operator_parameter.1.0;
    const token_id: token_id = operator_parameter.1.1;

    validate_token_id(token_id);
    validate_ownership(owner);

    const operator_key: (owner * operator) = (owner, operator)
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

(* AssertMetadata Entrypoint *)
function assert_metadata(const assert_metadata_parameters: assert_metadata_parameters; const store: storage): return is
  block{
    const key: string = assert_metadata_parameters.0;
    const hash: bytes = assert_metadata_parameters.1;
    case Big_map.find_opt(key, store.metadata) of
      Some (v) -> if v =/= hash then failwith("WRONG_HASH") else skip
    | None -> failwith("NOT_FOUND")
    end
  } with (no_operations, store)

(* Mint Entrypoint *)
function mint(const mint_parameters: mint_parameters; const store : storage) : return is
  block {
    const sender_address: owner = mint_parameters.0;
    const minted_tokens: token_balance = mint_parameters.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    validate_address_in_whitelist_contracts(Tezos.sender, store);

    // Update sender's balance
    const sender_new_balance: token_balance = get_balance(sender_address, store) + minted_tokens;

    // Update storage
    const updated_ledger: ledger = Big_map.update(sender_address, Some(sender_new_balance), store.ledger);
  } with (no_operations, store with record[ledger=updated_ledger])

(* Burn Entrypoint *)
function burn (const burn_parameters: burn_parameters; const store: storage) : return is
  block {
    const target_address: owner = burn_parameters.0;
    const burned_tokens: token_balance = burn_parameters.1;
    var target_balance: token_balance := get_balance(target_address, store);

    (* Check this call is comming from the doorman contract *)
    validate_sender_is_doorman_contract(store);

    (* Balance check *)
    validate_spender_balance(target_balance, burned_tokens);

    (* Update sender balance *)
    target_balance := abs(target_balance - burned_tokens);
    const new_total_supply: token_balance = abs(store.total_supply - burned_tokens);

    (* Update storage *)
    const updated_ledger: ledger = Big_map.update(target_address, Some(target_balance), store.ledger);
  } with (no_operations, store with record[ledger=updated_ledger;total_supply=new_total_supply])

(* On_stake_change Entrypoint *)
function on_stake_change(const on_stake_change_parameters: on_stake_change_parameters; const store: storage): return is
  block{
    // check sender is from doorman contract or vesting contract
    validate_address_in_whitelist_contracts(Tezos.sender, store);
    
    const owner: owner = on_stake_change_parameters.0;
    var owner_balance: token_balance := get_balance(owner, store);
    const value: token_balance = on_stake_change_parameters.1;
    const stake_type: stake_type = on_stake_change_parameters.2;
    // TODO: update doormanledger account in mvk ledger? total supply remains unchanged in any case

    case stake_type of
      Stake (_v) -> block{
        // stake -> decrease user balance in mvk ledger 
        (* Balance check *)
        validate_spender_balance(owner_balance, value);
        (* Update sender balance *)
        owner_balance := abs(owner_balance - value);
      }
      // unstake -> increase user balance in mvk ledger
      // claim   -> increase user balance in mvk ledger (from vesting)
    | Unstake (_v) -> owner_balance := owner_balance + value
    end;

    (* Update ledger *)
    const updated_ledger = Big_map.update(owner, Some(owner_balance), store.ledger);
  } with (no_operations, store with record[ledger=updated_ledger])

(* Update_whitelist_contracts Entrypoint *)
function update_whitelist_contracts(const update_whitelist_contracts_parameters: update_whitelist_contracts_parameters; const store: storage) : return is 
  block{
    validate_no_amount(Unit);   // entrypoint should not receive any tez amount
    validate_sender_is_admin(store); // check that sender is admin

    const contract_name: string = update_whitelist_contracts_parameters.0;
    const contract_address: address = update_whitelist_contracts_parameters.1;
    
    var exiting_address: option(address) := Some (contract_address);
    for _key -> value in map store.whitelist_contracts block{
      if contract_address = value then exiting_address := (None : option(address)) else skip;
    };
    const updated_whitelisted_contracts: whitelist_contracts_type = 
      Map.update(
        contract_name, 
        exiting_address,
        store.whitelist_contracts
      );
  } with (no_operations, store with record[whitelist_contracts=updated_whitelisted_contracts]) 

(* Update_contract_addresses Entrypoint *)
function update_contract_addresses(const update_contract_addresses_parameters: update_contract_addresses_parameters; const store: storage) : return is 
  block{
    validate_no_amount(Unit);   // entrypoint should not receive any tez amount
    validate_sender_is_admin(store); // check that sender is admin

    const contract_name: string = update_contract_addresses_parameters.0;
    const contract_address: address = update_contract_addresses_parameters.1;
    
    var exiting_address: option(address) := Some (contract_address);
    for _key -> value in map store.contract_addresses block{
      if contract_address = value then exiting_address := (None : option(address)) else skip;
    };
    const updated_contract_addresses: contract_addresses_type = 
      Map.update(
        contract_name, 
        exiting_address,
        store.contract_addresses
      );
  } with (no_operations, store with record[contract_addresses=updated_contract_addresses])

function update_mvk_doorman_total_supply(const update_mvk_doorman_total_supply_parameters: update_mvk_doorman_total_supply_parameters; const store: storage): return is
  block {
    (* Check this call is comming from the doorman contract *)
    validate_sender_is_doorman_contract(store);

    const unstake_amount: token_balance = update_mvk_doorman_total_supply_parameters;
    const doorman_address: address = Tezos.sender;

    const set_temp_mvk_total_supply_entrypoint: contract(nat) = 
      case (Tezos.get_entrypoint_opt("%setTempMvkTotalSupply", doorman_address) : option(contract(nat))) of
        Some (contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat))
      end;
    const set_temp_mvk_total_supply_entrypoint_operation: operation = Tezos.transaction(store.total_supply, 0tez, set_temp_mvk_total_supply_entrypoint);

    const unstake_complete_entrypoint: contract(nat) =
      case (Tezos.get_entrypoint_opt("%unstakeComplete", doorman_address) : option(contract(nat))) of
        Some(contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat))
      end;
    const unstake_complete_operation: operation = Tezos.transaction(unstake_amount, 0tez, unstake_complete_entrypoint);

    const operations: list(operation) = list [set_temp_mvk_total_supply_entrypoint_operation; unstake_complete_operation];

  } with (operations, store)

(* Main entrypoint *)
function main (const action : action; const store : storage) : return is
  case action of
      Transfer (params) -> transfer(params, store)
    | Balance_of (params) -> balance_of(params, store)
    | Update_operators (params) -> update_operators(params, store)
    | Assert_metadata (params) -> assert_metadata(params, store)
    | Total_supply (params) -> total_supply(params, store)
    | Mint (params) -> mint(params, store)
    | Burn (params) -> burn(params, store)
    | On_stake_change (params) -> on_stake_change(params, store)
    | Update_whitelist_contracts (params) -> update_whitelist_contracts(params, store)
    | Update_contract_addresses (params) -> update_contract_addresses(params, store)
    | Update_mvk_doorman_total_supply (params) -> update_mvk_doorman_total_supply(params, store)
  end;