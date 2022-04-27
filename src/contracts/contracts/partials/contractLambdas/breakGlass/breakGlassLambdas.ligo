// ------------------------------------------------------------------------------
//
// Break Glass Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass lambda *)
function lambdaBreakGlass(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Steps Overview:
    // 1. set contract admins to breakglass address - should be done in emergency governance?
    // 2. send pause all operations to main contracts

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);

    case breakGlassLambdaAction of [
        | LambdaBreakGlass(_parameters) -> {
                s.glassBroken := True; // break glass to give council members access to protected entrypoints
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType;  var s : breakGlassStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case breakGlassLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const breakGlassLambdaAction : breakGlassLambdaActionType;  var s : breakGlassStorage) : return is
block {
    
    checkSenderIsGovernance(s);

    case breakGlassLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is
block {
    
    checkSenderIsAdmin(s); 

    case breakGlassLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda  *)
function lambdaUpdateConfig(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {
  
    checkSenderIsAdmin(s); 
  
    case breakGlassLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : breakGlassUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : breakGlassUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                      ConfigThreshold (_v)                  -> if updateConfigNewValue > Set.cardinal(s.councilMembers) then failwith("Error. This config value cannot exceed the amount of members in the council") else s.config.threshold                 := updateConfigNewValue
                    | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
                    | ConfigCouncilNameMaxLength (_v)       -> s.config.councilMemberNameMaxLength        := updateConfigNewValue  
                    | ConfigCouncilWebsiteMaxLength (_v)    -> s.config.councilMemberWebsiteMaxLength     := updateConfigNewValue  
                    | ConfigCouncilImageMaxLength (_v)      -> s.config.councilMemberImageMaxLength       := updateConfigNewValue  
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const breakGlassLambdaAction : breakGlassLambdaActionType; var s: breakGlassStorage): return is
block {

    checkSenderIsAdmin(s);

    case breakGlassLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const breakGlassLambdaAction : breakGlassLambdaActionType; var s: breakGlassStorage): return is
block {

    checkSenderIsAdmin(s);

    case breakGlassLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateCouncilMemberInfo lambda - update the info of a council member *)
function lambdaUpdateCouncilMemberInfo(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is
block {

    case breakGlassLambdaAction of [
        | LambdaUpdateCouncilMemberInfo(councilMemberInfo) -> {

                // Check if sender is a member of the council
                var councilMember: councilMemberInfoType := case Map.find_opt(Tezos.sender, s.councilMembers) of [
                        Some (_info) -> _info
                    |   None         -> failwith("Error. You are not a member of the council")
                ];
                
                // Update member info
                councilMember.name      := councilMemberInfo.name;
                councilMember.website   := councilMemberInfo.website;
                councilMember.image     := councilMemberInfo.image;

                // Update storage
                s.councilMembers[Tezos.sender]  := councilMember;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Council Actions Begin - Internal Control of Council Members
// ------------------------------------------------------------------------------

(*  addCouncilMember lambda  *)
function lambdaAddCouncilMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaAddCouncilMember(newCouncilMember) -> {
                
                // Check if new council member is already in the council
                if Map.mem(newCouncilMember.memberAddress, s.councilMembers) then failwith("Error. The provided council member is already in the council")
                else skip;

                // Validate inputs
                if String.length(newCouncilMember.memberName) > s.config.councilMemberNameMaxLength then failwith("Error. Council member name too long") else skip;
                if String.length(newCouncilMember.memberImage) > s.config.councilMemberImageMaxLength then failwith("Error. Council member image link too long") else skip;
                if String.length(newCouncilMember.memberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith("Error. Council member website link too long") else skip;

                const addressMap : addressMapType     = map [
                    ("councilMemberAddress" : string) -> newCouncilMember.memberAddress;
                ];
                const stringMap : stringMapType      = map [
                    ("councilMemberName": string) -> newCouncilMember.memberName;
                    ("councilMemberImage": string) -> newCouncilMember.memberImage;
                    ("councilMemberWebsite": string) -> newCouncilMember.memberWebsite
                ];
                const emptyNatMap : natMapType       = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "addCouncilMember";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = addressMap;
                    stringMap             = stringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  removeCouncilMember lambda  *)
function lambdaRemoveCouncilMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaRemoveCouncilMember(councilMemberAddress) -> {
                
                // Check if council member is in the council
                if not Map.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is not in the council")
                else skip;

                // Check if removing the council member won't impact the threshold
                if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith("Error. Removing a council member will have an impact on the threshold. Try to adjust the threshold first.")
                else skip;

                const addressMap : addressMapType     = map [
                    ("councilMemberAddress"         : string) -> councilMemberAddress;
                ];
                const emptyStringMap : stringMapType  = map [];
                const emptyNatMap : natMapType        = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "removeCouncilMember";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = addressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;    

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  changeCouncilMember lambda  *)
function lambdaChangeCouncilMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaChangeCouncilMember(councilActionChangeMemberParams) -> {
                
                // Check if new council member is already in the council
                if Map.mem(councilActionChangeMemberParams.newCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided new council member is already in the council")
                else skip;
                // Validate inputs
                if String.length(councilActionChangeMemberParams.newCouncilMemberName) > s.config.councilMemberNameMaxLength then failwith("Error. Council member name too long") else skip;
                if String.length(councilActionChangeMemberParams.newCouncilMemberImage) > s.config.councilMemberImageMaxLength then failwith("Error. Council member image link too long") else skip;
                if String.length(councilActionChangeMemberParams.newCouncilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith("Error. Council member website link too long") else skip;

                // Check if old council member is in the council
                if not Map.mem(councilActionChangeMemberParams.oldCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided old council member is not in the council")
                else skip;

                const addressMap : addressMapType     = map [
                    ("oldCouncilMemberAddress"         : string) -> councilActionChangeMemberParams.oldCouncilMemberAddress;
                    ("newCouncilMemberAddress"         : string) -> councilActionChangeMemberParams.newCouncilMemberAddress;
                ];
                const stringMap : stringMapType      = map [
                    ("newCouncilMemberName"    : string)  -> councilActionChangeMemberParams.newCouncilMemberName;
                    ("newCouncilMemberWebsite" : string)  -> councilActionChangeMemberParams.newCouncilMemberWebsite;
                    ("newCouncilMemberImage"   : string)  -> councilActionChangeMemberParams.newCouncilMemberImage;
                ];
                const emptyNatMap : natMapType        = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "changeCouncilMember";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = addressMap;
                    stringMap             = stringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Break Glass Council Actions End - Internal Control of Council Members
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAllEntrypoints lambda  *)
function lambdaPauseAllEntrypoints(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaPauseAllEntrypoints(_parameters) -> {
                
                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const emptyNatMap      : natMapType          = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "pauseAllEntrypoints";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = emptyAddressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  unpauseAllEntrypoints lambda  *)
function lambdaUnpauseAllEntrypoints(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);        
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaUnpauseAllEntrypoints(_parameters) -> {
                
                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const emptyNatMap      : natMapType          = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "unpauseAllEntrypoints";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = emptyAddressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  propagateBreakGlass lambda  *)
function lambdaPropagateBreakGlass(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaPropagateBreakGlass(_parameters) -> {

                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType   = map [];
                const emptyNatMap      : natMapType      = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "propagateBreakGlass";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = emptyAddressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setSingleContractAdmin lambda  *)
function lambdaSetSingleContractAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaSetSingleContractAdmin(setSingleContractParams) -> {

                const newAdminAddress        : address = setSingleContractParams.newAdminAddress;
                const targetContractAddress  : address = setSingleContractParams.targetContractAddress;

                // Check if the provided contract has a setAdmin entrypoint
                const _checkEntrypoint: contract(address)    = setAdminInContract(targetContractAddress);

                // Check if the admin address is part of the whitelistDeveloper map
                const getWhitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                const whitelistDevelopers: whitelistDevelopersType = case getWhitelistDevelopersView of [
                    Some (value) -> value
                |   None -> failwith (error_VIEW_GET_WHITELIST_DEVELOPERS_NOT_FOUND)
                ];
                if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = s.governanceAddress or newAdminAddress = Tezos.self_address then skip
                else failwith(error_DEVELOPER_NOT_WHITELISTED);

                const addressMap   : addressMapType      = map [
                    ("newAdminAddress"       : string) -> newAdminAddress;
                    ("targetContractAddress" : string) -> targetContractAddress;
                ];
                const emptyStringMap   : stringMapType   = map [];
                const emptyNatMap      : natMapType      = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "setSingleContractAdmin";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = addressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setAllContractsAdmin lambda  *)
function lambdaSetAllContractsAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);          
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaSetAllContractsAdmin(newAdminAddress) -> {

                // Check if the admin address is part of the whitelistDeveloper map
                const getWhitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                const whitelistDevelopers: whitelistDevelopersType = case getWhitelistDevelopersView of [
                    Some (value) -> value
                |   None -> failwith (error_VIEW_GET_WHITELIST_DEVELOPERS_NOT_FOUND)
                ];                
                if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = s.governanceAddress or newAdminAddress = Tezos.self_address then skip
                else failwith(error_DEVELOPER_NOT_WHITELISTED);
                
                const addressMap   : addressMapType      = map [
                    ("newAdminAddress" : string) -> newAdminAddress;
                ];
                const emptyStringMap   : stringMapType   = map [];
                const emptyNatMap  : natMapType          = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "setAllContractsAdmin";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = addressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  removeBreakGlassControl lambda  *)
function lambdaRemoveBreakGlassControl(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that glass has been broken
    // 2. Check that sender is a council member
    // 3. Create and save new action record, set the sender as a signer of the action
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaRemoveBreakGlassControl(_parameters) -> {
                
                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const emptyNatMap      : natMapType          = map [];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "removeBreakGlassControl";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = emptyAddressMap;
                    stringMap             = emptyStringMap;
                    natMap                = emptyNatMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Glass Broken Required Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction lambda  *)
function lambdaFlushAction(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {

    // Overall steps:
    // 1. Check that sender is a council member
    // 2. Create and save new action record, set the sender as a signer of the action
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaFlushAction(actionId) -> {
                
                // Check if actionId exist
                const actionToFlush: actionRecordType = case Big_map.find_opt(actionId, s.actionsLedger) of [
                        Some (_action) -> _action
                    |   None           -> failwith("Error. There is no action linked to this actionId")
                ];

                // Check if action was previously flushed or executed
                if actionToFlush.executed then failwith("Error. This action was executed, it cannot be flushed")
                else skip;

                if actionToFlush.status = "FLUSHED" then failwith("Error. This action was flushed, it cannot be flushed again")
                else skip;

                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const natMap           : natMapType          = map [
                    ("actionId" : string) -> actionId;
                ];

                var actionRecord : actionRecordType := record[

                    initiator             = Tezos.sender;
                    status                = "PENDING";
                    actionType            = "flushAction";
                    executed              = False;

                    signers               = set[Tezos.sender];
                    signersCount          = 1n;

                    addressMap            = emptyAddressMap;
                    stringMap             = emptyStringMap;
                    natMap                = natMap;

                    startDateTime         = Tezos.now;
                    startLevel            = Tezos.level;             
                    executedDateTime      = Tezos.now;
                    executedLevel         = Tezos.level;
                    expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
                ];
                s.actionsLedger[s.actionCounter] := actionRecord; 

                // increment action counter
                s.actionCounter := s.actionCounter + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  signAction lambda  *)
function lambdaSignAction(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorage) : return is 
block {
    
    checkSenderIsCouncilMember(s);

    var operations : list(operation) := nil;

    case breakGlassLambdaAction of [
        | LambdaSignAction(actionId) -> {
                
                var _actionRecord : actionRecordType := case s.actionsLedger[actionId] of [
                    | Some(_record) -> _record
                    | None -> failwith("Error. Break Glass action record not found.")
                ];

                // check if break glass action has been flushed
                if _actionRecord.status = "FLUSHED" then failwith("Error. Break Glass action has been flushed") else skip;

                if Tezos.now > _actionRecord.expirationDateTime then failwith("Error. Break Glass action has expired") else skip;

                // check if signer already signed
                if Set.mem(Tezos.sender, _actionRecord.signers) then failwith("Error. Sender has already signed this break glass action") else skip;

                // update signers and signersCount for break glass action record
                var signersCount : nat             := _actionRecord.signersCount + 1n;
                _actionRecord.signersCount         := signersCount;
                _actionRecord.signers              := Set.add(Tezos.sender, _actionRecord.signers);
                s.actionsLedger[actionId]          := _actionRecord;

                const actionType : string = _actionRecord.actionType;

                // check if threshold has been reached
                if signersCount >= s.config.threshold and not _actionRecord.executed then block {
                    
                    // --------------------------------------
                    // execute action based on action types
                    // --------------------------------------

                    // flush action type
                    if actionType = "flushAction" then block {

                        // fetch params begin ---
                        const flushedActionId : nat = case _actionRecord.natMap["actionId"] of [
                            Some(_nat) -> _nat
                            | None -> failwith("Error. ActionId not found.")
                        ];
                        // fetch params end ---

                        var flushedActionRecord : actionRecordType := case s.actionsLedger[flushedActionId] of [     
                            Some(_record) -> _record
                            | None -> failwith("Error. Action not found")
                        ];

                        // Check if action was previously flushed or executed
                        if flushedActionRecord.executed then failwith("Error. This action was executed, it cannot be flushed")
                        else skip;

                        if flushedActionRecord.status = "FLUSHED" then failwith("Error. This action was flushed, it cannot be flushed again")
                        else skip;

                        flushedActionRecord.status := "FLUSHED";
                        s.actionsLedger[flushedActionId] := flushedActionRecord;

                    } else skip;



                    // addCouncilMember action type
                    if actionType = "addCouncilMember" then block {

                        // fetch params begin ---
                        const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of [
                            Some(_address) -> _address
                            | None -> failwith("Error. CouncilMemberAddress not found.")
                        ];

                        const councilMemberName : string = case _actionRecord.stringMap["councilMemberName"] of [
                            Some(_string) -> _string
                            | None -> failwith("Error. CouncilMemberName not found.")
                        ];

                        const councilMemberImage : string = case _actionRecord.stringMap["councilMemberImage"] of [
                            Some(_string) -> _string
                            | None -> failwith("Error. CouncilMemberImage not found.")
                        ];

                        const councilMemberWebsite : string = case _actionRecord.stringMap["councilMemberWebsite"] of [
                            Some(_string) -> _string
                            | None -> failwith("Error. CouncilMemberWebsite not found.")
                        ];
                        // fetch params end ---

                        
                        
                        // Validate inputs
                        if String.length(councilMemberName) > s.config.councilMemberNameMaxLength then failwith("Error. Council member name too long") else skip;
                        if String.length(councilMemberImage) > s.config.councilMemberImageMaxLength then failwith("Error. Council member image link too long") else skip;
                        if String.length(councilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith("Error. Council member website link too long") else skip;

                        const councilMemberInfo: councilMemberInfoType  = record[
                            name    = councilMemberName;
                            image   = councilMemberImage;
                            website = councilMemberWebsite;
                        ];

                        // Check if new council member is already in the council
                        if Map.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is already in the council")
                        else s.councilMembers := Map.add(councilMemberAddress, councilMemberInfo, s.councilMembers);

                    } else skip;



                    // removeCouncilMember action type
                    if actionType = "removeCouncilMember" then block {
                        // fetch params begin ---
                        const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of [
                            Some(_address) -> _address
                            | None -> failwith("Error. CouncilMemberAddress not found.")
                        ];
                        // fetch params end ---

                        // Check if council member is in the council
                        if not Map.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is not in the council")
                        else skip;

                        // Check if removing the council member won't impact the threshold
                        if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith("Error. Removing a council member will have an impact on the threshold. Try to adjust the threshold first.")
                        else skip;

                        s.councilMembers := Map.remove(councilMemberAddress, s.councilMembers);
                    } else skip;



                    // changeCouncilMember action type
                    if actionType = "changeCouncilMember" then block {

                        // fetch params begin ---
                        const oldCouncilMemberAddress : address = case _actionRecord.addressMap["oldCouncilMemberAddress"] of [
                            Some(_address) -> _address
                            | None -> failwith("Error. OldCouncilMemberAddress not found.")
                        ];

                        const newCouncilMemberAddress : address = case _actionRecord.addressMap["newCouncilMemberAddress"] of [
                            Some(_address) -> _address
                            | None -> failwith("Error. NewCouncilMemberAddress not found.")
                        ];

                        const councilMemberName : string = case _actionRecord.stringMap["newCouncilMemberName"] of [
                            Some(_string) -> _string
                            | None -> failwith("Error. CouncilMemberName not found.")
                        ];

                        const councilMemberImage : string = case _actionRecord.stringMap["newCouncilMemberImage"] of [
                            Some(_string) -> _string
                            | None -> failwith("Error. CouncilMemberImage not found.")
                        ];

                        const councilMemberWebsite : string = case _actionRecord.stringMap["newCouncilMemberWebsite"] of [
                            Some(_string) -> _string
                            | None -> failwith("Error. CouncilMemberWebsite not found.")
                        ];
                        // fetch params end ---

                        // Validate inputs
                        if String.length(councilMemberName) > s.config.councilMemberNameMaxLength then failwith("Error. Council member name too long") else skip;
                        if String.length(councilMemberImage) > s.config.councilMemberImageMaxLength then failwith("Error. Council member image link too long") else skip;
                        if String.length(councilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith("Error. Council member website link too long") else skip;

                        // Check if new council member is already in the council
                        if Map.mem(newCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided new council member is already in the council")
                        else skip;

                        // Check if old council member is in the council
                        if not Map.mem(oldCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided old council member is not in the council")
                        else skip;

                        const councilMemberInfo: councilMemberInfoType  = record[
                            name=councilMemberName;
                            image=councilMemberImage;
                            website=councilMemberWebsite;
                        ];

                        s.councilMembers := Map.add(newCouncilMemberAddress, councilMemberInfo, s.councilMembers);
                        s.councilMembers := Map.remove(oldCouncilMemberAddress, s.councilMembers);
                    } else skip;



                    // pauseAllEntrypoints action type
                    if actionType = "pauseAllEntrypoints" then block {

                        checkGlassIsBroken(s);          // check that glass is broken

                        for _contractName -> contractAddress in map s.generalContracts block {
                            case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                                Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                            |   None -> skip
                            ];
                        };      
                    } else skip;



                    // unpauseAllEntrypoints action type
                    if actionType = "unpauseAllEntrypoints" then block {

                        checkGlassIsBroken(s);          // check that glass is broken

                        for _contractName -> contractAddress in map s.generalContracts block {
                            case (Tezos.get_entrypoint_opt("%unpauseAll", contractAddress) : option(contract(unit))) of [
                                    Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                                |   None -> skip
                            ];
                        };            
                    } else skip;



                    // propagateBreakGlass action type
                    if actionType = "propagateBreakGlass" then block {

                        checkGlassIsBroken(s);          // check that glass is broken

                        const propagateBreakGlassEntrypoint: contract(unit) = case (Tezos.get_entrypoint_opt("%propagateBreakGlass", s.governanceAddress) : option(contract(unit))) of [
                            Some (contr)        -> contr
                        |   None                -> failwith("Error. PropagateBreakGlass entrypoint not found in the governance contract")
                        ];
                        const propagateBreakGlassOperation : operation = Tezos.transaction(
                            unit, 
                            0tez, 
                            propagateBreakGlassEntrypoint
                        );
                        operations := propagateBreakGlassOperation # operations;

                    } else skip;



                    // setSingleContractAdmin action type
                    if actionType = "setSingleContractAdmin" then block {

                        checkGlassIsBroken(s);          // check that glass is broken

                        // fetch params begin ---
                        const newAdminAddress : address = case _actionRecord.addressMap["newAdminAddress"] of [
                              Some(_address) -> _address
                            | None -> failwith("Error. NewAdminAddress not found.")
                        ];

                        const targetContractAddress : address = case _actionRecord.addressMap["targetContractAddress"] of [
                              Some(_address) -> _address
                            | None -> failwith("Error. TargetContractAddress not found.")
                        ];
                        // fetch params end ---

                        // Check if the admin address is part of the whitelistDeveloper map
                        const getWhitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                        const whitelistDevelopers: whitelistDevelopersType = case getWhitelistDevelopersView of [
                            Some (value) -> value
                        |   None -> failwith (error_VIEW_GET_WHITELIST_DEVELOPERS_NOT_FOUND)
                        ];
                        if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = s.governanceAddress or newAdminAddress = Tezos.self_address then skip
                        else failwith(error_DEVELOPER_NOT_WHITELISTED);

                        const setSingleContractAdminOperation : operation = Tezos.transaction(
                            newAdminAddress, 
                            0tez, 
                            setAdminInContract(targetContractAddress)
                        );
                        operations := setSingleContractAdminOperation # operations;

                    } else skip;



                    // setAllContractsAdmin action type
                    if actionType = "setAllContractsAdmin" then block {

                        checkGlassIsBroken(s);          // check that glass is broken

                        // fetch params begin ---
                        const newAdminAddress : address = case _actionRecord.addressMap["newAdminAddress"] of [
                                Some(_address) -> _address
                            |   None -> failwith("Error. NewAdminAddress not found.")
                        ];
                        // fetch params end ---

                        // Check if the admin address is part of the whitelistDeveloper map
                        const getWhitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                        const whitelistDevelopers: whitelistDevelopersType = case getWhitelistDevelopersView of [
                            Some (value) -> value
                        |   None -> failwith (error_VIEW_GET_WHITELIST_DEVELOPERS_NOT_FOUND)
                        ];
                        if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = s.governanceAddress or newAdminAddress = Tezos.self_address then skip
                        else failwith(error_DEVELOPER_NOT_WHITELISTED);

                        // Set self as contract admin
                        s.admin := newAdminAddress;

                        // Set all contracts in generalContracts map to given address
                        for _contractName -> contractAddress in map s.generalContracts block {
                            case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
                                    Some(contr) -> operations := Tezos.transaction(newAdminAddress, 0tez, contr) # operations
                                |   None -> skip
                            ];
                        } 
                    } else skip;



                    // removeBreakGlassControl action type
                    if actionType = "removeBreakGlassControl" then block {
                        // remove break glass control on contract
                        // ensure settings (entrypoints unpaused, admin reset to governance dao) has been done
                        checkGlassIsBroken(s);          // check that glass is broken

                        // Reset all contracts admin to governance contract
                        s.admin := s.governanceAddress;

                        for _contractName -> contractAddress in map s.generalContracts block {
                            case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
                                    Some(contr) -> operations := Tezos.transaction(s.governanceAddress, 0tez, contr) # operations
                                |   None -> skip
                            ];
                        };

                        // Reset glassBroken
                        s.glassBroken := False;

                    } else skip;
                        
                    // update break glass action record status
                    _actionRecord.status              := "EXECUTED";
                    _actionRecord.executed            := True;
                    _actionRecord.executedDateTime    := Tezos.now;
                    _actionRecord.executedLevel       := Tezos.level;
                    
                    // save break glass action record
                    s.actionsLedger[actionId]         := _actionRecord;

                } else skip;    


            }
        | _ -> skip
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
