// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Council Member address
function verifySenderIsCouncilMember(var s : councilStorageType) : unit is
block {

    if Big_map.mem(Mavryk.get_sender(), s.councilMembers) then skip
    else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);

} with unit
    
// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %addVestee entrypoint to add a new vestee on the Vesting contract
function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
    case (Mavryk.get_entrypoint_opt(
        "%addVestee",
        contractAddress) : option(contract(addVesteeType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
        ];



// helper function to %removeVestee entrypoint to remove a vestee on the Vesting contract
function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
    case (Mavryk.get_entrypoint_opt(
        "%removeVestee",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to %updateVestee entrypoint to update a vestee on the Vesting contract
function sendUpdateVesteeParams(const contractAddress : address) : contract(updateVesteeType) is
    case (Mavryk.get_entrypoint_opt(
        "%updateVestee",
        contractAddress) : option(contract(updateVesteeType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
        ];



// helper function to %toggleVesteeLock entrypoint to lock or unlock a vestee on the Vesting contract
function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
    case (Mavryk.get_entrypoint_opt(
        "%toggleVesteeLock",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to %dropFinancialRequest entrypoint on the Governance Financial contract
function sendDropFinancialRequestParams(const contractAddress : address) : contract(nat) is
    case (Mavryk.get_entrypoint_opt(
        "%dropFinancialRequest",
        contractAddress) : option(contract(nat))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(nat))
        ];



// helper function to %requestTokens entrypoint on the Governance Financial contract
function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
    case (Mavryk.get_entrypoint_opt(
        "%requestTokens",
        contractAddress) : option(contract(councilActionRequestTokensType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionRequestTokensType))
        ];



// helper function to %requestMint entrypoint on the Governance Financial contract
function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
    case (Mavryk.get_entrypoint_opt(
        "%requestMint",
        contractAddress) : option(contract(councilActionRequestMintType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionRequestMintType))
        ];



// helper function to %setContractBaker entrypoint on the Governance Financial contract
function sendSetContractBakerParams(const contractAddress : address) : contract(councilActionSetContractBakerType) is
    case (Mavryk.get_entrypoint_opt(
        "%setContractBaker",
        contractAddress) : option(contract(councilActionSetContractBakerType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionSetContractBakerType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get a council action record
function getCouncilActionRecord(const councilActionId : nat; const s : councilStorageType) : councilActionRecordType is
block {

    const councilActionRecord : councilActionRecordType = case Big_map.find_opt(councilActionId, s.councilActionsLedger) of [
            Some (_action) -> _action
        |   None           -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
    ];

} with councilActionRecord



// helper function to check if a satellite can interact with an action
function validateAction(const actionRecord : councilActionRecordType) : unit is
block {

    // Check if council action has been flushed
    if actionRecord.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED)  else skip;

    // Check if council action has already been executed
    if actionRecord.executed then failwith(error_COUNCIL_ACTION_EXECUTED) else skip;

    // check that council action has not expired
    if Mavryk.get_now() > actionRecord.expirationDateTime then failwith(error_COUNCIL_ACTION_EXPIRED) else skip;

} with (unit)



// helper function to check if a satellite can interact with an action
function validateActionById(const councilActionId : nat; const s : councilStorageType) : unit is
block {

    const actionRecord : councilActionRecordType = getCouncilActionRecord(councilActionId, s);

    // Check if governance satellite action has been flushed
    if actionRecord.status = "FLUSHED" then failwith(error_COUNCIL_ACTION_FLUSHED)  else skip;

    // Check if governance satellite action has already been executed
    if actionRecord.executed then failwith(error_COUNCIL_ACTION_EXECUTED) else skip;

    // check that break glass action has not expired
    if Mavryk.get_now() > actionRecord.expirationDateTime then failwith(error_COUNCIL_ACTION_EXPIRED) else skip;

} with (unit)



// helper to create a council action
function createCouncilAction(const actionType : string; const dataMap : dataMapType; var s : councilStorageType) : councilStorageType is 
block {

    const councilActionRecord : councilActionRecordType = record[
        initiator             = Mavryk.get_sender();
        actionType            = actionType;

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        dataMap               = dataMap;

        startDateTime         = Mavryk.get_now();
        startLevel            = Mavryk.get_level();             
        executedDateTime      = None;
        executedLevel         = None;
        expirationDateTime    = Mavryk.get_now() + (86_400 * s.config.actionExpiryDays);
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord;
    s.councilActionsSigners                 := Big_map.add((s.actionCounter, Mavryk.get_sender()), unit, s.councilActionsSigners);

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with(s)



// helper function to verify that council member is in the council
function verifyCouncilMemberExists(const councilMemberAddress : address; const  s : councilStorageType) : unit is 
block {

    if not Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    else skip;

} with unit



// helper function to verify that council member is not in the council
function verifyCouncilMemberDoesNotExist(const councilMemberAddress : address; const  s : councilStorageType) : unit is 
block {

    if Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else skip;

} with unit



// helper function to verify that council threshold is valid and will not be below config threshold
function verifyValidCouncilThreshold(const  s : councilStorageType) : unit is 
block {

    if (abs(s.councilSize - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
    else skip;

} with unit



// helper function to verify that council action exists
function verifyCouncilActionExists(const councilActionId : nat; const s : councilStorageType) : unit is 
block {

    const _councilActionRecord : councilActionRecordType = getCouncilActionRecord(councilActionId, s);

} with unit



// helper function to verify that financial governance request exists
function verifyFinancialRequestExists(const requestId : nat; const s : councilStorageType) : unit is 
block {

    // Get Governance Financial Address from the General Contracts Map on the Governance Contract
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    case (Mavryk.call_view ("getFinancialRequestOpt", requestId, governanceFinancialAddress) : option(option(financialRequestRecordType))) of [
            Some (_requestOpt)  -> case _requestOpt of [
                    Some (_request) -> skip
                |   None            -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
            ]
        |   None -> failwith(error_GET_FINANCIAL_REQUEST_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND)
    ];
    
} with unit



// helper function to verify vestee exists
function verifyVesteeExists(const vesteeAddress : address; const s : councilStorageType) : unit is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const vesteeOptView : option (option(vesteeRecordType)) = Mavryk.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
    case vesteeOptView of [
            Some (_value) -> case _value of [
                    Some (_vestee) -> skip
                |   None           -> failwith (error_VESTEE_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND)
    ];

} with unit 



// helper function to verify vestee does not exist
function verifyVesteeDoesNotExist(const vesteeAddress : address; const s : councilStorageType) : unit is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const vesteeOptView : option (option(vesteeRecordType)) = Mavryk.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
    case vesteeOptView of [
            Some (_value) -> case _value of [
                    Some (_vestee) -> failwith (error_VESTEE_ALREADY_EXISTS)
                |   None           -> skip
            ]
        |   None -> failwith (error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND)
    ];

} with unit 



// helper function to verify token type is correct
function verifyCorrectTokenType(const tokenType : string) : unit is 
block {

    if  tokenType = "FA12" or
        tokenType = "FA2"  or
        tokenType = "TEZ" then skip
    else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

} with unit



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



// helper function to unpack option(key_hash) from dataMap
function unpackKeyHash(const actionRecord : councilActionRecordType; const key : string) : option(key_hash) is 
block {

    const unpackedKeyhash : option(key_hash) = case actionRecord.dataMap[key] of [
            Some(_keyHash) -> case (Bytes.unpack(_keyHash) : option(option(key_hash))) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

} with unpackedKeyhash

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function for addVestee
function addVesteeOperation(const vesteeAddress : address; const totalAllocatedAmount : nat; const cliffInMonths : nat; const vestingInMonths : nat; const s : councilStorageType) : operation is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const addVesteeParams : addVesteeType = record [
        vesteeAddress           = vesteeAddress;
        totalAllocatedAmount    = totalAllocatedAmount;
        cliffInMonths           = cliffInMonths;
        vestingInMonths         = vestingInMonths;
    ];

    const addVesteeOperation : operation = Mavryk.transaction(
        addVesteeParams,
        0mav, 
        sendAddVesteeParams(vestingAddress)
    );

} with addVesteeOperation



// helper function for removeVestee
function removeVesteeOperation(const vesteeAddress : address; const s : councilStorageType) : operation is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const removeVesteeOperation : operation = Mavryk.transaction(
        vesteeAddress,
        0mav, 
        sendRemoveVesteeParams(vestingAddress)
    );

} with removeVesteeOperation



// helper function for updateVestee
function updateVesteeOperation(const vesteeAddress : address; const newTotalAllocatedAmount : nat; const newCliffInMonths : nat; const newVestingInMonths : nat; const s : councilStorageType) : operation is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const updateVesteeParams : updateVesteeType = record [
        vesteeAddress               = vesteeAddress;
        newTotalAllocatedAmount     = newTotalAllocatedAmount;
        newCliffInMonths            = newCliffInMonths;
        newVestingInMonths          = newVestingInMonths;
    ];

    const updateVesteeOperation : operation = Mavryk.transaction(
        updateVesteeParams,
        0mav, 
        sendUpdateVesteeParams(vestingAddress)
    );

} with updateVesteeOperation



// helper function for toggleVesteeLock
function toggleVesteeLockOperation(const vesteeAddress : address; const s : councilStorageType) : operation is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const toggleVesteeLockOperation : operation = Mavryk.transaction(
        vesteeAddress,
        0mav, 
        sendToggleVesteeLockParams(vestingAddress)
    );

} with toggleVesteeLockOperation



// helper function for requestTokens
function requestTokensOperation(const treasuryAddress : address; const receiverAddress : address; const tokenContractAddress : address; const tokenName : string; const tokenAmount : nat; const tokenType : string; const tokenId : nat; const purpose : string; const s : councilStorageType) : operation is 
block {

    // Get Governance Financial Address from the General Contracts Map on the Governance Contract
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    // Validate inputs
    validateStringLength(purpose       , s.config.requestPurposeMaxLength       , error_WRONG_INPUT_PROVIDED);
    validateStringLength(tokenName     , s.config.requestTokenNameMaxLength     , error_WRONG_INPUT_PROVIDED);

    const requestTokensParams : councilActionRequestTokensType = record[
        treasuryAddress       = treasuryAddress;
        receiverAddress       = receiverAddress;
        tokenContractAddress  = tokenContractAddress;
        tokenName             = tokenName;
        tokenAmount           = tokenAmount;
        tokenType             = tokenType;
        tokenId               = tokenId;
        purpose               = purpose;
    ];

    const requestTokensOperation : operation = Mavryk.transaction(
        requestTokensParams,
        0mav, 
        sendRequestTokensParams(governanceFinancialAddress)
    );

} with requestTokensOperation



// helper function for requestMint
function requestMintOperation(const treasuryAddress : address; const receiverAddress : address; const tokenAmount : nat; const purpose : string; const s : councilStorageType) : operation is 
block {

    // Get Governance Financial Address from the General Contracts Map on the Governance Contract
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    // Validate inputs
    validateStringLength(purpose, s.config.requestPurposeMaxLength, error_WRONG_INPUT_PROVIDED);

    const requestMintParams : councilActionRequestMintType = record[
        treasuryAddress  = treasuryAddress;
        receiverAddress  = receiverAddress;
        tokenAmount      = tokenAmount;
        purpose          = purpose;
    ];

    const requestMintOperation : operation = Mavryk.transaction(
        requestMintParams,
        0mav, 
        sendRequestMintParams(governanceFinancialAddress)
    );

} with requestMintOperation



// helper function for setContractBaker
function setContractBakerOperation(const targetContractAddress : address; const keyHash : option(key_hash); const s : councilStorageType) : operation is 
block {

    // Get Governance Financial Address from the General Contracts Map on the Governance Contract
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    const setContractBakerParams : councilActionSetContractBakerType = record[
        targetContractAddress   = targetContractAddress;
        keyHash                 = keyHash;
    ];

    const setContractBakerOperation : operation = Mavryk.transaction(
        setContractBakerParams,
        0mav, 
        sendSetContractBakerParams(governanceFinancialAddress)
    );

} with setContractBakerOperation
 

 // helper function for dropFinancialRequest
function dropFinancialRequestOperation(const requestId : nat; const s : councilStorageType) : operation is 
block {

    // Get Governance Financial Address from the General Contracts Map on the Governance Contract
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    // Verify that financial request exists
    verifyFinancialRequestExists(requestId, s);

    const dropFinancialRequestOperation : operation = Mavryk.transaction(
        requestId,
        0mav, 
        sendDropFinancialRequestParams(governanceFinancialAddress)
    );

} with dropFinancialRequestOperation

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Verify Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to verify entrypoint exists on Vesting Contract
function verifyVestingContractEntrypoint(const entrypointName : string; const s : councilStorageType) : unit is 
block {

    // Get Vesting Contract Address from the General Contracts Map on the Governance Contract
    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    if entrypointName = "addVestee" then {
        
        // Check if addVestee entrypoint exists on the Vesting Contract
        const _checkEntrypoint: contract(addVesteeType) = sendAddVesteeParams(vestingAddress);

    } else if entrypointName = "removeVestee" then {
        
        // Check if removeVestee entrypoint exists on the Vesting Contract
        const _checkEntrypoint: contract(address) = sendRemoveVesteeParams(vestingAddress);

    } else if entrypointName = "updateVestee" then {

        // Check if updateVestee entrypoint exists on the Vesting Contract
        const _checkEntrypoint: contract(updateVesteeType)  = sendUpdateVesteeParams(vestingAddress);

    } else if entrypointName = "toggleVesteeLock" then {

        // Check if toggleVesteeLock entrypoint exists on the Vesting Contract
        const _checkEntrypoint: contract(address) = sendToggleVesteeLockParams(vestingAddress);

    } else failwith(error_SPECIFIED_ENTRYPOINT_NOT_FOUND)

} with unit



 // helper function to verify entrypoint exists on Governance Financial Contract
function verifyGovernanceFinancialContractEntrypoint(const entrypointName : string; const s : councilStorageType) : unit is 
block {

    // Get Governance Financial Address from the General Contracts Map on the Governance Contract 
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    if entrypointName = "requestTokens" then {
        
        // Check if requestTokens entrypoint exists on the Governance Financial Contract 
        const _checkEntrypoint : contract(councilActionRequestTokensType) = sendRequestTokensParams(governanceFinancialAddress);

    } else if entrypointName = "requestMint" then {
        
        // Check if requestMint entrypoint exists on the Governance Financial Contract 
        const _checkEntrypoint: contract(councilActionRequestMintType) = sendRequestMintParams(governanceFinancialAddress);

    } else if entrypointName = "setContractBaker" then {
        
        // Check if setContractBaker entrypoint exists on the Governance Financial Contract 
        const _checkEntrypoint : contract(councilActionSetContractBakerType) = sendSetContractBakerParams(governanceFinancialAddress);

    } else failwith(error_SPECIFIED_ENTRYPOINT_NOT_FOUND)

} with unit

// ------------------------------------------------------------------------------
// Verify Entrypoint Helper Functions End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Sign Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to trigger the add council member action during the signing
function triggerAddCouncilMemberAction(const actionRecord : councilActionRecordType; var s : councilStorageType) : councilStorageType is 
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

    // Check if new council member is already in the council
    const councilMemberInfo: councilMemberInfoType  = record[
        name    = councilMemberName;
        image   = councilMemberImage;
        website = councilMemberWebsite;
    ];

    if Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else {
        s.councilMembers    := Big_map.add(councilMemberAddress, councilMemberInfo, s.councilMembers);
        s.councilSize       := s.councilSize + 1n;
    }

} with (s)



// helper function to trigger the remove council member action during the sign
function triggerRemoveCouncilMemberAction(const actionRecord : councilActionRecordType; var s : councilStorageType) : councilStorageType is
block {

    // fetch params begin ---
    const councilMemberAddress : address = unpackAddress(actionRecord, "councilMemberAddress");
    // fetch params end ---

    // Check if council member is in the council
    if not Big_map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    else skip;

    // Check if removing the council member won't impact the threshold
    if (abs(s.councilSize - 1n)) < s.config.threshold then failwith(error_COUNCIL_THRESHOLD_ERROR)
    else skip;

    s.councilMembers    := Big_map.remove(councilMemberAddress, s.councilMembers);
    s.councilSize       := abs(s.councilSize - 1n);

} with (s)



// helper function to trigger the change council member action during the sign
function triggerChangeCouncilMemberAction(const actionRecord : councilActionRecordType; var s : councilStorageType) : councilStorageType is
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
    
    // Verify that new council member is not already in the council
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



// helper function to trigger the set baker action during the sign
function triggerSetBakerAction(const actionRecord : councilActionRecordType; var operations : list(operation)) : list(operation) is
block {

    const keyHash : option(key_hash) = unpackKeyHash(actionRecord, "keyHash");

    // create setBakerOperation
    const setBakerOperation  : operation        = Mavryk.set_delegate(keyHash);

    operations := setBakerOperation # operations;

} with (operations)



// helper function to trigger the add vestee action during the sign
function triggerAddVesteeAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const vesteeAddress         : address   = unpackAddress(actionRecord, "vesteeAddress");
    const totalAllocatedAmount  : nat       = unpackNat(actionRecord, "totalAllocatedAmount");
    const cliffInMonths         : nat       = unpackNat(actionRecord, "cliffInMonths");
    const vestingInMonths       : nat       = unpackNat(actionRecord, "vestingInMonths");
    // fetch params end ---

    // create addVesteeOperation
    const addVesteeOperation : operation = addVesteeOperation(
        vesteeAddress,
        totalAllocatedAmount,
        cliffInMonths,
        vestingInMonths,
        s
    );

} with (addVesteeOperation # operations)



// helper function to trigger the remove vestee action during the sign
function triggerRemoveVesteeAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {
    
    // fetch params begin ---
    const vesteeAddress : address = unpackAddress(actionRecord, "vesteeAddress");
    // fetch params end ---

    // create removeVesteeOperation
    const removeVesteeOperation : operation = removeVesteeOperation(vesteeAddress, s);    

} with (removeVesteeOperation # operations)



// helper function to trigger the update vestee action during the sign
function triggerUpdateVesteeAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {
    
    // fetch params begin ---
    const vesteeAddress             : address   = unpackAddress(actionRecord, "vesteeAddress");
    const newTotalAllocatedAmount   : nat       = unpackNat(actionRecord, "newTotalAllocatedAmount");
    const newCliffInMonths          : nat       = unpackNat(actionRecord, "newCliffInMonths");
    const newVestingInMonths        : nat       = unpackNat(actionRecord, "newVestingInMonths");
    // fetch params end ---

    // create updateVesteeOperation
    const updateVesteeOperation : operation = updateVesteeOperation(
        vesteeAddress,
        newTotalAllocatedAmount, 
        newCliffInMonths,
        newVestingInMonths,
        s
    );

} with (updateVesteeOperation # operations)



// helper function to trigger the toggle vestee lock action during the sign
function triggerToggleVesteeLockAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const vesteeAddress : address = unpackAddress(actionRecord, "vesteeAddress");
    // fetch end begin ---

    // create toggleVesteeLockOperation
    const toggleVesteeLockOperation : operation = toggleVesteeLockOperation(vesteeAddress, s);

} with (toggleVesteeLockOperation # operations)



// helper function to trigger the transfer action during the sign
function triggerTransferAction(const actionRecord : councilActionRecordType; const operations : list(operation)) : list(operation) is
block {

    // fetch params begin ---
    const receiverAddress       : address   = unpackAddress(actionRecord, "receiverAddress");
    const tokenContractAddress  : address   = unpackAddress(actionRecord, "tokenContractAddress");
    const tokenType             : string    = unpackString(actionRecord, "tokenType");
    const tokenAmount           : nat       = unpackNat(actionRecord, "tokenAmount");
    const tokenId               : nat       = unpackNat(actionRecord, "tokenId");
    // fetch params end ---

    const from_  : address   = Mavryk.get_self_address();
    const to_    : address   = receiverAddress;
    const amt    : nat       = tokenAmount;
    
    // ---- initialise and set token type ----
    var _tokenTransferType : tokenType := Tez;

    if tokenType = "TEZ" then block {
        
        _tokenTransferType      := (Tez: tokenType); 

    } else if tokenType = "FA12" then block {
        
        _tokenTransferType      := (Fa12(tokenContractAddress) : tokenType);

    } else if tokenType = "FA2" then block {

        _tokenTransferType     := (Fa2(record [
            tokenContractAddress    = tokenContractAddress;
            tokenId                 = tokenId;
        ]) : tokenType); 

    } else skip;
    // --- --- ---

    // create transferTokenOperation
    const transferTokenOperation : operation = case _tokenTransferType of [ 
        |   Tez         -> transferTez((Mavryk.get_contract_with_error(to_, "Error. Contract not found at given address") : contract(unit)), amt * 1mumav)
        |   Fa12(token) -> transferFa12Token(from_, to_, amt, token)
        |   Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
    ];

} with (transferTokenOperation # operations)



// helper function to trigger the request token action during the sign
function triggerRequestTokenAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const treasuryAddress       : address   = unpackAddress(actionRecord, "treasuryAddress");
    const receiverAddress       : address   = unpackAddress(actionRecord, "receiverAddress");
    const tokenContractAddress  : address   = unpackAddress(actionRecord, "tokenContractAddress");

    const tokenType             : string    = unpackString(actionRecord, "tokenType");
    const tokenName             : string    = unpackString(actionRecord, "tokenName");
    const purpose               : string    = unpackString(actionRecord, "purpose");

    const tokenAmount           : nat       = unpackNat(actionRecord, "tokenAmount");
    const tokenId               : nat       = unpackNat(actionRecord, "tokenId");
    // fetch params end ---

    // create requestTokensOperation
    const requestTokensOperation : operation = requestTokensOperation(
        treasuryAddress,
        receiverAddress,
        tokenContractAddress,
        tokenName,
        tokenAmount, 
        tokenType,
        tokenId,
        purpose,
        s 
    );

} with (requestTokensOperation # operations)



// helper function to trigger the request mint action during the sign
function triggerRequestMintAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const treasuryAddress       : address   = unpackAddress(actionRecord, "treasuryAddress");
    const receiverAddress       : address   = unpackAddress(actionRecord, "receiverAddress");
    const purpose               : string    = unpackString(actionRecord, "purpose");
    const tokenAmount           : nat       = unpackNat(actionRecord, "tokenAmount");
    // fetch params end ---

    // create requestMintOperation
    const requestMintOperation : operation = requestMintOperation(
        treasuryAddress,
        receiverAddress,
        tokenAmount,
        purpose,
        s 
    );

} with (requestMintOperation # operations)



// helper function to trigger the set contract baker action during the sign
function triggerSetContractBakerAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {
    
    // fetch params begin ---
    const targetContractAddress  : address          = unpackAddress(actionRecord, "targetContractAddress");
    const keyHash                : option(key_hash) = unpackKeyHash(actionRecord, "keyHash");
    // fetch params end ---

    // create setContractBakerOperation
    const setContractBakerOperation : operation = setContractBakerOperation(
        targetContractAddress,
        keyHash,
        s 
    );

} with (setContractBakerOperation # operations)



// helper function to trigger the drop financial request action during the sign
function triggerDropFinancialRequestAction(const actionRecord : councilActionRecordType; const operations : list(operation); const s : councilStorageType) : list(operation) is
block {
                        
    // fetch params begin ---
    const requestId : nat = unpackNat(actionRecord, "requestId");
    // fetch params end ---

    // create dropFinancialRequestOperation
    const dropFinancialRequestOperation : operation =  dropFinancialRequestOperation(requestId, s);

} with (dropFinancialRequestOperation # operations)



// helper function to trigger the flush action action during the sign
function triggerFlushActionAction(const actionRecord : councilActionRecordType; const operations : list(operation); var s : councilStorageType) : return is
block {

    // fetch params begin ---
    const flushedCouncilActionId : nat = unpackNat(actionRecord, "actionId");
    // fetch params end ---

    var flushedCouncilActionRecord : councilActionRecordType := case s.councilActionsLedger[flushedCouncilActionId] of [      
            Some(_record) -> _record
        |   None          -> failwith(error_COUNCIL_ACTION_NOT_FOUND)
    ];

    // check if council can sign the action
    validateAction(flushedCouncilActionRecord);

    flushedCouncilActionRecord.status := "FLUSHED";
    s.councilActionsLedger[flushedCouncilActionId] := flushedCouncilActionRecord;

} with (operations, s)



// helper function to a council action during the signing
function executeCouncilAction(const actionRecord : councilActionRecordType; const actionId : actionIdType; const operations : list(operation); var s : councilStorageType) : return is
block {

    // --------------------------------------
    // execute action based on action types
    // --------------------------------------

    const actionType : string = actionRecord.actionType;

    // ------------------------------------------------------------------------------
    // Council Actions for Internal Control Begin
    // ------------------------------------------------------------------------------

    // initialize an updated operation list
    var updatedOperations : list(operation)                     := operations;

    // addCouncilMember action type
    if actionType = "addCouncilMember" then s                   := triggerAddCouncilMemberAction(actionRecord, s);

    // removeCouncilMember action type
    if actionType = "removeCouncilMember" then s                := triggerRemoveCouncilMemberAction(actionRecord, s);

    // changeCouncilMember action type
    if actionType = "changeCouncilMember" then s                := triggerChangeCouncilMemberAction(actionRecord, s);

    // setBaker action type
    if actionType = "setBaker" then updatedOperations           := triggerSetBakerAction(actionRecord, updatedOperations);

    // ------------------------------------------------------------------------------
    // Council Actions for Internal Control End
    // ------------------------------------------------------------------------------



    // ------------------------------------------------------------------------------
    // Council Actions for Vesting Begin
    // ------------------------------------------------------------------------------

    // addVestee action type
    if actionType = "addVestee" then updatedOperations          := triggerAddVesteeAction(actionRecord, updatedOperations, s);

    // addVestee action type
    if actionType = "removeVestee" then updatedOperations       := triggerRemoveVesteeAction(actionRecord, updatedOperations, s);

    // updateVestee action type
    if actionType = "updateVestee" then updatedOperations       := triggerUpdateVesteeAction(actionRecord, updatedOperations, s);

    // updateVestee action type
    if actionType = "toggleVesteeLock" then updatedOperations   := triggerToggleVesteeLockAction(actionRecord, updatedOperations, s);

    // ------------------------------------------------------------------------------
    // Council Actions for Vesting End
    // ------------------------------------------------------------------------------



    // ------------------------------------------------------------------------------
    // Financial Governance Actions Begin
    // ------------------------------------------------------------------------------

    // transfer action type
    if actionType = "transfer" then updatedOperations           := triggerTransferAction(actionRecord, updatedOperations);

    // requestTokens action type
    if actionType = "requestTokens" then updatedOperations      := triggerRequestTokenAction(actionRecord, updatedOperations, s);

    // requestMint action type
    if actionType = "requestMint" then updatedOperations        := triggerRequestMintAction(actionRecord, updatedOperations, s);

    // setContractBaker action type
    if actionType = "setContractBaker" then updatedOperations   := triggerSetContractBakerAction(actionRecord, updatedOperations, s);

    // dropFinancialRequest action type
    if actionType = "dropFinancialRequest" then updatedOperations:= triggerDropFinancialRequestAction(actionRecord, updatedOperations, s);

    // ------------------------------------------------------------------------------
    // Financial Governance Actions End
    // ------------------------------------------------------------------------------



    // ------------------------------------------------------------------------------
    // Council Signing of Actions Begin
    // ------------------------------------------------------------------------------

    // flush action type
    if actionType = "flushAction" then block {
        const triggerFlushActionActionTrigger : return          = triggerFlushActionAction(actionRecord, updatedOperations, s);
        s                   := triggerFlushActionActionTrigger.1;
        updatedOperations   := triggerFlushActionActionTrigger.0;
    } else skip;

    // ------------------------------------------------------------------------------
    // Council Signing of Actions End
    // ------------------------------------------------------------------------------

    // update council action record status
    var updatedActionRecord : councilActionRecordType := actionRecord;
    updatedActionRecord.status              := "EXECUTED";
    updatedActionRecord.executed            := True;
    updatedActionRecord.executedDateTime    := Some(Mavryk.get_now());
    updatedActionRecord.executedLevel       := Some(Mavryk.get_level());
    
    // save council action record
    s.councilActionsLedger[actionId] := updatedActionRecord;

} with (updatedOperations, s)

// ------------------------------------------------------------------------------
// Sign Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(councilUnpackLambdaFunctionType)) of [
            Some(f) -> f((councilLambdaAction, s))
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
