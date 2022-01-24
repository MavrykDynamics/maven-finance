
#include "../partials/fa12/fa12_types.ligo"
#include "../partials/fa2/fa2_types.ligo"

// type action_type is
//     | Transfer                of transfers_type
//     | Update_operators        of fa2_update_operators_type
//     | Balance_of              of fa2_balance_of_type

type configType is record [
    max_proposal_size   : nat;
    min_xtz_amount      : nat;
    max_xtz_amount      : nat;
]

type whitelistContractsType is set (address)
type storage is record [
    admin                 : address;
    config                : configType;

    whitelistContracts    : whitelistContractsType;   // whitelist of contracts that can access treasury contract
    glassBroken           : bool;
]

type treasuryAction is 
    | UpdateWhitelistContracts of (address)
    | Transfer of transfers_type
    | Update_operators        of fa2_update_operators_type
    | Balance_of              of fa2_balance_of_type

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");

function checkInWhitelistContracts(const contractAddress : address; var s : storage) : bool is 
block {
  var inWhitelistContractsMap : bool := False;
  for _key -> value in map s.whitelistContracts block {
    if contractAddress = value then inWhitelistContractsMap := True
      else skip;
  }  
} with inWhitelistContractsMap

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

function checkGlassIsBroken(var s : storage) : unit is
    if s.glassBroken = True then unit
        else failwith("Error. Glass has not been broken");
// admin helper functions end ---------------------------------------------------------


// function get_fa12_token_transfer_entrypoint(
//   const token           : address)
//                         : contract(fa12_transfer_type) is
//   case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa12_transfer_type))) of
//   | Some(contr) -> contr
//   | None        -> (failwith("Error. FA12 Token transfer entrypoint is not found.") : contract(fa12_transfer_type))
//   end


// treasury -> buy back MVK from the open market (DEX / CEX) 
// council to buy back the MVK
// council should not have access to transfer entrypoint / governance dao to have access to transfer entrypoint


function get_fa2_token_transfer_entrypoint(const token : address) : contract(fa2_transfer_type) is
  case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa2_transfer_type))) of
  | Some(contr) -> contr
  | None        -> (failwith("Error. FA2 Token transfer entrypoint is not found.") : contract(fa2_transfer_type))
  end

[@inline] function wrap_fa12_transfer_trx(const from_ : address; const to_ : address; const amt : nat) : fa12_transfer_type is FA12_transfer(from_, (to_, amt))

[@inline] function wrap_fa2_transfer_trx(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const id              : fa2_token_id_type)
                        : fa2_transfer_type is
  FA2_transfer(
    list [
      record [
        from_ = from_;
        txs   = list [
          record [
            to_      = to_;
            token_id = id;
            amount   = amt;
          ]
        ];
      ]
    ]
  )

function transfer_tez(
  const to_             : contract(unit);
  const amt             : nat)
                        : operation is
  Tezos.transaction(unit, amt * 1mutez, to_)

function transfer_fa12(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : address)
                        : operation is
  Tezos.transaction(
    wrap_fa12_transfer_trx(from_, to_, amt),
    0mutez,
    get_fa12_token_transfer_entrypoint(token)
  )

function transfer_fa2(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : address;
  const id              : fa2_token_id_type)
                        : operation is
  Tezos.transaction(
    wrap_fa2_transfer_trx(from_, to_, amt, id),
    0mutez,
    get_fa2_token_transfer_entrypoint(token)
  )

// function check_tez_or_token_and_transfer(
//   const inv_liq_params : invest_liquidity_t;
//   const tokens_required : nat;
//   const token_type      : token_t;
//   const tez_store_opt   : option(address))
//                         : operation is
//   if token_type = Tez
//   then get_invest_tez_op(inv_liq_params.shares_receiver, get_tez_store_or_fail(tez_store_opt))
//   else transfer_token(Tezos.sender, Tezos.self_address, tokens_required, token_type)


function transfer_token(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : token_t)
                        : operation is
  case token of
  | Tez         -> transfer_tez((get_contract(to_) : contract(unit)), amt)
  | Fa12(token) -> transfer_fa12(from_, to_, amt, token)
  | Fa2(token)  -> transfer_fa2(from_, to_, amt, token.token, token.id)
  end


// toggle adding and removal of whitelist contract addresses
function updateWhitelistContracts(const contractAddress : address; var s : storage) : return is 
block{

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    const checkIfWhitelistContractExists : bool = s.whitelistContracts contains contractAddress; 

    if (checkIfWhitelistContractExists) then block{
        // whitelist contract exists - remove whitelist contract from set 
        s.whitelistContracts := Set.remove(contractAddress, s.whitelistContracts);
    } else block {
        // whitelist contract does not exist - add whitelist contract to set 
        s.whitelistContracts := Set.add(contractAddress, s.whitelistContracts);
    }

} with (noOperations, s) 


function transfer(const action : action_t ; var s : storage) : return is 
block {
    
    // Steps Overview:
    // 1. Receive and unpack proposal metadata in lambda format from Governance DAO 
    // 2. Loop over transfers in the proposal metadata
    //    - case match xtz, fa12, and fa2 types

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    case action of
    | Transfer(params) -> {
      result.1 := transfer_sender_check(params, action, s);
      result := List.fold(iterate_transfer, params, result);
    }
    | _ -> skip
    end
    
} with (operations, s)

// function transfer(
//   const action          : action_t;
//   var s                 : storage_t)
//                         : return_t is
//   block {
//     var result : return_t := ((nil : list(operation)), s);

//     case action of
//     | Transfer(params) -> {
//       result.1 := transfer_sender_check(params, action, s);
//       result := List.fold(iterate_transfer, params, result);
//     }
//     | _ -> skip
//     end
//   } with result


function main (const action : treasuryAction; const s : storage) : return is 
    case action of
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | Transfer(parameters) -> transfer(parameters, s)
    end