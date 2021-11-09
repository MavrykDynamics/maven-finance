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

// 3) does users vMVK become sMVK for the delegator when he/she sets a delegator?

type delegationAction is 
    | SetDelegate of (address)
    | SetDelegateComplete of (nat * address)
    | UnsetDelegate of (address)
    | RegisterDelegate of (nat)
    | UnregisterDelegate of (nat)
    | SetVMvkTokenAddress of (address)
    // | ChangeStake of (nat)
    // | OnGovernanceAction of (nat)    // to be clarified what this does

// record for users choosing delegators 
type delegateRecordType is record [
    delegator            : address;
    delegatedDateTime    : timestamp;
    amountStaked         : nat; 
]
type delegateLedgerType is big_map (address, delegateRecordType)

// record for delegators
type delegatorsRecordType is record [
    status                : nat; 
    amountDelegated       : nat; 
    bondSufficiency       : bool; 
    registeredDateTime   : timestamp;
]
type delegatorsLedgerType is big_map (address, delegatorsRecordType)

type configType is record [
    minimumDelegateBond    : nat;  // minimum amount of vMVK required as bong to register as delegate (in muMVK)
    delegationPercentage   : nat;  // percentage to determine if delegator is overdelegated (requires more vMVK to be staked) or underdelegated
]

// type delegatorsAction - log of all actions done by delegator 

type storage is record [
    admin                : address;
    config               : configType;
    delegateLedger       : delegateLedgerType;
    delegatorLedger      : delegatorsLedgerType;
    vMvkTokenAddress     : address;
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

(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)


function setDelegate(const delegatorAddress : address; var s : storage) : return is
block {
    // Overall steps: 
    // 1. check if delegator exists in delegatorLedger - assign delegator to user first with 0 amount staked
    // 2̶.̶ v̶e̶r̶i̶f̶y̶ t̶h̶a̶t̶ u̶s̶e̶r̶ h̶a̶s̶ n̶o̶t̶ d̶e̶l̶e̶g̶a̶t̶e̶d̶ w̶i̶t̶h̶ a̶n̶y̶ o̶t̶h̶e̶r̶ d̶e̶l̶e̶g̶a̶t̶o̶r̶s̶
    // 3̶.̶ r̶e̶c̶o̶r̶d̶ u̶s̶e̶r̶'̶s̶ d̶e̶l̶e̶g̶a̶t̶e̶d̶ a̶m̶o̶u̶n̶t̶ i̶n̶ d̶e̶l̶e̶g̶a̶t̶o̶r̶L̶e̶d̶g̶e̶r̶ -̶ s̶t̶a̶k̶e̶d̶ a̶l̶l̶ v̶M̶V̶K̶ a̶t̶ p̶o̶i̶n̶t̶ i̶n̶ t̶i̶m̶e̶
    // 2. send proxy operation to vMVK contract to get user's vMVK balance
    // 3. complete set delegate - update delegateLedger with user's vMVK balance for amount staked

    var _checkDelegatorExistsInDelegatorLedger : delegatorsRecordType := case s.delegatorLedger[delegatorAddress] of
         Some(_val) -> _val
        | None -> failwith("Delegator does not exist")
    end;

    // // reference to vMVK getBalance
    // // var getVMvkBalance : contract(contract(address, nat)) := case (Tezos.get_entrypoint_opt("%getBalance", s.vMvkTokenAddress) : option(contract(contract(address, nat)))) of
    // var getVMvkBalance : contract(contract(michelson_pair(address, "owner", contract(nat), ""))) := case (Tezos.get_entrypoint_opt("%getBalance", s.vMvkTokenAddress) : option(contract(contract(michelson_pair(address, "owner", contract(nat), ""))))) of
    // // var getVMvkBalance : contract(nat) := case (Tezos.get_entrypoint_opt("%getBalance", s.vMvkTokenAddress) : option(contract(nat))) of
    // // var getVMvkBalance : contract(contract(nat)) := case (Tezos.get_entrypoint_opt("%getBalance", s.vMvkTokenAddress) : option(contract(contract(nat)))) of
    //     Some(contr) -> contr
    //     | None -> failwith("GetBalance entrypoint in vMVK Contract not found")
    // end;

    // // reference to delegation contract to complete
    // var setDelegateComplete : contract(michelson_pair(address, "owner", contract(nat), "")) := case (Tezos.get_entrypoint_opt("%setDelegateComplete", Tezos.self_address) : option(contract(michelson_pair(address, "owner", contract(nat), "")))) of
    //     Some(contr) -> contr
    //     | None -> failwith("SetDelegateComplete entrypoint in Delegation Contract not found")
    // end;
 
    // const setDelegateCompleteOperation : operation = Tezos.transaction(setDelegateComplete, 0mutez, getVMvkBalance);

    const updateUserVMvkBalanceForDelegationOperation : operation = Tezos.transaction(
        (Tezos.sender, delegatorAddress),
         0tez, 
         updateUserVMvkBalanceForDelegation(s.vMvkTokenAddress)
         );

    const operations : list(operation) = list [updateUserVMvkBalanceForDelegationOperation];

} with (operations, s)

function setDelegateComplete(const vMvkBalance : nat; const delegatorAddress : address; var s : storage) : return is 
block {

    var _checkDelegatorExistsInDelegatorLedger : delegatorsRecordType := case s.delegatorLedger[delegatorAddress] of
         Some(_val) -> _val
        | None -> failwith("Delegator does not exist")
    end;

    var _checkDelegateExistsInDelegateLedger : delegateRecordType := case s.delegateLedger[Tezos.source] of
         Some(_val) -> _val
        | None -> record [
            delegator          = delegatorAddress; 
            delegatedDateTime  = Tezos.now;
            amountStaked       = vMvkBalance;
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

    var _checkDelegatorExistsInDelegatorLedger : delegatorsRecordType := case s.delegatorLedger[delegatorAddress] of
         Some(_val) -> _val
        | None -> failwith("Delegator does not exist")
    end;

    // remove user record in delegate ledger - if records are kept, change status; if not reset record
    // s.delegateLedger[Tezos.sender]


} with (noOperations, s)

function registerDelegate(const _parameters : nat; var s : storage) : return is 
block {
    
    // From Hackmd: It is imporant to note that the locked bond limits the size of overall delegations/stake that a single delegate can accept.
    //  - How? 

    // Overall steps: 
    // 1. verify user vMVK balance -> proxy call to get user vMVK balance in vMVK contract
    // 2. lock user vMVK balance in vMVK contract - hence unstake in doorman contract will not be possible - mint sMVK
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate
    skip

} with (noOperations, s)

function unregisterDelegate(const _parameters : nat; var s : storage) : return is
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

// function onGovernanceAction(const _parameters : nat; var s : storage) : return is 
// block {
//     // Overall steps:
//     // 1. check if delegator has sufficient bond
//     // 2. perform governance action if delegator has sufficient bond - proxy call to governance contract to execute? 
//     skip
// } with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of    
        | SetDelegate(parameters) -> setDelegate(parameters, s)
        | SetDelegateComplete(parameters) -> setDelegateComplete(parameters.0, parameters.1, s)
        | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
        | UnsetDelegate(parameters) -> unsetDelegate(parameters, s)
        | RegisterDelegate(parameters) -> registerDelegate(parameters, s)
        | UnregisterDelegate(parameters) -> unregisterDelegate(parameters, s)
        // | ChangeStake(parameters) -> changeStake(parameters, s)    
        // | OnGovernanceAction(parameters) -> onGovernanceAction(parameters, s)
    end