
type councilMembersType is set(address)

type contractAddressesType is map (string, address)
type whitelistContractsType is map (string, address)

type storage is record [
    admin                       : address;
    councilMembers              : councilMembersType;  // set of council member addresses
    
    whitelistContracts          : whitelistContractsType;      
    contractAddresses           : contractAddressesType;

    // vestingAddress              : address;
    // treasuryAddress             : address; 
]

type addVesteeType is (address * nat * nat * nat) // vestee address, total allocated amount, cliff in months, vesting in months
type updateVesteeType is (address * nat * nat * nat) // vestee address, new total allocated amount, new cliff in months, new vesting in months
type updateWhitelistContractParams is (string * address)

type councilAction is 
    | AddVestee of addVesteeType
    | UpdateVestee of updateVesteeType
    | UpdateWhitelistContracts of updateWhitelistContractParams

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

function getWhitelistContractsSet(var s : storage) : set(address) is 
block {
  var _whitelistContractsSet : set(address) := set [];
  for _key -> value in map s.whitelistContracts block {
    var _whitelistContractsSet : set(address) := Set.add(value, _whitelistContractsSet);
  }
} with _whitelistContractsSet

function checkSenderIsWhitelistContract(var s : storage) : unit is
block {
  var whitelistContractsSet : set(address) := getWhitelistContractsSet(s);
  if (whitelistContractsSet contains Tezos.sender) then skip
  else failwith("Error. Only whitelisted contracts can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

// admin helper functions end ---------------------------------------------------------

// function addVesteeProxy(const contractAddress : address) : contract(addVesteeType * contract(nat)) is
//   case (Tezos.get_entrypoint_opt(
//       "%addVestee",
//       contractAddress) : option(contract(addVesteeType * contract(nat)))) of
//     Some(contr) -> contr
//   | None -> (failwith("addVestee entrypoint in Vesting Contract not found") : contract(addVesteeType * contract(nat)))
//   end;

// toggle adding and removal of whitelist contract addresses
function updateWhitelistContracts(const contractName : string; const contractAddress : address; var s : storage) : return is 
block{

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    var whitelistContractsSet : set(address) := getWhitelistContractsSet(s);

    const checkIfWhitelistContractExists : bool = whitelistContractsSet contains contractAddress; 

    if (checkIfWhitelistContractExists) then block{
        // whitelist contract exists - remove whitelist contract from set 
        s.whitelistContracts := Map.update(contractName, Some(contractAddress), s.whitelistContracts);
    } else block {
        // whitelist contract does not exist - add whitelist contract to set 
        s.whitelistContracts := Map.add(contractName, contractAddress, s.whitelistContracts);
    }

} with (noOperations, s) 

function addVesteeProxy(const contractAddress : address) : contract(addVesteeType) is
  case (Tezos.get_entrypoint_opt(
      "%addVestee",
      contractAddress) : option(contract(addVesteeType))) of
    Some(contr) -> contr
  | None -> (failwith("addVestee entrypoint in Vesting Contract not found") : contract(addVesteeType))
end;

// function updateVesteeProxy(const contractAddress : address) : contract(updateVesteeType * contract(nat)) is
// case (Tezos.get_entrypoint_opt(
//     "%updateVestee",
//     contractAddress) : option(contract(updateVesteeType * contract(nat)))) of
// Some(contr) -> contr
// | None -> (failwith("updateVestee entrypoint in Vesting Contract not found") : contract(updateVesteeType * contract(nat)))
// end;

function updateVesteeProxy(const contractAddress : address) : contract(updateVesteeType) is
case (Tezos.get_entrypoint_opt(
    "%updateVestee",
    contractAddress) : option(contract(updateVesteeType))) of
Some(contr) -> contr
| None -> (failwith("updateVestee entrypoint in Vesting Contract not found") : contract(updateVesteeType))
end;


function addVestee(const addVestee : addVesteeType ; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. 
    // 2. 
    checkSenderIsAdmin(s);

    var vestingAddress : address := case s.contractAddresses["vestingAddress"] of 
        Some(_address) -> _address
        | None -> failwith("Error. Vesting Contract Address not found")
    end;

    const addVesteeOperation : operation = Tezos.transaction(
        addVestee,
        0tez, 
        addVesteeProxy(vestingAddress)
        );

    const operations : list(operation) = list [addVesteeOperation];


} with (operations, s)

function updateVestee(const updateVestee : updateVesteeType; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    checkSenderIsAdmin(s);

    var vestingAddress : address := case s.contractAddresses["vestingAddress"] of 
        Some(_address) -> _address
        | None -> failwith("Error. Vesting Contract Address not found")
    end;

    const updateVesteeOperation : operation = Tezos.transaction(
        updateVestee,
        0tez, 
        updateVesteeProxy(vestingAddress)
        );

    const operations : list(operation) = list [updateVesteeOperation];


} with (operations, s)

function main (const action : councilAction; const s : storage) : return is 
    case action of
        | AddVestee(parameters) -> addVestee(parameters, s)
        | UpdateVestee(parameters) -> updateVestee(parameters, s)
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters.0, parameters.1, s)
    end