type delegationAction is 
    | SetDelegate of (nat)
    | RegisterDelegate of (nat)
    | UnregisterDelegate of (nat)
    | ChangeStake of (nat)
    | OnGovernanceAction of (nat)    // to be clarified what this does

type delegateRecordType is record [
    status               : nat; 
    registeredDateTime   : timestamp;
    amountStaked         : nat; 
]
type delegateLedgerType is big_map (address, delegateRecordType)

type storage is record [
    admin                : address;
    delegateLedger       : delegateLedgerType;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

function setDelegate(const _parameters : nat; var s : storage) : return is
block {
    skip
} with (noOperations, s)

function registerDelegate(const _parameters : nat; var s : storage) : return is 
block {
    skip
} with (noOperations, s)

function unregisterDelegate(const _parameters : nat; var s : storage) : return is
block {
    skip
} with (noOperations, s)

function changeStake(const _parameters : nat; var s : storage) : return is 
block {
    skip
} with (noOperations, s)

function onGovernanceAction(const _parameters : nat; var s : storage) : return is 
block {
    skip
} with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of
        | SetDelegate(parameters) -> setDelegate(parameters, s)
        | RegisterDelegate(parameters) -> registerDelegate(parameters, s)
        | ChangeStake(parameters) -> changeStake(parameters, s)
        | UnregisterDelegate(parameters) -> unregisterDelegate(parameters, s)
        | OnGovernanceAction(parameters) -> onGovernanceAction(parameters, s)
    end