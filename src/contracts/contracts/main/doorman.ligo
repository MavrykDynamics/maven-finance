#include "../partial/doorman/doormanMethods.ligo"

function main (const action : stakeAction; const s : storage) : return is
    case action of
    | Stake(parameters) -> stake(parameters, s)
    | Unstake(parameters) -> unstake(parameters, s)
    // | SetAdmin(parameters) -> setAdmin(parameters, s)  
    // | setMvkContractAddress(parameters) -> setMvkContractAddress(parameters, s)
    // | SetVMvkContractAddress(parameters) -> setVMvkContractAddress(parameters, s)
    // | SetVotingContractAddress(parameters) -> setVotingContractAddress(parameters, s)
    end



// Placeholder contract to provide deployement address to MVK and vMVK
// To remove and replace with actual code
// type storage is int

// type parameter is
//   Increment of int
// | Decrement of int
// | Reset

// type return is list (operation) * storage

// // Two entrypoints

// function add (const store : storage; const delta : int) : storage is 
//   store + delta

// function sub (const store : storage; const delta : int) : storage is 
//   store - delta

// (* Main access point that dispatches to the entrypoints according to
//    the smart contract parameter. *)
   
// function main (const action : parameter; const store : storage) : return is
//  ((nil : list (operation)),    // No operations
//   case action of
//     Increment (n) -> add (store, n)
//   | Decrement (n) -> sub (store, n)
//   | Reset         -> 0
//   end)
