// A few more questions for the delegation module:
// 1) For users delegating, will it be necessary to keep a record of his past delegators? 
// e.g.
// user delegates 100vMVK to Delegator A in May 
// user undelegates 100vMVK from Delegator A in June
// user delegates 150vMVK to Delegator B in July

// 2) if a user’s vMVK amount changed, should that be reflected in the amount staked to his selected Delegator?
// e.g.
// user delegates 100vMVK to Delegator A in May
// user stakes additional 200MVK and receives 200vMVK in June
// user receives 20vMVK exit fee reward in June
//      if exit fee distribution is not claimed, it would not be counted

// 3) does users vMVK become sMVK for the delegator when he/she sets a delegator?

type delegationAction is 
    | SetDelegate of (address)
    // | SetDelegateComplete of (nat * address)
    | UnsetDelegate of (address)
    | RegisterAsDelegator of (unit)
    | RegisterAsDelegatorComplete of (nat)
    | UnregisterAsDelegator of (nat)
    | SetVMvkTokenAddress of (address)
    // | ChangeStake of (nat)
    | OnGovernanceAction of (address)    // callback to check if delegator has sufficient bond and is not overdelegated

// record for users choosing delegators 
type delegateRecordType is record [
    // status               : nat; // active / inactive
    delegator            : address;
    delegatedDateTime    : timestamp;
    // amountStaked         : nat; // may not be used if we just look at vMVK - single source of truth will be delegate's vMVK balance
]
type delegateLedgerType is big_map (address, delegateRecordType)

// record for delegators
type delegatorRecordType is record [
    status                : nat;        // active: 1;
    amountDelegated       : nat;        // to be removed? use vMVK balance as single source of truth  
    bondSufficiency       : nat;        // bond sufficiency flag - set to 1 if delegator has enough bond; set to 0 if delegator has not enough bond (over-delegated) when checked on governance action
    registeredDateTime    : timestamp;
    delegationFee         : nat;        // fee that delegator charges to delegates 
]
type delegatorLedgerType is big_map (address, delegatorRecordType)

type configType is record [
    minimumDelegateBond    : nat;  // minimum amount of vMVK required as bong to register as delegate (in muMVK)
    delegationPercentage   : nat;  // percentage to determine if delegator is overdelegated (requires more vMVK to be staked) or underdelegated
]

// type delegatorsAction - log of all actions done by delegator 

type storage is record [
    admin                : address;
    config               : configType;
    delegateLedger       : delegateLedgerType;
    delegatorLedger      : delegatorLedgerType;
    vMvkTokenAddress     : address;
    // tempAddress          : address; // temp for testing purposes - to be removed
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// helper function to receive staked vMVK amount from vMVK contract and complete set delegate
// function delegateCompleteEntrypoint(const stakedAmount : nat) : option((contract(nat)) is
//   case (Tezos.get_entrypoint_opt(
//       "%setDelegateComplete",
//       Tezos.self_address) : (contract(nat))) of
//     Some(contr) -> contr
//   | None -> (failwith("SetDelegateComplete entrypoint in Delegation Contract not found") : contract(nat))
//   end;

// helper function to get User's vMVK balance for delegation
function updateUserVMvkBalanceForDelegation(const tokenAddress : address) : contract(address * address) is
  case (Tezos.get_entrypoint_opt(
      "%updateVMvkBalanceForDelegate",
      tokenAddress) : option(contract(address * address))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateVMvkBalanceForDelegate entrypoint in vMVK Token Contract not found") : contract(address * address))
  end;

// helper function to get User's vMVK balance from vMVK token address
function fetchVMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getBalance",
      tokenAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetBalance entrypoint in vMVK Token Contract not found") : contract(address * contract(nat)))
  end;

(* Helper function to get delegator *)
function getDelegator (const delegatorAddress : address; const s : storage) : delegatorRecordType is
  block {
    var delegatorDetails : delegatorRecordType :=
      record [
        status                = 1n;        
        amountDelegated       = 1n;        
        bondSufficiency       = 1n;        
        registeredDateTime    = Tezos.now;
        delegationFee         = 1n;    
      ];

    case s.delegatorLedger[addr] of
      None -> skip
    | Some(instance) -> delegatorDetails := instance
    end;
  } with delegatorDetails



(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)

function setDelegate(const delegatorAddress : address; var s : storage) : return is 
block {

    var _checkDelegatorExistsInDelegatorLedger : delegatorRecordType := case s.delegatorLedger[delegatorAddress] of
         Some(_val) -> _val
        | None -> failwith("Delegator does not exist")
    end;

    var _checkDelegateExistsInDelegateLedger : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> record [
            delegator          = delegatorAddress; 
            delegatedDateTime  = Tezos.now;
        ]
    end;

} with (noOperations, s)


function unsetDelegate(const delegatorAddress : address; var s : storage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. check if delegator exists in delegatorLedger
    // 3. remove user's record in delegate ledger 
    
    var _checkDelegateExistsInDelegateLedger : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> failwith("User wallet address not found.")
    end;

    var _checkDelegatorExistsInDelegatorLedger : delegatorRecordType := case s.delegatorLedger[delegatorAddress] of
         Some(_val) -> _val
        | None -> failwith("Delegator does not exist")
    end;

    // remove user record in delegate ledger - if records are kept, change status; if not reset record
    // s.delegateLedger[Tezos.sender]

} with (noOperations, s)

function registerAsDelegator(var s : storage) : return is 
block {
    
    // From Hackmd: It is imporant to note that the locked bond limits the size of overall delegations/stake that a single delegate can accept.
    //  - How? 

    // Overall steps: 
    // 1. verify user vMVK balance -> proxy call to get user vMVK balance in vMVK contract
    // 2. lock user vMVK balance in vMVK contract - hence unstake in doorman contract will not be possible - mint sMVK
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate

    // from notes: Any stakeholder with sufficient vMVK balance can register as a delegate. 
    // Automatically his vMVK is considered as a locked bond / own stake.
    //  It is imporant to note that the locked bond limits the size of overall delegations/stake that a single delegate can accept. 
    // This introduces a certain dynamic into the tokenomics, in order to achieve an even distribution of voting power within the system.

    // const delegationContractAddress : address = s.vMvkTokenAddress;
    // const delegationContractAddress : address = Tezos.self_address;

    // var registerDelegateCompleteCallback : contract(nat) := case (Tezos.get_entrypoint_opt("%registerDelegateComplete", Tezos.self_address): option(contract(nat))) of 
    // const registerDelegateCompleteCallback : contract(nat) = case (Tezos.self("%registerDelegateComplete"): option(contract(nat))) of 
    //     | Some(contr) -> contr
    //     | None -> failwith("RegisterDelegateComplete entrypoint not found in Delegation Contract")
    // end;

    const registerDelegateCompleteCallback : contract(nat) = Tezos.self("%registerAsDelegatorComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, registerDelegateCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)

function registerAsDelegatorComplete(const vMvkBalance : nat; var s : storage) : return is 
block {
    
    // From Hackmd: It is imporant to note that the locked bond limits the size of overall delegations/stake that a single delegate can accept.
    //  - How? 

    // Overall steps: 
    // 1. verify user vMVK balance -> proxy call to get user vMVK balance in vMVK contract
    // 2. lock user vMVK balance in vMVK contract - hence unstake in doorman contract will not be possible - mint sMVK
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate
    
    if vMvkBalance < s.config.minimumDelegateBond then failwith("You do not have enough vMVK to meet the minimum delegate bond.")
      else skip;

    var newDelegatorRecord : delegatorRecordType := record[            
            status               = 1n;
            amountDelegated      = vMvkBalance; 
            bondSufficiency      = 1n;
            registeredDateTime   = Tezos.now;
            delegationFee        = 0n;
        ];

    s.delegatorLedger[Tezos.source] := newDelegatorRecord;

} with (noOperations, s)


function unregisterAsDelegator(const _parameters : nat; var s : storage) : return is
block {
    // Overall steps:
    // 1. check if delegator exists in delegatorsLedger
    // 2. return all delegated amounts back to users
    // 3. burn sMVK and return delegator's vMvk
    // 3. update delegator status in delegatorsLedger as removed
    skip
} with (noOperations, s)

// function changeStakeAmount(const _parameters : nat; var s : storage) : return is 
// block {
//     // Overall steps:
//     // 1. verify that user has staked vMVK with the delegator
//     // 2. change the amount staked with the delegator
//     skip
// } with (noOperations, s)

function onGovernanceAction(const delegatorAddress : address; var s : storage) : return is 
block {
    // Overall steps:
    // 1. check if delegator has sufficient bond
    //    - needs a loop to find all delegates of the delegator, and retrieve vMVK balance for each delegate
    // 2. perform governance action if delegator has sufficient bond - proxy call to governance contract to execute? 
    //    - pass back a callback operation
    
    skip
} with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of    
        | SetDelegate(parameters) -> setDelegate(parameters, s)
        // | SetDelegateComplete(parameters) -> setDelegateComplete(parameters.0, parameters.1, s)
        | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
        | UnsetDelegate(parameters) -> unsetDelegate(parameters, s)
        | RegisterAsDelegator(_parameters) -> registerAsDelegator(s)
        | RegisterAsDelegatorComplete(parameters) -> registerAsDelegatorComplete(parameters, s)
        | UnregisterAsDelegator(parameters) -> unregisterAsDelegator(parameters, s)
        // | ChangeStake(parameters) -> changeStake(parameters, s)    
        | OnGovernanceAction(parameters) -> onGovernanceAction(parameters, s)
    end