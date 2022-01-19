type fa2_token_id_type is nat

type fa2_token_metadata_type is [@layout:comb] record [
  token_id                : fa2_token_id_type;
  token_info              : map(string, bytes);
]

type fa2_transfer_destination_type is [@layout:comb] record [
  to_                     : address;
  token_id                : fa2_token_id_type;
  amount                  : nat;
]

type transfer_type         is [@layout:comb] record [
  from_                   : address;
  txs                     : list(fa2_transfer_destination_type);
]

type transfers_type        is list(transfer_type)

type fa2_transfer_type     is FA2_transfer of transfers_type

type fa2_operator_type         is [@layout:comb] record [
  owner                   : address;
  operator                : address;
  token_id                : fa2_token_id_type;
]

type fa2_update_operator_type  is
| Add_operator            of fa2_operator_type
| Remove_operator         of fa2_operator_type

type fa2_update_operators_type is list(fa2_update_operator_type)

type fa2_balance_request_type  is [@layout:comb] record [
  owner                   : address;
  token_id                : fa2_token_id_type;
]

type fa2_balance_response_type is [@layout:comb] record [
  request                 : fa2_balance_request_type;
  balance                 : nat;
]

type balance_of_type       is [@layout:comb] record [
  requests                : list(fa2_balance_request_type);
  callback                : contract(list(fa2_balance_response_type));
]

type fa2_balance_of_type   is FA2_balance_of of balance_of_type

type fa2_is_tx_operator_type   is [@layout:comb] record [
  owner                   : address;
  approved                : bool;
]

type tez_t              is unit

type fa12_token_t       is address

type fa2_token_t        is [@layout:comb] record [
  token                   : address;
  id                      : nat;
]

type token_t       is
| Tez                     of tez_t          // unit
| Fa12                    of fa12_token_t   // address
| Fa2                     of fa2_token_t    // record [ token : address; id : nat; ]