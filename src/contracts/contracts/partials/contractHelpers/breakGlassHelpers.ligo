// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Council Member address
function verifySenderIsCouncilMember(var s : breakGlassStorageType) : unit is
block {
    
    if Big_map.mem(Mavryk.get_sender(), s.councilMembers) then skip
    else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);

} with unit
    


// Allowed Senders: Emergency Governance Contract
function verifySenderIsEmergencyGovernanceContract(var s : breakGlassStorageType) : unit is
block{
    
    const emergencyGovernanceAddress : address = getContractAddressFromGovernanceContract("emergencyGovernance", s.governanceAddress, error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[emergencyGovernanceAddress], error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED)

} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : breakGlassStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Check that glass is broken
function checkGlassIsBroken(var s : breakGlassStorageType) : unit is
    if s.glassBroken = True then unit
    else failwith(error_GLASS_NOT_BROKEN);



// Helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
    case (Mavryk.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check if a satellite can interact with an action
function validateAction(const actionRecord : councilActionRecordType) : unit is
block {

    // Check if break glass action has been flushed
    if actionRecord.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED) else skip;

    // Check if break glass action has already been executed
    if actionRecord.executed then failwith(error_COUNCIL_ACTION_EXECUTED) else skip;

    // check that break glass action has not expired
    if Mavryk.get_now() > actionRecord.expirationDateTime then failwith(error_COUNCIL_ACTION_EXPIRED) else skip;

} with (unit)



// helper funtion to get governance proxy address directly from the Governance Contract
function getGovernanceProxyAddress(const s : breakGlassStorageType) : address is
block {

    const governanceProxyAddressView : option (address) = Mavryk.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
    const governanceProxyAddress : address = case governanceProxyAddressView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with governanceProxyAddress



// helper function to get whitelist developers map from the Governance Contract
function getWhitelistDevelopersMap(const s : breakGlassStorageType) : whitelistDevelopersType is 
block {

    // Get Whitelist Developers map from the Governance Contract
    const whitelistDevelopersView : option (whitelistDevelopersType) = Mavryk.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
    const whitelistDevelopers : whitelistDevelopersType = case whitelistDevelopersView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with whitelistDevelopers



// helper function to verify valid new admin address
function verifyValidAdminAddress(const newAdminAddress : address; const whitelistDevelopers : whitelistDevelopersType; const governanceProxyAddress : address) : unit is 
block {

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Mavryk.get_self_address() or newAdminAddress = governanceProxyAddress then skip
    else failwith(error_DEVELOPER_NOT_WHITELISTED);

} with unit



// helper function to verify that council member is in the council
function verifyCouncilMemberExists(const councilMemberAddress : address; const  s : breakGlassStorageType) : unit is 
block {

    if not Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    else skip;

} with unit



// helper function to verify that council member is not in the council
function verifyCouncilMemberDoesNotExist(const councilMemberAddress : address; const  s : breakGlassStorageType) : unit is 
block {

    if Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else skip;

} with unit



// helper function to verify that council threshold is valid and will not be below config threshold
function verifyValidCouncilThreshold(const  s : breakGlassStorageType) : unit is 
block {

    if (abs(s.councilSize - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
    else skip;

} with unit



// helper function to create a break glass action
function createBreakGlassAction(const actionType : string; const dataMap : dataMapType; var s : breakGlassStorageType) : breakGlassStorageType is
block {

    var actionRecord : councilActionRecordType := record[

        initiator             = Mavryk.get_sender();
        status                = "PENDING";
        actionType            = actionType;
        executed              = False;

        signersCount          = 1n;

        dataMap               = dataMap;

        startDateTime         = Mavryk.get_now();
        startLevel            = Mavryk.get_level();
        executedDateTime      = None;
        executedLevel         = None;
        expirationDateTime    = Mavryk.get_now() + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 
    s.actionsSigners                 := Big_map.add((s.actionCounter, Mavryk.get_sender()), unit, s.actionsSigners);

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with (s)



// helper function to get council action record
function getCouncilActionRecord(const actionId : nat; const s : breakGlassStorageType) : councilActionRecordType is
block {

    const councilActionRecord : councilActionRecordType = case s.actionsLedger[actionId] of [
            Some (_action) -> _action
        |   None           -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
    ];

} with councilActionRecord



// helper function to unpack strings from dataMap
function unpackString(const actionRecord : councilActionRecordType; const key : string) : string is 
block {

    const unpackedString : string = case actionRecord.dataMap[key] of [
            Some(_string) -> case (Bytes.unpack(_string) : option(string)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

} with unpackedString



// helper function to unpack address from dataMap
function unpackAddress(const actionRecord : councilActionRecordType; const key : string) : address is 
block {

    const unpackedAddress : address = case actionRecord.dataMap[key] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

} with unpackedAddress



// helper function to unpack address from dataMap
function unpackAddressSet(const actionRecord : councilActionRecordType; const key : string) : set(address) is 
block {

    const unpackedAddresses : set(address) = case actionRecord.dataMap[key] of [
            Some(_addressSet) -> case (Bytes.unpack(_addressSet) : option(set(address))) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

} with unpackedAddresses



// helper function to unpack nat from dataMap
function unpackNat(const actionRecord : councilActionRecordType; const key : string) : nat is 
block {

    const unpackedNat : nat = case actionRecord.dataMap[key] of [
            Some(_nat) -> case (Bytes.unpack(_nat) : option(nat)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

} with unpackedNat

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function for propagateBreakGlass
function propagateBreakGlassOperation(const contractAddressSet : set(address); const s : breakGlassStorageType) : operation is 
block {

    // Check if the %propagateBreakGlass entrypoint exists on the Governance Contract
    const propagateBreakGlassEntrypoint: contract(set(address)) = case (Mavryk.get_entrypoint_opt("%propagateBreakGlass", s.governanceAddress) : option(contract(set(address)))) of [
            Some (contr)        -> contr
        |   None                -> failwith(error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Create operation to trigger propagateBreakGlass entrypoint on the Governance Contract
    const propagateBreakGlassOperation : operation = Mavryk.transaction(
        contractAddressSet, 
        0mav, 
        propagateBreakGlassEntrypoint
    );

} with propagateBreakGlassOperation


// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Sign Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to trigger the flush action action during the sign
function triggerFlushActionAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const flushedActionId : nat = unpackNat(actionRecord, "actionId");
    // fetch params end ---

    var flushedActionRecord : councilActionRecordType := getCouncilActionRecord(flushedActionId, s);

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
    const councilMemberAddress  : address = unpackAddress(actionRecord, "councilMemberAddress");
    const councilMemberName     : string  = unpackString(actionRecord, "councilMemberName");
    const councilMemberImage    : string  = unpackString(actionRecord, "councilMemberImage");
    const councilMemberWebsite  : string  = unpackString(actionRecord, "councilMemberWebsite");
    // fetch params end ---
    
    // Validate inputs
    validateStringLength(councilMemberName      , s.config.councilMemberNameMaxLength       , error_WRONG_INPUT_PROVIDED);
    validateStringLength(councilMemberImage     , s.config.councilMemberImageMaxLength      , error_WRONG_INPUT_PROVIDED);
    validateStringLength(councilMemberWebsite   , s.config.councilMemberWebsiteMaxLength    , error_WRONG_INPUT_PROVIDED);

    const councilMemberInfo: councilMemberInfoType  = record[
        name    = councilMemberName;
        image   = councilMemberImage;
        website = councilMemberWebsite;
    ];

    // Check if new council member is already in the council
    if Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else{
        s.councilMembers    := Big_map.add(councilMemberAddress, councilMemberInfo, s.councilMembers);
        s.councilSize       := s.councilSize + 1n;
    }

} with (s)



// helper function to trigger the remove council member action during the sign
function triggerRemoveCouncilMemberAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const councilMemberAddress  : address = unpackAddress(actionRecord, "councilMemberAddress");
    // fetch params end ---

    // Verify that council member is in the council
    verifyCouncilMemberExists(councilMemberAddress, s);

    // Check if removing the council member won't impact the threshold
    verifyValidCouncilThreshold(s);

    s.councilMembers    := Big_map.remove(councilMemberAddress, s.councilMembers);
    s.councilSize       := abs(s.councilSize - 1n);

} with (s)



// helper function to trigger the change council member action during the sign
function triggerChangeCouncilMemberAction(const actionRecord : councilActionRecordType; var s : breakGlassStorageType) : breakGlassStorageType is 
block {

    // fetch params begin ---
    const oldCouncilMemberAddress   : address = unpackAddress(actionRecord, "oldCouncilMemberAddress");
    const newCouncilMemberAddress   : address = unpackAddress(actionRecord, "newCouncilMemberAddress");
    const newCouncilMemberName      : string  = unpackString(actionRecord, "newCouncilMemberName");
    const newCouncilMemberImage     : string  = unpackString(actionRecord, "newCouncilMemberImage");
    const newCouncilMemberWebsite   : string  = unpackString(actionRecord, "newCouncilMemberWebsite");
    // fetch params end ---

    // Validate inputs
    validateStringLength(newCouncilMemberName       , s.config.councilMemberNameMaxLength       , error_WRONG_INPUT_PROVIDED);
    validateStringLength(newCouncilMemberImage      , s.config.councilMemberImageMaxLength      , error_WRONG_INPUT_PROVIDED);
    validateStringLength(newCouncilMemberWebsite    , s.config.councilMemberWebsiteMaxLength    , error_WRONG_INPUT_PROVIDED);

    // Verify that new council member is not in the council
    verifyCouncilMemberDoesNotExist(newCouncilMemberAddress, s);
    
    // Verify that old council member is in the council
    verifyCouncilMemberExists(oldCouncilMemberAddress, s);

    const councilMemberInfo: councilMemberInfoType  = record[
        name    = newCouncilMemberName;
        image   = newCouncilMemberImage;
        website = newCouncilMemberWebsite;
    ];

    s.councilMembers := Big_map.add(newCouncilMemberAddress, councilMemberInfo, s.councilMembers);
    s.councilMembers := Big_map.remove(oldCouncilMemberAddress, s.councilMembers);

} with (s)



// helper function to trigger the pause all entrypoint action during the sign
function triggerPauseAllEntrypointsAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const contractAddressSet        : set(address) = unpackAddressSet(actionRecord, "contractAddressSet");
    // fetch params end ---

    // Pause all entrypoints in all contracts in the General Contracts map
    //  - iterate over contracts map with operation to pause all entrypoints
    var updatedOperations : list(operation) := operations;
    for contractAddress in set contractAddressSet block {
        case (Mavryk.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                Some(contr) -> updatedOperations := Mavryk.transaction(unit, 0mav, contr) # updatedOperations
            |   None        -> skip
        ];
    };    

} with (updatedOperations)



// helper function to trigger the unpause all entrypoint action during the sign
function triggerUnpauseAllEntrypointsAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const contractAddressSet        : set(address) = unpackAddressSet(actionRecord, "contractAddressSet");
    // fetch params end ---

    // Unpause all entrypoints in all contracts in the General Contracts map
    //  - iterate over contracts map with operation to unpause all entrypoints
    var updatedOperations : list(operation) := operations;
    for contractAddress in set contractAddressSet block {
        case (Mavryk.get_entrypoint_opt("%unpauseAll", contractAddress) : option(contract(unit))) of [
                Some(contr) -> updatedOperations := Mavryk.transaction(unit, 0mav, contr) # updatedOperations
            |   None        -> skip
        ];
    };    

} with (updatedOperations)



// helper function to trigger the propagate break glass action during the sign
function triggerPropagateBreakGlassAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {
    
    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const contractAddressSet    : set(address)  = unpackAddressSet(actionRecord, "contractAddressSet");
    // fetch params end ---

    // Create operation to trigger propagateBreakGlass entrypoint on the Governance Contract
    const propagateBreakGlassOperation : operation = propagateBreakGlassOperation(contractAddressSet, s);

} with (propagateBreakGlassOperation # operations)



// helper function to trigger the all contracts admin action during the sign
function triggerSetContractsAdminAction(const actionRecord : councilActionRecordType; const operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const newAdminAddress       : address       = unpackAddress(actionRecord, "newAdminAddress");
    const contractAddressSet    : set(address)  = unpackAddressSet(actionRecord, "contractAddressSet");
    // fetch params end ---

    // Get Whitelist Developers map from the Governance Contract
    const whitelistDevelopers : whitelistDevelopersType = getWhitelistDevelopersMap(s);

    // Get Governance Proxy Contract address directly from the Governance Contract
    const governanceProxyAddress : address = getGovernanceProxyAddress(s);

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    verifyValidAdminAddress(newAdminAddress, whitelistDevelopers, governanceProxyAddress);

    // Set new contract admin of the Break Glass contract
    if Set.mem(Mavryk.get_self_address(), contractAddressSet) then {
        s.admin             := newAdminAddress;
    }
    else skip;

    // -----------------
    // Set contracts to new admin address
    // -----------------

    // Reset all contracts admin to the new admin address
    //  - iterate over unique contracts set with setAdmin operation
    function setAdminFold(const operationList: list(operation); const singleContractAddress : address) : list(operation) is
        case (Mavryk.get_entrypoint_opt("%setAdmin", singleContractAddress) : option(contract(address))) of [
                Some (_setAdmin)    -> if singleContractAddress = Mavryk.get_self_address() then operationList else Mavryk.transaction(newAdminAddress, 0mav, _setAdmin) # operationList
            |   None                -> operationList
        ];

    var updatedOperations : list(operation) := operations;
    for contractAddress in set contractAddressSet block{
        updatedOperations := setAdminFold(updatedOperations, contractAddress);
    }

} with (updatedOperations, s)



// helper function to trigger the remove break glass control action during the sign
function triggerRemoveBreakGlassControlAction(const actionRecord : councilActionRecordType; const operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // remove access to protected Break Glass entrypoints                        
    // N.B. important to ensure proper settings configuration has been done before this entrypoint is triggered
    //   - relevant entrypoints unpaused, admin set to Break Glass Contract

    checkGlassIsBroken(s); // check that glass is broken

    // fetch params begin ---
    const contractAddressSet    : set(address)  = unpackAddressSet(actionRecord, "contractAddressSet");
    // fetch params end ---

    // Get Governance Proxy Contract address directly from the Governance Contract
    const governanceProxyAddress : address = getGovernanceProxyAddress(s);

    // Set admin of the Break Glass contract to the Governance Proxy Contract
    s.admin := governanceProxyAddress;

    // Reset all contracts admin to Governance Proxy contract
    //  - iterate over unique contracts set with operation to set admin as the Governance Proxy Contract
    function setAdminFold(const operationList: list(operation); const singleContractAddress : address) : list(operation) is
        case (Mavryk.get_entrypoint_opt("%setAdmin", singleContractAddress) : option(contract(address))) of [
                Some (_setAdmin)    -> if singleContractAddress = Mavryk.get_self_address() then operationList else Mavryk.transaction(governanceProxyAddress, 0mav, _setAdmin) # operationList
            |   None                -> operationList
        ];

    var updatedOperations : list(operation) := operations;
    for contractAddress in set contractAddressSet block{
        updatedOperations := setAdminFold(updatedOperations, contractAddress);
    };

    // Set glassBroken boolean to False (removes access to protected Break Glass entrypoints)
    s.glassBroken := False;

} with (updatedOperations, s)



// helper function to execute a break glass action during the sign
function executeBreakGlassAction(const actionRecord : councilActionRecordType; const actionId : actionIdType; const operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // --------------------------------------
    // execute action based on action types
    // --------------------------------------

    const actionType : string = actionRecord.actionType;

    // initialize an updated operation list
    var updatedOperations : list(operation)                     := operations;

    // flush action type
    if actionType = "flushAction" then s                                := triggerFlushActionAction(actionRecord, s);

    // addCouncilMember action type
    if actionType = "addCouncilMember" then s                           := triggerAddCouncilMemberAction(actionRecord, s);

    // removeCouncilMember action type
    if actionType = "removeCouncilMember" then s                        := triggerRemoveCouncilMemberAction(actionRecord, s);

    // changeCouncilMember action type
    if actionType = "changeCouncilMember" then s                        := triggerChangeCouncilMemberAction(actionRecord, s);

    // pauseAllEntrypoints action type
    if actionType = "pauseAllEntrypoints" then updatedOperations        := triggerPauseAllEntrypointsAction(actionRecord, updatedOperations, s);

    // unpauseAllEntrypoints action type
    if actionType = "unpauseAllEntrypoints" then updatedOperations      := triggerUnpauseAllEntrypointsAction(actionRecord, updatedOperations, s);

    // propagateBreakGlass action type
    if actionType = "propagateBreakGlass" then updatedOperations        := triggerPropagateBreakGlassAction(actionRecord, updatedOperations, s);

    // setContractsAdmin action type
    if actionType = "setContractsAdmin" then block {
        const triggerSetContractsAdminActionTrigger : return            = triggerSetContractsAdminAction(actionRecord, updatedOperations, s);
        s                   := triggerSetContractsAdminActionTrigger.1;
        updatedOperations   := triggerSetContractsAdminActionTrigger.0;
    } else skip;

    // removeBreakGlassControl action type
    if actionType = "removeBreakGlassControl" then block {
        const triggerRemoveBreakGlassControlActionTrigger : return      = triggerRemoveBreakGlassControlAction(actionRecord, updatedOperations, s);
        s                   := triggerRemoveBreakGlassControlActionTrigger.1;
        updatedOperations   := triggerRemoveBreakGlassControlActionTrigger.0;
    } else skip;
        
    // update break glass action record status
    var updatedActionRecord : councilActionRecordType := actionRecord;
    updatedActionRecord.status              := "EXECUTED";
    updatedActionRecord.executed            := True;
    updatedActionRecord.executedDateTime    := Some(Mavryk.get_now());
    updatedActionRecord.executedLevel       := Some(Mavryk.get_level());
    
    // save break glass action record
    s.actionsLedger[actionId]         := updatedActionRecord;

} with (updatedOperations, s)

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
            Some(f) -> f((breakGlassLambdaAction, s))
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
