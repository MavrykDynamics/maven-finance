// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

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
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mvkTokenStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith("ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED");



function checkSenderIsAdmin(const store: mvkTokenStorage): unit is
  if Tezos.sender =/= store.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit



function checkSenderIsDoormanContract(const store: mvkTokenStorage): unit is
  case Map.find_opt("doorman", store.generalContracts) of [
      Some (v) -> if v =/= Tezos.sender then failwith("ONLY_DOORMAN_CONTRACT_ALLOWED") else unit
    | None -> failwith("DOORMAN_CONTRACT_NOT_FOUND")
  ]



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

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

(* getBalance View *)
[@view] function getBalance(const user: owner; const store: mvkTokenStorage) : tokenBalance is
  case Big_map.find_opt(user, store.ledger) of [
      Some (_v) -> _v
    | None      -> 0n
  ]



(* GetTotalSupply View *)
[@view] function getTotalSupply(const _: unit; const store: mvkTokenStorage) : tokenBalance is
  store.totalSupply



(* GetMaximumSupply View *)
[@view] function getMaximumSupply(const _: unit; const store: mvkTokenStorage) : tokenBalance is
  store.maximumSupply



(* GetTotalAndMaximumSupply View *)
[@view] function getTotalAndMaximumSupply(const _: unit; const store: mvkTokenStorage) : tokenBalance * tokenBalance is
  (store.totalSupply, store.maximumSupply)

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
            const ownerBalance: tokenBalance = getBalance(owner, accumulator);
            const receiverBalance: tokenBalance = getBalance(receiver, accumulator);

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
    if tempTotalSupply > store.maximumSupply then failwith("Maximum total supply of MVK exceeded") 
    else skip;

    // Update sender's balance
    const senderNewBalance: tokenBalance = getBalance(recipientAddress, store) + mintedTokens;

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
    if newInflationRate > 2000n then failwith("Error. The inflation rate cannot exceed 20%")
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
    else failwith("Error. You cannot trigger inflation now");

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