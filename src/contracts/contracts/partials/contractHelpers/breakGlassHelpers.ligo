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
    
    if Big_map.mem(Tezos.get_sender(), s.councilMembers) then skip
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
    case (Tezos.get_entrypoint_opt(
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
    if Tezos.get_now() > actionRecord.expirationDateTime then failwith(error_COUNCIL_ACTION_EXPIRED) else skip;

} with (unit)



// helper funtion to get governance proxy address directly from the Governance Contract
function getGovernanceProxyAddress(const s : breakGlassStorageType) : address is
block {

    const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
    const governanceProxyAddress : address = case governanceProxyAddressView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with governanceProxyAddress


// helper function to get general contracts map from the Governance Contract
function getGeneralContractsMap(const s : breakGlassStorageType) : generalContractsType is 
block {

    // Get General Contracts map from the Governance Contract
    const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
    const generalContracts : generalContractsType = case generalContractsView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with generalContracts



// helper function to get whitelist developers map from the Governance Contract
function getWhitelistDevelopersMap(const s : breakGlassStorageType) : whitelistDevelopersType is 
block {

    // Get Whitelist Developers map from the Governance Contract
    const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
    const whitelistDevelopers : whitelistDevelopersType = case whitelistDevelopersView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with whitelistDevelopers



// helper function to verify valid new admin address
function verifyValidAdminAddress(const newAdminAddress : address; const whitelistDevelopers : whitelistDevelopersType; const governanceProxyAddress : address) : unit is 
block {

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.get_self_address() or newAdminAddress = governanceProxyAddress then skip
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

        initiator             = Tezos.get_sender();
        status                = "PENDING";
        actionType            = actionType;
        executed              = False;

        signers               = set[Tezos.get_sender()];
        signersCount          = 1n;

        dataMap               = dataMap;

        startDateTime         = Tezos.get_now();
        startLevel            = Tezos.get_level();             
        executedDateTime      = Tezos.get_now();
        executedLevel         = Tezos.get_level();
        expirationDateTime    = Tezos.get_now() + (86_400 * s.config.actionExpiryDays);
    ];
    s.actionsLedger[s.actionCounter] := actionRecord; 

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
function propagateBreakGlassOperation(const s : breakGlassStorageType) : operation is 
block {

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

} with propagateBreakGlassOperation



// helper function for setSingleContractAdmin
function setSingleContractAdminOperation(const newAdminAddress : address; const targetContractAddress : address) : operation is 
block {

    const setSingleContractAdminOperation : operation = Tezos.transaction(
        newAdminAddress, 
        0tez, 
        setAdminInContract(targetContractAddress)
    );

} with setSingleContractAdminOperation 


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
function triggerPauseAllEntrypointsAction(var operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // Get General Contracts map from the Governance Contract
    const generalContracts : generalContractsType = getGeneralContractsMap(s);

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
    const generalContracts : generalContractsType = getGeneralContractsMap(s);

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

    // Create operation to trigger propagateBreakGlass entrypoint on the Governance Contract
    const propagateBreakGlassOperation : operation = propagateBreakGlassOperation(s);

    operations := propagateBreakGlassOperation # operations;

} with (operations)



// helper function to trigger the set single contract admin action during the sign
function triggerSetSingleContractAdminAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : breakGlassStorageType) : list(operation) is 
block {
    
    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const newAdminAddress        : address = unpackAddress(actionRecord, "newAdminAddress");
    const targetContractAddress  : address = unpackAddress(actionRecord, "targetContractAddress");
    // fetch params end ---

    // Get Whitelist Developers map from the Governance Contract
    const whitelistDevelopers : whitelistDevelopersType = getWhitelistDevelopersMap(s);

    // Get Governance Proxy Contract address directly from the Governance Contract
    const governanceProxyAddress : address = getGovernanceProxyAddress(s);

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    verifyValidAdminAddress(newAdminAddress, whitelistDevelopers, governanceProxyAddress);
    
    // Create operation to set admin on specified contract
    const setSingleContractAdminOperation : operation = setSingleContractAdminOperation(newAdminAddress, targetContractAddress);

    operations := setSingleContractAdminOperation # operations;

} with (operations)



// helper function to trigger the all contracts admin action during the sign
function triggerSetAllContractsAdminAction(const actionRecord : councilActionRecordType; var operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // check that glass is broken
    checkGlassIsBroken(s);

    // fetch params begin ---
    const newAdminAddress : address = unpackAddress(actionRecord, "newAdminAddress");
    // fetch params end ---

    // Get Whitelist Developers map from the Governance Contract
    const whitelistDevelopers : whitelistDevelopersType = getWhitelistDevelopersMap(s);

    // Get Governance Proxy Contract address directly from the Governance Contract
    const governanceProxyAddress : address = getGovernanceProxyAddress(s);

    // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    verifyValidAdminAddress(newAdminAddress, whitelistDevelopers, governanceProxyAddress);

    // Set new contract admin of the Break Glass contract
    s.admin := newAdminAddress;

    // -----------------
    // Set all contracts in generalContracts map to new admin address
    // -----------------

    // Get General Contracts map from the Governance Contract
    var generalContracts : generalContractsType := getGeneralContractsMap(s);

    // Add Governance contract to the general contracts map if it doesn't exist
    generalContracts["governance"] := case generalContracts["governance"] of [
            Some(_v) -> _v
        |   None     -> s.governanceAddress
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

} with (operations, s)



// helper function to trigger the remove break glass control action during the sign
function triggerRemoveBreakGlassControlAction(var operations : list(operation); var s : breakGlassStorageType) : return is 
block {

    // remove access to protected Break Glass entrypoints                        
    // N.B. important to ensure proper settings configuration has been done before this entrypoint is triggered
    //   - relevant entrypoints unpaused, admin set to Break Glass Contract

    checkGlassIsBroken(s); // check that glass is broken

    // Get Governance Proxy Contract address directly from the Governance Contract
    const governanceProxyAddress : address = getGovernanceProxyAddress(s);

    // Set admin of the Break Glass contract to the Governance Proxy Contract
    s.admin := governanceProxyAddress;

    // Get General Contracts map from the Governance Contract
    var generalContracts : generalContractsType := getGeneralContractsMap(s);

    // Add Governance contract to the general contracts map if it doesn't exist
    generalContracts["governance"] := case generalContracts["governance"] of [
            Some(_v) -> _v
        |   None     -> s.governanceAddress
    ];

    // Create a set to remove duplicate contract addresses (as General Contracts map may contain duplicate addresses)
    var uniqueContracts : set(address) := (Set.empty: set(address));

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
        const triggerSetAllContractsAdminActionTrigger : return       = triggerSetAllContractsAdminAction(actionRecord, operations, s);
        s            := triggerSetAllContractsAdminActionTrigger.1;
        operations   := triggerSetAllContractsAdminActionTrigger.0;
    } else skip;

    // removeBreakGlassControl action type
    if actionType = "removeBreakGlassControl" then block {
        const triggerRemoveBreakGlassControlActionTrigger : return    = triggerRemoveBreakGlassControlAction(operations, s);
        s            := triggerRemoveBreakGlassControlActionTrigger.1;
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
