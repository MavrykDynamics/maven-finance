type trusted is address;
type amt is nat;
type token_id is nat;

type account is
  record [
    balance         : amt;
    allowances      : map (trusted, amt);
  ]

type token_metadata_info is record [
  token_id          : token_id;
  token_info        : map(string, bytes);
]

type storage is
  record [
    metadata        : big_map (string, bytes);
    token_metadata  : big_map(token_id, token_metadata_info);
    totalSupply     : amt;
    ledger          : big_map (address, account);
  ]

(* define return for readability *)
type return is list (operation) * storage

(* define noop for readability *)
const noOperations : list (operation) = nil;



(* get: balance View *)
[@view] function get_balance(const userAndId: address * nat; const store: storage) : nat is
  case Big_map.find_opt(userAndId.0, store.ledger) of [
      Some (_v) -> _v.balance
    | None      -> 0n
  ]



(* total_supply View *)
[@view] function total_supply(const _tokenId: nat; const _store: storage) : nat is
  _store.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _store: storage) : list(nat) is
  list[0n]



(* get: metadata *)
[@view] function token_metadata(const tokenId: nat; const store: storage) : token_metadata_info is
  case Big_map.find_opt(tokenId, store.token_metadata) of [
    Some (_metadata)  -> _metadata
  | None              -> record[
    token_id    = tokenId;
    token_info  = map[]
  ]
  ]

(* Inputs *)
type transferParams is michelson_pair(address, "from", michelson_pair(address, "to", amt, "value"), "")
type approveParams is michelson_pair(trusted, "spender", amt, "value")
type balanceParams is michelson_pair(address, "owner", contract(amt), "")
type allowanceParams is michelson_pair(michelson_pair(address, "owner", trusted, "spender"), "", contract(amt), "")
type totalSupplyParams is (unit * contract(amt))

(* Valid entry points *)
type entryAction is
  | Transfer of transferParams
  | Approve of approveParams
  | GetBalance of balanceParams
  | GetAllowance of allowanceParams
  | GetTotalSupply of totalSupplyParams

(* Helper function to get account *)
function getAccount (const addr : address; const s : storage) : account is
  block {
    var acct : account :=
      record [
        balance    = 0n;
        allowances = (map [] : map (address, amt));
      ];
    case s.ledger[addr] of [
      None -> skip
    | Some(instance) -> acct := instance
    ];
  } with acct

(* Helper function to get allowance for an account *)
function getAllowance (const ownerAccount : account; const spender : address; const _s : storage) : amt is
  case ownerAccount.allowances[spender] of [
    Some (amt) -> amt
  | None -> 0n
  ];

(* Transfer token to another account *)
function transfer (const from_ : address; const to_ : address; const value : amt; var s : storage) : return is
  block {

    (* Retrieve sender account from storage *)
    var senderAccount : account := getAccount(from_, s);

    (* Balance check *)
    if senderAccount.balance < value then
      failwith("NotEnoughBalance")
    else skip;

    (* Check this address can spend the tokens *)
    if from_ =/= Tezos.get_sender() then block {
      const spenderAllowance : amt = getAllowance(senderAccount, Tezos.get_sender(), s);

      if spenderAllowance < value then
        failwith("NotEnoughAllowance")
      else skip;

      (* Decrease any allowances *)
      senderAccount.allowances[Tezos.get_sender()] := abs(spenderAllowance - value);
    } else skip;

    (* Update sender balance *)
    senderAccount.balance := abs(senderAccount.balance - value);

    (* Update storage *)
    s.ledger[from_] := senderAccount;

    (* Create or get destination account *)
    var destAccount : account := getAccount(to_, s);

    (* Update destination balance *)
    destAccount.balance := destAccount.balance + value;

    (* Update storage *)
    s.ledger[to_] := destAccount;

  } with (noOperations, s)

(* Approve an amt to be spent by another address in the name of the sender *)
function approve (const spender : address; const value : amt; var s : storage) : return is
  block {

    (* Create or get sender account *)
    var senderAccount : account := getAccount(Tezos.get_sender(), s);

    (* Get current spender allowance *)
    const spenderAllowance : amt = getAllowance(senderAccount, spender, s);

    (* Prevent a corresponding attack vector *)
    if spenderAllowance > 0n and value > 0n then
      failwith("UnsafeAllowanceChange")
    else skip;

    (* Set spender allowance *)
    senderAccount.allowances[spender] := value;

    (* Update storage *)
    s.ledger[Tezos.get_sender()] := senderAccount;

  } with (noOperations, s)

(* View function that forwards the balance of source to a contract *)
function getBalance (const owner : address; const contr : contract(amt); var s : storage) : return is
  block {
    const ownerAccount : account = getAccount(owner, s);
  } with (list [Tezos.transaction(ownerAccount.balance, 0tz, contr)], s)

(* View function that forwards the allowance amt of spender in the name of tokenOwner to a contract *)
function getAllowance (const owner : address; const spender : address; const contr : contract(amt); var s : storage) : return is
  block {
    const ownerAccount : account = getAccount(owner, s);
    const spenderAllowance : amt = getAllowance(ownerAccount, spender, s);
  } with (list [Tezos.transaction(spenderAllowance, 0tz, contr)], s)

(* View function that forwards the totalSupply to a contract *)
function getTotalSupply (const contr : contract(amt); var s : storage) : return is
  block {
    skip
  } with (list [Tezos.transaction(s.totalSupply, 0tz, contr)], s)

(* Main entrypoint *)
function main (const action : entryAction; var s : storage) : return is
  block {
    skip
  } with case action of [
    | Transfer(params) -> transfer(params.0, params.1.0, params.1.1, s)
    | Approve(params) -> approve(params.0, params.1, s)
    | GetBalance(params) -> getBalance(params.0, params.1, s)
    | GetAllowance(params) -> getAllowance(params.0.0, params.0.1, params.1, s)
    | GetTotalSupply(params) -> getTotalSupply(params.1, s)
  ];
