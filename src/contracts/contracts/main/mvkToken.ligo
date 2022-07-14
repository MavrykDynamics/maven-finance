// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// General Contracts : generalContractsType, updateGeneralContractsParams
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Housekeeping Entrypoints
        SetAdmin                  of address
    |   SetGovernance             of address
    |   UpdateWhitelistContracts  of updateWhitelistContractsType
    |   UpdateGeneralContracts    of updateGeneralContractsType
    |   MistakenTransfer          of transferActionType

        // FA2 Entrypoints
    |   AssertMetadata            of assertMetadataType
    |   Transfer                  of fa2TransferType
    |   Balance_of                of balanceOfParams
    |   Update_operators          of updateOperatorsType
    |   Mint                      of mintType

        // Additional Entrypoints (Token Supply Inflation)
    |   UpdateInflationRate       of nat
    |   TriggerInflation          of unit


type return is list (operation) * mvkTokenStorageType
const noOperations : list (operation) = nil;



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const one_day        : int              = 86_400;
const thirty_days    : int              = one_day * 30;
const one_year       : int              = one_day * 365;

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mvkTokenStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const store : mvkTokenStorageType): unit is
    if Tezos.get_sender() =/= store.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



function checkNoAmount(const _p: unit): unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit



function checkSenderIsDoormanContract(const store : mvkTokenStorageType): unit is
block{

    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", store.governanceAddress);

} with (case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> if _contract =/= Tezos.get_sender() then failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED) else unit
                |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
])



function checkSenderIsAdminOrGovernanceSatelliteContract(var store : mvkTokenStorageType) : unit is
block{

  if Tezos.get_sender() = store.admin then skip
  else {
    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", store.governanceAddress);
    const governanceSatelliteAddress : address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    
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

function checkTokenId(const tokenId: tokenIdType): unit is
    if tokenId =/= 0n then failwith("FA2_TOKEN_UNDEFINED")
    else unit



function checkBalance(const spenderBalance: tokenBalanceType; const tokenAmount: tokenBalanceType): unit is
    if spenderBalance < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE")
    else unit



function checkOwnership(const owner: ownerType): unit is
    if Tezos.get_sender() =/= owner then failwith("FA2_NOT_OWNER")
    else unit



function checkOperator(const owner: ownerType; const token_id: tokenIdType; const operators : operatorsType): unit is
    if owner = Tezos.get_sender() or Big_map.mem((owner, Tezos.get_sender(), token_id), operators) then unit
    else failwith ("FA2_NOT_OPERATOR")



// mergeOperations helper function - used in transfer entrypoint
function mergeOperations(const first: list (operation); const second: list (operation)) : list (operation) is 
List.fold( 
    function(const operations : list(operation); const operation: operation): list(operation) is operation # operations,
    first,
    second
)



// addOperator helper function - used in update_operators entrypoint
function addOperator(const operatorParameter: operatorParameterType; const operators : operatorsType): operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.update(operatorKey, Some (unit), operators))



// removeOperator helper function - used in update_operators entrypoint
function removeOperator(const operatorParameter: operatorParameterType; const operators : operatorsType): operatorsType is
block{

    const owner     : ownerType     = operatorParameter.owner;
    const operator  : operatorType  = operatorParameter.operator;
    const tokenId   : tokenIdType   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (ownerType * operatorType * tokenIdType) = (owner, operator, tokenId)

} with(Big_map.remove(operatorKey, operators))

// ------------------------------------------------------------------------------
// FA2 Helper Functions End
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
[@view] function getAdmin(const _ : unit; var store : mvkTokenStorageType) : address is
    store.admin



(* get: general contracts *)
[@view] function getGeneralContracts(const _ : unit; const store : mvkTokenStorageType) : generalContractsType is
    store.generalContracts



(* get: whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const store : mvkTokenStorageType) : whitelistContractsType is
    store.whitelistContracts



(* get: inflation rate *)
[@view] function getInflationRate(const _ : unit; const store : mvkTokenStorageType) : nat is
    store.inflationRate



(* get: next inflation timestamp *)
[@view] function getNextInflationTimestamp(const _ : unit; const store : mvkTokenStorageType) : timestamp is
    store.nextInflationTimestamp



(* get: operator *)
[@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const store : mvkTokenStorageType) : option(unit) is
    Big_map.find_opt(operator, store.operators)



(* maximumSupply View *)
[@view] function getMaximumSupply(const _ : unit; const store : mvkTokenStorageType) : tokenBalanceType is
    store.maximumSupply



(* get: balance View *)
[@view] function get_balance(const userAndId : ownerType * nat; const store : mvkTokenStorageType) : tokenBalanceType is
    case Big_map.find_opt(userAndId.0, store.ledger) of [
            Some (_v) -> _v
        |   None      -> 0n
    ]



(* total_supply View *)
[@view] function total_supply(const _tokenId : nat; const _store : mvkTokenStorageType) : tokenBalanceType is
    _store.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _store : mvkTokenStorageType) : list(nat) is
    list[0n]



(* check if operator *)
[@view] function is_operator(const operator : (ownerType * operatorType * nat); const store : mvkTokenStorageType) : bool is
    Big_map.mem(operator, store.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId : nat; const store : mvkTokenStorageType) : tokenMetadataInfoType is
    case Big_map.find_opt(tokenId, store.token_metadata) of [
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
function setAdmin(const newAdminAddress : address; var store : mvkTokenStorageType) : return is
block {

  checkSenderIsAllowed(store);
  store.admin := newAdminAddress;

} with (noOperations, store)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var store : mvkTokenStorageType) : return is
block {
    
  checkSenderIsAllowed(store);
  store.governanceAddress := newGovernanceAddress;

} with (noOperations, store)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : mvkTokenStorageType): return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  
} with (noOperations, s)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : mvkTokenStorageType): return is
block {
  
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var store : mvkTokenStorageType): return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    // Check if the sender is admin or the Governance Satellite Contract
    checkSenderIsAdminOrGovernanceSatelliteContract(store);

    // Operations list
    var operations : list(operation) := nil;

    // Create transfer operations
    function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
        block{

            const transferTokenOperation : operation = case transferParam.token of [
                |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                |   Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
            ];

        } with(transferTokenOperation # operationList);
    
    operations  := List.fold_right(transferOperationFold, destinationParams, operations)

} with (operations, store)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Entrypoints Begin
// ------------------------------------------------------------------------------

(* assertMetadata entrypoint *)
function assertMetadata(const assertMetadataParams : assertMetadataType; const store : mvkTokenStorageType): return is
block{

    const metadataKey  : string  = assertMetadataParams.key;
    const metadataHash : bytes   = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, store.metadata) of [
            Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
        |   None     -> failwith("METADATA_NOT_FOUND")
    ]

} with (noOperations, store)



(* transfer entrypoint *)
function transfer(const transferParams : fa2TransferType; const store : mvkTokenStorageType): return is
block{

    function makeTransfer(const account : return; const transferParam : transfer) : return is
        block {

            const owner : ownerType = transferParam.from_;
            const txs : list(transferDestination) = transferParam.txs;
            
            function transferTokens(const accumulator : mvkTokenStorageType; const destination : transferDestination): mvkTokenStorageType is
            block {

                const tokenId : tokenIdType = destination.token_id;
                const tokenAmount : tokenBalanceType = destination.amount;
                const receiver : ownerType = destination.to_;
                const ownerBalance : tokenBalanceType = get_balance((owner, 0n), accumulator);
                const receiverBalance : tokenBalanceType = get_balance((receiver, 0n), accumulator);

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

                var updatedLedger : ledgerType := Big_map.update(owner, Some (ownerNewBalance), accumulator.ledger);
                updatedLedger := Big_map.update(receiver, Some (receiverNewBalance), updatedLedger);

            } with accumulator with record[ledger=updatedLedger];

            const updatedOperations : list(operation) = (nil: list(operation));
            const updatedStorage : mvkTokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferParams, ((nil: list(operation)), store))




(* balance_of entrypoint *)
function balanceOf(const balanceOfParams : balanceOfParams; const store : mvkTokenStorageType) : return is
block{

    function retrieveBalance(const request: balanceOfRequestType): balanceOfResponse is
        block{

            const requestOwner: ownerType = request.owner;
            const tokenBalance: tokenBalanceType = 
            case Big_map.find_opt(requestOwner, store.ledger) of [
                    Some (b) -> b
                |   None     -> 0n
            ];
            const response: balanceOfResponse = record[request=request;balance=tokenBalance];

        } with (response);

      const requests : list(balanceOfRequestType) = balanceOfParams.requests;
      const callback: contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses : list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation: operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation],store)



(* update_operators entrypoint *)
function updateOperators(const updateOperatorsParams : updateOperatorsType; const store : mvkTokenStorageType) : return is
block{

    var updatedOperators : operatorsType := List.fold(
        function(const operators : operatorsType; const updateOperator: updateOperatorVariantType): operatorsType is
            case updateOperator of [
                    Add_operator (param)    -> addOperator(param, operators)
                |   Remove_operator (param) -> removeOperator(param, operators)
            ]
        ,
        updateOperatorsParams,
        store.operators
    )

} with (noOperations, store with record[operators=updatedOperators])



(* mint entrypoint *)
function mint(const mintParams : mintType; var store : mvkTokenStorageType) : return is
block {

    const recipientAddress  : ownerType         = mintParams.0;
    const mintedTokens      : tokenBalanceType  = mintParams.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    if checkInWhitelistContracts(Tezos.get_sender(), store.whitelistContracts) or Tezos.get_sender() = Tezos.get_self_address() then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    // Check if the minted token exceed the maximumSupply defined in the mvkTokenStorageType
    const tempTotalSupply: tokenBalanceType = store.totalSupply + mintedTokens;
    if tempTotalSupply > store.maximumSupply then failwith(error_MAXIMUM_SUPPLY_EXCEEDED) 
    else skip;

    // Update sender's balance
    const senderNewBalance: tokenBalanceType = get_balance((recipientAddress, 0n), store) + mintedTokens;

    // Update mvkTokenStorageType
    store.totalSupply := store.totalSupply + mintedTokens;
    store.ledger := Big_map.update(recipientAddress, Some(senderNewBalance), store.ledger);

} with (noOperations, store)

// ------------------------------------------------------------------------------
// FA2 Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Additional Entrypoints (Token Supply Inflation) Begin 
// ------------------------------------------------------------------------------

(* updateInflationRate entrypoint *)
function updateInflationRate(const newInflationRate: nat; var store : mvkTokenStorageType) : return is
block {
    
    checkSenderIsAdmin(store);

    // Update the inflation rate
    if newInflationRate > 2000n then failwith(error_INFLATION_RATE_TOO_HIGH)
    else store.inflationRate  := newInflationRate

} with (noOperations, store)



(* triggerInflation entrypoint *)
function triggerInflation(var store : mvkTokenStorageType) : return is
block {
    
    checkSenderIsAdmin(store);

    // Check inflation rate
    const inflation: tokenBalanceType = store.maximumSupply * store.inflationRate / 10000n; // Apply the rate 
    
    // Apply inflation rate on maximum supply if it has been 360 days since the last time it was updated
    if store.nextInflationTimestamp < Tezos.get_now() then {
      
      // Set the new maximumSupply
      store.maximumSupply           := store.maximumSupply + inflation;

      // Update the next change date
      store.nextInflationTimestamp  := Tezos.get_now() + one_year;

    }
    else failwith(error_CANNOT_TRIGGER_INFLATION_NOW);

} with (noOperations, store)

// ------------------------------------------------------------------------------
// Additional Entrypoints (Token Supply Inflation) End 
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : action; const store : mvkTokenStorageType) : return is
block{

    checkNoAmount(Unit); // Check that sender didn't send any tezos while calling an entrypoint

} with(
    
    case action of [

            // Housekeeping Entrypoints
            SetAdmin (params)                   -> setAdmin(params, store)
        |   SetGovernance (params)              -> setGovernance(params, store)
        |   UpdateWhitelistContracts (params)   -> updateWhitelistContracts(params, store)
        |   UpdateGeneralContracts (params)     -> updateGeneralContracts(params, store)
        |   MistakenTransfer (params)           -> mistakenTransfer(params, store)

            // FA2 Entrypoints
        |   AssertMetadata (params)             -> assertMetadata(params, store)
        |   Transfer (params)                   -> transfer(params, store)
        |   Balance_of (params)                 -> balanceOf(params, store)
        |   Update_operators (params)           -> updateOperators(params, store)
        |   Mint (params)                       -> mint(params, store)

            // Additional Entrypoints (Token Supply Inflation)
        |   UpdateInflationRate (params)        -> updateInflationRate(params, store)
        |   TriggerInflation (_params)          -> triggerInflation(store)

    ]

)
