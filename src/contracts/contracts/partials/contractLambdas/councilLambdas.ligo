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
    
    verifyNoAmountSent(Unit);        // entrypoint should not receive any tez amount
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
    
    verifyNoAmountSent(Unit);        // entrypoint should not receive any tez amount
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

    verifyNoAmountSent(Unit);     // entrypoint should not receive any tez amount
    verifySenderIsAdmin(s.admin); // verify that sender is admin (i.e. Governance Proxy Contract address)

    case councilLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda  *)
function lambdaUpdateConfig(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    verifyNoAmountSent(Unit);     // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case councilLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : councilUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : councilUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigThreshold (_v)                  -> if updateConfigNewValue > s.councilSize then failwith(error_COUNCIL_THRESHOLD_ERROR) else s.config.threshold := updateConfigNewValue
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
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
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
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
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
                var councilMember: councilMemberInfoType := case Big_map.find_opt(Tezos.get_sender(), s.councilMembers) of [
                        Some (_info) -> _info
                    |   None -> failwith(error_COUNCIL_MEMBER_NOT_FOUND)
                ];
                
                // Validate inputs
                validateStringLength(councilMemberInfo.name     , s.config.councilMemberNameMaxLength, error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilMemberInfo.image    , s.config.councilMemberImageMaxLength, error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilMemberInfo.website  , s.config.councilMemberWebsiteMaxLength, error_WRONG_INPUT_PROVIDED);
                
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
function lambdaCouncilAddMember(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check if new Council Member to be added is not already in the Council 
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: addCouncilMember
    // 5. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilAddMember(newCouncilMember) -> {

                // Validate inputs
                validateStringLength(newCouncilMember.memberName     , s.config.councilMemberNameMaxLength      , error_WRONG_INPUT_PROVIDED);
                validateStringLength(newCouncilMember.memberImage    , s.config.councilMemberImageMaxLength     , error_WRONG_INPUT_PROVIDED);
                validateStringLength(newCouncilMember.memberWebsite  , s.config.councilMemberWebsiteMaxLength   , error_WRONG_INPUT_PROVIDED);

                // Verify that new council member is not already in the council
                verifyCouncilMemberDoesNotExist(newCouncilMember.memberAddress, s);

                const dataMap : dataMapType = map [
                    ("councilMemberAddress" : string) -> Bytes.pack(newCouncilMember.memberAddress);
                    ("councilMemberName"    : string) -> Bytes.pack(newCouncilMember.memberName);
                    ("councilMemberImage"   : string) -> Bytes.pack(newCouncilMember.memberImage);
                    ("councilMemberWebsite" : string) -> Bytes.pack(newCouncilMember.memberWebsite);
                ];

                // create council action
                s := createCouncilAction(
                    "addCouncilMember",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRemoveMember lambda  *)
function lambdaCouncilRemoveMember(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Check that Address to be removed is a Council Member
    // 3. Check that Council (Signing) Threshold will not be affected with the removal of the Council Member
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeCouncilMember
    // 4. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilRemoveMember(councilMemberAddress) -> {

                // Verify that council member is in the council
                verifyCouncilMemberExists(councilMemberAddress, s);

                // Verify that removing the council member won't impact the threshold
                verifyValidCouncilThreshold(s);

                const dataMap : dataMapType = map [
                    ("councilMemberAddress" : string) -> Bytes.pack(councilMemberAddress)
                ];

                // create council action
                s := createCouncilAction(
                    "removeCouncilMember",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionChangeMember lambda  *)
function lambdaCouncilChangeMember(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (name, image, website) and check max length is not exceeded
    // 3. Check that new Council Member to be added is not already in the Council
    // 4. Check that old Council Member to be removed is in the Council
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: changeCouncilMember
    // 6. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilChangeMember(councilActionChangeMemberParams) -> {
                
                // Validate inputs
                validateStringLength(councilActionChangeMemberParams.newCouncilMemberName     , s.config.councilMemberNameMaxLength, error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilActionChangeMemberParams.newCouncilMemberImage    , s.config.councilMemberImageMaxLength, error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilActionChangeMemberParams.newCouncilMemberWebsite  , s.config.councilMemberWebsiteMaxLength, error_WRONG_INPUT_PROVIDED);

                // Verify that new council member is not already in the council
                verifyCouncilMemberDoesNotExist(councilActionChangeMemberParams.newCouncilMemberAddress, s);

                // Verify that old council member is in the council
                verifyCouncilMemberExists(councilActionChangeMemberParams.oldCouncilMemberAddress, s);

                const dataMap : dataMapType = map [
                    ("oldCouncilMemberAddress"  : string) -> Bytes.pack(councilActionChangeMemberParams.oldCouncilMemberAddress);
                    ("newCouncilMemberAddress"  : string) -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberAddress);
                    ("newCouncilMemberName"     : string) -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberName);
                    ("newCouncilMemberWebsite"  : string) -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberWebsite);
                    ("newCouncilMemberImage"    : string) -> Bytes.pack(councilActionChangeMemberParams.newCouncilMemberImage);
                ];

                // create council action
                s := createCouncilAction(
                    "changeCouncilMember",
                    dataMap,
                    s
                );
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionSetBaker lambda  *)
function lambdaCouncilSetBaker(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: setBaker
    // 3. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilSetBaker(setBakerParams) -> {

                const dataMap : dataMapType = map [
                    ("keyHash"  : string) -> Bytes.pack(setBakerParams);
                ];

                // create council action
                s := createCouncilAction(
                    "setBaker",
                    dataMap,
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
function lambdaCouncilAddVestee(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract address from the General Contracts Map on the Governance Contract
    // 3. Check if addVestee entrypoint exists on the Vesting Contract
    // 4. Check if the vestee already exists
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: addVestee
    // 6. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilAddVestee(addVesteeParams) -> {
                
                // Verify that toggleVesteeLock entrypoint exists on the Vesting Contract
                verifyVestingContractEntrypoint("addVestee", s);

                // init parameters
                const vesteeAddress          : address  = addVesteeParams.vesteeAddress;
                const totalAllocatedAmount   : nat      = addVesteeParams.totalAllocatedAmount;
                const cliffInMonths          : nat      = addVesteeParams.cliffInMonths;
                const vestingInMonths        : nat      = addVesteeParams.vestingInMonths;

                // Verify that vestee does not exist
                verifyVesteeDoesNotExist(vesteeAddress, s);

                const dataMap : dataMapType = map [
                    ("vesteeAddress"         : string) -> Bytes.pack(vesteeAddress);
                    ("totalAllocatedAmount"  : string) -> Bytes.pack(totalAllocatedAmount);
                    ("cliffInMonths"         : string) -> Bytes.pack(cliffInMonths);
                    ("vestingInMonths"       : string) -> Bytes.pack(vestingInMonths);
                ];

                // create council action
                s := createCouncilAction(
                    "addVestee",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRemoveVestee lambda  *)
function lambdaCouncilRemoveVestee(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    // 3. Check if removeVestee entrypoint exists on the Vesting Contract
    // 4. Check if the vestee exists on the Vesting Contract
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: removeVestee
    // 6. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilRemoveVestee(vesteeAddress) -> {

                // Verify that toggleVesteeLock entrypoint exists on the Vesting Contract
                verifyVestingContractEntrypoint("removeVestee", s);

                // Verify that the vestee exists
                verifyVesteeExists(vesteeAddress, s);

                const dataMap : dataMapType = map [
                    ("vesteeAddress" : string) -> Bytes.pack(vesteeAddress);
                ];

                // create council action
                s := createCouncilAction(
                    "removeVestee",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionUpdateVestee lambda  *)
function lambdaCouncilUpdateVestee(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    // 3. Check if updateVestee entrypoint exists on the Vesting Contract
    // 4. Check if the vestee exists on the Vesting Contract
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: updateVestee
    // 6. Increment action counter
    
    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilUpdateVestee(updateVesteeParams) -> {

                // Verify that updateVestee entrypoint exists on the Vesting Contract
                verifyVestingContractEntrypoint("updateVestee", s);

                // init parameters
                const vesteeAddress             : address  = updateVesteeParams.vesteeAddress;
                const newTotalAllocatedAmount   : nat      = updateVesteeParams.newTotalAllocatedAmount;
                const newCliffInMonths          : nat      = updateVesteeParams.newCliffInMonths;
                const newVestingInMonths        : nat      = updateVesteeParams.newVestingInMonths;

                // Verify that the vestee exists
                verifyVesteeExists(vesteeAddress, s);

                const dataMap : dataMapType = map [
                    ("vesteeAddress"            : string) -> Bytes.pack(vesteeAddress);
                    ("newTotalAllocatedAmount"  : string) -> Bytes.pack(newTotalAllocatedAmount);
                    ("newCliffInMonths"         : string) -> Bytes.pack(newCliffInMonths);
                    ("newVestingInMonths"       : string) -> Bytes.pack(newVestingInMonths);
                ];

                // create council action
                s := createCouncilAction(
                    "updateVestee",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionToggleVesteeLock lambda  *)
function lambdaCouncilToggleVesteeLock(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    // 3. Check if toggleVesteeLock entrypoint exists on the Vesting Contract
    // 4. Check if the vestee exists on the Vesting Contract
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: toggleVesteeLock
    // 6. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilToggleVesteeLock(vesteeAddress) -> {

                // Verify that toggleVesteeLock entrypoint exists on the Vesting Contract
                verifyVestingContractEntrypoint("toggleVesteeLock", s);

                // Verify that the vestee exists
                verifyVesteeExists(vesteeAddress, s);

                const dataMap : dataMapType = map [
                    ("vesteeAddress" : string) -> Bytes.pack(vesteeAddress);
                ];

                // create council action
                s := createCouncilAction(
                    "toggleVesteeLock",
                    dataMap,
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
function lambdaCouncilTransfer(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (purpose) does not exceed max length
    // 3. Check if tokenType provided is correct
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: transfer
    // 5. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilTransfer(councilActionTransferParams) -> {
                
                // Validate inputs
                validateStringLength(councilActionTransferParams.purpose, s.config.requestPurposeMaxLength, error_WRONG_INPUT_PROVIDED);

                // Verify that token type is correct
                verifyCorrectTokenType(councilActionTransferParams.tokenType);

                const dataMap : dataMapType = map [
                    ("receiverAddress"       : string) -> Bytes.pack(councilActionTransferParams.receiverAddress);
                    ("tokenContractAddress"  : string) -> Bytes.pack(councilActionTransferParams.tokenContractAddress);
                    ("tokenType"             : string) -> Bytes.pack(councilActionTransferParams.tokenType);
                    ("purpose"               : string) -> Bytes.pack(councilActionTransferParams.purpose);
                    ("tokenAmount"           : string) -> Bytes.pack(councilActionTransferParams.tokenAmount);
                    ("tokenId"               : string) -> Bytes.pack(councilActionTransferParams.tokenId);
                ];

                // create council action
                s := createCouncilAction(
                    "transfer",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRequestTokens lambda  *)
function lambdaCouncilRequestTokens(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
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

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilRequestTokens(councilActionRequestTokensParams) -> {                

                // Validate inputs                
                validateStringLength(councilActionRequestTokensParams.purpose     , s.config.requestPurposeMaxLength    , error_WRONG_INPUT_PROVIDED);
                validateStringLength(councilActionRequestTokensParams.tokenName   , s.config.requestTokenNameMaxLength  , error_WRONG_INPUT_PROVIDED);

                // Verify that requestTokens entrypoint exists on the Governance Financial Contract 
                verifyGovernanceFinancialContractEntrypoint("requestTokens", s);

                // Verify that token type is correct
                verifyCorrectTokenType(councilActionRequestTokensParams.tokenType);

                const dataMap : dataMapType = map [
                    ("treasuryAddress"       : string) -> Bytes.pack(councilActionRequestTokensParams.treasuryAddress);
                    ("receiverAddress"       : string) -> Bytes.pack(councilActionRequestTokensParams.receiverAddress);
                    ("tokenContractAddress"  : string) -> Bytes.pack(councilActionRequestTokensParams.tokenContractAddress);
                    ("tokenName"             : string) -> Bytes.pack(councilActionRequestTokensParams.tokenName);
                    ("purpose"               : string) -> Bytes.pack(councilActionRequestTokensParams.purpose);
                    ("tokenType"             : string) -> Bytes.pack(councilActionRequestTokensParams.tokenType);
                    ("tokenAmount"           : string) -> Bytes.pack(councilActionRequestTokensParams.tokenAmount);
                    ("tokenId"               : string) -> Bytes.pack(councilActionRequestTokensParams.tokenId);
                ];

                // create council action
                s := createCouncilAction(
                    "requestTokens",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionRequestMint lambda  *)
function lambdaCouncilRequestMint(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Validate inputs (purpose) does not exceed max length
    // 3. Get Governance Financial Address from the General Contracts Map on the Governance Contract 
    // 4. Check if requestTokens entrypoint exists on the Governance Financial Contract 
    // 5. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: requestMint
    // 6. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilRequestMint(councilActionRequestMintParams) -> {
                
                // Validate inputs
                validateStringLength(councilActionRequestMintParams.purpose, s.config.requestPurposeMaxLength, error_WRONG_INPUT_PROVIDED);

                // Verify that requestMint entrypoint exists on the Governance Financial Contract 
                verifyGovernanceFinancialContractEntrypoint("requestMint", s);

                const dataMap : dataMapType = map [
                    ("treasuryAddress"       : string) -> Bytes.pack(councilActionRequestMintParams.treasuryAddress);
                    ("receiverAddress"       : string) -> Bytes.pack(councilActionRequestMintParams.receiverAddress);
                    ("purpose"               : string) -> Bytes.pack(councilActionRequestMintParams.purpose);
                    ("tokenAmount"           : string) -> Bytes.pack(councilActionRequestMintParams.tokenAmount);
                ];

                // create council action
                s := createCouncilAction(
                    "requestMint",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionSetContractBaker lambda  *)
function lambdaCouncilSetContractBaker(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Get Governance Financial Address from the General Contracts Map on the Governance Contract 
    // 3. Check if setContractBaker entrypoint exists on the Governance Financial Contract 
    // 4. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: setContractBaker
    // 5. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilSetContractBaker(councilActionSetContractBakerParams) -> {

                // Verify that setContractBaker entrypoint exists on the Governance Financial Contract 
                verifyGovernanceFinancialContractEntrypoint("setContractBaker", s);

                const dataMap : dataMapType = map [
                    ("targetContractAddress"    : string) -> Bytes.pack(councilActionSetContractBakerParams.targetContractAddress);
                    ("keyHash"                  : string) -> Bytes.pack(councilActionSetContractBakerParams.keyHash);
                ];

                // create council action
                s := createCouncilAction(
                    "setContractBaker",
                    dataMap,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  councilActionDropFinancialRequest lambda  *)
function lambdaCouncilDropFinancialReq(const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check if sender is a Council Member
    // 2. Create and save new council action record, set the sender as a signer of the action
    //      - Action Type: dropFinancialRequest
    // 4. Increment action counter

    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaCouncilDropFinancialReq(requestId) -> {

                const dataMap : dataMapType = map [
                    ("requestId" : string) -> Bytes.pack(requestId);
                ];

                // Verify that financial request exists
                verifyFinancialRequestExists(requestId, s);

                // create council action
                s := createCouncilAction(
                    "dropFinancialRequest",
                    dataMap,
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
    
    verifySenderIsCouncilMember(s);

    case councilLambdaAction of [
        |   LambdaFlushAction(actionId) -> {
                
                // Verify that council action exists
                verifyCouncilActionExists(actionId, s);

                // check if council can sign the action
                validateActionById(actionId, s);

                const dataMap : dataMapType = map [
                    ("actionId" : string) -> Bytes.pack(actionId);
                ];

                // create council action
                s := createCouncilAction(
                    "flushAction",
                    dataMap,
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
    
    verifySenderIsCouncilMember(s);

    var operations : list(operation) := nil;

    case councilLambdaAction of [
        |   LambdaSignAction(actionId) -> {
                
                // Verify that council action exists
                verifyCouncilActionExists(actionId, s);

                // check if council can sign the action
                validateActionById(actionId, s);

                var councilActionRecord : councilActionRecordType := getCouncilActionRecord(actionId, s);

                // check if council member has already signed for this action
                if Big_map.mem((actionId, Tezos.get_sender()), s.councilActionsSigners) then failwith(error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER) else skip;

                // update signers and signersCount for council action record
                var signersCount : nat             := councilActionRecord.signersCount + 1n;
                councilActionRecord.signersCount   := signersCount;
                s.councilActionsSigners            := Big_map.add((actionId, Tezos.get_sender()), unit, s.councilActionsSigners);
                s.councilActionsLedger[actionId]   := councilActionRecord;

                // check if threshold has been reached
                if signersCount >= s.config.threshold and not councilActionRecord.executed then block {
                    
                    const executeCouncilActionReturn : return = executeCouncilAction(councilActionRecord, actionId, operations, s);
                    
                    s           := executeCouncilActionReturn.1;
                    operations := executeCouncilActionReturn.0;

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
