// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Transfer Types: transferDestinationType
#include "../partials/transferTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/types/mvkTokenTypes.ligo"

// ------------------------------------------------------------------------------

type action is

  // Housekeeping Entrypoints
  SetAdmin                  of address
| SetGovernance             of address
| UpdateWhitelistContracts  of updateWhitelistContractsParams
| UpdateGeneralContracts    of updateGeneralContractsParams
| MistakenTransfer          of transferActionType

  // FA2 Entrypoints
| AssertMetadata            of assertMetadataParams
| Transfer                  of transferType
| Balance_of                of balanceOfParams
| Update_operators          of updateOperatorsParams
| Mint                      of mintParams

  // Additional Entrypoints (Token Supply Inflation)
| UpdateInflationRate       of nat
| TriggerInflation          of unit


type return is list (operation) * mvkTokenStorage
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
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
//
// Error Codes End
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mvkTokenStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const store: mvkTokenStorage): unit is
  if Tezos.sender =/= store.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
  else unit



function checkSenderIsDoormanContract(const store: mvkTokenStorage): unit is
  block{
    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", store.governanceAddress);
  } with(case generalContractsOptView of [
        Some (_optionContract) -> case _optionContract of [
                Some (_contract)    -> if _contract =/= Tezos.sender then failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED) else unit
            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
            ]
    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ])



function checkSenderIsGovernanceSatelliteContract(var store : mvkTokenStorage) : unit is
block{
  const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", store.governanceAddress);
  const governanceSatelliteAddress: address = case generalContractsOptView of [
      Some (_optionContract) -> case _optionContract of [
              Some (_contract)    -> _contract
          |   None                -> failwith (error_GOVERNANCE_CONTRACT_NOT_FOUND)
          ]
  |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = governanceSatelliteAddress) then skip
    else failwith(error_ONLY_GOVERNANCE_CONTRACT_ALLOWED);
} with unit



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// Treasury Transfer: transferTez, transferFa12Token, transferFa2Token
#include "../partials/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// FA2 Helper Functions Begin
// ------------------------------------------------------------------------------

function checkTokenId(const tokenId: tokenId): unit is
  if tokenId =/= 0n then failwith("FA2_TOKEN_UNDEFINED")
  else unit



function checkBalance(const spenderBalance: tokenBalance; const tokenAmount: tokenBalance): unit is
  if spenderBalance < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE")
  else unit



function checkOwnership(const owner: owner): unit is
  if Tezos.sender =/= owner then failwith("FA2_NOT_OWNER")
  else unit



function checkOperator(const owner: owner; const token_id: tokenId; const operators: operators): unit is
  if owner = Tezos.sender or Big_map.mem((owner, Tezos.sender, token_id), operators) then unit
  else failwith ("FA2_NOT_OPERATOR")



// mergeOperations helper function - used in transfer entrypoint
function mergeOperations(const first: list (operation); const second: list (operation)) : list (operation) is 
List.fold( 
  function(const operations: list(operation); const operation: operation): list(operation) is operation # operations,
  first,
  second
)



// addOperator helper function - used in update_operators entrypoint
function addOperator(const operatorParameter: operatorParameter; const operators: operators): operators is
block{

    const owner     : owner     = operatorParameter.owner;
    const operator  : operator  = operatorParameter.operator;
    const tokenId   : tokenId   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (owner * operator * tokenId) = (owner, operator, tokenId)

} with(Big_map.update(operatorKey, Some (unit), operators))



// removeOperator helper function - used in update_operators entrypoint
function removeOperator(const operatorParameter: operatorParameter; const operators: operators): operators is
block{

    const owner     : owner     = operatorParameter.owner;
    const operator  : operator  = operatorParameter.operator;
    const tokenId   : tokenId   = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (owner * operator * tokenId) = (owner, operator, tokenId)

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
[@view] function getAdmin(const _: unit; var store : mvkTokenStorage) : address is
  store.admin



(* get: general contracts *)
[@view] function getGeneralContracts(const _: unit; const store: mvkTokenStorage) : generalContractsType is
  store.generalContracts



(* get: whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; const store: mvkTokenStorage) : whitelistContractsType is
  store.whitelistContracts



(* get: inflation rate *)
[@view] function getInflationRate(const _: unit; const store: mvkTokenStorage) : nat is
  store.inflationRate



(* get: next inflation timestamp *)
[@view] function getNextInflationTimestamp(const _: unit; const store: mvkTokenStorage) : timestamp is
  store.nextInflationTimestamp



(* get: operator *)
[@view] function getOperatorOpt(const operator: (owner * operator * nat); const store: mvkTokenStorage) : option(unit) is
  Big_map.find_opt(operator, store.operators)



(* maximumSupply View *)
[@view] function getMaximumSupply(const _: unit; const store: mvkTokenStorage) : tokenBalance is
  store.maximumSupply



(* get: balance View *)
[@view] function get_balance(const userAndId: owner * nat; const store: mvkTokenStorage) : tokenBalance is
  case Big_map.find_opt(userAndId.0, store.ledger) of [
      Some (_v) -> _v
    | None      -> 0n
  ]



(* total_supply View *)
[@view] function total_supply(const _tokenId: nat; const _store: mvkTokenStorage) : tokenBalance is
  _store.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _: unit; const _store: mvkTokenStorage) : list(nat) is
  list[0n]



(* check if operator *)
[@view] function is_operator(const operator: (owner * operator * nat); const store: mvkTokenStorage) : bool is
  Big_map.mem(operator, store.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId: nat; const store: mvkTokenStorage) : tokenMetadataInfo is
  case Big_map.find_opt(tokenId, store.token_metadata) of [
    Some (_metadata)  -> _metadata
  | None              -> record[
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
function setAdmin(const newAdminAddress : address; var store : mvkTokenStorage) : return is
block {

  checkSenderIsAdmin(store);
  store.admin := newAdminAddress;

} with (noOperations, store)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var store : mvkTokenStorage) : return is
block {
    
  checkSenderIsAllowed(store);
  store.governanceAddress := newGovernanceAddress;

} with (noOperations, store)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: mvkTokenStorage): return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  
} with (noOperations, s)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: mvkTokenStorage): return is
block {
  
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var store: mvkTokenStorage): return is
block {
    // Check if the sender is the governanceSatellite contract
    checkSenderIsGovernanceSatelliteContract(store);

    // Operations list
    var operations : list(operation) := nil;

    // Create transfer operations
    function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
      block{
        // Check if token is not MVK (it would break SMVK) before creating the transfer operation
        const transferTokenOperation : operation = case transferParam.token of [
            | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
            | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
            | Fa2(token)  -> transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
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
function assertMetadata(const assertMetadataParams: assertMetadataParams; const store: mvkTokenStorage): return is
block{

    const metadataKey  : string  = assertMetadataParams.key;
    const metadataHash : bytes   = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, store.metadata) of [
        Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
      | None     -> failwith("METADATA_NOT_FOUND")
    ]

} with (noOperations, store)



(* transfer entrypoint *)
function transfer(const transferType: transferType; const store: mvkTokenStorage): return is
block{

    function makeTransfer(const account: return; const transferParam: transfer) : return is
      block {

        const owner: owner = transferParam.from_;
        const txs: list(transferDestination) = transferParam.txs;
        
        function transferTokens(const accumulator: mvkTokenStorage; const destination: transferDestination): mvkTokenStorage is
          block {

            const tokenId: tokenId = destination.token_id;
            const tokenAmount: tokenBalance = destination.amount;
            const receiver: owner = destination.to_;
            const ownerBalance: tokenBalance = get_balance((owner, 0n), accumulator);
            const receiverBalance: tokenBalance = get_balance((receiver, 0n), accumulator);

            // Validate operator
            checkOperator(owner, tokenId, account.1.operators);

            // Validate token type
            checkTokenId(tokenId);

            // Validate that sender has enough token
            checkBalance(ownerBalance,tokenAmount);

            // Update users' balances
            var ownerNewBalance     : tokenBalance := ownerBalance;
            var receiverNewBalance  : tokenBalance := receiverBalance;

            if owner =/= receiver then {
              ownerNewBalance     := abs(ownerBalance - tokenAmount);
              receiverNewBalance  := receiverBalance + tokenAmount;
            }
            else skip;

            var updatedLedger: ledger := Big_map.update(owner, Some (ownerNewBalance), accumulator.ledger);
            updatedLedger := Big_map.update(receiver, Some (receiverNewBalance), updatedLedger);

          } with accumulator with record[ledger=updatedLedger];

          const updatedOperations: list(operation) = (nil: list(operation));
          const updatedStorage: mvkTokenStorage = List.fold(transferTokens, txs, account.1);

      } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferType, ((nil: list(operation)), store))




(* balance_of entrypoint *)
function balanceOf(const balanceOfParams: balanceOfParams; const store: mvkTokenStorage) : return is
block{

    function retrieveBalance(const request: balanceOfRequest): balanceOfResponse is
      block{

        const requestOwner: owner = request.owner;
        const tokenBalance: tokenBalance = 
          case Big_map.find_opt(requestOwner, store.ledger) of [
              Some (b) -> b
            | None     -> 0n
          ];
        const response: balanceOfResponse = record[request=request;balance=tokenBalance];

      } with (response);

      const requests: list(balanceOfRequest) = balanceOfParams.requests;
      const callback: contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses: list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation: operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation],store)



(* update_operators entrypoint *)
function updateOperators(const updateOperatorsParams: updateOperatorsParams; const store: mvkTokenStorage) : return is
block{

    var updatedOperators: operators := List.fold(
      function(const operators: operators; const updateOperator: updateOperator): operators is
        case updateOperator of [
            Add_operator (param)    -> addOperator(param, operators)
          | Remove_operator (param) -> removeOperator(param, operators)
        ]
      ,
      updateOperatorsParams,
      store.operators
    )

} with(noOperations,store with record[operators=updatedOperators])



(* mint entrypoint *)
function mint(const mintParams: mintParams; var store : mvkTokenStorage) : return is
block {

    const recipientAddress  : owner         = mintParams.0;
    const mintedTokens      : tokenBalance  = mintParams.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    if checkInWhitelistContracts(Tezos.sender, store.whitelistContracts) or Tezos.sender = Tezos.self_address then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    // Check if the minted token exceed the maximumSupply defined in the mvkTokenStorage
    const tempTotalSupply: tokenBalance = store.totalSupply + mintedTokens;
    if tempTotalSupply > store.maximumSupply then failwith(error_MAXIMUM_SUPPLY_EXCEEDED) 
    else skip;

    // Update sender's balance
    const senderNewBalance: tokenBalance = get_balance((recipientAddress, 0n), store) + mintedTokens;

    // Update mvkTokenStorage
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
function updateInflationRate(const newInflationRate: nat; var store : mvkTokenStorage) : return is
block {
    
    checkSenderIsAdmin(store);

    // Update the inflation rate
    if newInflationRate > 2000n then failwith(error_INFLATION_RATE_TOO_HIGH)
    else store.inflationRate  := newInflationRate

} with (noOperations, store)



(* triggerInflation entrypoint *)
function triggerInflation(var store : mvkTokenStorage) : return is
block {
    
    checkSenderIsAdmin(store);

    // Check inflation rate
    const inflation: tokenBalance = store.maximumSupply * store.inflationRate / 10000n; // Apply the rate 
    
    // Apply inflation rate on maximum supply if it has been 360 days since the last time it was updated
    if store.nextInflationTimestamp < Tezos.now then {
      
      // Set the new maximumSupply
      store.maximumSupply           := store.maximumSupply + inflation;

      // Update the next change date
      store.nextInflationTimestamp  := Tezos.now + one_year;
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
function main (const action : action; const store : mvkTokenStorage) : return is
  block{
    
    checkNoAmount(Unit); // Check that sender didn't send any tezos while calling an entrypoint

  } with(
    
    case action of [

        // Housekeeping Entrypoints
        SetAdmin (params)                   -> setAdmin(params, store)
      | SetGovernance (params)              -> setGovernance(params, store)
      | UpdateWhitelistContracts (params)   -> updateWhitelistContracts(params, store)
      | UpdateGeneralContracts (params)     -> updateGeneralContracts(params, store)
      | MistakenTransfer (params)           -> mistakenTransfer(params, store)

        // FA2 Entrypoints
      | AssertMetadata (params)             -> assertMetadata(params, store)
      | Transfer (params)                   -> transfer(params, store)
      | Balance_of (params)                 -> balanceOf(params, store)
      | Update_operators (params)           -> updateOperators(params, store)
      | Mint (params)                       -> mint(params, store)

        // Additional Entrypoints (Token Supply Inflation)
      | UpdateInflationRate (params)        -> updateInflationRate(params, store)
      | TriggerInflation (_params)          -> triggerInflation(store)
    ]

  )