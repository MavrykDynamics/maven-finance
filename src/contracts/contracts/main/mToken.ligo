// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Constants
#include "../partials/shared/constants.ligo"

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// mToken Types
#include "../partials/contractTypes/mTokenTypes.ligo"

// Vault Types  
#include "../partials/contractTypes/vaultTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Housekeeping Entrypoints
        SetAdmin                  of address
    |   SetGovernance             of address
    |   UpdateWhitelistContracts  of updateWhitelistContractsType
    |   MistakenTransfer          of transferActionType

        // FA2 Entrypoints
    |   Transfer                  of fa2TransferType
    |   Balance_of                of balanceOfType
    |   Update_operators          of updateOperatorsType
    |   AssertMetadata            of assertMetadataType

        // Additional Entrypoints 
    |   MintOrBurn                of mintOrBurnType
    |   Compound                  of compoundType


type return is list (operation) * mTokenStorageType
const noOperations : list (operation) = nil;

// const fixedPointAccuracy : nat      = 1_000_000_000_000_000_000_000_000_000n;   // 10^27     - // for use in division

// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mTokenStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s : mTokenStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : mTokenStorageType) : unit is
block{

  if Tezos.get_sender() = s.admin then skip
  else {
    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    
    if Tezos.get_sender() = governanceSatelliteAddress then skip
    else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);

  }
} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Helper Functions Begin
// ------------------------------------------------------------------------------

function checkTokenId(const tokenId : tokenIdType) : unit is
    if tokenId =/= 0n then failwith("FA2_TOKEN_UNDEFINED")
    else unit



function checkBalance(const spenderBalance : tokenBalanceType; const tokenAmount: tokenBalanceType) : unit is
    if spenderBalance < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE")
    else unit



function checkOwnership(const owner : ownerType) : unit is
    if Tezos.get_sender() =/= owner then failwith("FA2_NOT_OWNER")
    else unit



function checkOperator(const owner : ownerType; const token_id : tokenIdType; const operators : operatorsType) : unit is
    if owner = Tezos.get_sender() or Big_map.mem((owner, Tezos.get_sender(), token_id), operators) then unit
    else failwith ("FA2_NOT_OPERATOR")



// mergeOperations helper function - used in transfer entrypoint
function mergeOperations(const first : list (operation); const second : list (operation)) : list (operation) is 
List.fold( 
    function(const operations : list(operation); const operation : operation) : list(operation) is operation # operations,
    first,
    second
)



// addOperator helper function - used in update_operators entrypoint
function addOperator(const operatorParameter : operatorParameterType; const operators : operatorsType) : operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey : (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.update(operatorKey, Some (unit), operators))



// removeOperator helper function - used in update_operators entrypoint
function removeOperator(const operatorParameter : operatorParameterType; const operators : operatorsType) : operatorsType is
block {

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey : (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.remove(operatorKey, operators))



// get raw user balance from ledger
function getRawBalance(const userAddress : address; const s : mTokenStorageType) : nat is 
block {

    var rawUserBalance : tokenBalanceType := case s.ledger[userAddress] of [
            Some (balance) -> balance
        |   None           -> 0n
    ];

} with rawUserBalance



// get raw user reward index
function getUserRewardIndex(const userAddress : address; const tokenRewardIndex : nat; const s : mTokenStorageType) : nat is 
block {

    const userRewardIndex : nat = case s.rewardIndexLedger[userAddress] of [
            Some (index) -> index
        |   None         -> tokenRewardIndex
    ];

} with userRewardIndex



// calculate additional rewards
function calculateAdditionalRewards(const userRewardIndex : nat; const tokenRewardIndex : nat; const userTokenBalance : nat) : nat is
block {

    // tokenRewardIndex is monotonically increasing and should always be greater than user reward index
    if userRewardIndex > tokenRewardIndex then failwith(error_CALCULATION_ERROR) else skip;
    const currentRewardsPerShare : nat = abs(tokenRewardIndex - userRewardIndex);

    // calculate additional rewards
    const additionalRewards : nat = (currentRewardsPerShare * userTokenBalance) / fixedPointAccuracy;

} with additionalRewards



// update user balance and user reward index
function updateUserBalanceAndRewardIndex(const userAddress : address; const newUserBalance : nat; const newUserRewardIndex : nat; var s : mTokenStorageType) : mTokenStorageType is 
block {

    s.ledger[userAddress]            := newUserBalance;
    s.rewardIndexLedger[userAddress] := newUserRewardIndex;

} with s

// ------------------------------------------------------------------------------
// FA2 Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------

(* Get loan token record from lending controller contract *)
function getLoanTokenRecordFromLendingController(const loanTokenName : string; const s : mTokenStorageType) : loanTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get loan token record of user from Lending Controller through on-chain views
    const getLoanTokenRecordOptView : option (option (loanTokenRecordType)) = Tezos.call_view ("getLoanTokenRecordOpt", loanTokenName, lendingControllerAddress);
    const loanTokenRecord : loanTokenRecordType = case getLoanTokenRecordOptView of [
            Some (_viewResult)  -> case _viewResult of [
                    Some (_record)  -> _record
                |   None            -> failwith (error_LOAN_TOKEN_RECORD_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_LOAN_TOKEN_RECORD_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND)
    ];

} with loanTokenRecord

// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : mTokenStorageType) : address is
    s.admin



(* get: whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const store : mTokenStorageType) : option(unit) is
    Big_map.find_opt(contractAddress, store.whitelistContracts)



(* get: operator *)
[@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const s : mTokenStorageType) : option(unit) is
    Big_map.find_opt(operator, s.operators)



(* get: balance View *)
[@view] function get_balance(const userAndId : ownerType * nat; const s : mTokenStorageType) : tokenBalanceType is
block {

    // init user address
    const userAddress       : address           = userAndId.0;

    // get current token reward index i.e. loan token accumulated rewards per share
    const tokenRewardIndex  : nat               = s.tokenRewardIndex;

    // get user reward index and user raw balance
    const userRewardIndex   : nat               = getUserRewardIndex(userAddress, tokenRewardIndex, s);
    var userTokenBalance    : tokenBalanceType := getRawBalance(userAddress, s);

    // reflect token updated balance
    if(userRewardIndex = tokenRewardIndex) then skip     // no change to token balance
    else {

        // increment token balance with calculated additional rewards 
        const additionalRewards : nat = calculateAdditionalRewards(userRewardIndex, tokenRewardIndex, userTokenBalance);
        userTokenBalance := userTokenBalance + additionalRewards;

    };

} with userTokenBalance



(* get: reward index View *)
[@view] function get_reward_index(const userAddress : ownerType; const s : mTokenStorageType) : nat is
block {

    // get user reward index 
    const userRewardIndex : nat = case s.rewardIndexLedger[userAddress] of [
            Some (index) -> index
        |   None         -> 0n
    ];

} with userRewardIndex


(* total_supply View *)
[@view] function get_raw_total_supply(const _tokenId : nat; const s : mTokenStorageType) : tokenBalanceType is
    s.totalSupply



(* total_supply View *)
[@view] function get_raw_token_reward_index(const _tokenId : nat; const s : mTokenStorageType) : nat is
    s.tokenRewardIndex



(* total_supply View *)
[@view] function get_raw_supply_and_reward_index(const _tokenId : nat; const s : mTokenStorageType) : (tokenBalanceType * nat) is
    (s.totalSupply, s.tokenRewardIndex)



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _s : mTokenStorageType) : list(nat) is
    list[0n]



(* check if operator *)
[@view] function is_operator(const operator : (ownerType * operatorType * nat); const s : mTokenStorageType) : bool is
    Big_map.mem(operator, s.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId : nat; const s : mTokenStorageType) : tokenMetadataInfoType is
    case Big_map.find_opt(tokenId, s.token_metadata) of [
            Some (_metadata)  -> _metadata
        |   None -> record[
                token_id    = tokenId;
                token_info  = map[]
            ]
    ]

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
function setAdmin(const newAdminAddress : address; var s : mTokenStorageType) : return is
block {

    checkSenderIsAllowed(s);
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : mTokenStorageType) : return is
block {
    
    checkSenderIsAllowed(s);
    s.governanceAddress := newGovernanceAddress;

} with (noOperations, s)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsTypes : updateWhitelistContractsType; var s : mTokenStorageType) : return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsTypes, s.whitelistContracts);
  
} with (noOperations, s)



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationTypes : transferActionType; var s : mTokenStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the parameters sent

    // Check if the sender is admin or the Governance Satellite Contract
    checkSenderIsAdminOrGovernanceSatelliteContract(s);

    // Operations list
    var operations : list(operation) := nil;

    // Create transfer operations
    function transferOperationFold(const transferParam : transferDestinationType; const operationList : list(operation)) : list(operation) is
        block{

            const transferTokenOperation : operation = case transferParam.token of [
                |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                |   Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
            ];

        } with (transferTokenOperation # operationList);
    
    operations  := List.fold_right(transferOperationFold, destinationTypes, operations)

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// FA2 Entrypoints Begin
// ------------------------------------------------------------------------------

(* assertMetadata entrypoint *)
function assertMetadata(const assertMetadataParams : assertMetadataType; const s : mTokenStorageType) : return is
block{

    const metadataKey  : string  = assertMetadataParams.key;
    const metadataHash : bytes   = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, s.metadata) of [
            Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
        |   None     -> failwith("METADATA_NOT_FOUND")
    ]

} with (noOperations, s)



(* transfer entrypoint *)
function transfer(const transferParams : fa2TransferType; const s : mTokenStorageType) : return is
block{

    function makeTransfer(const account : return; const transferParam : transfer) : return is
        block {

            const owner : ownerType = transferParam.from_;
            const txs : list(transferDestination) = transferParam.txs;

            // get loan token record from Lending Controller through on-chain views
            const loanTokenRecord    : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
            const tokenRewardIndex   : nat                 = loanTokenRecord.tokenRewardIndex; // decimals: 1e27
             
            function transferTokens(var accumulator : mTokenStorageType; const destination : transferDestination) : mTokenStorageType is
            block {

                // init variables
                const tokenId       : tokenIdType       = destination.token_id;
                const tokenAmount   : tokenBalanceType  = destination.amount;
                const receiver      : ownerType         = destination.to_;
                var newTotalSupply  : nat               := s.totalSupply;

                // get token balance for owner and receiver
                var ownerTokenBalance      : tokenBalanceType := getRawBalance(owner, s);
                var receiverTokenBalance   : tokenBalanceType := getRawBalance(receiver, s);

                // get reward indexes for owner and receiver
                const ownerRewardIndex     : nat               = getUserRewardIndex(owner, tokenRewardIndex, s);
                const receiverRewardIndex  : nat               = getUserRewardIndex(receiver, tokenRewardIndex, s);

                // reflect token updated balance for owner and receiver
                if(ownerRewardIndex = tokenRewardIndex) then skip     // no change to token balance
                else {
                    
                    // increment token balance with calculated additional rewards 
                    const ownerAdditionalRewards : nat = calculateAdditionalRewards(ownerRewardIndex, tokenRewardIndex, ownerTokenBalance);
                    ownerTokenBalance   := ownerTokenBalance + ownerAdditionalRewards;
                    newTotalSupply      := newTotalSupply + ownerAdditionalRewards;

                }; 

                if(receiverRewardIndex = tokenRewardIndex) then skip     // no change to token balance
                else {

                    // increment token balance with calculated additional rewards 
                    const receiverAdditionalRewards : nat = calculateAdditionalRewards(receiverRewardIndex, tokenRewardIndex, receiverTokenBalance);
                    receiverTokenBalance := receiverTokenBalance + receiverAdditionalRewards;
                    newTotalSupply := newTotalSupply + receiverAdditionalRewards;

                }; 

                // Validate operator
                checkOperator(owner, tokenId, account.1.operators);

                // Validate token type
                checkTokenId(tokenId);

                // Validate that sender has enough token
                checkBalance(ownerTokenBalance,tokenAmount);

                // Update users' balances
                var ownerNewBalance     : tokenBalanceType := ownerTokenBalance;
                var receiverNewBalance  : tokenBalanceType := receiverTokenBalance;

                if owner =/= receiver then {
                    ownerNewBalance     := abs(ownerTokenBalance - tokenAmount);
                    receiverNewBalance  := receiverTokenBalance + tokenAmount;
                }
                else skip;

                // update storage
                accumulator := updateUserBalanceAndRewardIndex(owner, ownerNewBalance, tokenRewardIndex, accumulator);
                accumulator := updateUserBalanceAndRewardIndex(receiver, receiverNewBalance, tokenRewardIndex, accumulator);

                accumulator.tokenRewardIndex    := tokenRewardIndex;
                accumulator.totalSupply         := newTotalSupply;

            } with accumulator;

            const updatedOperations : list(operation) = (nil: list(operation));
            const updatedStorage : mTokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferParams, ((nil: list(operation)), s))




(* balance_of entrypoint *)
function balanceOf(const balanceOfParams : balanceOfType; const s : mTokenStorageType) : return is
block{

    // get loan token record from Lending Controller through on-chain views
    const loanTokenRecord    : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
    const tokenRewardIndex   : nat                 = loanTokenRecord.tokenRewardIndex; // decimals: 1e27

    function retrieveBalance(const request : balanceOfRequestType) : balanceOfResponse is
    block{

        const requestOwner : ownerType = request.owner;

        // get token balance and reward index for user
        var userTokenBalance   : tokenBalanceType  := getRawBalance(requestOwner, s);
        const userRewardIndex  : nat                = getUserRewardIndex(requestOwner, tokenRewardIndex, s);

        // reflect token updated balance
        if(userRewardIndex = tokenRewardIndex) then skip     // no change to token balance
        else {

            // increment token balance with calculated additional rewards 
            const additionalRewards : nat = calculateAdditionalRewards(userRewardIndex, tokenRewardIndex, userTokenBalance);
            userTokenBalance := userTokenBalance + additionalRewards;

        };

        const response : balanceOfResponse = record[
            request = request;
            balance = userTokenBalance
        ];

    } with (response);

    const requests   : list(balanceOfRequestType) = balanceOfParams.requests;
    const callback   : contract(list(balanceOfResponse)) = balanceOfParams.callback;
    const responses  : list(balanceOfResponse) = List.map(retrieveBalance, requests);
    const operation  : operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation], s with record[tokenRewardIndex = tokenRewardIndex])



(* update_operators entrypoint *)
function updateOperators(const updateOperatorsParams : updateOperatorsType; const s : mTokenStorageType) : return is
block{

    var updatedOperators : operatorsType := List.fold(
        function(const operators : operatorsType; const updateOperator : updateOperatorVariantType) : operatorsType is
            case updateOperator of [
                    Add_operator (param)    -> addOperator(param, operators)
                |   Remove_operator (param) -> removeOperator(param, operators)
            ]
        ,
        updateOperatorsParams,
        s.operators
    )

} with (noOperations, s with record[operators=updatedOperators])

// ------------------------------------------------------------------------------
// FA2 Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Additional Entrypoints Begin 
// ------------------------------------------------------------------------------

(* MintOrBurn Entrypoint *)
function mintOrBurn(const mintOrBurnParams : mintOrBurnType; var s : mTokenStorageType) : return is
block {

    // check sender is whitelisted
    if checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    const quantity        : int             = mintOrBurnParams.quantity;
    const targetAddress   : address         = mintOrBurnParams.target;
    const tokenId         : tokenIdType     = mintOrBurnParams.tokenId;
    const tokenAmount     : nat             = abs(quantity);

    var newTotalSupply    : nat := s.totalSupply;

    // get loan token record from Lending Controller through on-chain views
    const loanTokenRecord    : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
    const tokenRewardIndex   : nat                 = loanTokenRecord.tokenRewardIndex; // decimals: 1e27

    // check token id
    checkTokenId(tokenId);

    // get token balance and reward index for user
    var userTokenBalance      : tokenBalanceType := getRawBalance(targetAddress, s);
    const userRewardIndex     : nat               = getUserRewardIndex(targetAddress, tokenRewardIndex, s);

    // reflect token updated balance
    if(userRewardIndex = tokenRewardIndex) then skip     // no change to token balance
    else {

        // increment token balance with calculated additional rewards 
        const additionalRewards : nat = calculateAdditionalRewards(userRewardIndex, tokenRewardIndex, userTokenBalance);
        userTokenBalance  := userTokenBalance + additionalRewards;
        newTotalSupply    := newTotalSupply + additionalRewards;

    };

    // process mint or burn
    if quantity < 0 then block {
        // burn Token

        // Balance check
        if userTokenBalance < tokenAmount then
        failwith("NotEnoughBalance")
        else skip;

        // get new balance and update storage
        const targetNewBalance  : tokenBalanceType  = abs(userTokenBalance - tokenAmount);

        if newTotalSupply < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE") else skip;
        newTotalSupply := abs(newTotalSupply - tokenAmount);
        
        s := updateUserBalanceAndRewardIndex(targetAddress, targetNewBalance, tokenRewardIndex, s);

    } else block {
        // mint Token

        // get new balance and update storage
        const targetNewBalance  : tokenBalanceType = userTokenBalance + tokenAmount;
        newTotalSupply := newTotalSupply + tokenAmount;

        s := updateUserBalanceAndRewardIndex(targetAddress, targetNewBalance, tokenRewardIndex, s);

    };

    // update token reward index
    s.tokenRewardIndex  := tokenRewardIndex;
    s.totalSupply       := newTotalSupply;

} with (noOperations, s)



(* Compound Entrypoint *)
function compound(const compoundParams : compoundType; var s : mTokenStorageType) : return is
block {

    // get loan token record from Lending Controller through on-chain views
    const loanTokenRecord    : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
    const tokenRewardIndex   : nat                 = loanTokenRecord.tokenRewardIndex; // decimals: 1e27

    var newTotalSupply    : nat := s.totalSupply;

    for userAddress in set compoundParams block {

        // get token balance and reward index for user
        var userTokenBalance      : tokenBalanceType := getRawBalance(userAddress, s);
        const userRewardIndex     : nat               = getUserRewardIndex(userAddress, tokenRewardIndex, s);

        // reflect token updated balance
        if(userRewardIndex = tokenRewardIndex) then skip     // no change to token balance
        else {

            // increment token balance with calculated additional rewards 
            const additionalRewards : nat = calculateAdditionalRewards(userRewardIndex, tokenRewardIndex, userTokenBalance);
            userTokenBalance  := userTokenBalance + additionalRewards;
            newTotalSupply    := newTotalSupply + additionalRewards;

        };

        // Update user balance
        s := updateUserBalanceAndRewardIndex(userAddress, userTokenBalance, tokenRewardIndex, s);

    };

    // update token reward index
    s.tokenRewardIndex  := tokenRewardIndex;
    s.totalSupply       := newTotalSupply;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Additional Entrypoints End 
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------

(* main entrypoint *)
function main (const action : action; const s : mTokenStorageType) : return is
block{

    checkNoAmount(Unit); // Check that sender didn't send any tezos while calling an entrypoint

} with(
    
    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   MistakenTransfer (parameters)           -> mistakenTransfer(parameters, s)

            // FA2 Entrypoints
        |   Transfer (parameters)                   -> transfer(parameters, s)
        |   Balance_of (parameters)                 -> balanceOf(parameters, s)
        |   Update_operators (parameters)           -> updateOperators(parameters, s)
        |   AssertMetadata (parameters)             -> assertMetadata(parameters, s)

            // Additional Entrypoints
        |   MintOrBurn (parameters)                 -> mintOrBurn(parameters, s)
        |   Compound (parameters)                   -> compound(parameters, s)

    ]

)
