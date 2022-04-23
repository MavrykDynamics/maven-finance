function checkInWhitelistContracts(const contractAddress : address; var whitelistContracts : whitelistContractsType) : bool is 
block {
  var inWhitelistContractsMap : bool := False;
  for _key -> value in map whitelistContracts block {
    if contractAddress = value then inWhitelistContractsMap := True
      else skip;
  }
} with inWhitelistContractsMap

(* UpdateWhitelistContracts Function *)
function updateWhitelistContractsMap(const updateWhitelistContractsParams: updateWhitelistContractsParams; const whitelistContracts : whitelistContractsType) : whitelistContractsType is 
  block{
    
    const contractName     : string  = updateWhitelistContractsParams.whitelistContractName;
    const contractAddress  : address = updateWhitelistContractsParams.whitelistContractAddress;
    
    const existingAddress: option(address) = 
      if checkInWhitelistContracts(contractAddress, whitelistContracts) then (None : option(address)) else Some (contractAddress);

    const updatedWhitelistContracts: whitelistContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        whitelistContracts
      );

  } with (updatedWhitelistContracts)

  (* UpdateWhitelistContracts Entrypoint *)
// function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; const store: storage) : return is 
//   block{
//     checkSenderIsAdmin(store); // check that sender is admin

//     const contractName: string = updateWhitelistContractsParams.0;
//     const contractAddress: address = updateWhitelistContractsParams.1;
    
//     const exitingAddress: option(address) = 
//       if checkInWhitelistContracts(contractAddress, store.whitelistContracts) then (None : option(address)) else Some (contractAddress);

//     const updatedWhitelistedContracts: whitelistContractsType = 
//       Map.update(
//         contractName, 
//         exitingAddress,
//         store.whitelistContracts
//       );
//   } with (noOperations, store with record[whitelistContracts=updatedWhitelistedContracts]) 


// toggle adding and removal of whitelist contract addresses
// function updateWhitelistContracts(const contractName : string; const contractAddress : address; var s : storage) : return is 
// block{

//     checkNoAmount(Unit);   // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(s); // check that sender is admin

//     var inWhitelistCheck : bool := checkInWhitelistContracts(contractAddress, s.whitelistContracts);

//     if (inWhitelistCheck) then block{
//         // whitelist contract exists - remove whitelist contract from set 
//         s.whitelistContracts := Map.update(contractName, Some(contractAddress), s.whitelistContracts);
//     } else block {
//         // whitelist contract does not exist - add whitelist contract to set 
//         s.whitelistContracts := Map.add(contractName, contractAddress, s.whitelistContracts);
//     }

// } with (noOperations, s) 