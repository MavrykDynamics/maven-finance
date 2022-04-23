function checkInWhitelistTokenContracts(const contractAddress : address; var whitelistTokenContracts : whitelistTokenContractsType) : bool is 
block {
  var inWhitelistTokenContractsMap : bool := False;
  for _key -> value in map whitelistTokenContracts block {
    if contractAddress = value then inWhitelistTokenContractsMap := True
      else skip;
  }  
} with inWhitelistTokenContractsMap

(* UpdateWhitelistTokenContracts Entrypoint *)
function updateWhitelistTokenContractsMap(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; const whitelistTokenContracts : whitelistTokenContractsType) : whitelistTokenContractsType is 
  block{
    
    const contractName     : string  = updateWhitelistTokenContractsParams.tokenContractName;
    const contractAddress  : address = updateWhitelistTokenContractsParams.tokenContractAddress;
    
    const existingAddress: option(address) = 
      if checkInWhitelistTokenContracts(contractAddress, whitelistTokenContracts) then (None : option(address)) else Some (contractAddress);

    const updatedWhitelistTokenContracts: whitelistTokenContractsType = 
      Map.update(
        contractName, 
        existingAddress,
        whitelistTokenContracts
      );

  } with (updatedWhitelistTokenContracts) 
