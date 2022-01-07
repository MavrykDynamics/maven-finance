
type councilMembersType is set(address)

type contractAddressesType is map (string, address)
type whitelistContractsType is map (string, address)

// todo: consideration: include a signature hash of signer for added security?

type signType is (string * timestamp)              // sign type (e.g. "APPROVE" / "REJECT"), timestamp
type signersMapType is map (address, signType)

type councilActionRecordType is record [

    initiator                  : address;
    action_type                : string;
    signers                    : signersMapType; 

    approveCount               : nat;
    rejectCount                : nat; 
    executed                   : bool;

    address_param_1            : option (address);
    address_param_2            : option (address);
    nat_param_1                : option (nat);
    nat_param_2                : option (nat);
    nat_param_3                : option (nat);
    string_param_1             : option (string);
    string_param_2             : option (string);

    startDateTime              : timestamp;
    startLevel                 : nat;             
    endDateTime                : timestamp;   
    endLevel                   : nat;

    expirationDateTime         : timestamp;
]
type councilActionsLedgerType is big_map(nat, councilActionRecordType)

type configType is record [
    threshold                   : nat;                 // min number of council members who need to agree on action
    actionExpiryDuration        : nat;                 // action expiry duration in block levels
]

type storage is record [
    admin                       : address;
    config                      : configType;

    councilMembers              : councilMembersType;  // set of council member addresses
    
    whitelistContracts          : whitelistContractsType;      
    contractAddresses           : contractAddressesType;

    councilActionsLedger        : councilActionsLedgerType; 

    thresholdSigners            : nat; 
    actionCounter               : nat;

    // todo: 3 out of 5 to sign for any action to take place 
]

type addVesteeType is (address * nat * nat * nat) // vestee address, total allocated amount, cliff in months, vesting in months
type updateVesteeType is (address * nat * nat * nat) // vestee address, new total allocated amount, new cliff in months, new vesting in months
type updateWhitelistContractParams is (string * address)
type signActionType is (nat * nat) // councilActionId, voteType to be decided and confirmed: on frontend, set 1 as APPROVE, 0 as REJECT 

type councilAction is 
    | AddVesteeAction of addVesteeType
    | UpdateVesteeAction of updateVesteeType
    | ToggleTreasuryWithdrawAction of unit
    // | UpdateWhitelistContracts of updateWhitelistContractParams
    | SignAction of signActionType                

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

    var inWhitelistCheck : bool := checkInWhitelistContracts(contractAddress, s);

    if (inWhitelistCheck) then block{
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


function addVesteeAction(const addVestee : addVesteeType ; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. 
    // 2. 
    checkSenderIsCouncilMember(s);

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

function updateVesteeAction(const updateVestee : updateVesteeType; var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

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

function toggleTreasuryWithdrawAction(var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    skip

} with (noOperations, s)

function signAction(const proposalId: nat; const voteType: nat; var s : storage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    var _councilAction : councilActionRecordType := case s.councilActionsLedger[proposalId] of
        Some(_councilAction) -> _councilAction
        | None -> failwith("Error. Council Action not found")
    end;

    var voteTypeName : string := "";
    var approveCount : nat    := _councilAction.approveCount;

    if voteType = 1n then block{
        voteTypeName := "APPROVE";
        _councilAction.approveCount := approveCount + 1n;
    } else block {
        voteTypeName := "REJECT";
        _councilAction.rejectCount := _councilAction.rejectCount + 1n;
    };

    // add new signer to council action
    const newSigner : signType = (voteTypeName, Tezos.now);
    _councilAction.signers[Tezos.sender] := newSigner;

    // check if threshold has been reached
    if approveCount > s.config.threshold then block {
        
        skip
        // execution action based on action types

    } else skip;

} with (noOperations, s)

function main (const action : councilAction; const s : storage) : return is 
    case action of
        | AddVesteeAction(parameters) -> addVesteeAction(parameters, s)
        | UpdateVesteeAction(parameters) -> updateVesteeAction(parameters, s)
        | ToggleTreasuryWithdrawAction(_parameters) -> toggleTreasuryWithdrawAction(s)
        // | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters.0, parameters.1, s)
        | SignAction(parameters) -> signAction(parameters.0, parameters.1, s)
    end