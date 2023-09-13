// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------


#include "./sharedTypes.ligo"
#include "../errors.ligo"


// ------------------------------------------------------------------------------
// General Contract Helpers
// ------------------------------------------------------------------------------

// helper functions - conversions
function mumavToNatural(const amt : mav) : nat is amt / 1mumav;
function naturalToMutez(const amt : nat) : mav is amt * 1mumav;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );



(* UpdateGeneralContracts Entrypoint *)
function updateGeneralContractsMap(const updateGeneralContractsParams : updateGeneralContractsType; var generalContracts : generalContractsType) : generalContractsType is 
block {

    const contractName     : string     = updateGeneralContractsParams.generalContractName;
    const contractAddress  : address    = updateGeneralContractsParams.generalContractAddress;
    const updateType       : updateType = updateGeneralContractsParams.updateType; 

    generalContracts := case updateType of [
            Update(_) -> Big_map.update(contractName, (Some(contractAddress)), generalContracts)
        |   Remove(_) -> Big_map.update(contractName, (None : option(address)), generalContracts)
    ]

} with (generalContracts)



(* Get an address from the governance contract general contracts map *)
function getContractAddressFromGovernanceContract(const contractName : string; const governanceAddress : address; const errorCode : nat) : address is 
block {
 
    const contractAddress : address = case Mavryk.call_view("getGeneralContractOpt", contractName, governanceAddress) of [
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

function checkInWhitelistContracts(const contractAddress : address; var whitelistContracts : whitelistContractsType) : bool is 
block {

    var inWhitelistContractsMap : bool := Big_map.mem(contractAddress, whitelistContracts)

} with inWhitelistContractsMap



(* UpdateWhitelistContracts Function *)
function updateWhitelistContractsMap(const updateWhitelistContractsParams : updateWhitelistContractsType; var whitelistContracts : whitelistContractsType) : whitelistContractsType is 
block {

    const contractAddress  : address    = updateWhitelistContractsParams.whitelistContractAddress;
    const updateType       : updateType = updateWhitelistContractsParams.updateType; 

    whitelistContracts := case updateType of [
            Update(_) -> Big_map.update(contractAddress, Some(unit), whitelistContracts)
        |   Remove(_) -> Big_map.remove(contractAddress, whitelistContracts)
    ]

} with (whitelistContracts)


// ------------------------------------------------------------------------------
// Whitelist Token Contract Helpers
// ------------------------------------------------------------------------------


function checkInWhitelistTokenContracts(const contractAddress : address; var whitelistTokenContracts : whitelistTokenContractsType) : bool is 
block {

    var inWhitelistTokenContractsMap : bool := Big_map.mem(contractAddress, whitelistTokenContracts);
     
} with inWhitelistTokenContractsMap



(* UpdateWhitelistTokenContracts Entrypoint *)
function updateWhitelistTokenContractsMap(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var whitelistTokenContracts : whitelistTokenContractsType) : whitelistTokenContractsType is 
block {

    const contractAddress  : address    = updateWhitelistTokenContractsParams.tokenContractAddress;
    const updateType       : updateType = updateWhitelistTokenContractsParams.updateType; 

    whitelistTokenContracts := case updateType of [
            Update(_) -> Big_map.update(contractAddress, Some(unit), whitelistTokenContracts)
        |   Remove(_) -> Big_map.remove(contractAddress, whitelistTokenContracts)
    ]

} with (whitelistTokenContracts)

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



// verify that no Mavryk is sent to the entrypoint
function verifyNoAmountSent(const _p : unit) : unit is
block {
    
    if (Mavryk.get_amount() = 0mav) then skip else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

} with unit 
    

// ------------------------------------------------------------------------------
// Access Control Helpers
// ------------------------------------------------------------------------------


// verify sender is admin
function verifySenderIsAdmin(const adminAddress : address) : unit is
block {

    const senderIsAdmin : bool = adminAddress = Mavryk.get_sender();
    if senderIsAdmin then skip else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);

} with unit



// verify sender is admin or governance
function verifySenderIsAdminOrGovernance(const adminAddress : address; const governanceAddress : address) : unit is
block {

    const senderIsAdminOrGovernance : bool = adminAddress = Mavryk.get_sender() or governanceAddress = Mavryk.get_sender();
    if senderIsAdminOrGovernance then skip else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);

} with unit



// verify sender is allowed (set of addresses)
function verifySenderIsAllowed(const allowedSet : set(address); const errorCode : nat) : unit is
block {

    const senderIsAllowed : bool = allowedSet contains Mavryk.get_sender();
    if senderIsAllowed then skip else failwith(errorCode);

} with unit



// verify that sender is self
function verifySenderIsSelf(const _p : unit) : unit is
block {

    if Mavryk.get_sender() = Mavryk.get_self_address() 
    then skip 
    else failwith(error_ONLY_SELF_ALLOWED);

} with unit



// verify that sender is self or specified user
function verifySenderIsSelfOrAddress(const userAddress : address) : unit is
block {

    if Mavryk.get_sender() = userAddress or Mavryk.get_sender() = Mavryk.get_self_address() 
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