
type councilMembersType is set(address)

type storage is record [
    admin                       : address;
    councilMembers              : councilMembersType;  // set of council member addresses
    
    vestingAddress              : address;
    treasuryAddress             : address; 
]

type addVesteeType is (address * nat * nat * nat) // vestee address, total allocated amount, cliff in months, vesting in months
type updateVesteeType is (address * nat * nat * nat) // vestee address, new total allocated amount, new cliff in months, new vesting in months

type councilAction is 
    | AddVestee of addVesteeType
    | UpdateVestee of updateVesteeType

const noOperations : list (operation) = nil;
type return is list (operation) * storage



// may need a lambda function to be able to send calls to future unspecified entrypoints if needed

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsCouncilMember(var s : storage) : unit is
    if Set.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith("Only council members can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------

function addVestee(const contractAddress : address) : contract(addVesteeType * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%addVestee",
      contractAddress) : option(contract(addVesteeType * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("addVestee entrypoint in Vesting Contract not found") : contract(addVesteeType * contract(nat)))
  end;

function updateVestee(const contractAddress : address) : contract(updateVesteeType * contract(nat)) is
case (Tezos.get_entrypoint_opt(
    "%updateVestee",
    contractAddress) : option(contract(updateVesteeType * contract(nat)))) of
Some(contr) -> contr
| None -> (failwith("updateVestee entrypoint in Vesting Contract not found") : contract(updateVesteeType * contract(nat)))
end;


function addVestee(const addVestee : addVesteeType ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2. 
    skip

} with (noOperations, s)

function updateVestee(const updateVestee : updateVesteeType; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)

function main (const action : councilAction; const s : storage) : return is 
    case action of
        | AddVestee(parameters) -> addVestee(parameters.0, parameters.1, parameters.2, parameters.3, s)
        | UpdateVestee(parameters) -> updateVestee(parameters.0, parameters.1, parameters.2, parameters.3, s)
    end