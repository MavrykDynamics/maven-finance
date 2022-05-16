function checkInWhitelistContracts(const contractAddress : address; var s : storage) : bool is 
block {
  var inWhitelistContractsMap : bool := False;
  for _key -> value in map s.whitelistContracts block {
    if contractAddress = value then inWhitelistContractsMap := True
      else skip;
  }  
} with inWhitelistContractsMap

(* UpdateWhitelistContracts Entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s : storage) : return is 
  block{

    checkSenderIsAdmin(s); // check that sender is admin

    const contractName     : string  = updateWhitelistContractsParams.0;
    const contractAddress  : address = updateWhitelistContractsParams.1;
    
    const existingAddress: option(address) = 
      if checkInWhitelistContracts(contractAddress, s) then (None : option(address)) else Some (contractAddress);

    const updatedWhitelistContracts: whitelistContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        s.whitelistContracts
      );

    s.whitelistContracts := updatedWhitelistContracts

  } with (noOperations, s) 