function checkInWhitelistTokenContracts(const contractAddress : address; var s : storage) : bool is 
block {
  var inWhitelistTokenContractsMap : bool := False;
  for _key -> value in map s.whitelistTokenContracts block {
    if contractAddress = value then inWhitelistTokenContractsMap := True
      else skip;
  }  
} with inWhitelistTokenContractsMap

(* UpdateWhitelistTokenContracts Entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s : storage) : return is 
  block{

    checkSenderIsAdmin(s); // check that sender is admin

    const contractName     : string  = updateWhitelistTokenContractsParams.0;
    const contractAddress  : address = updateWhitelistTokenContractsParams.1;
    
    const existingAddress: option(address) = 
      if checkInWhitelistTokenContracts(contractAddress, s) then (None : option(address)) else Some (contractAddress);

    const updatedWhitelistTokenContracts: whitelistTokenContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        s.whitelistTokenContracts
      );

    s.whitelistTokenContracts := updatedWhitelistTokenContracts

  } with (noOperations, s) 
