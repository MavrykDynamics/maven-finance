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

    const existingAddress : option(address) = case generalContracts[contractName] of [
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
block {
 
    const contractAddress : address = case Tezos.call_view("getGeneralContractOpt", contractName, governanceAddress) of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (errorCode)
            ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with contractAddress


// ------------------------------------------------------------------------------
// Whitelist Contract Helpers
// ------------------------------------------------------------------------------


function getLocalWhitelistContract(const contractName : string; const whitelistContractsMap : whitelistContractsType; const errorCode : nat) : address is
block {

    const whitelistContract : address = case whitelistContractsMap[contractName] of [
            Some(_contr) -> _contr
        |   None -> failwith(errorCode)
    ];

} with whitelistContract



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

    const existingAddress : option(address) = case whitelistContracts[contractName] of [
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


// validate string length does not exceed max length
function validateStringLength(const inputString : string; const maxLength : nat; const errorCode : nat) : unit is 
block {

    if String.length(inputString) > maxLength then failwith(errorCode) else skip;

} with unit 



// verify first value is less than second value
function verifyLessThan(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    if firstValue < secondValue then skip else failwith(errorCode);

} with unit



// verify first value is less than second value
function verifyLessThanOrEqual(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    if firstValue <= secondValue then skip else failwith(errorCode);

} with unit



// verify first value is greater than second value
function verifyGreaterThan(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    // if firstValue < secondValue then failwith(errorCode) else skip;
    if firstValue > secondValue then skip else failwith(errorCode);

} with unit



// verify first value is greater than or equal to second value
function verifyGreaterThanOrEqual(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    if firstValue >= secondValue then skip else failwith(errorCode);

} with unit



// verify input is 0
function verifyIsZero(const input : nat; const errorCode : nat) : unit is 
block {

    if input = 0n then skip else failwith(errorCode);

} with unit



// verify input is not 0
function verifyIsNotZero(const input : nat; const errorCode : nat) : unit is 
block {

    if input = 0n then failwith(errorCode) else skip;

} with unit



// verify that no Tezos is sent to the entrypoint
function verifyNoAmountSent(const _p : unit) : unit is
block {
    
    if (Tezos.get_amount() = 0tez) then skip else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

} with unit 
    

// ------------------------------------------------------------------------------
// Access Control Helpers
// ------------------------------------------------------------------------------


// verify sender is admin
function verifySenderIsAdmin(const adminAddress : address) : unit is
block {

    const senderIsAdmin : bool = adminAddress = Tezos.get_sender();
    if senderIsAdmin then skip else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);

} with unit



// verify sender is admin or governance
function verifySenderIsAdminOrGovernance(const adminAddress : address; const governanceAddress : address) : unit is
block {

    const senderIsAdminOrGovernance : bool = adminAddress = Tezos.get_sender() or governanceAddress = Tezos.get_sender();
    if senderIsAdminOrGovernance then skip else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);

} with unit



// verify sender is allowed (set of addresses)
function verifySenderIsAllowed(const allowedSet : set(address); const errorCode : nat) : unit is
block {

    const senderIsAllowed : bool = allowedSet contains Tezos.get_sender();
    if senderIsAllowed then skip else failwith(errorCode);

} with unit



// verify that sender is self
function verifySenderIsSelf(const _p : unit) : unit is
block {

    if Tezos.get_sender() = Tezos.get_self_address() 
    then skip 
    else failwith(error_ONLY_SELF_ALLOWED);

} with unit



// verify that sender is self or specified user
function verifySenderIsSelfOrAddress(const userAddress : address) : unit is
block {

    if Tezos.get_sender() = userAddress or Tezos.get_sender() = Tezos.get_self_address() 
    then skip 
    else failwith(error_ONLY_SELF_OR_SPECIFIED_ADDRESS_ALLOWED);

} with unit



// ------------------------------------------------------------------------------
// Break Glass / Pause Helpers
// ------------------------------------------------------------------------------


// verify entrypoint is not paused
function verifyEntrypointIsNotPaused(const entrypoint : bool; const errorCode : nat) : unit is
block {

    if entrypoint = True then failwith(errorCode) else skip;

} with unit



// verify entrypoint is paused
function verifyEntrypointIsPaused(const entrypoint : bool; const errorCode : nat) : unit is
block {

    if entrypoint = True then skip else failwith(errorCode);

} with unit


// ------------------------------------------------------------------------------
// Entrypoint Helpers
// ------------------------------------------------------------------------------


// helper function to get an entrypoint with nat type on specified contract
// function getEntrypointNatType(const entrypointName : string; const contractAddress : address; const errorCode : nat) : contract(nat) is
// block {

//     const contractEntrypoint : contract(nat) = case Tezos.get_entrypoint_opt(entrypointName, contractAddress) of [
//             Some(contr) -> contr
//         |   None        -> (failwith(errorCode) : contract(nat))
//     ];

// } with contractEntrypoint



// helper function to get an entrypoint with address type on specified contract
// function getEntrypointAddressType(const entrypointName : string; const contractAddress : address; const errorCode : nat) : contract(address) is
// block {

//     const contractEntrypoint : contract(address) = case (Tezos.get_entrypoint_opt(entrypointName, contractAddress)) of [
//             Some(contr) -> contr
//         |   None        -> (failwith(errorCode) : contract(address))
//     ];

// } with contractEntrypoint


// function getEntrypointAddressType(const entrypointName : string; const contractAddress : address; const errorCode : nat) : contract(address) is
//     case (Tezos.get_entrypoint_opt(
//         "%" ^ entrypointName, 
//         contractAddress) : option(contract(address))) of [
//             Some(contr) -> contr
//         |   None        -> (failwith(errorCode) : contract(address))
//     ];


// helper function to %addVestee entrypoint to add a new vestee on the Vesting contract
// function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
// block {

//     case (Tezos.get_entrypoint_opt("%addVestee",contractAddress) : option(contract(addVesteeType))) of [
//             Some(contr) -> contr
//         |   None        -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
//     ];
// }   

// helper function to get an entrypoint with unit type on specified contract
// function getEntrypointUnitType(const entrypointName : string; const contractAddress : address; const errorCode : nat) : contract(unit) is
// block {

//     const contractEntrypoint : contract(unit) = case Tezos.get_entrypoint_opt(entrypointName, contractAddress) of [
//             Some(contr) -> contr
//         |   None        -> (failwith(errorCode) : contract(unit))
//     ];

// } with contractEntrypoint



// helper function to get an entrypoint with bytes type on specified contract
// function getEntrypointBytesType(const entrypointName : string; const contractAddress : address; const errorCode : nat) : contract(bytes) is
// block {

//     const contractEntrypoint : contract(bytes) = case Tezos.get_entrypoint_opt(entrypointName,contractAddress) of [
//             Some(contr) -> contr
//         |   None        -> (failwith(errorCode) : contract(bytes))
//     ];

// } with contractEntrypoint
    


// ------------------------------------------------------------------------------
// Lambda Helpers
// ------------------------------------------------------------------------------


// helper function to get lambda bytes
function getLambdaBytes(const lambdaKey : string; const lambdaLedger : lambdaLedgerType) : bytes is 
block {
    
    // get lambda bytes from lambda ledger
    const lambdaBytes : bytes = case lambdaLedger[lambdaKey] of [
            Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

} with lambdaBytes