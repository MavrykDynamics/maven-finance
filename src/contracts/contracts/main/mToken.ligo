// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

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


type return is list (operation) * mavrykFa2TokenStorageType
const noOperations : list (operation) = nil;

const fixedPointAccuracy : nat      = 1_000_000_000_000_000_000_000_000_000n;   // 10^27     - // for use in division

// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mavrykFa2TokenStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s : mavrykFa2TokenStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : mavrykFa2TokenStorageType) : unit is
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
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey : (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.remove(operatorKey, operators))

// ------------------------------------------------------------------------------
// FA2 Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------

(* Get loan token record from lending controller contract *)
function getLoanTokenRecordFromLendingController(const loanTokenName : string; const s : mavrykFa2TokenStorageType) : loanTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get loan token record of user from Lending Controlelr contract
    const getLoanTokenRecordOptView : option (option (loanTokenRecordType)) = Tezos.call_view ("getLoanTokenRecordOpt", loanTokenName, lendingControllerAddress);
    const loanTokenRecord : loanTokenRecordType = case getLoanTokenRecordOptView of [
            Some (_viewResult)  -> case _viewResult of [
                    Some (_record)  -> _record
                |   None            -> failwith (error_LOAN_TOKEN_RECORD_NOT_FOUND)
            ]
        |   None                -> failwith (error_GET_LOAN_TOKEN_RECORD_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND)
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
[@view] function getAdmin(const _ : unit; var s : mavrykFa2TokenStorageType) : address is
    s.admin



(* get: whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : mavrykFa2TokenStorageType) : whitelistContractsType is
    s.whitelistContracts



(* get: operator *)
[@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const s : mavrykFa2TokenStorageType) : option(unit) is
    Big_map.find_opt(operator, s.operators)



(* get: balance View *)
[@view] function get_balance(const userAndId : ownerType * nat; const s : mavrykFa2TokenStorageType) : tokenBalanceType is
block {

    const userAddress : address = userAndId.0;

    // get loan token record from Lending Controller
    const loanTokenRecord               : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
    const loanTokenAccRewardsPerShare   : nat                 = loanTokenRecord.accumulatedRewardsPerShare; // decimals: 1e27

    // get user reward index
    const rewardIndex : nat = case s.rewardIndexLedger[userAddress] of [
            Some (index) -> index
        |   None         -> loanTokenAccRewardsPerShare
    ];

    // get user token balance from ledger
    var tokenBalance : tokenBalanceType := case s.ledger[userAddress] of [
            Some (balance) -> balance
        |   None           -> 0n
    ];

    // reflect token updated balance
    if(rewardIndex = loanTokenAccRewardsPerShare) then skip     // no change to token balance
    else {
        
        // loanTokenAccRewardsPerShare is monotonically increasing and should always be greater than owner index
        if rewardIndex > loanTokenAccRewardsPerShare then failwith(error_CALCULATION_ERROR) else skip;
        const currentRewardsPerShare : nat = abs(loanTokenAccRewardsPerShare - rewardIndex);

        // calculate additional rewards
        const additionalRewards : nat = (currentRewardsPerShare * tokenBalance) / fixedPointAccuracy;

        // increment token balance with the rewards
        tokenBalance := tokenBalance + additionalRewards;
    };

} with tokenBalance


(* total_supply View - reference lending controller *)
[@view] function total_supply(const _tokenId : nat; const s : mavrykFa2TokenStorageType) : tokenBalanceType is
block {
    
    // get loan token record from Lending Controller
    const loanTokenRecord : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
    const tokenPoolTotal : nat = loanTokenRecord.tokenPoolTotal;

} with tokenPoolTotal



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _s : mavrykFa2TokenStorageType) : list(nat) is
    list[0n]



(* check if operator *)
[@view] function is_operator(const operator : (ownerType * operatorType * nat); const s : mavrykFa2TokenStorageType) : bool is
    Big_map.mem(operator, s.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId : nat; const s : mavrykFa2TokenStorageType) : tokenMetadataInfoType is
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
function setAdmin(const newAdminAddress : address; var s : mavrykFa2TokenStorageType) : return is
block {

    checkSenderIsAllowed(s);
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : mavrykFa2TokenStorageType) : return is
block {
    
    checkSenderIsAllowed(s);
    s.governanceAddress := newGovernanceAddress;

} with (noOperations, s)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsTypes : updateWhitelistContractsType; var s : mavrykFa2TokenStorageType) : return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsTypes, s.whitelistContracts);
  
} with (noOperations, s)



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationTypes : transferActionType; var s : mavrykFa2TokenStorageType) : return is
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
function assertMetadata(const assertMetadataParams : assertMetadataType; const s : mavrykFa2TokenStorageType) : return is
block{

    const metadataKey  : string  = assertMetadataParams.key;
    const metadataHash : bytes   = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, s.metadata) of [
            Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
        |   None     -> failwith("METADATA_NOT_FOUND")
    ]

} with (noOperations, s)



(* transfer entrypoint *)
function transfer(const transferParams : fa2TransferType; const s : mavrykFa2TokenStorageType) : return is
block{

    function makeTransfer(const account : return; const transferParam : transfer) : return is
        block {

            const owner : ownerType = transferParam.from_;
            const txs : list(transferDestination) = transferParam.txs;

            // get loan token record and accumulated rewards per share
            const loanTokenRecord               : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
            const loanTokenAccRewardsPerShare   : nat                 = loanTokenRecord.accumulatedRewardsPerShare; // decimals: 1e27
             
            function transferTokens(var accumulator : mavrykFa2TokenStorageType; const destination : transferDestination) : mavrykFa2TokenStorageType is
            block {

                const tokenId : tokenIdType = destination.token_id;
                const tokenAmount : tokenBalanceType = destination.amount;
                const receiver : ownerType = destination.to_;

                // get token balances from ledger for owner and receiver
                var ownerBalance : tokenBalanceType := case s.ledger[owner] of [
                        Some (balance) -> balance
                    |   None           -> 0n
                ];

                var receiverBalance : tokenBalanceType := case s.ledger[receiver] of [
                        Some (balance) -> balance
                    |   None           -> 0n
                ];

                // get reward indexes for owner and receiver
                const ownerRewardIndex : nat = case s.rewardIndexLedger[owner] of [
                        Some (index) -> index
                    |   None         -> loanTokenAccRewardsPerShare
                ];

                const receiverRewardIndex : nat = case s.rewardIndexLedger[receiver] of [
                        Some (index) -> index
                    |   None         -> loanTokenAccRewardsPerShare
                ];

                // reflect token updated balance for owner and receiver
                if(ownerRewardIndex = loanTokenAccRewardsPerShare) then skip     // no change to token balance
                else {
                    
                    // loanTokenAccRewardsPerShare is monotonically increasing and should always be greater than owner index
                    if ownerRewardIndex > loanTokenAccRewardsPerShare then failwith(error_CALCULATION_ERROR) else skip;
                    const ownerCurrentRewardsPerShare : nat = abs(loanTokenAccRewardsPerShare - ownerRewardIndex);

                    // calculate additional rewards
                    const ownerAdditionalRewards : nat = (ownerCurrentRewardsPerShare * ownerBalance) / fixedPointAccuracy;

                    // increment token balance with the rewards
                    ownerBalance := ownerBalance + ownerAdditionalRewards;
                }; 

                if(receiverRewardIndex = loanTokenAccRewardsPerShare) then skip     // no change to token balance
                else {
                    
                    // loanTokenAccRewardsPerShare is monotonically increasing and should always be greater than owner index
                    if receiverRewardIndex > loanTokenAccRewardsPerShare then failwith(error_CALCULATION_ERROR) else skip;
                    const receiverCurrentRewardsPerShare : nat = abs(loanTokenAccRewardsPerShare - receiverRewardIndex);

                    // calculate additional rewards
                    const receiverAdditionalRewards : nat = (receiverCurrentRewardsPerShare * receiverBalance) / fixedPointAccuracy;

                    // increment token balance with the rewards
                    receiverBalance := receiverBalance + receiverAdditionalRewards;
                }; 

                // Validate operator
                checkOperator(owner, tokenId, account.1.operators);

                // Validate token type
                checkTokenId(tokenId);

                // Validate that sender has enough token
                checkBalance(ownerBalance,tokenAmount);

                // Update users' balances
                var ownerNewBalance     : tokenBalanceType := ownerBalance;
                var receiverNewBalance  : tokenBalanceType := receiverBalance;

                if owner =/= receiver then {
                    ownerNewBalance     := abs(ownerBalance - tokenAmount);
                    receiverNewBalance  := receiverBalance + tokenAmount;
                }
                else skip;

                // update storage
                accumulator.ledger[owner]               := ownerNewBalance;       
                accumulator.ledger[receiver]            := receiverNewBalance;       

                accumulator.rewardIndexLedger[owner]    := loanTokenAccRewardsPerShare;       
                accumulator.rewardIndexLedger[receiver] := loanTokenAccRewardsPerShare;       

            } with accumulator;

            const updatedOperations : list(operation) = (nil: list(operation));
            const updatedStorage : mavrykFa2TokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferParams, ((nil: list(operation)), s))




(* balance_of entrypoint *)
function balanceOf(const balanceOfParams : balanceOfType; const s : mavrykFa2TokenStorageType) : return is
block{

    function retrieveBalance(const request : balanceOfRequestType) : balanceOfResponse is
        block{

            const loanTokenRecord               : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
            const loanTokenAccRewardsPerShare   : nat                 = loanTokenRecord.accumulatedRewardsPerShare; // decimals: 1e27

            const requestOwner : ownerType = request.owner;

            // get user token balance from ledger
            var tokenBalance : tokenBalanceType := case s.ledger[requestOwner] of [
                    Some (balance) -> balance
                |   None           -> 0n
            ];

            // reward index <-> identical to user participation fees per share used in doorman contract
            const rewardIndex : nat = case s.rewardIndexLedger[requestOwner] of [
                    Some (index) -> index
                |   None         -> loanTokenAccRewardsPerShare
            ];

            // reflect token updated balance
            if(rewardIndex = loanTokenAccRewardsPerShare) then skip     // no change to token balance
            else {
                
                // loanTokenAccRewardsPerShare is monotonically increasing and should always be greater than owner index
                if rewardIndex > loanTokenAccRewardsPerShare then failwith(error_CALCULATION_ERROR) else skip;
                const currentRewardsPerShare : nat = abs(loanTokenAccRewardsPerShare - rewardIndex);

                // calculate additional rewards
                const additionalRewards : nat = (currentRewardsPerShare * tokenBalance) / fixedPointAccuracy;

                // increment token balance with the rewards
                tokenBalance := tokenBalance + additionalRewards;
            };

            const response : balanceOfResponse = record[
                request = request;
                balance = tokenBalance
            ];

        } with (response);

      const requests   : list(balanceOfRequestType) = balanceOfParams.requests;
      const callback   : contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses  : list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation  : operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation],s)



(* update_operators entrypoint *)
function updateOperators(const updateOperatorsParams : updateOperatorsType; const s : mavrykFa2TokenStorageType) : return is
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
function mintOrBurn(const mintOrBurnParams : mintOrBurnType; var s : mavrykFa2TokenStorageType) : return is
block {

    // check sender is whitelisted
    if checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    const quantity        : int             = mintOrBurnParams.quantity;
    const targetAddress   : address         = mintOrBurnParams.target;
    const tokenId         : tokenIdType     = mintOrBurnParams.tokenId;
    const tokenAmount     : nat             = abs(quantity);

    // get loan token record from Lending Controller
    const loanTokenRecord               : loanTokenRecordType = getLoanTokenRecordFromLendingController(s.loanToken, s);
    const loanTokenAccRewardsPerShare   : nat                 = loanTokenRecord.accumulatedRewardsPerShare; // decimals: 1e27

    // check token id
    checkTokenId(tokenId);

    // get user token balance from ledger
    var userBalance : tokenBalanceType := case s.ledger[targetAddress] of [
            Some (balance) -> balance
        |   None           -> 0n
    ];

    // get user reward index
    const rewardIndex : nat = case s.rewardIndexLedger[targetAddress] of [
            Some (index) -> index
        |   None         -> loanTokenAccRewardsPerShare
    ];

    // reflect token updated balance
    if(rewardIndex = loanTokenAccRewardsPerShare) then skip     // no change to token balance
    else {
        
        // loanTokenAccRewardsPerShare is monotonically increasing and should always be greater than owner index
        if rewardIndex > loanTokenAccRewardsPerShare then failwith(error_CALCULATION_ERROR) else skip;
        const currentRewardsPerShare : nat = abs(loanTokenAccRewardsPerShare - rewardIndex);

        // calculate additional rewards
        const additionalRewards : nat = (currentRewardsPerShare * userBalance) / fixedPointAccuracy;

        // increment token balance with the rewards
        userBalance := userBalance + additionalRewards;
    };

    // process mint or burn
    if quantity < 0 then block {
        // burn Token

        // Balance check
        if userBalance < tokenAmount then
        failwith("NotEnoughBalance")
        else skip;

        // Update target balance 
        const targetNewBalance  : tokenBalanceType  = abs(userBalance - tokenAmount);

        // Update storage
        s.ledger[targetAddress]             := targetNewBalance;       
        s.rewardIndexLedger[targetAddress]  := loanTokenAccRewardsPerShare;               

    } else block {
        // mint Token

        // Update target's balance
        const targetNewBalance  : tokenBalanceType = userBalance + tokenAmount;
        
        // Update storage
        s.ledger[targetAddress]             := targetNewBalance;       
        s.rewardIndexLedger[targetAddress]  := loanTokenAccRewardsPerShare; 
    };

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
function main (const action : action; const s : mavrykFa2TokenStorageType) : return is
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

    ]

)
