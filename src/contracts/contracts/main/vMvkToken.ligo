type trusted is address;
type amt is nat;
type token_id is nat;

type account is
  record [
    balance         : amt;
    allowances      : map (trusted, amt);
  ]

type token_metadata_info is record [
  token_id        : token_id;
  token_info      : map(string, bytes);
]

type storage is
  record [
    metadata        : big_map (string, bytes);
    token_metadata  : big_map(token_id, token_metadata_info);
    totalSupply     : amt;
    ledger          : big_map (address, account);
    doormanAddress  : address;
  ]

(* define return for readability *)
type return is list (operation) * storage

(* define noop for readability *)
const noOperations : list (operation) = nil;

(* Inputs *)
type transferParams is michelson_pair(address, "from", michelson_pair(address, "to", amt, "value"), "")
type approveParams is michelson_pair(trusted, "spender", amt, "value")
type balanceParams is michelson_pair(address, "owner", contract(amt), "")
type allowanceParams is michelson_pair(michelson_pair(address, "owner", trusted, "spender"), "", contract(amt), "")
type totalSupplyParams is (unit * contract(amt))
// type mintParams is michelson_pair(address, "to", amt, "value")
// type burnParams is michelson_pair(address, "from", amt, "value")
type mintParams is (address * nat)
type burnParams is (address * nat)

(* Valid entry points *)
type entryAction is
  | Transfer of transferParams
  | Approve of approveParams
  | GetBalance of balanceParams
  | GetAllowance of allowanceParams
  | GetTotalSupply of totalSupplyParams
  | UpdateVMvkTotalSupplyForDoorman of nat
  | Mint of mintParams
  | Burn of burnParams

(*  helper function to set temp vMvk total supply in Doorman module *)
function setTempVMvkTotalSupplyInDoorman(const tokenAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%setTempVMvkTotalSupply",
      tokenAddress) : option(contract(nat))) of
    Some(contr) -> contr
  | None -> (failwith("SetTempVMvkTotalSupply entrypoint not found") : contract(nat))
  end;

(*  helper function to unstakeComplete in Doorman module *)
function unstakeCompleteInDoorman(const tokenAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%unstakeComplete",
      tokenAddress) : option(contract(nat))) of
    Some(contr) -> contr
  | None -> (failwith("UnstakeComplete entrypoint not found") : contract(nat))
  end;


(* Helper function to get account *)
function getAccount (const addr : address; const s : storage) : account is
  block {
    var acct : account :=
      record [
        balance    = 0n;
        allowances = (map [] : map (address, amt));
      ];
    case s.ledger[addr] of
      None -> skip
    | Some(instance) -> acct := instance
    end;
  } with acct

(* Helper function to get allowance for an account *)
function getAllowance (const ownerAccount : account; const spender : address; const _s : storage) : amt is
  case ownerAccount.allowances[spender] of
    Some (amt) -> amt
  | None -> 0n
  end;

(* Transfer token to another account *)
function transfer (const _from : address; const _to : address; const _value : amt; var s : storage) : return is
  block {
    failwith("NotAuthorized")
  } with (noOperations, s)

(* Approve an amt to be spent by another address in the name of the sender *)
function approve (const spender : address; const value : amt; var s : storage) : return is
  block {

    (* Create or get sender account *)
    var senderAccount : account := getAccount(Tezos.sender, s);

    (* Get current spender allowance *)
    const spenderAllowance : amt = getAllowance(senderAccount, spender, s);

    (* Prevent a corresponding attack vector *)
    if spenderAllowance > 0n and value > 0n then
      failwith("UnsafeAllowanceChange")
    else skip;

    (* Set spender allowance *)
    senderAccount.allowances[spender] := value;

    (* Update storage *)
    s.ledger[Tezos.sender] := senderAccount;

  } with (noOperations, s)

(* View function that forwards the balance of source to a contract *)
function getBalance (const owner : address; const contr : contract(amt); var s : storage) : return is
  block {
    const ownerAccount : account = getAccount(owner, s);
  } with (list [transaction(ownerAccount.balance, 0tz, contr)], s)

(* View function that forwards the allowance amt of spender in the name of tokenOwner to a contract *)
function getAllowance (const owner : address; const spender : address; const contr : contract(amt); var s : storage) : return is
  block {
    const ownerAccount : account = getAccount(owner, s);
    const spenderAllowance : amt = getAllowance(ownerAccount, spender, s);
  } with (list [transaction(spenderAllowance, 0tz, contr)], s)

(* View function that forwards the totalSupply to a contract *)
function getTotalSupply (const contr : contract(amt); var s : storage) : return is
  block {
    skip
  } with (list [transaction(s.totalSupply, 0tz, contr)], s)

  (* View function that forwards the totalSupply to a contract *)
function updateVMvkTotalSupplyForDoorman (const unstakeAmount : nat; var s : storage) : return is
  block {

    (* Check this call is comming from the doorman contract *)
    if s.doormanAddress =/= Tezos.sender then
      failwith("NotAuthorized")
    else skip;

    const setTempVMvkTotalSupplyInDoormanOperation : operation = Tezos.transaction(s.totalSupply, 0tez, setTempVMvkTotalSupplyInDoorman(s.doormanAddress));
    const unstakeCompleteOperation : operation = Tezos.transaction(unstakeAmount, 0tez, unstakeCompleteInDoorman(s.doormanAddress));

    const operations : list (operation) = list [setTempVMvkTotalSupplyInDoormanOperation; unstakeCompleteOperation];

  } with (operations, s)

(* Mint tokens to an address, only callable by the doorman contract *)
function mint (const to_ : address; const value : amt; var s : storage) : return is
  block {
    (* Retrieve target account from storage *)
    var targetAccount : account := getAccount(to_, s);

    (* Check this call is comming from the doorman contract *)
    if s.doormanAddress =/= Tezos.sender then
      failwith("NotAuthorized")
    else skip;

    (* Update sender balance *)
    targetAccount.balance := targetAccount.balance + value;

    s.totalSupply := s.totalSupply + value;

    (* Update storage *)
    s.ledger[to_] := targetAccount;
  } with (noOperations, s)

(* Mint tokens to an address, only callable by the doorman contract *)
function burn (const from_ : address; const value : amt; var s : storage) : return is
  block {
    (* Retrieve target account from storage *)
    var targetAccount : account := getAccount(from_, s);

    (* Check this call is comming from the doorman contract *)
    if s.doormanAddress =/= Tezos.sender then
      failwith("NotAuthorized")
    else skip;

    (* Balance check *)
    if targetAccount.balance < value then
      failwith("NotEnoughBalance")
    else skip;

    (* Update sender balance *)
    targetAccount.balance := abs(targetAccount.balance - value);

    s.totalSupply := abs(s.totalSupply - value);

    (* Update storage *)
    s.ledger[from_] := targetAccount;
  } with (noOperations, s)

(* Main entrypoint *)
function main (const action : entryAction; var s : storage) : return is
  block {
    skip
  } with case action of
    | Transfer(params) -> transfer(params.0, params.1.0, params.1.1, s)
    | Approve(params) -> approve(params.0, params.1, s)
    | GetBalance(params) -> getBalance(params.0, params.1, s)
    | GetAllowance(params) -> getAllowance(params.0.0, params.0.1, params.1, s)
    | GetTotalSupply(params) -> getTotalSupply(params.1, s)
    | UpdateVMvkTotalSupplyForDoorman(params) -> updateVMvkTotalSupplyForDoorman(params, s)
    | Mint(params) -> mint(params.0, params.1, s)
    | Burn(params) -> burn(params.0, params.1, s)
  end;
