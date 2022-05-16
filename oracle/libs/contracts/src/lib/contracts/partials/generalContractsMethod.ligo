function checkInGeneralContracts(const contractAddress : address; var s : storage) : bool is 
block {
  var inContractAddressMap : bool := False;
  for _key -> value in map s.generalContracts block {
    if contractAddress = value then inContractAddressMap := True
      else skip;
  }  
} with inContractAddressMap

(* UpdateGeneralContracts Entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsParams; var s : storage) : return is 
  block{
    
    checkSenderIsAdmin(s); // check that sender is admin

    const contractName    : string  = updateGeneralContractsParams.0;
    const contractAddress : address = updateGeneralContractsParams.1; 
    // type

    const existingAddress: option(address) = 
      if checkInGeneralContracts(contractAddress, s) then (None : option(address)) else Some (contractAddress);

    const updatedGeneralContracts: generalContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        s.generalContracts
      );

    s.generalContracts := updatedGeneralContracts;

  } with (noOperations, s)

