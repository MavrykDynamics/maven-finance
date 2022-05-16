type storage is record [
    admin                       : address;
]

type templateAction is 
    | First of (nat)
    | Second of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

function first(const _proposal : nat ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2. 

    // Intercontract call with Callback operation with Multiple parameters
    // fetch and update MVK balance, and send satellite info (e.g. name, desc, fee) to callback 
    // const registerAsSatelliteCompleteCallback : contract(registerAsSatelliteCompleteParamsType) = Tezos.self("%registerAsSatelliteComplete");
    // const getSatelliteBalanceOperation : operation = Tezos.transaction(
    //     (Tezos.sender, name, description, image, satelliteFee, registerAsSatelliteCompleteCallback),
    //     0tez, 
    //     getSatelliteBalance(doormanAddress)
    //     );
    // const operations : list(operation) = list [getSatelliteBalanceOperation];

    // Intercontract call with Callback operation with one parameter
    // const undelegateFromSatelliteCompleteCallback : contract(nat) = Tezos.self("%undelegateFromSatelliteComplete");
    // const checkVMvkBalanceOperation : operation = Tezos.transaction(
    //     (Tezos.sender, undelegateFromSatelliteCompleteCallback),
    //      0tez, 
    //      fetchStakedMvkBalance(doormanAddress)
    //      );
    
    // const operations : list(operation) = list [checkVMvkBalanceOperation];

    skip

} with (noOperations, s)

function second(const _parameters : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)

function main (const action : templateAction; const s : storage) : return is 
    case action of
        | First(parameters) -> first(parameters, s)
        | Second(parameters) -> second(parameters, s)
    end