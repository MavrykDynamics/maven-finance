// ------------------------------------------------------------------------------
//
// Council Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case councilLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const councilLambdaAction : councilLambdaActionType;  var s : councilStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case councilLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is
block {

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case councilLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda  *)
function lambdaUpdateConfig(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  case councilLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : councilUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : councilUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigThreshold (_v)                  -> if updateConfigNewValue > Map.size(s.councilMembers) then failwith(error_COUNCIL_THRESHOLD_ERROR) else s.config.threshold := updateConfigNewValue
                    |   ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
                    |   ConfigCouncilNameMaxLength (_v)       -> s.config.councilMemberNameMaxLength        := updateConfigNewValue
                    |   ConfigCouncilWebsiteMaxLength (_v)    -> s.config.councilMemberWebsiteMaxLength     := updateConfigNewValue  
                    |   ConfigCouncilImageMaxLength (_v)      -> s.config.councilMemberImageMaxLength       := updateConfigNewValue  
                    |   ConfigRequestTokenNameMaxLength (_v)  -> s.config.requestTokenNameMaxLength         := updateConfigNewValue  
                    |   ConfigRequestPurposeMaxLength (_v)    -> s.config.requestPurposeMaxLength           := updateConfigNewValue  
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const councilLambdaAction : councilLambdaActionType; var s: councilStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case councilLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const councilLambdaAction : councilLambdaActionType; var s: councilStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case councilLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateCouncilMemberInfo lambda - update the info of a council member *)
function lambdaUpdateCouncilMemberInfo(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Update Council Member info with new info provided

    case councilLambdaAction of [
        |   LambdaUpdateCouncilMemberInfo(councilMemberInfo) -> {
                
                // Check if sender is a member of the council
                var councilMember: councilMemberInfoType := case Map.find_opt(Tezos.get_sender(), s.councilMembers) of [
                        Some (_info) -> _info
                    |   None -> failwith(error_COUNCIL_MEMBER_NOT_FOUND)
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
                s.councilMembers[Tezos.get_sender()]  := councilMember;   

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Council Actions for Internal Control Begin
// ------------------------------------------------------------------------------

(*  councilActionAddMember lambda  *)
function lambdaCouncilActionAddMember(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check if new Council Member to be added is not already in the Council 
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: addCouncilMember
    // 5. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionAddMember(newCouncilMember) -> {

                // Validate inputs
                if String.length(newCouncilMember.memberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newCouncilMember.memberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newCouncilMember.memberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Check if new council member is already in the council
                if Map.mem(newCouncilMember.memberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
                else skip;

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap          : addressMapType     = map [
                    ("councilMemberAddress" : string) -> newCouncilMember.memberAddress
                ];
                const stringMap           : stringMapType      = map [
                    ("councilMemberName"    : string) -> newCouncilMember.memberName;
                    ("councilMemberImage"   : string) -> newCouncilMember.memberImage;
                    ("councilMemberWebsite" : string) -> newCouncilMember.memberWebsite
                ];
                const emptyNatMap         : natMapType         = map [];

                // create council action
                s   := createCouncilAction(
                    "addCouncilMember",
                    addressMap,
                    stringMap,
                    emptyNatMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRemoveMember lambda  *)
function lambdaCouncilActionRemoveMember(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Check that Address to be removed is a Council Member
    // 3. Check that Council (Signing) Threshold will not be affected with the removal of the Council Member
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeCouncilMember
    // 4. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionRemoveMember(councilMemberAddress) -> {
                
                // Check if council member is in the council
                if not Map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
                else skip;

                // Check if removing the council member won't impact the threshold
                if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
                else skip;

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap          : addressMapType     = map [
                    ("councilMemberAddress" : string) -> councilMemberAddress
                ];
                const emptyStringMap      : stringMapType      = map [];
                const emptyNatMap         : natMapType         = map [];

                // create council action
                s   := createCouncilAction(
                    "removeCouncilMember",
                    addressMap,
                    emptyStringMap,
                    emptyNatMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionChangeMember lambda  *)
function lambdaCouncilActionChangeMember(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check that new Council Member to be added is not already in the Council
    // 4. Check that old Council Member to be removed is in the Council
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: changeCouncilMember
    // 6. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionChangeMember(councilActionChangeMemberParams) -> {
                
                // Validate inputs
                if String.length(councilActionChangeMemberParams.newCouncilMemberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilActionChangeMemberParams.newCouncilMemberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilActionChangeMemberParams.newCouncilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Check if new council member is already in the council
                if Map.mem(councilActionChangeMemberParams.newCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
                else skip;

                // Check if old council member is in the council
                if not Map.mem(councilActionChangeMemberParams.oldCouncilMemberAddress, s.councilMembers) then failwith(error_LAMBDA_NOT_FOUND)
                else skip;

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap          : addressMapType     = map [
                    ("oldCouncilMemberAddress"  : string) -> councilActionChangeMemberParams.oldCouncilMemberAddress;
                    ("newCouncilMemberAddress"  : string) -> councilActionChangeMemberParams.newCouncilMemberAddress;
                ];
                const stringMap           : stringMapType      = map [
                    ("newCouncilMemberName"     : string) -> councilActionChangeMemberParams.newCouncilMemberName;
                    ("newCouncilMemberWebsite"  : string) -> councilActionChangeMemberParams.newCouncilMemberWebsite;
                    ("newCouncilMemberImage"    : string) -> councilActionChangeMemberParams.newCouncilMemberImage;
                ];
                const emptyNatMap         : natMapType         = map [];

                // create council action
                s   := createCouncilAction(
                    "changeCouncilMember",
                    addressMap,
                    stringMap,
                    emptyNatMap,
                    keyHash,
                    s
                );
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionSetBaker lambda  *)
function lambdaCouncilActionSetBaker(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: setBaker
    // 3. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionSetBaker(setBakerParams) -> {
                
                const emptyAddressMap     : addressMapType     = map [];
                const emptyStringMap      : stringMapType      = map [];
                const emptyNatMap         : natMapType         = map [];

                // create council action
                s   := createCouncilAction(
                    "setBaker",
                    emptyAddressMap,
                    emptyStringMap,
                    emptyNatMap,
                    setBakerParams,
                    s
                );
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Council Actions for Internal Control End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Vesting Begin
// ------------------------------------------------------------------------------

(*  councilActionAddVestee lambda  *)
function lambdaCouncilActionAddVestee(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract address from the General Contracts Map on the Governance Contract
    // 3. Check if addVestee entrypoint exists on the Vesting Contract
    // 4. Check if the vestee already exists
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: addVestee
    // 6. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionAddVestee(addVesteeParams) -> {
                
                // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
                const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);
                
                // Check if addVestee entrypoint exists on the Vesting Contract
                const _checkEntrypoint: contract(addVesteeType)    = sendAddVesteeParams(vestingAddress);

                // init parameters
                const vesteeAddress          : address  = addVesteeParams.vesteeAddress;
                const totalAllocatedAmount   : nat      = addVesteeParams.totalAllocatedAmount;
                const cliffInMonths          : nat      = addVesteeParams.cliffInMonths;
                const vestingInMonths        : nat      = addVesteeParams.vestingInMonths;

                // Check if the vestee already exists
                const vesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
                case vesteeOptView of [
                        Some (_value) -> case _value of [
                                Some (_vestee) -> failwith (error_VESTEE_ALREADY_EXISTS)
                            |   None -> skip
                        ]
                    |   None -> failwith (error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND)
                ];

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("vesteeAddress"         : string) -> vesteeAddress;
                ];
                const emptyStringMap : stringMapType = map [];
                const natMap : natMapType            = map [
                    ("totalAllocatedAmount"  : string) -> totalAllocatedAmount;
                    ("cliffInMonths"         : string) -> cliffInMonths;
                    ("vestingInMonths"       : string) -> vestingInMonths;
                ];

                // create council action
                s   := createCouncilAction(
                    "addVestee",
                    addressMap,
                    emptyStringMap,
                    natMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRemoveVestee lambda  *)
function lambdaCouncilActionRemoveVestee(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    // 3. Check if removeVestee entrypoint exists on the Vesting Contract
    // 4. Check if the vestee exists on the Vesting Contract
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeVestee
    // 6. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionRemoveVestee(vesteeAddress) -> {
                
                // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
                const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Check if removeVestee entrypoint exists on the Vesting Contract
                const _checkEntrypoint: contract(address) = sendRemoveVesteeParams(vestingAddress);

                // Check if the vestee exists
                const vesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
                case vesteeOptView of [
                        Some (_value) -> case _value of [
                                Some (_vestee) -> skip
                            |   None -> failwith (error_VESTEE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND)
                ];

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("vesteeAddress"         : string) -> vesteeAddress;
                ];
                const emptyStringMap : stringMapType  = map [];
                const emptyNatMap : natMapType        = map [];

                // create council action
                s   := createCouncilAction(
                    "removeVestee",
                    addressMap,
                    emptyStringMap,
                    emptyNatMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionUpdateVestee lambda  *)
function lambdaCouncilActionUpdateVestee(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    // 3. Check if updateVestee entrypoint exists on the Vesting Contract
    // 4. Check if the vestee exists on the Vesting Contract
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: updateVestee
    // 6. Increment action counter
    
    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionUpdateVestee(updateVesteeParams) -> {
                
                // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
                const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Check if updateVestee entrypoint exists on the Vesting Contract
                const _checkEntrypoint: contract(updateVesteeType)  = sendUpdateVesteeParams(vestingAddress);

                // init parameters
                const vesteeAddress             : address  = updateVesteeParams.vesteeAddress;
                const newTotalAllocatedAmount   : nat      = updateVesteeParams.newTotalAllocatedAmount;
                const newCliffInMonths          : nat      = updateVesteeParams.newCliffInMonths;
                const newVestingInMonths        : nat      = updateVesteeParams.newVestingInMonths;

                // Check if the vestee exists
                const vesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
                case vesteeOptView of [
                        Some (_value) -> case _value of [
                                Some (_vestee) -> skip
                            |   None -> failwith (error_VESTEE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND)
                ];

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("vesteeAddress"         : string)    -> vesteeAddress;
                ];
                const emptyStringMap : stringMapType = map [];
                const natMap : natMapType            = map [
                    ("newTotalAllocatedAmount"  : string) -> newTotalAllocatedAmount;
                    ("newCliffInMonths"         : string) -> newCliffInMonths;
                    ("newVestingInMonths"       : string) -> newVestingInMonths;
                ];

                // create council action
                s   := createCouncilAction(
                    "updateVestee",
                    addressMap,
                    emptyStringMap,
                    natMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionToggleVesteeLock lambda  *)
function lambdaCouncilActionToggleVesteeLock(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    // 3. Check if toggleVesteeLock entrypoint exists on the Vesting Contract
    // 4. Check if the vestee exists on the Vesting Contract
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: toggleVesteeLock
    // 6. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilToggleVesteeLock(vesteeAddress) -> {
                
                // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
                const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

                // Check if toggleVesteeLock entrypoint exists on the Vesting Contract
                const _checkEntrypoint: contract(address) = sendToggleVesteeLockParams(vestingAddress);

                // Check if the vestee exists
                const vesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
                case vesteeOptView of [
                        Some (_value) -> case _value of [
                                Some (_vestee) -> skip
                            |   None -> failwith (error_VESTEE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND)
                ];

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("vesteeAddress"         : string) -> vesteeAddress;
                ];
                const emptyStringMap : stringMapType  = map [];
                const emptyNatMap : natMapType        = map [];

                // create council action
                s   := createCouncilAction(
                    "toggleVesteeLock",
                    addressMap,
                    emptyStringMap,
                    emptyNatMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Council Actions for Vesting End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Council Actions for Financial Governance Begin
// ------------------------------------------------------------------------------

(*  councilActionTransfer lambda  *)
function lambdaCouncilActionTransfer(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (purpose) does not exceed max length
    // 3. Check if tokenType provided is correct
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: transfer
    // 5. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilActionTransfer(councilActionTransferParams) -> {
                
                // Validate inputs
                if String.length(councilActionTransferParams.purpose) > s.config.requestPurposeMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Check if token type is correct
                if councilActionTransferParams.tokenType = "FA12" or
                councilActionTransferParams.tokenType = "FA2" or
                councilActionTransferParams.tokenType = "TEZ" then skip
                else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("receiverAddress"       : string) -> councilActionTransferParams.receiverAddress;
                    ("tokenContractAddress"  : string) -> councilActionTransferParams.tokenContractAddress;
                ];
                const stringMap : stringMapType      = map [
                    ("tokenType"             : string) -> councilActionTransferParams.tokenType; 
                    ("purpose"               : string) -> councilActionTransferParams.purpose; 
                ];
                const natMap : natMapType         = map [
                    ("tokenAmount"           : string) -> councilActionTransferParams.tokenAmount;
                    ("tokenId"               : string) -> councilActionTransferParams.tokenId;
                ];

                // create council action
                s   := createCouncilAction(
                    "transfer",
                    addressMap,
                    stringMap,
                    natMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRequestTokens lambda  *)
function lambdaCouncilActionRequestTokens(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (purpose, token name) does not exceed max length
    // 3. Get Governance Financial Address from the General Contracts Map on the Governance Contract 
    // 4. Check if requestTokens entrypoint exists on the Governance Financial Contract 
    // 5. Check if tokenType provided is correct
    // 6. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: requestTokens
    // 7. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilRequestTokens(councilActionRequestTokensParams) -> {                

                // Validate inputs
                if String.length(councilActionRequestTokensParams.purpose) > s.config.requestPurposeMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(councilActionRequestTokensParams.tokenName) > s.config.requestTokenNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Get Governance Financial Address from the General Contracts Map on the Governance Contract 
                const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

                // Check if requestTokens entrypoint exists on the Governance Financial Contract 
                const _checkEntrypoint : contract(councilActionRequestTokensType) = sendRequestTokensParams(governanceFinancialAddress);

                // Check if type is correct
                if councilActionRequestTokensParams.tokenType = "FA12" or
                councilActionRequestTokensParams.tokenType = "FA2" or
                councilActionRequestTokensParams.tokenType = "TEZ" then skip
                else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("treasuryAddress"       : string) -> councilActionRequestTokensParams.treasuryAddress;
                    ("tokenContractAddress"  : string) -> councilActionRequestTokensParams.tokenContractAddress;
                ];
                const stringMap : stringMapType      = map [
                    ("tokenName"             : string) -> councilActionRequestTokensParams.tokenName; 
                    ("purpose"               : string) -> councilActionRequestTokensParams.purpose;        
                    ("tokenType"             : string) -> councilActionRequestTokensParams.tokenType;  
                ];
                const natMap : natMapType         = map [
                    ("tokenAmount"           : string) -> councilActionRequestTokensParams.tokenAmount;
                    ("tokenId"               : string) -> councilActionRequestTokensParams.tokenId;
                ];

                // create council action
                s   := createCouncilAction(
                    "requestTokens",
                    addressMap,
                    stringMap,
                    natMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRequestMint lambda  *)
function lambdaCouncilActionRequestMint(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (purpose) does not exceed max length
    // 3. Get Governance Financial Address from the General Contracts Map on the Governance Contract 
    // 4. Check if requestTokens entrypoint exists on the Governance Financial Contract 
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: requestMint
    // 6. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilRequestMint(councilActionRequestMintParams) -> {
                
                // Validate inputs
                if String.length(councilActionRequestMintParams.purpose) > s.config.requestPurposeMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Get Governance Financial Address from the General Contracts Map on the Governance Contract 
                const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

                // Check if requestTokens entrypoint exists on the Governance Financial Contract 
                const _checkEntrypoint: contract(councilActionRequestTokensType)    = sendRequestTokensParams(governanceFinancialAddress);

                const keyHash : option(key_hash) = (None : option(key_hash));

                const addressMap : addressMapType     = map [
                    ("treasuryAddress"       : string) -> councilActionRequestMintParams.treasuryAddress;
                ];
                const stringMap : stringMapType      = map [
                    ("purpose"               : string) -> councilActionRequestMintParams.purpose; 
                ];
                const natMap : natMapType         = map [
                    ("tokenAmount"           : string) -> councilActionRequestMintParams.tokenAmount;
                ];

                // create council action
                s   := createCouncilAction(
                    "requestMint",
                    addressMap,
                    stringMap,
                    natMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionSetContractBaker lambda  *)
function lambdaCouncilActionSetContractBaker(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Governance Financial Address from the General Contracts Map on the Governance Contract 
    // 3. Check if setContractBaker entrypoint exists on the Governance Financial Contract 
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: setContractBaker
    // 5. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilSetContractBaker(councilActionSetContractBakerParams) -> {

                // Get Governance Financial Address from the General Contracts Map on the Governance Contract 
                const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

                // Check if setContractBaker entrypoint exists on the Governance Financial Contract 
                const _checkEntrypoint : contract(councilActionSetContractBakerType) = sendSetContractBakerParams(governanceFinancialAddress);

                const keyHash : option(key_hash) = councilActionSetContractBakerParams.keyHash; 

                const addressMap        : addressMapType     = map [
                    ("targetContractAddress" : string) -> councilActionSetContractBakerParams.targetContractAddress
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                // create council action
                s   := createCouncilAction(
                    "setContractBaker",
                    addressMap,
                    emptyStringMap,
                    emptyNatMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionDropFinancialRequest lambda  *)
function lambdaCouncilActionDropFinancialRequest(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: dropFinancialRequest
    // 4. Increment action counter

    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilDropFinancialReq(requestId) -> {

                const keyHash : option(key_hash) = (None : option(key_hash));

                const emptyAddressMap : addressMapType      = map [];
                const emptyStringMap : stringMapType        = map [];
                const natMap : natMapType                   = map [
                    ("requestId"           : string) -> requestId;
                ];

                // check if request exists
                const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);
                case (Tezos.call_view ("getFinancialRequestOpt", requestId, governanceFinancialAddress) : option(option(financialRequestRecordType))) of [
                        Some (_requestOpt)  -> case _requestOpt of [
                                Some (_request) -> skip
                            |   None            -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
                        ]
                    |   None                -> failwith(error_GET_FINANCIAL_REQUEST_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND)
                ];

                // create council action
                s   := createCouncilAction(
                    "dropFinancialRequest",
                    emptyAddressMap,
                    emptyStringMap,
                    natMap,
                    keyHash,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Council Actions for Financial Governance End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Council Signing of Actions Begin
// ------------------------------------------------------------------------------

(*  flushAction lambda  *)
function lambdaFlushAction(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Check if Council Action exists
    // 3. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: flushAction
    // 4. Increment action counter
    
    checkSenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaFlushAction(actionId) -> {
                
                // Check if council action exists
                const _request: councilActionRecordType = case Big_map.find_opt(actionId, s.councilActionsLedger) of [
                        Some (_action) -> _action
                    |   None           -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
                ];

                // check if council can sign the action
                checkActionInteraction(_request);

                const keyHash : option(key_hash) = (None : option(key_hash));

                const emptyAddressMap  : addressMapType     = map [];
                const emptyStringMap   : stringMapType      = map [];
                const natMap           : natMapType         = map [
                    ("actionId" : string) -> actionId;
                ];

                // create council action
                s   := createCouncilAction(
                    "flushAction",
                    emptyAddressMap,
                    emptyStringMap,
                    natMap,
                    keyHash,
                    s
                );
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  signAction lambda  *)
function lambdaSignAction(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Check if Council Action exists
    //      - check that council action has not been flushed
    //      - check that council action has not expired
    //      - check if council member has already signed for this action
    // 3. Update signers and signersCount for Council Action record
    // 4. Execute action if signers threshold has been reached     
    
    checkSenderIsCouncilMember(s);

    var operations : list(operation) := nil;

    case councilLambdaAction of [
        |   LambdaSignAction(actionId) -> {
                
                // check if council action exists
                var _councilActionRecord : councilActionRecordType := case s.councilActionsLedger[actionId] of [
                        Some(_record) -> _record
                    |   None -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
                ];

                // check if council can sign the action
                checkActionInteraction(_councilActionRecord);

                // check if council member has already signed for this action
                if Set.mem(Tezos.get_sender(), _councilActionRecord.signers) then failwith(error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER) else skip;

                // update signers and signersCount for council action record
                var signersCount : nat             := _councilActionRecord.signersCount + 1n;
                _councilActionRecord.signersCount  := signersCount;
                _councilActionRecord.signers       := Set.add(Tezos.get_sender(), _councilActionRecord.signers);
                s.councilActionsLedger[actionId]   := _councilActionRecord;

                // check if threshold has been reached
                if signersCount >= s.config.threshold and not _councilActionRecord.executed then block {
                    const executeCouncilActionReturn : return   = executeCouncilAction(_councilActionRecord, actionId, operations, s);
                    s           := executeCouncilActionReturn.1;
                    operations  := executeCouncilActionReturn.0;
                } else skip;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Council Signing of Actions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Council Lambdas End
//
// ------------------------------------------------------------------------------
