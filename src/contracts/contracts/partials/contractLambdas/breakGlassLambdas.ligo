// ------------------------------------------------------------------------------
//
// Break Glass Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass lambda *)
function lambdaBreakGlass(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:    
    // 1. Check that sender is from the Emergency Governance Contract
    // 2. Set glassBroken boolean to True -> this will allow access to protected entrypoints (e.g. propagateBreakGlass entrypoint)

    verifySenderIsEmergencyGovernanceContract(s);

    case breakGlassLambdaAction of [
        |   LambdaBreakGlass(_parameters) -> {
                s.glassBroken := True; 
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType;  var s : breakGlassStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case breakGlassLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const breakGlassLambdaAction : breakGlassLambdaActionType;  var s : breakGlassStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case breakGlassLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {
    
    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    case breakGlassLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda  *)
function lambdaUpdateConfig(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {
  
    // verify that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case breakGlassLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : breakGlassUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : breakGlassUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigThreshold (_v)                  -> if updateConfigNewValue > s.councilSize then failwith(error_COUNCIL_SIZE_EXCEEDED) else s.config.threshold                 := updateConfigNewValue
                    |   ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays                  := updateConfigNewValue  
                    |   ConfigCouncilNameMaxLength (_v)       -> s.config.councilMemberNameMaxLength        := updateConfigNewValue  
                    |   ConfigCouncilWebsiteMaxLength (_v)    -> s.config.councilMemberWebsiteMaxLength     := updateConfigNewValue  
                    |   ConfigCouncilImageMaxLength (_v)      -> s.config.councilMemberImageMaxLength       := updateConfigNewValue  
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // verify that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case breakGlassLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // verify that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case breakGlassLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case breakGlassLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers)
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  updateCouncilMemberInfo lambda - update the info of a council member *)
function lambdaUpdateCouncilMemberInfo(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check if sender is a Break Glass Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Update Council Member info with new info provided

    case breakGlassLambdaAction of [
        |   LambdaUpdateCouncilMemberInfo(councilMemberInfo) -> {

                // Check if sender is a member of the council
                var councilMember : councilMemberInfoType := case Big_map.find_opt(Tezos.get_sender(), s.councilMembers) of [
                        Some (_info) -> _info
                    |   None         -> failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED)
                ];

                // Validate inputs
                validateStringLength(councilMemberInfo.name       , s.config.councilMemberNameMaxLength       , error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilMemberInfo.image      , s.config.councilMemberImageMaxLength      , error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilMemberInfo.website    , s.config.councilMemberWebsiteMaxLength    , error_WRONG_INPUT_PROVIDED);
                
                // Update member info
                councilMember.name      := councilMemberInfo.name;
                councilMember.website   := councilMemberInfo.website;
                councilMember.image     := councilMemberInfo.image;

                // Update storage
                s.councilMembers[Tezos.get_sender()]  := councilMember;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Council Actions Begin - Internal Control of Council Members
// ------------------------------------------------------------------------------

(*  councilActionAddMember lambda  *)
function lambdaCouncilAddMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check if new Council Member to be added is not already in the Council 
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: addCouncilMember
    // 5. Increment action counter

    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaCouncilAddMember(newCouncilMember) -> {
                
                // Validate inputs
                validateStringLength(newCouncilMember.memberName       , s.config.councilMemberNameMaxLength       , error_WRONG_INPUT_PROVIDED);
                validateStringLength(newCouncilMember.memberImage      , s.config.councilMemberImageMaxLength      , error_WRONG_INPUT_PROVIDED);
                validateStringLength(newCouncilMember.memberWebsite    , s.config.councilMemberWebsiteMaxLength    , error_WRONG_INPUT_PROVIDED);
                
                // Verify that new council member does not exist in the council
                verifyCouncilMemberDoesNotExist(newCouncilMember.memberAddress, s);

                const dataMap : dataMapType = map [
                    ("councilMemberAddress"  : string) -> Bytes.pack(newCouncilMember.memberAddress);
                    ("councilMemberName"     : string) -> Bytes.pack(newCouncilMember.memberName);
                    ("councilMemberImage"    : string) -> Bytes.pack(newCouncilMember.memberImage);
                    ("councilMemberWebsite"  : string) -> Bytes.pack(newCouncilMember.memberWebsite);
                ];

                // create break glass action
                s   := createBreakGlassAction(
                    "addCouncilMember",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRemoveMember lambda  *)
function lambdaCouncilRemoveMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Check that Address to be removed is a Council Member
    // 3. Check that Council (Signing) Threshold will not be affected with the removal of the Council Member
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeCouncilMember
    // 4. Increment action counter

    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaCouncilRemoveMember(councilMemberAddress) -> {
                
                // Verify that council member is in the council
                verifyCouncilMemberExists(councilMemberAddress, s);

                // Verify that removing the council member won't impact the threshold
                verifyValidCouncilThreshold(s);

                const dataMap : dataMapType = map [
                    ("councilMemberAddress" : string) -> Bytes.pack(councilMemberAddress);
                ];

                // create break glass action
                s := createBreakGlassAction(
                    "removeCouncilMember",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionChangeMember lambda  *)
function lambdaCouncilChangeMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check that new Council Member to be added is not already in the Council
    // 4. Check that old Council Member to be removed is in the Council
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: changeCouncilMember
    // 6. Increment action counter

    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaCouncilChangeMember(councilActionChangeMemberParams) -> {
                
                // Validate inputs
                validateStringLength(councilActionChangeMemberParams.newCouncilMemberName       , s.config.councilMemberNameMaxLength       , error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilActionChangeMemberParams.newCouncilMemberImage      , s.config.councilMemberImageMaxLength      , error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilActionChangeMemberParams.newCouncilMemberWebsite    , s.config.councilMemberWebsiteMaxLength    , error_WRONG_INPUT_PROVIDED);

                // Verify that new council member is not in the council
                verifyCouncilMemberDoesNotExist(councilActionChangeMemberParams.newCouncilMemberAddress, s);
                
                // Verify that old council member is in the council
                verifyCouncilMemberExists(councilActionChangeMemberParams.oldCouncilMemberAddress, s);

                const dataMap : dataMapType = map [
                    ("oldCouncilMemberAddress"  : string)  -> Bytes.pack(councilActionChangeMemberParams.oldCouncilMemberAddress);
                    ("newCouncilMemberAddress"  : string)  -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberAddress);
                    ("newCouncilMemberName"     : string)  -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberName);
                    ("newCouncilMemberWebsite"  : string)  -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberWebsite);
                    ("newCouncilMemberImage"    : string)  -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberImage);
                ];

                // create break glass action
                s := createBreakGlassAction(
                    "changeCouncilMember",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Break Glass Council Actions End - Internal Control of Council Members
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAllEntrypoints lambda  *)
function lambdaPauseAllEntrypoints(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: pauseAllEntrypoints
    // 4. Increment action counter

    checkGlassIsBroken(s);          
    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaPauseAllEntrypoints(_parameters) -> {

                // create break glass action
                s := createBreakGlassAction(
                    "pauseAllEntrypoints",
                    emptyDataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  unpauseAllEntrypoints lambda  *)
function lambdaUnpauseAllEntrypoints(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: unpauseAllEntrypoints
    // 4. Increment action counter

    checkGlassIsBroken(s);        
    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaUnpauseAllEntrypoints(_parameters) -> {

                // create break glass action
                s := createBreakGlassAction(
                    "unpauseAllEntrypoints",
                    emptyDataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  propagateBreakGlass lambda  *)
function lambdaPropagateBreakGlass(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: propagateBreakGlass
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaPropagateBreakGlass(_parameters) -> {

                // create break glass action
                s := createBreakGlassAction(
                    "propagateBreakGlass",
                    emptyDataMap,
                    s
                );
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setSingleContractAdmin lambda  *)
function lambdaSetSingleContractAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Check if the provided contract has a setAdmin entrypoint
    // 4. Check if the provided new admin address is allowed
    //    - Get whitelist developers map from the Governance Contract
    //    - Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
    //    - Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: setSingleContractAdmin
    // 6. Increment action counter

    checkGlassIsBroken(s);         
    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaSetSingleContractAdmin(setSingleContractParams) -> {

                const newAdminAddress        : address = setSingleContractParams.newContractAdmin;
                const targetContractAddress  : address = setSingleContractParams.targetContractAddress;

                // Check if the provided contract has a setAdmin entrypoint
                const _checkEntrypoint: contract(address) = setAdminInContract(targetContractAddress);

                // Get Whitelist Developers map from the Governance Contract
                const whitelistDevelopers : whitelistDevelopersType = getWhitelistDevelopersMap(s);

                // Get Governance Proxy Contract address directly from the Governance Contract
                const governanceProxyAddress : address = getGovernanceProxyAddress(s);

                // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
                verifyValidAdminAddress(newAdminAddress, whitelistDevelopers, governanceProxyAddress);

                const dataMap : dataMapType = map [
                    ("newAdminAddress"       : string) -> Bytes.pack(newAdminAddress);
                    ("targetContractAddress" : string) -> Bytes.pack(targetContractAddress);
                ];

                // create break glass action
                s := createBreakGlassAction(
                    "setSingleContractAdmin",
                    dataMap,
                    s
                );
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setAllContractsAdmin lambda  *)
function lambdaSetAllContractsAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Check if the provided new admin address is allowed
    //    - Get whitelist developers map from the Governance Contract
    //    - Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
    //    - Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: setAllContractsAdmin
    // 5. Increment action counter

    checkGlassIsBroken(s);          
    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaSetAllContractsAdmin(newAdminAddress) -> {

                // Get Whitelist Developers map from the Governance Contract
                const whitelistDevelopers : whitelistDevelopersType = getWhitelistDevelopersMap(s);

                // Get Governance Proxy Contract address directly from the Governance Contract
                const governanceProxyAddress : address = getGovernanceProxyAddress(s);

                // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
                verifyValidAdminAddress(newAdminAddress, whitelistDevelopers, governanceProxyAddress);
                
                const dataMap : dataMapType = map [
                    ("newAdminAddress" : string) -> Bytes.pack(newAdminAddress);
                ];

                // create break glass action
                s := createBreakGlassAction(
                    "setAllContractsAdmin",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  removeBreakGlassControl lambda  *)
function lambdaRemoveBreakGlassControl(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeBreakGlassControl
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaRemoveBreakGlassControl(_parameters) -> {

                // create break glass action
                s := createBreakGlassAction(
                    "removeBreakGlassControl",
                    emptyDataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction lambda  *)
function lambdaFlushAction(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Check if action to be flushed exists
    // 3. Check if action has already been flushed or executed
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: flushAction
    // 5. Increment action counter

    verifySenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        |   LambdaFlushAction(actionId) -> {
                
                // Check if action to be flushed exists
                const actionToFlush : councilActionRecordType = getCouncilActionRecord(actionId, s);

                // Check if action has already been flushed or executed
                validateAction(actionToFlush);

                const dataMap : dataMapType = map [
                    ("actionId" : string) -> Bytes.pack(actionId);
                ];

                // create break glass action
                s := createBreakGlassAction(
                    "flushAction",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  signAction lambda  *)
function lambdaSignAction(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Check if action exists
    //      - check that break glass action has not been flushed
    //      - check that break glass action has not expired
    //      - check if council member has already signed for this action
    // 3. Update signers and signersCount for Break Glass Council Action record
    // 4. Execute action if signers threshold has been reached     

    verifySenderIsCouncilMember(s);

    var operations : list(operation) := nil;

    case breakGlassLambdaAction of [
        |   LambdaSignAction(actionId) -> {
                
                // check if action exists
                var actionRecord : councilActionRecordType := getCouncilActionRecord(actionId, s);

                // check if council can sign the action
                validateAction(actionRecord);

                // check if council member has already signed for this action
                if Set.mem(Tezos.get_sender(), actionRecord.signers) then failwith(error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER) else skip;

                // update signers and signersCount for Break Glass Council Action  record
                var signersCount : nat             := actionRecord.signersCount + 1n;
                actionRecord.signersCount          := signersCount;
                actionRecord.signers               := Set.add(Tezos.get_sender(), actionRecord.signers);
                s.actionsLedger[actionId]          := actionRecord;

                // check if threshold has been reached
                if signersCount >= s.config.threshold and not actionRecord.executed then block {
                    const executeBreakGlassActionReturn : return   = executeBreakGlassAction(actionRecord, actionId, operations, s);
                    s           := executeBreakGlassActionReturn.1;
                    operations := executeBreakGlassActionReturn.0;
                } else skip;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Break Glass Lambdas End
//
// ------------------------------------------------------------------------------
