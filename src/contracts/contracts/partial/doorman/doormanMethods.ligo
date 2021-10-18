#include "doormanTypes.ligo"

function get_fa12_token_contract(
  const token_address : address) : contract(transfer_type_fa12) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      token_address) : option(contract(transfer_type_fa12))) of
    Some(contr) -> contr
  | None -> (failwith("Dex/not-token") : contract(transfer_type_fa12))
  end;

(* Helper function to prepare the token transfer *)
function wrap_fa12_transfer_trx(
  const owner : address;
  const receiver : address;
  const value : nat) : transfer_type_fa12 is
  TransferTypeFA12(owner, (receiver, value))

(* Helper function to transfer fa1.2 tokens *)
function transfer_fa12(
  const sender_ : address;
  const receiver : address;
  const amount_ : nat;
  const contract_address : address) : operation is
  Tezos.transaction(
    wrap_fa12_transfer_trx(
      sender_,
      receiver,
      amount_),
    0mutez,
    get_fa12_token_contract(contract_address)
  );

function setContractAdmin(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.admin := parameters;
} with (noOperations, s)

function setContractAddress(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.contract := parameters;
} with (noOperations, s)

function setReserveAddress(const parameters : address; var s : storage) : return is
block {
    s.reserve := parameters;
} with (noOperations, s)

function stake(const parameters : nat; var s : storage) : return is
block {

} with (operations, s)


function unstake(const parameters : nat; var s : storage) : return is
block {

} with (operations, s)

function getReward(const parameters : getRewardParam) : nat is
block {

    // Reward from Governance vote - voting is incentivised with stability fees (from satellites to delegates)
    // Reward from Oracle - providing price feed data (from satellites to delegates)
    // Reward from Exit Fees - opportunity cost for staking
    // Reward from time staked? - set temporary function first

    // const k : nat = 10_000_000_000n;
    // var period : nat := abs(parameters.stop - parameters.start);
    // var timeRatio : nat := k * period;
    // timeRatio := abs(timeRatio / 31536000);
    // var reward : nat := timeRatio * parameters.rate * parameters.amount;
    // reward := reward / (k * 100n);
} with reward

function claimReward(const _parameters : unit; var s : storage) : return is 
block {

} with (operations, s)
