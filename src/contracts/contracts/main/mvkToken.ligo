// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/types/mvkTokenTypes.ligo"

////
// ENTRYPOINTS
////
type action is
  Transfer of transferType
| Balance_of of balanceOfParams
| Update_operators of updateOperatorsParams
| AssertMetadata of assertMetadataParams
| Mint of mintParams
| UpdateWhitelistContracts of updateWhitelistContractsParams
| UpdateGeneralContracts of updateGeneralContractsParams

////
// RETURN TYPES
////
(* define return for readability *)
type return is list (operation) * mvkTokenStorage
(* define noop for readability *)
const noOperations : list (operation) = nil;

////
// FUNCTIONS
////
(* View functions *)
(* getBalance View *)
[@view] function getBalance(const user: owner; const store: mvkTokenStorage) : tokenBalance is
  case Big_map.find_opt(user, store.ledger) of [
    Some (_v) -> _v
  | None -> 0n
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


(* Helper function to validate *)
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

function checkSenderIsDoormanContract(const store: mvkTokenStorage): unit is
  case Map.find_opt("doorman", store.generalContracts) of [
    Some (v) -> if v =/= Tezos.sender then failwith("ONLY_DOORMAN_CONTRACT_ALLOWED") else unit
  | None -> failwith("DOORMAN_CONTRACT_NOT_FOUND")
  ]

function checkSenderIsAdmin(const store: mvkTokenStorage): unit is
  if Tezos.sender =/= store.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: mvkTokenStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: mvkTokenStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

(* Transfer Entrypoint *)
function mergeOperations(const first: list (operation); const second: list (operation)) : list (operation) is 
  List.fold( 
    function(const operations: list(operation); const operation: operation): list(operation) is operation # operations,
    first,
    second
  )

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
            var ownerNewBalance: tokenBalance := ownerBalance;
            var receiverNewBalance: tokenBalance := receiverBalance;

            if owner =/= receiver then {
              ownerNewBalance := abs(ownerBalance - tokenAmount);
              receiverNewBalance := receiverBalance + tokenAmount;
            }
            else skip;

            var updatedLedger: ledger := Big_map.update(owner, Some (ownerNewBalance), accumulator.ledger);
            updatedLedger := Big_map.update(receiver, Some (receiverNewBalance), updatedLedger);
          } with accumulator with record[ledger=updatedLedger];

          const updatedOperations: list(operation) = (nil: list(operation));
          const updatedStorage: mvkTokenStorage = List.fold(transferTokens, txs, account.1);
      } with (mergeOperations(updatedOperations,account.0), updatedStorage)
  } with List.fold(makeTransfer, transferType, ((nil: list(operation)), store))

(* Balance_of Entrypoint *)
function balanceOf(const balanceOfParams: balanceOfParams; const store: mvkTokenStorage) : return is
  block{
    function retrieveBalance(const request: balanceOfRequest): balanceOfResponse is
      block{
        const requestOwner: owner = request.owner;
        const tokenBalance: tokenBalance = 
          case Big_map.find_opt(requestOwner, store.ledger) of [
            Some (b) -> b
          | None -> 0n
          ];
        const response: balanceOfResponse = record[request=request;balance=tokenBalance];
      } with (response);
      const requests: list(balanceOfRequest) = balanceOfParams.requests;
      const callback: contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses: list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation: operation = Tezos.transaction(responses, 0tez, callback);
  } with (list[operation],store)

(* Update_operators Entrypoint *)
function addOperator(const operatorParameter: operatorParameter; const operators: operators): operators is
  block{
    const owner: owner = operatorParameter.owner;
    const operator: operator = operatorParameter.operator;
    const tokenId: tokenId = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (owner * operator * tokenId) = (owner, operator, tokenId)
  } with(Big_map.update(operatorKey, Some (unit), operators))

function removeOperator(const operatorParameter: operatorParameter; const operators: operators): operators is
  block{
    const owner: owner = operatorParameter.owner;
    const operator: operator = operatorParameter.operator;
    const tokenId: tokenId = operatorParameter.token_id;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (owner * operator * tokenId) = (owner, operator, tokenId)
  } with(Big_map.remove(operatorKey, operators))

function updateOperators(const updateOperatorsParams: updateOperatorsParams; const store: mvkTokenStorage) : return is
  block{
    var updatedOperators: operators := List.fold(
      function(const operators: operators; const updateOperator: updateOperator): operators is
        case updateOperator of [
          Add_operator (param) -> addOperator(param, operators)
        | Remove_operator (param) -> removeOperator(param, operators)
        ]
      ,
      updateOperatorsParams,
      store.operators
    )
  } with(noOperations,store with record[operators=updatedOperators])

(* AssertMetadata Entrypoint *)
function assertMetadata(const assertMetadataParams: assertMetadataParams; const store: mvkTokenStorage): return is
  block{
    const metadataKey: string = assertMetadataParams.key;
    const metadataHash: bytes = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, store.metadata) of [
      Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
    | None -> failwith("METADATA_NOT_FOUND")
    ]
  } with (noOperations, store)

(* Mint Entrypoint *)
function mint(const mintParams: mintParams; const store : mvkTokenStorage) : return is
  block {
    const recipientAddress: owner = mintParams.0;
    const mintedTokens: tokenBalance = mintParams.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    if checkInWhitelistContracts(Tezos.sender, store.whitelistContracts) or Tezos.sender = Tezos.self_address then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    // Check if the minted token exceed the maximumSupply defined in the mvkTokenStorage
    const tempTotalSupply: tokenBalance = store.totalSupply + mintedTokens;
    if tempTotalSupply > store.maximumSupply then failwith("Maximum total supply of MVK exceeded") else skip;

    // Update sender's balance
    const senderNewBalance: tokenBalance = getBalance(recipientAddress, store) + mintedTokens;
    const newTotalSupply: tokenBalance = store.totalSupply + mintedTokens;

    // Update mvkTokenStorage
    const updatedLedger: ledger = Big_map.update(recipientAddress, Some(senderNewBalance), store.ledger);
  } with (noOperations, store with record[ledger=updatedLedger;totalSupply=newTotalSupply])

(* Main entrypoint *)
function main (const action : action; const store : mvkTokenStorage) : return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of [
        Transfer (params) -> transfer(params, store)
      | Balance_of (params) -> balanceOf(params, store)
      | Update_operators (params) -> updateOperators(params, store)
      | AssertMetadata (params) -> assertMetadata(params, store)

      | Mint (params) -> mint(params, store)

      | UpdateWhitelistContracts (params) -> updateWhitelistContracts(params, store)
      | UpdateGeneralContracts (params) -> updateGeneralContracts(params, store)
    ]
  )