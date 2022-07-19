// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./sharedTypes.ligo"

// ------------------------------------------------------------------------------
// General Contract Methods
// ------------------------------------------------------------------------------

function checkInGeneralContracts(const contractAddress : address; const generalContracts : generalContractsType) : bool is 
block {
    
    var inContractAddressMap : bool := False;
    
    for _key -> value in map generalContracts block {
        
        if contractAddress = value then inContractAddressMap := True
        else skip;

    }  

} with inContractAddressMap

(* UpdateGeneralContracts Entrypoint *)
function updateGeneralContractsMap(const updateGeneralContractsParams : updateGeneralContractsType; const generalContracts : generalContractsType) : generalContractsType is 
  block{

    const contractName     : string  = updateGeneralContractsParams.generalContractName;
    const contractAddress  : address = updateGeneralContractsParams.generalContractAddress; 

    const existingAddress : option(address) = case Map.find_opt(contractName, generalContracts) of [
            Some (_address) -> if _address = contractAddress then (None : option(address)) else (Some (contractAddress) : option(address))
        |   None            -> (Some (contractAddress) : option(address))
    ];
    
    const updatedGeneralContracts : generalContractsType = 
        Map.update(
            contractName, 
            existingAddress,
            generalContracts
        );

  } with (updatedGeneralContracts)

// ------------------------------------------------------------------------------
// Whitelist Contract Methods
// ------------------------------------------------------------------------------

function checkInWhitelistContracts(const contractAddress : address; var whitelistContracts : whitelistContractsType) : bool is 
block {

    var inWhitelistContractsMap : bool := False;
    for _key -> value in map whitelistContracts block {
        if contractAddress = value then inWhitelistContractsMap := True
        else skip;
    }

} with inWhitelistContractsMap

(* UpdateWhitelistContracts Function *)
function updateWhitelistContractsMap(const updateWhitelistContractsParams : updateWhitelistContractsType; const whitelistContracts : whitelistContractsType) : whitelistContractsType is 
block{
    
    const contractName     : string  = updateWhitelistContractsParams.whitelistContractName;
    const contractAddress  : address = updateWhitelistContractsParams.whitelistContractAddress;

    const existingAddress : option(address) = case Map.find_opt(contractName, whitelistContracts) of [
            Some (_address) -> if _address = contractAddress then (None : option(address)) else (Some (contractAddress) : option(address))
        |   None            -> (Some (contractAddress) : option(address))
    ];

    const updatedWhitelistContracts : whitelistContractsType = 
        Map.update(
            contractName, 
            existingAddress,
            whitelistContracts
        );

} with (updatedWhitelistContracts)

// ------------------------------------------------------------------------------
// Whitelist Token Contract Methods
// ------------------------------------------------------------------------------

function checkInWhitelistTokenContracts(const contractAddress : address; var whitelistTokenContracts : whitelistTokenContractsType) : bool is 
block {

    var inWhitelistTokenContractsMap : bool := False;
    for _key -> value in map whitelistTokenContracts block {
        if contractAddress = value then inWhitelistTokenContractsMap := True
        else skip;
    } 
     
} with inWhitelistTokenContractsMap

(* UpdateWhitelistTokenContracts Entrypoint *)
function updateWhitelistTokenContractsMap(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; const whitelistTokenContracts : whitelistTokenContractsType) : whitelistTokenContractsType is 
block{
    
    const contractName     : string  = updateWhitelistTokenContractsParams.tokenContractName;
    const contractAddress  : address = updateWhitelistTokenContractsParams.tokenContractAddress;
    
    const existingAddress : option(address) = 
        if checkInWhitelistTokenContracts(contractAddress, whitelistTokenContracts) then (None : option(address)) else Some (contractAddress);

    const updatedWhitelistTokenContracts : whitelistTokenContractsType = 
        Map.update(
            contractName, 
            existingAddress,
            whitelistTokenContracts
        );

} with (updatedWhitelistTokenContracts)
