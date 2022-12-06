// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./sharedTypes.ligo"
#include "../errors.ligo"

// ------------------------------------------------------------------------------
// General Contract Helpers
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
block {

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



(* Get an address from the governance contract general contracts map *)
function getContractAddressFromGovernanceContract(const contractName : string; const governanceAddress : address; const errorCode : nat) : address is 
case (Tezos.call_view ("getGeneralContractOpt", contractName, governanceAddress) : option (option(address))) of [
        Some (_optionContract) -> case _optionContract of [
                Some (_contract)    -> _contract
            |   None                -> failwith (errorCode)
        ]
    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
];

// ------------------------------------------------------------------------------
// Whitelist Contract Helpers
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
block {
    
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
// Whitelist Token Contract Helpers
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
block {
    
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


// ------------------------------------------------------------------------------
// General Helpers
// ------------------------------------------------------------------------------

function validateStringLength(const inputString : string; const maxLength : nat; const errorCode : nat) : unit is 
block {

    if String.length(inputString) > maxLength then failwith(errorCode) else skip;

} with unit 



// helper function to verify first value is less than second value
function verifyLessThan(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    if firstValue > secondValue then failwith(errorCode)
    else skip;

} with unit



// helper function to verify first value is greater than second value
function verifyGreaterThan(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    if firstValue < secondValue then failwith(errorCode)
    else skip;

} with unit



// helper function to verify input is not 0
function verifyNotZero(const input : nat; const errorCode : nat) : unit is 
block {

    if input = 0n then failwith(errorCode) else skip;

} with unit



// helper function to verify sender is admin
function verifySenderIsAdmin(const adminAddress : address) : unit is
block {

    const senderIsAdmin : bool = adminAddress = Tezos.get_sender();
    if senderIsAdmin then skip else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);

} with unit



// helper function to verify sender is admin or governance
function verifySenderIsAdminOrGovernance(const adminAddress : address; const governanceAddress : address) : unit is
block {

    const senderIsAdminOrGovernance : bool = adminAddress = Tezos.get_sender() or governanceAddress = Tezos.get_sender();
    if senderIsAdminOrGovernance then skip else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);

} with unit



// helper function to verify sender is allowed (set of addresses)
function verifySenderIsAllowed(const allowedSet : set(address); const errorCode : nat) : unit is
block {

    const senderIsAllowed : bool = allowedSet contains Tezos.get_sender();
    if senderIsAllowed then skip else failwith(errorCode);

} with unit



// verify that sender is self or specified user
function verifySenderIsSelfOrUser(const userAddress : address) : unit is
block {

    if Tezos.get_sender() = userAddress or Tezos.get_sender() = Tezos.get_self_address() 
    then skip 
    else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

} with unit



