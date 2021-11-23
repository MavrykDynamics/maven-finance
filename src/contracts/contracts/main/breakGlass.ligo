
type storage is record [
    admin  : address; // change to multisig
    daoAddress : address; // DAO address
]

type breakGlassAction is 
    | BreakGlass of (unit)
    | SetDaoContractAddress of (address)
    | SetContractAdmin of (address)
    | UpdateMultisig of (address) // to be changed
    | RemoveBreakGlassControl of (unit)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// todo: reference multisig contract, and signatures

function breakGlass(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. emergency governance proposal will call breakGlass with emergency governance proposal id  
    // 2. callback to verify emergency governance proposal based on id
    // 3. if success, break glass and remove pause on functions below
    skip

} with (noOperations, s)

function setDaoContractAddress(const _daoContractAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. update DAO contract address (have to be careful if DAO contract changed)    
    skip
} with (noOperations, s)

function setContractAdmin(const _targetContractAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. set admin address of target contract 
    
    skip
} with (noOperations, s)

function updateMultisig(const _newAddress : address; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. todo: check multisig contract for reference
    // 2.
    
    skip
} with (noOperations, s)

function removeBreakGlassControl(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that glass has been broken
    // 2. check sender is this address
    // 3. remove break glass control  
    
    skip
} with (noOperations, s)

function main (const action : breakGlassAction; const s : storage) : return is 
    case action of
        | BreakGlass(_parameters) -> breakGlass(s)
        | SetDaoContractAddress(parameters) -> setDaoContractAddress(parameters, s)
        | SetContractAdmin(parameters) -> setContractAdmin(parameters, s)
        | UpdateMultisig(parameters) -> updateMultisig(parameters, s)
        | RemoveBreakGlassControl(_parameters) -> removeBreakGlassControl(s)
    end