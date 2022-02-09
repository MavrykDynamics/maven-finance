

type storage is record [
    admin           : address;
    doormanAddress  : address;
]

type poolAction is 
    | Distribute of (address * nat)
    | SetAdmin of (address)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------

// helper function to get User's MVK balance from MVK token address
function distributeExitFeeReward(const contractAddress : address) : contract(address * nat) is
  case (Tezos.get_entrypoint_opt(
      "%distributeExitFeeReward",
      contractAddress) : option(contract(address * nat))) of
    Some(contr) -> contr
  | None -> (failwith("distributeExitFeeReward entrypoint in Doorman Contract not found") : contract(address * nat))
  end;

function distribute(const userAddress : address; const exitFeeReward : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // note: not possible to loop through bigmap, has to be done through an indexer or api 
    // 1. receive user address and amount to be distributed from off-chain calculations in batch operation 
    // 2. send operation to doorman contract to distribute exit fee reward

    const distributeExitFeeRewardOperation : operation = Tezos.transaction(
        (userAddress, exitFeeReward),
        0tez,
        distributeExitFeeReward(s.doormanAddress)
    );

    const operations : list(operation) = list [distributeExitFeeRewardOperation];

} with (operations, s)

function setAdmin(const newAdminAddress : address; var s : storage) : return is 
block {
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

function main (const action : poolAction; const s : storage) : return is 
    case action of
        | Distribute(parameters) -> distribute(parameters.0, parameters.1, s)
        | SetAdmin(parameters) -> setAdmin(parameters, s)
    end