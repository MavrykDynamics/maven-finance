// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// Votes Helpers
#include "../partials/shared/councilActionHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// BreakGlass Types
#include "../partials/contractTypes/breakGlassTypes.ligo"

// ------------------------------------------------------------------------------

type breakGlassAction is

        // Break Glass
    |   BreakGlass                    of (unit)

        // Housekeeping Entrypoints - Glass Broken Not Required
    |   SetAdmin                      of (address)
    |   SetGovernance                 of (address)
    |   UpdateMetadata                of updateMetadataType
    |   UpdateConfig                  of breakGlassUpdateConfigParamsType    
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType
    |   MistakenTransfer              of transferActionType
    |   UpdateCouncilMemberInfo       of councilMemberInfoType
    
        // Internal Control of Council Members
    |   AddCouncilMember              of councilActionAddMemberType
    |   RemoveCouncilMember           of address
    |   ChangeCouncilMember           of councilActionChangeMemberType
    
        // Glass Broken Required
    |   PropagateBreakGlass           of (unit)
    |   SetSingleContractAdmin        of setContractAdminType
    |   SetAllContractsAdmin          of (address)
    |   PauseAllEntrypoints           of (unit)
    |   UnpauseAllEntrypoints         of (unit)
    |   RemoveBreakGlassControl       of (unit)

        // Council Signing of Actions
    |   FlushAction                   of actionIdType
    |   SignAction                    of actionIdType

        // Lambda Entrypoints
    |   SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * breakGlassStorageType

// break glass contract methods lambdas
type breakGlassUnpackLambdaFunctionType is (breakGlassLambdaActionType * breakGlassStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : breakGlassStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : breakGlassStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Council Member address
function checkSenderIsCouncilMember(var s : breakGlassStorageType) : unit is
    if Map.mem(Tezos.get_sender(), s.councilMembers) then unit 
    else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);



// Allowed Senders: Emergency Governance Contract
function checkSenderIsEmergencyGovernanceContract(var s : breakGlassStorageType) : unit is
block{

    const emergencyGovernanceAddress : address = case s.whitelistContracts["emergencyGovernance"] of [
                Some(_address) -> _address
            |   None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    
    if (Tezos.get_sender() = emergencyGovernanceAddress) then skip
    else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governnace Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : breakGlassStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }
    
} with unit



// Check that glass is broken
function checkGlassIsBroken(var s : breakGlassStorageType) : unit is
    if s.glassBroken = True then unit
    else failwith(error_GLASS_NOT_BROKEN);



// Helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check if a satellite can interact with an action
function validateAction(const actionRecord : councilActionRecordType) : unit is
block {

    // Check if governance satellite action has been flushed
    if actionRecord.status    = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED)  else skip;

    // Check if governance satellite action has already been executed
    if actionRecord.executed then failwith(error_COUNCIL_ACTION_EXECUTED) else skip;

    // check that break glass action has not expired
    if Tezos.get_now() > actionRecord.expirationDateTime then failwith(error_COUNCIL_ACTION_EXPIRED) else skip;

} with (unit)


// helper function to create a break glass action
function createBreakGlassAction(const actionType : string; const dataMap : dataMapType; var s : breakGlassStorageType) : breakGlassStorageType is
block {

    var actionRecord : councilActionRecordType := record[

        initiator             = Tezos.get_sender();
        status                = "PENDING";
        actionType            = actionType;
        executed              = False;

        signers               = set[Tezos.get_sender()];
        signersCount          = 1n;

        dataMap               = dataMap;

        startDateTime         = Tezos.get_now();
        startLevel            = Tezos.get_level();             
        executedDateTime      = zeroTimestamp;
        executedLevel         = 0n;
        expirationDateTime    = Tezos.get_now() + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (s)

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Sign Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to trigger the flush action action during the sign
function triggerFlushActionAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const flushedActionId : nat = case actionRecord.dataMap["actionId"] of [
            Some(_nat) -> case (Bytes.unpack(_nat) : option(nat)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    var flushedActionRecord : councilActionRecordType := case s.actionsLedger[flushedActionId] of [     
            Some(_record) -> _record
        |   None          -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
    ];

    // Check if action was previously flushed or executed
    if flushedActionRecord.executed then failwith(error_COUNCIL_ACTION_EXECUTED)
    else skip;

    if flushedActionRecord.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED)
    else skip;

    flushedActionRecord.status := "FLUSHED";
    s.actionsLedger[flushedActionId] := flushedActionRecord;

} with (s)



// helper function to trigger the add council member action during the sign
function triggerAddCouncilMemberAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const councilMemberAddress : address = case actionRecord.dataMap["councilMemberAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    ];

    const councilMemberName : string = case actionRecord.dataMap["councilMemberName"] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberImage : string = case actionRecord.dataMap["councilMemberImage"] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberWebsite : string = case actionRecord.dataMap["councilMemberWebsite"] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---
    
    // Validate inputs
    if String.length(councilMemberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(councilMemberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(councilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    const councilMemberInfo: councilMemberInfoType  = record[
        name    = councilMemberName;
        image   = councilMemberImage;
        website = councilMemberWebsite;
    ];

    // Check if new council member is already in the council
    if Map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else s.councilMembers := Map.add(councilMemberAddress, councilMemberInfo, s.councilMembers);

} with (s)



// helper function to trigger the remove council member action during the sign
function triggerRemoveCouncilMemberAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const councilMemberAddress : address = case actionRecord.dataMap["councilMemberAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Check if council member is in the council
    if not Map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    else skip;

    // Check if removing the council member won't impact the threshold
    if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
    else skip;

    s.councilMembers := Map.remove(councilMemberAddress, s.councilMembers);

} with (s)



// helper function to trigger the change council member action during the sign
function triggerChangeCouncilMemberAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const oldCouncilMemberAddress : address = case actionRecord.dataMap["oldCouncilMemberAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newCouncilMemberAddress : address = case actionRecord.dataMap["newCouncilMemberAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberName : string = case actionRecord.dataMap["newCouncilMemberName"] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberImage : string = case actionRecord.dataMap["newCouncilMemberImage"] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberWebsite : string = case actionRecord.dataMap["newCouncilMemberWebsite"] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Validate inputs
    if String.length(councilMemberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(councilMemberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(councilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    // Check if new council member is already in the council
    if Map.mem(newCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else skip;

    // Check if old council member is in the council
    if not Map.mem(oldCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    else skip;

    const councilMemberInfo: councilMemberInfoType  = record[
        name    = councilMemberName;
        image   = councilMemberImage;
        website = councilMemberWebsite;
    ];

    s.councilMembers := Map.add(newCouncilMemberAddress, councilMemberInfo, s.councilMembers);
    s.councilMembers := Map.remove(oldCouncilMemberAddress, s.councilMembers);

} with (s)



// helper function to trigger the pause all entrypoint action during the sign
function triggerPauseAllEntrypointsAction(var operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // Get General Contracts map from the Governance Contract
    const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
    const generalContracts : generalContractsType = case generalContractsView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Pause all entrypoints in all contracts in the General Contracts map
    //  - iterate over contracts map with operation to pause all entrypoints
    for _contractName -> contractAddress in map generalContracts block {
        case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
            |   None        -> skip
        ];
    };    

} with (operations)



// helper function to trigger the unpause all entrypoint action during the sign
function triggerUnpauseAllEntrypointsAction(var operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // Get General Contracts map from the Governance Contract
    const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
    const generalContracts : generalContractsType = case generalContractsView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Unpause all entrypoints in all contracts in the General Contracts map
    //  - iterate over contracts map with operation to unpause all entrypoints
    for _contractName -> contractAddress in map generalContracts block {
        case (Tezos.get_entrypoint_opt("%unpauseAll", contractAddress) : option(contract(unit))) of [
                Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
            |   None        -> skip
        ];
    };    

} with (operations)



// helper function to trigger the propagate break glass action during the sign
function triggerPropagateBreakGlassAction(var operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {
    
    // check that glass is broken
    checkGlassIsBroken(s);

    // Check if the %propagateBreakGlass entrypoint exists on the Governance Contract
    const propagateBreakGlassEntrypoint: contract(unit) = case (Tezos.get_entrypoint_opt("%propagateBreakGlass", s.governanceAddress) : option(contract(unit))) of [
            Some (contr)        -> contr
        |   None                -> failwith(error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Create operation to trigger propagateBreakGlass entrypoint on the Governance Contract
    const propagateBreakGlassOperation : operation = Tezos.transaction(
        unit, 
        0tez, 
        propagateBreakGlassEntrypoint
    );

    operations := propagateBreakGlassOperation # operations;

} with (operations)



// helper function to trigger the set single contract admin action during the sign
function triggerSetSingleContractAdminAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {
    
    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const newAdminAddress : address = case actionRecord.dataMap["newAdminAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const targetContractAddress : address = case actionRecord.dataMap["targetContractAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Get whitelist developers map from the Governance Contract
    const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
    const whitelistDevelopers : whitelistDevelopersType = case whitelistDevelopersView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
    const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
    const governanceProxyAddress : address = case governanceProxyAddressView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.get_self_address() or newAdminAddress = governanceProxyAddress then skip
    else failwith(error_DEVELOPER_NOT_WHITELISTED);

    // Create operation to set admin on specified contract
    const setSingleContractAdminOperation : operation = Tezos.transaction(
        newAdminAddress, 
        0tez, 
        setAdminInContract(targetContractAddress)
    );

    operations := setSingleContractAdminOperation # operations;

} with (operations)



// helper function to trigger the all contracts admin action during the sign
function triggerSetAllContractsAdminAction(const actionRecord : councilActionRecordType; var operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const newAdminAddress : address = case actionRecord.dataMap["newAdminAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Get whitelist developers map from the Governance Contract
    const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
    const whitelistDevelopers : whitelistDevelopersType = case whitelistDevelopersView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    
    // Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
    const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
    const governanceProxyAddress : address = case governanceProxyAddressView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.get_self_address() or newAdminAddress = governanceProxyAddress then skip
    else failwith(error_DEVELOPER_NOT_WHITELISTED);

    // Set new contract admin of the Break Glass contract
    s.admin := newAdminAddress;

    // -----------------
    // Set all contracts in generalContracts map to new admin address
    // -----------------

    // Get General Contracts map from the Governance Contract
    const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
    const generalContracts : generalContractsType = case generalContractsView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Create a set to remove duplicate contract addresses (as General Contracts map may contain duplicate addresses)
    var uniqueContracts : set(address) := (Set.empty: set(address));
    
    function generalContractsFold(const contractsSet: set(address); const generalContract: string * address) : set(address) is
        // Add address to the set except self
        if generalContract.1 = Tezos.get_self_address() then contractsSet else Set.add(generalContract.1, contractsSet);

    uniqueContracts := Map.fold(generalContractsFold, generalContracts, uniqueContracts);

    // Reset all contracts admin to the new admin address
    //  - iterate over unique contracts set with setAdmin operation
    function setAdminFold(const operationList: list(operation); const singleContractAddress : address) : list(operation) is
        case (Tezos.get_entrypoint_opt("%setAdmin", singleContractAddress) : option(contract(address))) of [
                Some (_setAdmin)    -> Tezos.transaction(newAdminAddress, 0tez, _setAdmin) # operationList
            |   None                -> operationList
        ];

    operations := Set.fold(setAdminFold, uniqueContracts, operations);

    // Reset governance contract admin to the new admin address
    const resetGovernanceContractAdminOperation : operation = Tezos.transaction(
        newAdminAddress, 
        0tez, 
        setAdminInContract(s.governanceAddress)
    );
    operations := resetGovernanceContractAdminOperation # operations;

} with (operations, s)



// helper function to trigger the remove break glass control action during the sign
function triggerRemoveBreakGlassControlAction(var operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // remove access to protected Break Glass entrypoints                        
    // N.B. important to ensure proper settings configuration has been done before this entrypoint is triggered
    //   - relevant entrypoints unpaused, admin set to Break Glass Contract

    checkGlassIsBroken(s); // check that glass is broken

    // Get Governance proxy address from the General Contracts map on the Governance Contract
    const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
    const governanceProxyAddress : address = case governanceProxyAddressView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Set admin of the Break Glass contract to the Governance Proxy Contract
    s.admin := governanceProxyAddress;

    // Get General Contracts map from the Governance Contract
    const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
    const generalContracts : generalContractsType = case generalContractsView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Create a set to remove duplicate contract addresses (as General Contracts map may contain duplicate addresses)
    var uniqueContracts : set(address)    := (Set.empty: set(address));

    function generalContractsFold(const contractsSet: set(address); const generalContract: string * address) : set(address) is
        // Add address to the set except self
        if generalContract.1 = Tezos.get_self_address() then contractsSet else Set.add(generalContract.1, contractsSet);
    
    uniqueContracts := Map.fold(generalContractsFold, generalContracts, uniqueContracts);

    // Reset all contracts admin to Governance Proxy contract
    //  - iterate over unique contracts set with operation to set admin as the Governance Proxy Contract
    function setAdminFold(const operationList: list(operation); const singleContractAddress : address) : list(operation) is
        case (Tezos.get_entrypoint_opt("%setAdmin", singleContractAddress) : option(contract(address))) of [
                Some (_setAdmin)    -> Tezos.transaction(governanceProxyAddress, 0tez, _setAdmin) # operationList
            |   None                -> operationList
        ];
    operations := Set.fold(setAdminFold, uniqueContracts, operations);

    // Reset governance contract admin to governance proxy contract
    const resetGovernanceContractAdminOperation : operation = Tezos.transaction(
        governanceProxyAddress, 
        0tez, 
        setAdminInContract(s.governanceAddress)
    );
    operations := resetGovernanceContractAdminOperation # operations;

    // Set glassBroken boolean to False (removes access to protected Break Glass entrypoints)
    s.glassBroken := False;

} with (operations, s)



// helper function to execute a break glass action during the sign
function executeBreakGlassAction(var actionRecord : councilActionRecordType; const actionId : actionIdType; var operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // --------------------------------------
    // execute action based on action types
    // --------------------------------------

    const actionType : string = actionRecord.actionType;

    // flush action type
    if actionType = "flushAction" then s                                := triggerFlushActionAction(actionRecord, s);

    // addCouncilMember action type
    if actionType = "addCouncilMember" then s                           := triggerAddCouncilMemberAction(actionRecord, s);

    // removeCouncilMember action type
    if actionType = "removeCouncilMember" then s                        := triggerRemoveCouncilMemberAction(actionRecord, s);

    // changeCouncilMember action type
    if actionType = "changeCouncilMember" then s                        := triggerChangeCouncilMemberAction(actionRecord, s);

    // pauseAllEntrypoints action type
    if actionType = "pauseAllEntrypoints" then operations            := triggerPauseAllEntrypointsAction(operations, s);

    // unpauseAllEntrypoints action type
    if actionType = "unpauseAllEntrypoints" then operations          := triggerUnpauseAllEntrypointsAction(operations, s);

    // propagateBreakGlass action type
    if actionType = "propagateBreakGlass" then operations            := triggerPropagateBreakGlassAction(operations, s);

    // setSingleContractAdmin action type
    if actionType = "setSingleContractAdmin" then operations         := triggerSetSingleContractAdminAction(actionRecord, operations, s);

    // setAllContractsAdmin action type
    if actionType = "setAllContractsAdmin" then block {
        const triggerSetAllContractsAdminActionTrigger : return         = triggerSetAllContractsAdminAction(actionRecord, operations, s);
        s               := triggerSetAllContractsAdminActionTrigger.1;
        operations   := triggerSetAllContractsAdminActionTrigger.0;
    } else skip;

    // removeBreakGlassControl action type
    if actionType = "removeBreakGlassControl" then block {
        const triggerRemoveBreakGlassControlActionTrigger : return      = triggerRemoveBreakGlassControlAction(operations, s);
        s               := triggerRemoveBreakGlassControlActionTrigger.1;
        operations   := triggerRemoveBreakGlassControlActionTrigger.0;
    } else skip;
        
    // update break glass action record status
    actionRecord.status              := "EXECUTED";
    actionRecord.executed            := True;
    actionRecord.executedDateTime    := Tezos.get_now();
    actionRecord.executedLevel       := Tezos.get_level();
    
    // save break glass action record
    s.actionsLedger[actionId]         := actionRecord;

} with (operations, s)

// ------------------------------------------------------------------------------
// Sign Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(breakGlassUnpackLambdaFunctionType)) of [
            Some(f) -> f(breakGlassLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------


// BreakGlass Lambdas:
#include "../partials/contractLambdas/breakGlass/breakGlassLambdas.ligo"


// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : breakGlassStorageType) : address is
    s.admin



(* View: get Glass broken variable *)
[@view] function getGlassBroken(const _ : unit; var s : breakGlassStorageType) : bool is
    s.glassBroken



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : breakGlassStorageType) : breakGlassConfigType is
    s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _ : unit; var s : breakGlassStorageType) : councilMembersType is
    s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : breakGlassStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : breakGlassStorageType) : generalContractsType is
    s.generalContracts



(* View: get an action *)
[@view] function getActionOpt(const actionId: nat; var s : breakGlassStorageType) : option(councilActionRecordType) is
    Big_map.find_opt(actionId, s.actionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; var s : breakGlassStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : breakGlassStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : breakGlassStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass entrypoint *)
function breakGlass(var s : breakGlassStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBreakGlass"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : breakGlassStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : breakGlassStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : breakGlassStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
  
    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var s : breakGlassStorageType) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);  

} with response



(* updateCouncilMemberInfo entrypoint *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUpdateCouncilMemberInfo(councilMemberInfo);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Break Glass Council Actions Begin - Internal Control of Council Members
// ------------------------------------------------------------------------------

(*  addCouncilMember entrypoint  *)
function addCouncilMember(const newCouncilMember : councilActionAddMemberType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddCouncilMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaAddCouncilMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeCouncilMember entrypoint  *)
function removeCouncilMember(const councilMemberAddress : address; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveCouncilMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveCouncilMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  changeCouncilMember entrypoint  *)
function changeCouncilMember(const changeCouncilMemberParams : councilActionChangeMemberType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaChangeCouncilMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaChangeCouncilMember(changeCouncilMemberParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Council Actions End - Internal Control of Council Members
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAllEntrypoints entrypoint  *)
function pauseAllEntrypoints(var s : breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAllEntrypoints"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  unpauseAllEntrypoints entrypoint  *)
function unpauseAllEntrypoints(var s : breakGlassStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAllEntrypoints"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaUnpauseAllEntrypoints(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  propagateBreakGlass entrypoint  *)
function propagateBreakGlass(var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropagateBreakGlass"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaPropagateBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setSingleContractAdmin entrypoint  *)
function setSingleContractAdmin(const setSingleContractAdminParams : setContractAdminType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetSingleContractAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetSingleContractAdmin(setSingleContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  setAllContractsAdmin entrypoint  *)
function setAllContractsAdmin(const newAdminAddress : address; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAllContractsAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSetAllContractsAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  removeBreakGlassControl entrypoint  *)
function removeBreakGlassControl(var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveBreakGlassControl"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaRemoveBreakGlassControl(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction entrypoint  *)
function flushAction(const actionId: actionIdType; var s : breakGlassStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFlushAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId: nat; var s : breakGlassStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init break glass lambda action
    const breakGlassLambdaAction : breakGlassLambdaActionType = LambdaSignAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, breakGlassLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council signing of actions Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: breakGlassStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : breakGlassAction; const s : breakGlassStorageType) : return is 
block {

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with(

    case action of [
        
            // Break Glass
        |   BreakGlass(_parameters)               -> breakGlass(s)
        
            // Housekeeping Entrypoints - Glass Broken Not Required
        |   SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
        |   UpdateCouncilMemberInfo(parameters)   -> updateCouncilMemberInfo(parameters, s)

            // Break Glass Council Actions - Internal Control of Council Members
        |   AddCouncilMember(parameters)          -> addCouncilMember(parameters, s)
        |   RemoveCouncilMember(parameters)       -> removeCouncilMember(parameters, s)
        |   ChangeCouncilMember(parameters)       -> changeCouncilMember(parameters, s)
        
            // Glass Broken Required
        |   PropagateBreakGlass(_parameters)      -> propagateBreakGlass(s)
        |   SetSingleContractAdmin(parameters)    -> setSingleContractAdmin(parameters, s)
        |   SetAllContractsAdmin(parameters)      -> setAllContractsAdmin(parameters, s)
        |   PauseAllEntrypoints(_parameters)      -> pauseAllEntrypoints(s)
        |   UnpauseAllEntrypoints(_parameters)    -> unpauseAllEntrypoints(s)
        |   RemoveBreakGlassControl(_parameters)  -> removeBreakGlassControl(s)

            // Council Signing of Actions
        |   FlushAction(parameters)               -> flushAction(parameters, s)
        |   SignAction(parameters)                -> signAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
)
