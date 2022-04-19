function checkInGeneralContracts(const contractAddress : address; const generalContracts : generalContractsType) : bool is 
block {
  var inContractAddressMap : bool := False;
  for _key -> value in map generalContracts block {
    if contractAddress = value then inContractAddressMap := True
      else skip;
  }  
} with inContractAddressMap

(* UpdateGeneralContracts Entrypoint *)
function updateGeneralContractsMap(const updateGeneralContractsParams : updateGeneralContractsParams; const generalContracts : generalContractsType) : generalContractsType is 
  block{

    const contractName     : string  = updateGeneralContractsParams.generalContractName;
    const contractAddress  : address = updateGeneralContractsParams.generalContractAddress; 

    const existingAddress: option(address) = case Map.find_opt(contractName, generalContracts) of [
      Some (_address) -> if _address = contractAddress then (None : option(address)) else (Some (contractAddress): option(address))
    |  None -> (Some (contractAddress): option(address))
    ];
    
    const updatedGeneralContracts: generalContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        generalContracts
      );

  } with (updatedGeneralContracts)


//   function updateContractAddresses(const updateContractAddressesParams : updateContractAddressesParams; const store: storage) : return is 
//   block{
//     checkSenderIsAdmin(store); // check that sender is admin

//     const contractName: string = updateContractAddressesParams.0;
//     const contractAddress: address = updateContractAddressesParams.1;
    
//     const exitingAddress: option(address) = 
//       if checkInContractAddresses(contractAddress, store) then (None : option(address)) else Some (contractAddress);

//     const updatedContractAddresses: contractAddressesType = 
//       Map.update(
//         contractName, 
//         exitingAddress,
//         store.contractAddresses
//       );
//   } with (noOperations, store with record[contractAddresses=updatedContractAddresses])


// toggle adding and removal of general contract addresses
// function updateGeneralContracts(const contractName : string; const contractAddress : address; var s : storage) : return is 
// block{

//     checkNoAmount(Unit);   // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(s); // check that sender is admin
 
//     var inGeneralContractsBool : bool := checkInGeneralContracts(contractAddress, s);

//     if (inGeneralContractsBool) then block{
//         // whitelist contract exists - remove whitelist contract from set 
//         s.generalContracts := Map.update(contractName, Some(contractAddress), s.generalContracts);
//     } else block {
//         // whitelist contract does not exist - add whitelist contract to set 
//         s.generalContracts := Map.add(contractName, contractAddress, s.generalContracts);
//     }

// } with (noOperations, s) 
