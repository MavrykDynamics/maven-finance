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

    checkSenderIsEmergencyGovernanceContract(s);

    case breakGlassLambdaAction of [
        | LambdaBreakGlass(_parameters) -> {
            s.glassBroken := True; 
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
function lambdaSetAdmin(const breakGlassLambdaAction : breakGlassLambdaActionType;  var s : breakGlassStorageType) : return is
block {
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case breakGlassLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
            s.admin := newAdminAddress;
          }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const breakGlassLambdaAction : breakGlassLambdaActionType;  var s : breakGlassStorageType) : return is
block {
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case breakGlassLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
            s.governanceAddress := newGovernanceAddress;
          }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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
function lambdaUpdateConfig(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {
  
    checkSenderIsAdmin(s); // check that sender is admin
  
    case breakGlassLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : breakGlassUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : breakGlassUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                      ConfigThreshold (_v)                  -> if updateConfigNewValue > Map.size(s.councilMembers) then failwith(error_COUNCIL_SIZE_EXCEEDED) else s.config.threshold                 := updateConfigNewValue
                    | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays                  := updateConfigNewValue  
                    | ConfigCouncilNameMaxLength (_v)       -> s.config.councilMemberNameMaxLength        := updateConfigNewValue  
                    | ConfigCouncilWebsiteMaxLength (_v)    -> s.config.councilMemberWebsiteMaxLength     := updateConfigNewValue  
                    | ConfigCouncilImageMaxLength (_v)      -> s.config.councilMemberImageMaxLength       := updateConfigNewValue  
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const breakGlassLambdaAction : breakGlassLambdaActionType; var s: breakGlassStorageType): return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case breakGlassLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
            s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
          }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const breakGlassLambdaAction : breakGlassLambdaActionType; var s: breakGlassStorageType): return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case breakGlassLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
            s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
          }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const breakGlassLambdaAction : breakGlassLambdaActionType; var s: breakGlassStorageType): return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case breakGlassLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    const transferTokenOperation : operation = case transferParam.token of [
                      | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                      | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
                      | Fa2(token)  -> transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        | _ -> skip
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
        | LambdaUpdateCouncilMemberInfo(councilMemberInfo) -> {

                // Check if sender is a member of the council
                var councilMember: councilMemberInfoType := case Map.find_opt(Tezos.sender, s.councilMembers) of [
                    Some (_info) -> _info
                  | None         -> failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED)
                ];

                // Validate inputs
                if String.length(councilMemberInfo.name)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilMemberInfo.image)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilMemberInfo.website) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
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
function lambdaAddCouncilMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check if new Council Member to be added is not already in the Council 
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: addCouncilMember
    // 5. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaAddCouncilMember(newCouncilMember) -> {
                
                // Validate inputs
                if String.length(newCouncilMember.memberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newCouncilMember.memberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newCouncilMember.memberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Check if new council member is already in the council
                if Map.mem(newCouncilMember.memberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
                else skip;

                const addressMap : addressMapType     = map [
                  ("councilMemberAddress"  : string) -> newCouncilMember.memberAddress;
                ];
                const stringMap : stringMapType      = map [
                  ("councilMemberName"     : string) -> newCouncilMember.memberName;
                  ("councilMemberImage"    : string) -> newCouncilMember.memberImage;
                  ("councilMemberWebsite"  : string) -> newCouncilMember.memberWebsite
                ];
                const emptyNatMap : natMapType       = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaRemoveCouncilMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Check that Address to be removed is a Council Member
    // 3. Check that Council (Signing) Threshold will not be affected with the removal of the Council Member
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeCouncilMember
    // 4. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaRemoveCouncilMember(councilMemberAddress) -> {
                
                // Check if council member is in the council
                if not Map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
                else skip;

                // Check if removing the council member won't impact the threshold
                if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
                else skip;

                const addressMap : addressMapType     = map [
                  ("councilMemberAddress"         : string) -> councilMemberAddress;
                ];
                const emptyStringMap : stringMapType  = map [];
                const emptyNatMap : natMapType        = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaChangeCouncilMember(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check that new Council Member to be added is not already in the Council
    // 4. Check that old Council Member to be removed is in the Council
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: changeCouncilMember
    // 6. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaChangeCouncilMember(councilActionChangeMemberParams) -> {
                
                // Validate inputs
                if String.length(councilActionChangeMemberParams.newCouncilMemberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilActionChangeMemberParams.newCouncilMemberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilActionChangeMemberParams.newCouncilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Check if new council member is already in the council
                if Map.mem(councilActionChangeMemberParams.newCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
                else skip;
                
                // Check if old council member is in the council
                if not Map.mem(councilActionChangeMemberParams.oldCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
                else skip;

                const addressMap : addressMapType     = map [
                  ("oldCouncilMemberAddress"  : string)  -> councilActionChangeMemberParams.oldCouncilMemberAddress;
                  ("newCouncilMemberAddress"  : string)  -> councilActionChangeMemberParams.newCouncilMemberAddress;
                ];
                const stringMap : stringMapType      = map [
                  ("newCouncilMemberName"     : string)  -> councilActionChangeMemberParams.newCouncilMemberName;
                  ("newCouncilMemberWebsite"  : string)  -> councilActionChangeMemberParams.newCouncilMemberWebsite;
                  ("newCouncilMemberImage"    : string)  -> councilActionChangeMemberParams.newCouncilMemberImage;
                ];
                const emptyNatMap : natMapType        = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaPauseAllEntrypoints(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: pauseAllEntrypoints
    // 4. Increment action counter

    checkGlassIsBroken(s);          
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaPauseAllEntrypoints(_parameters) -> {
                
                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const emptyNatMap      : natMapType          = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaUnpauseAllEntrypoints(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: unpauseAllEntrypoints
    // 4. Increment action counter

    checkGlassIsBroken(s);        
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaUnpauseAllEntrypoints(_parameters) -> {
                
                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const emptyNatMap      : natMapType          = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaPropagateBreakGlass(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: propagateBreakGlass
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaPropagateBreakGlass(_parameters) -> {

                const emptyAddressMap  : addressMapType  = map [];
                const emptyStringMap   : stringMapType   = map [];
                const emptyNatMap      : natMapType      = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaSetSingleContractAdmin(setSingleContractParams) -> {

                const newAdminAddress        : address = setSingleContractParams.newContractAdmin;
                const targetContractAddress  : address = setSingleContractParams.targetContractAddress;

                // Check if the provided contract has a setAdmin entrypoint
                const _checkEntrypoint: contract(address)    = setAdminInContract(targetContractAddress);

                // Get whitelist developers map from the Governance Contract
                const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                const whitelistDevelopers: whitelistDevelopersType = case whitelistDevelopersView of [
                    Some (value) -> value
                  | None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
                const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                const governanceProxyAddress: address = case governanceProxyAddressView of [
                    Some (value) -> value
                  | None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];  
                
                // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
                if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.self_address or newAdminAddress = governanceProxyAddress then skip
                else failwith(error_DEVELOPER_NOT_WHITELISTED);

                const addressMap   : addressMapType      = map [
                  ("newAdminAddress"       : string) -> newAdminAddress;
                  ("targetContractAddress" : string) -> targetContractAddress;
                ];
                const emptyStringMap   : stringMapType   = map [];
                const emptyNatMap      : natMapType      = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaSetAllContractsAdmin(newAdminAddress) -> {

                // Get whitelist developers map from the Governance Contract
                const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                const whitelistDevelopers: whitelistDevelopersType = case whitelistDevelopersView of [
                    Some (value) -> value
                  | None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
                const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                const governanceProxyAddress: address = case governanceProxyAddressView of [
                    Some (value) -> value
                  | None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
                if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.self_address or newAdminAddress = governanceProxyAddress then skip
                else failwith(error_DEVELOPER_NOT_WHITELISTED);
                
                const addressMap   : addressMapType      = map [
                  ("newAdminAddress" : string) -> newAdminAddress;
                ];
                const emptyStringMap   : stringMapType   = map [];
                const emptyNatMap  : natMapType          = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaRemoveBreakGlassControl(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that glass has been broken (since this is a protected entrypoint)
    // 2. Check if sender is a Break Glass Council Member
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeBreakGlassControl
    // 4. Increment action counter

    checkGlassIsBroken(s);         
    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaRemoveBreakGlassControl(_parameters) -> {
                
                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const emptyNatMap      : natMapType          = map [];

                var actionRecord : breakGlassActionRecordType := record[

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
function lambdaFlushAction(const breakGlassLambdaAction : breakGlassLambdaActionType; var s : breakGlassStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Break Glass Council Member
    // 2. Check if action to be flushed exists
    // 3. Check if action has already been flushed or executed
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: flushAction
    // 5. Increment action counter

    checkSenderIsCouncilMember(s);

    case breakGlassLambdaAction of [
        | LambdaFlushAction(actionId) -> {
                
                // Check if action to be flushed exists
                const actionToFlush: breakGlassActionRecordType = case Big_map.find_opt(actionId, s.actionsLedger) of [
                    Some (_action) -> _action
                  | None           -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
                ];

                // Check if action has already been flushed or executed
                if actionToFlush.executed then failwith(error_COUNCIL_ACTION_EXECUTED)
                else skip;

                if actionToFlush.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED)
                else skip;

                const emptyAddressMap  : addressMapType      = map [];
                const emptyStringMap   : stringMapType       = map [];
                const natMap           : natMapType          = map [
                  ("actionId" : string) -> actionId;
                ];

                var actionRecord : breakGlassActionRecordType := record[

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

    checkSenderIsCouncilMember(s);

    var operations : list(operation) := nil;

    case breakGlassLambdaAction of [
        | LambdaSignAction(actionId) -> {
                
                // check if action exists
                var _actionRecord : breakGlassActionRecordType := case s.actionsLedger[actionId] of [
                  | Some(_record) -> _record
                  | None -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
                ];

                // check that break glass action has not been flushed
                if _actionRecord.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED) else skip;

                // check that break glass action has not expired
                if Tezos.now > _actionRecord.expirationDateTime then failwith(error_COUNCIL_ACTION_EXPIRED) else skip;

                // check if council member has already signed for this action
                if Set.mem(Tezos.sender, _actionRecord.signers) then failwith(error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER) else skip;

                // update signers and signersCount for Break Glass Council Action  record
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
                          | None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];
                        // fetch params end ---

                        var flushedActionRecord : breakGlassActionRecordType := case s.actionsLedger[flushedActionId] of [     
                            Some(_record) -> _record
                          | None          -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
                        ];

                        // Check if action was previously flushed or executed
                        if flushedActionRecord.executed then failwith(error_COUNCIL_ACTION_EXECUTED)
                        else skip;

                        if flushedActionRecord.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED)
                        else skip;

                        flushedActionRecord.status := "FLUSHED";
                        s.actionsLedger[flushedActionId] := flushedActionRecord;

                    } else skip;



                    // addCouncilMember action type
                    if actionType = "addCouncilMember" then block {

                        // fetch params begin ---
                        const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of [
                            Some(_address) -> _address
                          | None           -> failwith(error_COUNCIL_MEMBER_NOT_FOUND)
                        ];

                        const councilMemberName : string = case _actionRecord.stringMap["councilMemberName"] of [
                            Some(_string) -> _string
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const councilMemberImage : string = case _actionRecord.stringMap["councilMemberImage"] of [
                            Some(_string) -> _string
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const councilMemberWebsite : string = case _actionRecord.stringMap["councilMemberWebsite"] of [
                            Some(_string) -> _string
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
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

                    } else skip;



                    // removeCouncilMember action type
                    if actionType = "removeCouncilMember" then block {

                        // fetch params begin ---
                        const councilMemberAddress : address = case _actionRecord.addressMap["councilMemberAddress"] of [
                            Some(_address) -> _address
                          | None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];
                        // fetch params end ---

                        // Check if council member is in the council
                        if not Map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
                        else skip;

                        // Check if removing the council member won't impact the threshold
                        if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
                        else skip;

                        s.councilMembers := Map.remove(councilMemberAddress, s.councilMembers);

                    } else skip;



                    // changeCouncilMember action type
                    if actionType = "changeCouncilMember" then block {

                        // fetch params begin ---
                        const oldCouncilMemberAddress : address = case _actionRecord.addressMap["oldCouncilMemberAddress"] of [
                            Some(_address) -> _address
                          | None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const newCouncilMemberAddress : address = case _actionRecord.addressMap["newCouncilMemberAddress"] of [
                            Some(_address) -> _address
                          | None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const councilMemberName : string = case _actionRecord.stringMap["newCouncilMemberName"] of [
                            Some(_string) -> _string
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const councilMemberImage : string = case _actionRecord.stringMap["newCouncilMemberImage"] of [
                            Some(_string) -> _string
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const councilMemberWebsite : string = case _actionRecord.stringMap["newCouncilMemberWebsite"] of [
                            Some(_string) -> _string
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
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

                    } else skip;



                    // pauseAllEntrypoints action type
                    if actionType = "pauseAllEntrypoints" then block {

                        checkGlassIsBroken(s); // check that glass is broken

                        // Get General Contracts map from the Governance Contract
                        const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
                        const generalContracts: generalContractsType = case generalContractsView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Pause all entrypoints in all contracts in the General Contracts map
                        //  - iterate over contracts map with operation to pause all entrypoints
                        for _contractName -> contractAddress in map generalContracts block {
                            case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                                Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                              | None        -> skip
                            ];
                        };    

                    } else skip;



                    // unpauseAllEntrypoints action type
                    if actionType = "unpauseAllEntrypoints" then block {

                        checkGlassIsBroken(s); // check that glass is broken

                        // Get General Contracts map from the Governance Contract
                        const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
                        const generalContracts: generalContractsType = case generalContractsView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Unpause all entrypoints in all contracts in the General Contracts map
                        //  - iterate over contracts map with operation to unpause all entrypoints
                        for _contractName -> contractAddress in map generalContracts block {
                            case (Tezos.get_entrypoint_opt("%unpauseAll", contractAddress) : option(contract(unit))) of [
                                Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                              | None        -> skip
                            ];
                        };    

                    } else skip;



                    // propagateBreakGlass action type
                    if actionType = "propagateBreakGlass" then block {

                        checkGlassIsBroken(s);  // check that glass is broken

                        // Check if the %propagateBreakGlass entrypoint exists on the Governance Contract
                        const propagateBreakGlassEntrypoint: contract(unit) = case (Tezos.get_entrypoint_opt("%propagateBreakGlass", s.governanceAddress) : option(contract(unit))) of [
                            Some (contr)        -> contr
                          | None                -> failwith(error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Create operation to trigger propagateBreakGlass entrypoint on the Governance Contract
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
                          | None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];

                        const targetContractAddress : address = case _actionRecord.addressMap["targetContractAddress"] of [
                            Some(_address) -> _address
                          | None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];
                        // fetch params end ---

                        // Get whitelist developers map from the Governance Contract
                        const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                        const whitelistDevelopers: whitelistDevelopersType = case whitelistDevelopersView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
                        const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                        const governanceProxyAddress: address = case governanceProxyAddressView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
                        if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.self_address or newAdminAddress = governanceProxyAddress then skip
                        else failwith(error_DEVELOPER_NOT_WHITELISTED);

                        // Create operation to set admin on specified contract
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
                          | None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
                        ];
                        // fetch params end ---

                        // Get whitelist developers map from the Governance Contract
                        const whitelistDevelopersView : option (whitelistDevelopersType) = Tezos.call_view ("getWhitelistDevelopers", unit, s.governanceAddress);
                        const whitelistDevelopers: whitelistDevelopersType = case whitelistDevelopersView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];
                        
                        // Get Governance Proxy Contract address from the General Contracts map on the Governance Contract
                        const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                        const governanceProxyAddress: address = case governanceProxyAddressView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Check if the admin address is contained within the whitelistDevelopers map, or is the Governance Proxy Address, or is the Break Glass Contract (self)
                        if Set.mem(newAdminAddress, whitelistDevelopers) or newAdminAddress = Tezos.self_address or newAdminAddress = governanceProxyAddress then skip
                        else failwith(error_DEVELOPER_NOT_WHITELISTED);

                        // Set new contract admin of the Break Glass contract
                        s.admin := newAdminAddress;

                        // -----------------
                        // Set all contracts in generalContracts map to new admin address
                        // -----------------

                        // Get General Contracts map from the Governance Contract
                        const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
                        const generalContracts: generalContractsType = case generalContractsView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Create a set to remove duplicate contract addresses (as General Contracts map may contain duplicate addresses)
                        var uniqueContracts: set(address) := (Set.empty: set(address));
                        
                        function generalContractsFold(const contractsSet: set(address); const generalContract: string * address) : set(address) is
                            // Add address to the set except self
                            if generalContract.1 = Tezos.self_address then contractsSet else Set.add(generalContract.1, contractsSet);

                        uniqueContracts := Map.fold(generalContractsFold, generalContracts, uniqueContracts);

                        // Reset all contracts admin to the new admin address
                        //  - iterate over unique contracts set with setAdmin operation
                        function setAdminFold(const operationList: list(operation); const singleContractAddress: address) : list(operation) is
                            case (Tezos.get_entrypoint_opt("%setAdmin", singleContractAddress) : option(contract(address))) of [
                                Some (_setAdmin)    -> Tezos.transaction(newAdminAddress, 0tez, _setAdmin) # operationList
                              | None                -> operationList
                            ];

                        operations := Set.fold(setAdminFold, uniqueContracts, operations);
                        
                    } else skip;



                    // removeBreakGlassControl action type
                    if actionType = "removeBreakGlassControl" then block {
                        
                        // remove access to protected Break Glass entrypoints                        
                        // N.B. important to ensure proper settings configuration has been done before this entrypoint is triggered
                        //   - relevant entrypoints unpaused, admin set to Break Glass Contract

                        checkGlassIsBroken(s); // check that glass is broken

                        // Get Governance proxy address from the General Contracts map on the Governance Contract
                        const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
                        const governanceProxyAddress: address = case governanceProxyAddressView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Set admin of the Break Glass contract to the Governance Proxy Contract
                        s.admin := governanceProxyAddress;

                        // Get General Contracts map from the Governance Contract
                        const generalContractsView : option (generalContractsType) = Tezos.call_view ("getGeneralContracts", unit, s.governanceAddress);
                        const generalContracts: generalContractsType = case generalContractsView of [
                            Some (value) -> value
                          | None         -> failwith (error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                        ];

                        // Create a set to remove duplicate contract addresses (as General Contracts map may contain duplicate addresses)
                        var uniqueContracts: set(address)    := (Set.empty: set(address));

                        function generalContractsFold(const contractsSet: set(address); const generalContract: string * address) : set(address) is
                            // Add address to the set except self
                            if generalContract.1 = Tezos.self_address then contractsSet else Set.add(generalContract.1, contractsSet);
                        
                        uniqueContracts := Map.fold(generalContractsFold, generalContracts, uniqueContracts);

                        // Reset all contracts admin to Governance Proxy contract
                        //  - iterate over unique contracts set with operation to set admin as the Governance Proxy Contract
                        function setAdminFold(const operationList: list(operation); const singleContractAddress: address) : list(operation) is
                            case (Tezos.get_entrypoint_opt("%setAdmin", singleContractAddress) : option(contract(address))) of [
                                Some (_setAdmin)    -> Tezos.transaction(governanceProxyAddress, 0tez, _setAdmin) # operationList
                              | None                -> operationList
                            ];
                        operations := Set.fold(setAdminFold, uniqueContracts, operations);

                        // Set glassBroken boolean to False (removes access to protected Break Glass entrypoints)
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
