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
#include "../partials/shared/voteHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvkToken types for transfer
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// // Vesting types for vesting council actions
#include "../partials/contractTypes/vestingTypes.ligo"

// Treasury types for transfer and mint
#include "../partials/contractTypes/treasuryTypes.ligo"

// Council Types
#include "../partials/contractTypes/councilTypes.ligo"

// Governance financial Types
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// ------------------------------------------------------------------------------

// Council Main Entrypoint Actions
type councilAction is 

        // Default Entrypoint to Receive Tez
        Default                                     of unit

        // Housekeeping Actions
    |   SetAdmin                                    of address
    |   SetGovernance                               of (address)
    |   UpdateMetadata                              of updateMetadataType
    |   UpdateConfig                                of councilUpdateConfigParamsType
    |   UpdateWhitelistContracts                    of updateWhitelistContractsType
    |   UpdateGeneralContracts                      of updateGeneralContractsType
    |   UpdateCouncilMemberInfo                     of councilMemberInfoType

        // Council Actions for Internal Control
    |   CouncilActionAddMember                      of councilActionAddMemberType
    |   CouncilActionRemoveMember                   of address
    |   CouncilActionChangeMember                   of councilActionChangeMemberType
    |   CouncilActionSetBaker                       of setBakerType

        // Council Actions for Vesting
    |   CouncilActionAddVestee                      of addVesteeType
    |   CouncilActionRemoveVestee                   of address
    |   CouncilActionUpdateVestee                   of updateVesteeType
    |   CouncilActionToggleVesteeLock               of address

        // Council Actions for Financial Governance
    |   CouncilActionTransfer                       of councilActionTransferType
    |   CouncilActionRequestTokens                  of councilActionRequestTokensType
    |   CouncilActionRequestMint                    of councilActionRequestMintType
    |   CouncilActionSetContractBaker               of councilActionSetContractBakerType
    |   CouncilActionDropFinancialReq               of nat

        // Council Signing of Actions
    |   FlushAction                                 of actionIdType
    |   SignAction                                  of actionIdType                

        // Lambda Entrypoints
    |   SetLambda                                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * councilStorageType

// council contract methods lambdas
type councilUnpackLambdaFunctionType is (councilLambdaActionType * councilStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : councilStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : councilStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Council Member address
function checkSenderIsCouncilMember(var s : councilStorageType) : unit is
    if Map.mem(Tezos.get_sender(), s.councilMembers) then unit 
    else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------



// helper function to %addVestee entrypoint to add a new vestee on the Vesting contract
function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
    case (Tezos.get_entrypoint_opt(
        "%addVestee",
        contractAddress) : option(contract(addVesteeType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
        ];



// helper function to %removeVestee entrypoint to remove a vestee on the Vesting contract
function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%removeVestee",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to %updateVestee entrypoint to update a vestee on the Vesting contract
function sendUpdateVesteeParams(const contractAddress : address) : contract(updateVesteeType) is
    case (Tezos.get_entrypoint_opt(
        "%updateVestee",
        contractAddress) : option(contract(updateVesteeType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
        ];



// helper function to %toggleVesteeLock entrypoint to lock or unlock a vestee on the Vesting contract
function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%toggleVesteeLock",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to %requestTokens entrypoint on the Governance Financial contract
function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
    case (Tezos.get_entrypoint_opt(
        "%requestTokens",
        contractAddress) : option(contract(councilActionRequestTokensType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionRequestTokensType))
        ];



// helper function to %requestMint entrypoint on the Governance Financial contract
function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
    case (Tezos.get_entrypoint_opt(
        "%requestMint",
        contractAddress) : option(contract(councilActionRequestMintType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionRequestMintType))
        ];



// helper function to %dropFinancialRequest entrypoint on the Governance Financial contract
function sendDropFinancialRequestParams(const contractAddress : address) : contract(nat) is
    case (Tezos.get_entrypoint_opt(
        "%dropFinancialRequest",
        contractAddress) : option(contract(nat))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(nat))
        ];



// helper function to %setContractBaker entrypoint on the Governance Financial contract
function sendSetContractBakerParams(const contractAddress : address) : contract(councilActionSetContractBakerType) is
    case (Tezos.get_entrypoint_opt(
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



// helper to create a council action
function createCouncilAction(const actionType : string; const addressMap : addressMapType; const stringMap : stringMapType; const natMap : natMapType; const keyHash : option(key_hash); var s : councilStorageType) : councilStorageType is 
block {

    var councilActionRecord : councilActionRecordType := record[
        initiator             = Tezos.get_sender();
        actionType            = actionType;
        signers               = set[Tezos.get_sender()];

        status                = "PENDING";
        signersCount          = 1n;
        executed              = False;

        addressMap            = addressMap;
        stringMap             = stringMap;
        natMap                = natMap;
        keyHash               = keyHash;

        startDateTime         = Tezos.get_now();
        startLevel            = Tezos.get_level();             
        executedDateTime      = Tezos.get_now();
        executedLevel         = Tezos.get_level();
        expirationDateTime    = Tezos.get_now() + (86_400 * s.config.actionExpiryDays);
    ];
    s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

    // increment action counter
    s.actionCounter := s.actionCounter + 1n;

} with(s)

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------

// helper function to trigger the add council member action during the sign
function triggerAddCouncilMemberAction(const actionRecord : councilActionRecordType; var s : councilStorageType) : councilStorageType is 
block {

    // fetch params begin ---
    const councilMemberAddress : address = case actionRecord.addressMap["councilMemberAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberName : string = case actionRecord.stringMap["councilMemberName"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberImage : string = case actionRecord.stringMap["councilMemberImage"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const councilMemberWebsite : string = case actionRecord.stringMap["councilMemberWebsite"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Validate inputs
    if String.length(councilMemberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(councilMemberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(councilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    // Check if new council member is already in the council
    const councilMemberInfo: councilMemberInfoType  = record[
        name    = councilMemberName;
        image   = councilMemberImage;
        website = councilMemberWebsite;
    ];

    if Map.mem(councilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else s.councilMembers := Map.add(councilMemberAddress, councilMemberInfo, s.councilMembers);

} with (s)



// helper function to trigger the remove council member action during the sign
function triggerRemoveCouncilMemberAction(const actionRecord : councilActionRecordType; var s : councilStorageType) : councilStorageType is
block {

    // fetch params begin ---
    const councilMemberAddress : address = case actionRecord.addressMap["councilMemberAddress"] of [
            Some(_address) -> _address
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
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
function triggerChangeCouncilMemberAction(const actionRecord : councilActionRecordType; var s : councilStorageType) : councilStorageType is
block {

    // fetch params begin ---
    const oldCouncilMemberAddress : address = case actionRecord.addressMap["oldCouncilMemberAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newCouncilMemberAddress : address = case actionRecord.addressMap["newCouncilMemberAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newCouncilMemberName : string = case actionRecord.stringMap["newCouncilMemberName"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newCouncilMemberImage : string = case actionRecord.stringMap["newCouncilMemberImage"] of [
            Some(_string) -> _string
        |    None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newCouncilMemberWebsite : string = case actionRecord.stringMap["newCouncilMemberWebsite"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Validate inputs
    if String.length(newCouncilMemberName)    > s.config.councilMemberNameMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(newCouncilMemberImage)   > s.config.councilMemberImageMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(newCouncilMemberWebsite) > s.config.councilMemberWebsiteMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    // Check if new council member is already in the council
    if Map.mem(newCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_ALREADY_EXISTS)
    else skip;

    // Check if old council member is in the council
    if not Map.mem(oldCouncilMemberAddress, s.councilMembers) then failwith(error_COUNCIL_MEMBER_NOT_FOUND)
    else skip;

    const councilMemberInfo: councilMemberInfoType  = record[
        name    = newCouncilMemberName;
        image   = newCouncilMemberImage;
        website = newCouncilMemberWebsite;
    ];

    s.councilMembers := Map.add(newCouncilMemberAddress, councilMemberInfo, s.councilMembers);
    s.councilMembers := Map.remove(oldCouncilMemberAddress, s.councilMembers);

} with (s)



// helper function to trigger the set baker action during the sign
function triggerSetBakerAction(const actionRecord : councilActionRecordType; var operations : list(operation)) : list(operation) is
block {

    const keyHash            : option(key_hash) = actionRecord.keyHash;
    const setBakerOperation  : operation        = Tezos.set_delegate(keyHash);

    operations := setBakerOperation # operations;

} with (operations)



// helper function to trigger the add vestee action during the sign
function triggerAddVesteeAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const vesteeAddress : address = case actionRecord.addressMap["vesteeAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const totalAllocatedAmount : nat = case actionRecord.natMap["totalAllocatedAmount"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const cliffInMonths : nat = case actionRecord.natMap["cliffInMonths"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const vestingInMonths : nat = case actionRecord.natMap["vestingInMonths"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    const addVesteeParams : addVesteeType = record [
        vesteeAddress           = vesteeAddress;
        totalAllocatedAmount    = totalAllocatedAmount;
        cliffInMonths           = cliffInMonths;
        vestingInMonths         = vestingInMonths;
    ];

    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const addVesteeOperation : operation = Tezos.transaction(
        addVesteeParams,
        0tez, 
        sendAddVesteeParams(vestingAddress)
    );
    
    operations := addVesteeOperation # operations;

} with (operations)



// helper function to trigger the remove vestee action during the sign
function triggerRemoveVesteeAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {
    
    // fetch params begin ---
    const vesteeAddress : address = case actionRecord.addressMap["vesteeAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const removeVesteeOperation : operation = Tezos.transaction(
        vesteeAddress,
        0tez, 
        sendRemoveVesteeParams(vestingAddress)
    );
    
    operations := removeVesteeOperation # operations;

} with (operations)



// helper function to trigger the update vestee action during the sign
function triggerUpdateVesteeAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {
    
    // fetch params begin ---
    const vesteeAddress : address = case actionRecord.addressMap["vesteeAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newTotalAllocatedAmount : nat = case actionRecord.natMap["newTotalAllocatedAmount"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newCliffInMonths : nat = case actionRecord.natMap["newCliffInMonths"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const newVestingInMonths : nat = case actionRecord.natMap["newVestingInMonths"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    const updateVesteeParams : updateVesteeType = record [
        vesteeAddress               = vesteeAddress;
        newTotalAllocatedAmount     = newTotalAllocatedAmount;
        newCliffInMonths            = newCliffInMonths;
        newVestingInMonths          = newVestingInMonths;
    ];

    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const updateVesteeOperation : operation = Tezos.transaction(
        updateVesteeParams,
        0tez, 
        sendUpdateVesteeParams(vestingAddress)
    );

    operations := updateVesteeOperation # operations;

} with (operations)



// helper function to trigger the toggle vestee lock action during the sign
function triggerToggleVesteeLockAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const vesteeAddress : address = case actionRecord.addressMap["vesteeAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch end begin ---

    const vestingAddress: address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    const toggleVesteeLockOperation : operation = Tezos.transaction(
        vesteeAddress,
        0tez, 
        sendToggleVesteeLockParams(vestingAddress)
    );

    operations := toggleVesteeLockOperation # operations;

} with (operations)



// helper function to trigger the transfer action during the sign
function triggerTransferAction(const actionRecord : councilActionRecordType; var operations : list(operation)) : list(operation) is
block {

    // fetch params begin ---
    const receiverAddress : address = case actionRecord.addressMap["receiverAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenContractAddress : address = case actionRecord.addressMap["tokenContractAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenType : string = case actionRecord.stringMap["tokenType"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenAmount : nat = case actionRecord.natMap["tokenAmount"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenId : nat = case actionRecord.natMap["tokenId"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    const from_  : address   = Tezos.get_self_address();
    const to_    : address   = receiverAddress;
    const amt    : nat       = tokenAmount;
    
    // ---- set token type ----
    var _tokenTransferType : tokenType := Tez;

    if  tokenType = "TEZ" then block {
        _tokenTransferType      := (Tez: tokenType); 
    } else skip;

    if  tokenType = "FA12" then block {
        _tokenTransferType      := (Fa12(tokenContractAddress) : tokenType);
    } else skip;

    if  tokenType = "FA2" then block {

        _tokenTransferType     := (Fa2(record [
            tokenContractAddress    = tokenContractAddress;
            tokenId                 = tokenId;
        ]) : tokenType); 

    } else skip;
    // --- --- ---

    const transferTokenOperation : operation = case _tokenTransferType of [ 
        |   Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address") : contract(unit)), amt * 1mutez)
        |   Fa12(token) -> transferFa12Token(from_, to_, amt, token)
        |   Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
    ];

    operations := transferTokenOperation # operations;

} with (operations)



// helper function to trigger the request token action during the sign
function triggerRequestTokenAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const treasuryAddress : address = case actionRecord.addressMap["treasuryAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenContractAddress : address = case actionRecord.addressMap["tokenContractAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenType : string = case actionRecord.stringMap["tokenType"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenName : string = case actionRecord.stringMap["tokenName"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const purpose : string = case actionRecord.stringMap["purpose"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenAmount : nat = case actionRecord.natMap["tokenAmount"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenId : nat = case actionRecord.natMap["tokenId"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Validate inputs
    if String.length(purpose)   > s.config.requestPurposeMaxLength   then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    if String.length(tokenName) > s.config.requestTokenNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    const requestTokensParams : councilActionRequestTokensType = record[
        treasuryAddress       = treasuryAddress;
        tokenContractAddress  = tokenContractAddress;
        tokenName             = tokenName;
        tokenAmount           = tokenAmount;
        tokenType             = tokenType;
        tokenId               = tokenId;
        purpose               = purpose;
    ];

    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    const requestTokensOperation : operation = Tezos.transaction(
        requestTokensParams,
        0tez, 
        sendRequestTokensParams(governanceFinancialAddress)
    );

    operations := requestTokensOperation # operations;

} with (operations)



// helper function to trigger the request mint action during the sign
function triggerRequestMintAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {

    // fetch params begin ---
    const treasuryAddress : address = case actionRecord.addressMap["treasuryAddress"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const purpose : string = case actionRecord.stringMap["purpose"] of [
            Some(_string) -> _string
        |   None          -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];

    const tokenAmount : nat = case actionRecord.natMap["tokenAmount"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    // Validate inputs
    if String.length(purpose) > s.config.requestPurposeMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    const requestMintParams : councilActionRequestMintType = record[
        tokenAmount      = tokenAmount;
        treasuryAddress  = treasuryAddress;
        purpose          = purpose;
    ];

    const requestMintOperation : operation = Tezos.transaction(
        requestMintParams,
        0tez, 
        sendRequestMintParams(governanceFinancialAddress)
    );

    operations := requestMintOperation # operations;

} with (operations)



// helper function to trigger the set contract baker action during the sign
function triggerSetContractBakerAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {
    
    // fetch params begin ---
    const targetContractAddress : address = case actionRecord.addressMap["targetContractAddress"] of [
            Some(_address) -> _address
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    const setContractBakerParams : councilActionSetContractBakerType = record[
        targetContractAddress   = targetContractAddress;
        keyHash                 = actionRecord.keyHash;
    ];

    const setContractBakerOperation : operation = Tezos.transaction(
        setContractBakerParams,
        0tez, 
        sendSetContractBakerParams(governanceFinancialAddress)
    );

    operations := setContractBakerOperation # operations;

} with (operations)



// helper function to trigger the drop financial request action during the sign
function triggerDropFinancialRequestAction(const actionRecord : councilActionRecordType; var operations : list(operation); const s : councilStorageType) : list(operation) is
block {
                        
    // fetch params begin ---
    const requestId : nat = case actionRecord.natMap["requestId"] of [
            Some(_address) -> _address
        |   None -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
    // fetch params end ---

    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    // check if request exists
    case (Tezos.call_view ("getFinancialRequestOpt", requestId, governanceFinancialAddress) : option(option(financialRequestRecordType))) of [
            Some (_requestOpt)  -> case _requestOpt of [
                    Some (_request) -> skip
                |   None            -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
            ]
        |   None                -> failwith(error_GET_FINANCIAL_REQUEST_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND)
    ];

    const dropFinancialRequestOperation : operation = Tezos.transaction(
        requestId,
        0tez, 
        sendDropFinancialRequestParams(governanceFinancialAddress)
    );

    operations := dropFinancialRequestOperation # operations;

} with (operations)



// helper function to trigger the flush action action during the sign
function triggerFlushActionAction(const actionRecord : councilActionRecordType; var operations : list(operation); var s : councilStorageType) : return is
block {

    // fetch params begin ---
    const flushedCouncilActionId : nat = case actionRecord.natMap["actionId"] of [
            Some(_nat) -> _nat
        |   None       -> failwith(error_COUNCIL_ACTION_PARAMETER_NOT_FOUND)
    ];
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



// helper function to a council action during the sign
function executeCouncilAction(var actionRecord : councilActionRecordType; const actionId : actionIdType; var operations : list(operation); var s : councilStorageType) : return is
block {

    // --------------------------------------
    // execute action based on action types
    // --------------------------------------

    const actionType : string = actionRecord.actionType;

    // ------------------------------------------------------------------------------
    // Council Actions for Internal Control Begin
    // ------------------------------------------------------------------------------

    // addCouncilMember action type
    if actionType = "addCouncilMember" then s                   := triggerAddCouncilMemberAction(actionRecord, s);

    // removeCouncilMember action type
    if actionType = "removeCouncilMember" then s                := triggerRemoveCouncilMemberAction(actionRecord, s);

    // changeCouncilMember action type
    if actionType = "changeCouncilMember" then s                := triggerChangeCouncilMemberAction(actionRecord, s);

    // setBaker action type
    if actionType = "setBaker" then operations               := triggerSetBakerAction(actionRecord, operations);

    // ------------------------------------------------------------------------------
    // Council Actions for Internal Control End
    // ------------------------------------------------------------------------------



    // ------------------------------------------------------------------------------
    // Council Actions for Vesting Begin
    // ------------------------------------------------------------------------------

    // addVestee action type
    if actionType = "addVestee" then operations              := triggerAddVesteeAction(actionRecord, operations, s);

    // addVestee action type
    if actionType = "removeVestee" then operations           := triggerRemoveVesteeAction(actionRecord, operations, s);

    // updateVestee action type
    if actionType = "updateVestee" then operations           := triggerUpdateVesteeAction(actionRecord, operations, s);

    // updateVestee action type
    if actionType = "toggleVesteeLock" then operations       := triggerToggleVesteeLockAction(actionRecord, operations, s);

    // ------------------------------------------------------------------------------
    // Council Actions for Vesting End
    // ------------------------------------------------------------------------------



    // ------------------------------------------------------------------------------
    // Financial Governance Actions Begin
    // ------------------------------------------------------------------------------

    // transfer action type
    if actionType = "transfer" then operations               := triggerTransferAction(actionRecord, operations);

    // requestTokens action type
    if actionType = "requestTokens" then operations          := triggerRequestTokenAction(actionRecord, operations, s);

    // requestMint action type
    if actionType = "requestMint" then operations            := triggerRequestMintAction(actionRecord, operations, s);

    // setContractBaker action type
    if actionType = "setContractBaker" then operations       := triggerSetContractBakerAction(actionRecord, operations, s);

    // dropFinancialRequest action type
    if actionType = "dropFinancialRequest" then operations   := triggerDropFinancialRequestAction(actionRecord, operations, s);

    // ------------------------------------------------------------------------------
    // Financial Governance Actions End
    // ------------------------------------------------------------------------------



    // ------------------------------------------------------------------------------
    // Council Signing of Actions Begin
    // ------------------------------------------------------------------------------

    // flush action type
    if actionType = "flushAction" then block {
        const triggerFlushActionActionTrigger : return          = triggerFlushActionAction(actionRecord, operations, s);
        s               := triggerFlushActionActionTrigger.1;
        operations   := triggerFlushActionActionTrigger.0;
    } else skip;

    // ------------------------------------------------------------------------------
    // Council Signing of Actions End
    // ------------------------------------------------------------------------------

    // update council action record status
    actionRecord.status              := "EXECUTED";
    actionRecord.executed            := True;
    actionRecord.executedDateTime    := Tezos.get_now();
    actionRecord.executedLevel       := Tezos.get_level();
    
    // save council action record
    s.councilActionsLedger[actionId]         := actionRecord;

} with (operations, s)

// ------------------------------------------------------------------------------
// Sign Helper Functions Begin
// ------------------------------------------------------------------------------



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
            Some(f) -> f(councilLambdaAction, s)
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

// Council Lambdas:
#include "../partials/contractLambdas/council/councilLambdas.ligo"

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
[@view] function getAdmin(const _ : unit; var s : councilStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : councilStorageType) : councilConfigType is
    s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _ : unit; var s : councilStorageType) : councilMembersType is
    s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : councilStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : councilStorageType) : generalContractsType is
    s.generalContracts    



(* View: get a council action *)
[@view] function getCouncilActionOpt(const actionId: nat; var s : councilStorageType) : option(councilActionRecordType) is
    Big_map.find_opt(actionId, s.councilActionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; var s : councilStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : councilStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : councilStorageType) : lambdaLedgerType is
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
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : councilUpdateConfigParamsType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateCouncilMemberInfo entrypoint - update the info of a council member *)
function updateCouncilMemberInfo(const councilMemberInfo : councilMemberInfoType; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateCouncilMemberInfo(councilMemberInfo);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Internal Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddMember entrypoint  *)
function councilActionAddMember(const newCouncilMember : councilActionAddMemberType ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionAddMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionAddMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRemoveMember entrypoint  *)
function councilActionRemoveMember(const councilMemberAddress : address ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRemoveMember"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionRemoveMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionChangeMember entrypoint  *)
function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionChangeMember"] of [
        | Some(_v) -> _v
        | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionChangeMember(councilActionChangeMemberParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionSetBaker entrypoint  *)
function councilActionSetBaker(const councilActionSetBakerParams : setBakerType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionSetBaker"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionSetBaker(councilActionSetBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Internal Control Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddVestee entrypoint  *)
function councilActionAddVestee(const addVesteeParams : addVesteeType ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionAddVestee"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionAddVestee(addVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRemoveVestee entrypoint  *)
function councilActionRemoveVestee(const vesteeAddress : address ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRemoveVestee"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionRemoveVestee(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionUpdateVestee entrypoint  *)
function councilActionUpdateVestee(const updateVesteeParams : updateVesteeType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionUpdateVestee"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionUpdateVestee(updateVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionToggleVesteeLock entrypoint  *)
function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionToggleVesteeLock"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilToggleVesteeLock(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Financial Governance Begin
// ------------------------------------------------------------------------------

(*  councilActionTransfer entrypoint  *)
function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionTransfer(councilActionTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRequestTokens entrypoint  *)
function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRequestTokens"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRequestTokens(councilActionRequestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRequestMint entrypoint  *)
function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRequestMint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRequestMint(councilActionRequestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionSetContractBaker entrypoint  *)
function councilActionSetContractBaker(const councilActionSetContractBakerParams : councilActionSetContractBakerType ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionSetContractBaker"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilSetContractBaker(councilActionSetContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionDropFinancialRequest entrypoint  *)
function councilActionDropFinancialRequest(const requestId : nat ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionDropFinancialRequest"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilDropFinancialReq(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Financial Governance End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction entrypoint  *)
function flushAction(const actionId : actionIdType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFlushAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId : actionIdType; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSignAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : councilStorageType) : return is
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
function main (const action : councilAction; const s : councilStorageType) : return is 

    case action of [
      
            // Default Entrypoint to Receive Tez
            Default(_parameters)                          -> ((nil : list(operation)), s)

            // Housekeeping Actions
        |   SetAdmin(parameters)                          -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   UpdateCouncilMemberInfo(parameters)           -> updateCouncilMemberInfo(parameters, s)
        
            // Council Actions for Internal Control
        |   CouncilActionAddMember(parameters)            -> councilActionAddMember(parameters, s)
        |   CouncilActionRemoveMember(parameters)         -> councilActionRemoveMember(parameters, s)
        |   CouncilActionChangeMember(parameters)         -> councilActionChangeMember(parameters, s)
        |   CouncilActionSetBaker(parameters)             -> councilActionSetBaker(parameters, s)

            // Council Actions for Vesting
        |   CouncilActionAddVestee(parameters)            -> councilActionAddVestee(parameters, s)
        |   CouncilActionRemoveVestee(parameters)         -> councilActionRemoveVestee(parameters, s)
        |   CouncilActionUpdateVestee(parameters)         -> councilActionUpdateVestee(parameters, s)
        |   CouncilActionToggleVesteeLock(parameters)     -> councilActionToggleVesteeLock(parameters, s)
        
            // Council Actions for Financial Governance
        |   CouncilActionTransfer(parameters)             -> councilActionTransfer(parameters, s)
        |   CouncilActionRequestTokens(parameters)        -> councilActionRequestTokens(parameters, s)
        |   CouncilActionRequestMint(parameters)          -> councilActionRequestMint(parameters, s)
        |   CouncilActionSetContractBaker(parameters)     -> councilActionSetContractBaker(parameters, s)
        |   CouncilActionDropFinancialReq(parameters)     -> councilActionDropFinancialRequest(parameters, s)

            // Council Signing of Actions 
        |   FlushAction(parameters)                       -> flushAction(parameters, s)
        |   SignAction(parameters)                        -> signAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)
    ]
