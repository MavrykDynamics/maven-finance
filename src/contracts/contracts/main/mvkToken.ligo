// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

////
// COMMON TYPES
////
type tokenId is nat;
type tokenBalance is nat;
type operator is address
type owner is address
type treasury is string
type forceTransfer is bool

////
// STORAGE
////
type tokenMetadataInfo is record [
  token_id          : tokenId;
  token_info        : map(string, bytes);
]
type ledger is big_map(address, tokenBalance);
type operators is big_map((owner * operator * nat), unit)

type tokenMetadata is big_map(tokenId, tokenMetadataInfo);
type metadata is big_map (string, bytes);

type storage is record [
  admin                 : address;
  generalContracts      : generalContractsType;    // map of contract addresses
  whitelistContracts    : whitelistContractsType;  // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
  metadata              : metadata;
  token_metadata        : tokenMetadata;
  totalSupply           : tokenBalance;
  maximumTotalSupply    : tokenBalance;
  ledger                : ledger;
  operators             : operators
]

////
// RETURN TYPES
////
(* define return for readability *)
type return is list (operation) * storage
(* define noop for readability *)
const noOperations : list (operation) = nil;

////
// INPUTS
////
(* Transfer entrypoint inputs *)
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: tokenId;
  amount: tokenBalance;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type transferParams is list(transfer)

(* Balance_of entrypoint inputs *)
type balanceOfRequest is [@layout:comb] record[
  owner: owner;
  token_id: tokenId;
]
type balanceOfResponse is [@layout:comb] record[
  request: balanceOfRequest;
  balance: tokenBalance;
]
type balanceOfParams is [@layout:comb] record[
  requests: list(balanceOfRequest);
  callback: contract(list(balanceOfResponse));
]

(* Update_operators entrypoint inputs *)
type operatorParameter is [@layout:comb] record[
  owner: owner;
  operator: operator;
  token_id: tokenId;
]
type updateOperator is 
  Add_operator of operatorParameter
| Remove_operator of operatorParameter
type updateOperatorsParams is list(updateOperator)

(* AssertMetadata entrypoint inputs *)
type assertMetadataParams is [@layout:comb] record[
  key: string;
  hash: bytes;
]

(* GetTotalSupply entrypoint inputs *)
type getTotalSupplyParams is contract(tokenBalance)

(* GetDesiredMintPossibility entrypoint inputs *)
type getDesiredMintPossibilityParams is contract(tokenBalance)

(* Mint entrypoint inputs *)
type mintParams is (owner * tokenBalance)

(* OnStakeChange entrypoint inputs *)
type stakeType is 
  StakeAction of unit
| UnstakeAction of unit
type onStakeChangeParamsType is (owner * tokenBalance * stakeType)

(* DoormanUnstakeStage entrypoint inputs *)
type doormanUnstakeStageParams is tokenBalance

(* DoormanFarmClaimStage entrypoint inputs *)
type doormanFarmClaimStageParams is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

////
// ENTRYPOINTS
////
type action is
  Transfer of transferParams
| Balance_of of balanceOfParams
| Update_operators of updateOperatorsParams
| AssertMetadata of assertMetadataParams
| GetTotalSupply of getTotalSupplyParams
| Mint of mintParams
| OnStakeChange of onStakeChangeParamsType
| UpdateWhitelistContracts of updateWhitelistContractsParams
| UpdateGeneralContracts of updateGeneralContractsParams
| DoormanUnstakeStage of doormanUnstakeStageParams
| DoormanFarmClaimStage of doormanFarmClaimStageParams

////
// FUNCTIONS
////
(* Helper functions *)
function getBalance(const owner : owner; const store : storage) : tokenBalance is
  case Big_map.find_opt(owner, store.ledger) of
    Some (v) -> v
  | None -> 0n
  end

(* Helper function to validate *)
function checkTokenId(const tokenId: tokenId): unit is
  if tokenId =/= 0n then failwith("FA2_TOKEN_UNDEFINED") // TODO: Check if that's the right syntax
  else unit

function checkBalance(const spenderBalance: tokenBalance; const tokenAmount: tokenBalance): unit is
  if spenderBalance < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE") // TODO: See if the balance is decrease correctly if the same user send tokens to multiple destinations at once 
  else unit

function checkOwnership(const owner: owner): unit is
  if Tezos.sender =/= owner then failwith("FA2_NOT_OWNER")
  else unit

function checkOperator(const owner: owner; const token_id: tokenId; const operators: operators): unit is
  if owner = Tezos.sender or Big_map.mem((owner, Tezos.sender, token_id), operators) then unit
  else failwith ("FA2_NOT_OPERATOR")

function checkSenderIsDoormanContract(const store: storage): unit is
  case Map.find_opt("doorman", store.generalContracts) of
    Some (v) -> if v =/= Tezos.sender then failwith("ONLY_DOORMAN_CONTRACT_ALLOWED") else unit
  | None -> failwith("DOORMAN_CONTRACT_NOT_FOUND")
  end

function checkSenderIsAdmin(const store: storage): unit is
  if Tezos.sender =/= store.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

(* Transfer Entrypoint *)
function mergeOperations(const first: list (operation); const second: list (operation)) : list (operation) is 
  List.fold( 
    function(const operations: list(operation); const operation: operation): list(operation) is operation # operations,
    first,
    second
  )

function transfer(const transferParams: transferParams; const store: storage): return is
  block{
    function makeTransfer(const account: return; const transferParam: transfer) : return is
      block {
        const owner: owner = transferParam.from_;
        const txs: list(transferDestination) = transferParam.txs;
        
        function transferTokens(const accumulator: storage; const destination: transferDestination): storage is
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
          const updatedStorage: storage = List.fold(transferTokens, txs, account.1);
      } with (mergeOperations(updatedOperations,account.0), updatedStorage)
  } with List.fold(makeTransfer, transferParams, ((nil: list(operation)), store))

(* Balance_of Entrypoint *)
function balanceOf(const balanceOfParams: balanceOfParams; const store: storage) : return is
  block{
    function retrieveBalance(const request: balanceOfRequest): balanceOfResponse is
      block{
        const requestOwner: owner = request.owner;
        const tokenBalance: tokenBalance = 
          case Big_map.find_opt(requestOwner, store.ledger) of
            Some (b) -> b
          | None -> 0n
          end;
        const response: balanceOfResponse = record[request=request;balance=tokenBalance];
      } with (response);
      const requests: list(balanceOfRequest) = balanceOfParams.requests;
      const callback: contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses: list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation: operation = Tezos.transaction(responses, 0tez, callback);
  } with (list[operation],store)

(* TotalSupply Entrypoint *)
function getTotalSupply(const getTotalSupplyParams: getTotalSupplyParams; const store: storage) : return is
  (list[Tezos.transaction(store.totalSupply, 0tez, getTotalSupplyParams)], store)

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

function updateOperators(const updateOperatorsParams: updateOperatorsParams; const store: storage) : return is
  block{
    var updatedOperators: operators := List.fold(
      function(const operators: operators; const updateOperator: updateOperator): operators is
        case updateOperator of
          Add_operator (param) -> addOperator(param, operators)
        | Remove_operator (param) -> removeOperator(param, operators)
        end
      ,
      updateOperatorsParams,
      store.operators
    )
  } with(noOperations,store with record[operators=updatedOperators])

(* AssertMetadata Entrypoint *)
function assertMetadata(const assertMetadataParams: assertMetadataParams; const store: storage): return is
  block{
    const metadataKey: string = assertMetadataParams.key;
    const metadataHash: bytes = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, store.metadata) of
      Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
    | None -> failwith("METADATA_NOT_FOUND")
    end
  } with (noOperations, store)

(* Mint Entrypoint *)
function mint(const mintParams: mintParams; const store : storage) : return is
  block {
    const recipientAddress: owner = mintParams.0;
    const mintedTokens: tokenBalance = mintParams.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    if checkInWhitelistContracts(Tezos.sender, store) or Tezos.sender = Tezos.self_address then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    // Check if the minted token exceed the maximumTotalSupply defined in the storage
    const tempTotalSupply: tokenBalance = store.totalSupply + mintedTokens;
    if tempTotalSupply > store.maximumTotalSupply then failwith("Maximum total supply of MVK exceeded") else skip;

    // Update sender's balance
    const senderNewBalance: tokenBalance = getBalance(recipientAddress, store) + mintedTokens;
    const newTotalSupply: tokenBalance = store.totalSupply + mintedTokens;

    // Update storage
    const updatedLedger: ledger = Big_map.update(recipientAddress, Some(senderNewBalance), store.ledger);
  } with (noOperations, store with record[ledger=updatedLedger;totalSupply=newTotalSupply])

(* OnStakeChange Entrypoint *)
(* type onStakeChangeParamsType is (owner * tokenBalance * stakeType) : (address * nat * (StakeAction : unit, UnstakeAction : unit) )  *)
function onStakeChange(const onStakeChangeParams: onStakeChangeParamsType; const store: storage): return is
  block{
    // check sender is from doorman contract or vesting contract
    if checkInWhitelistContracts(Tezos.sender, store) then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");
    
    const owner: owner = onStakeChangeParams.0;
    var ownerBalance: tokenBalance := getBalance(owner, store);
    const value: tokenBalance = onStakeChangeParams.1;
    const stakeType: stakeType = onStakeChangeParams.2;

    case stakeType of
      StakeAction (_v) -> block{
        // stake -> decrease user balance in mvk ledger 
        (* Balance check *)
        checkBalance(ownerBalance, value);
        (* Update sender balance *)
        ownerBalance := abs(ownerBalance - value);
      }
      // unstake -> increase user balance in mvk ledger
      // claim   -> increase user balance in mvk ledger (from vesting)
    | UnstakeAction (_v) -> ownerBalance := ownerBalance + value
    end;

    (* Update ledger *)
    const updatedLedger = Big_map.update(owner, Some(ownerBalance), store.ledger);
  } with (noOperations, store with record[ledger=updatedLedger])

(* DoormanUnstakeStage Entrypoint *)
function doormanUnstakeStage(const doormanUnstakeStageParams: doormanUnstakeStageParams; const store: storage): return is
  block {
    (* Check this call is comming from the doorman contract *)
    checkSenderIsDoormanContract(store);

    const unstakeAmount: tokenBalance = doormanUnstakeStageParams;
    const doormanAddress: address = Tezos.sender;

    const setTempMvkTotalSupplyEntrypoint: contract(nat*nat) = 
      case (Tezos.get_entrypoint_opt("%setTempMvkTotalSupply", doormanAddress) : option(contract(nat*nat))) of
        Some (contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat*nat))
      end;
    const setTempMvkTotalSupplyEntrypoint_operation: operation = Tezos.transaction((store.totalSupply, store.maximumTotalSupply), 0tez, setTempMvkTotalSupplyEntrypoint);

    const unstakeCompleteEntrypoint: contract(nat) =
      case (Tezos.get_entrypoint_opt("%unstakeComplete", doormanAddress) : option(contract(nat))) of
        Some(contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat))
      end;
    const unstakeCompleteOperation: operation = Tezos.transaction(unstakeAmount, 0tez, unstakeCompleteEntrypoint);

    const operations: list(operation) = list [setTempMvkTotalSupplyEntrypoint_operation; unstakeCompleteOperation];

  } with (operations, store)

(* DoormanFarmClaimStage Entrypoint *)
function doormanFarmClaimStage(const doormanFarmClaimStageParams: doormanFarmClaimStageParams; const store: storage): return is
  block {
    (* Check this call is comming from the doorman contract *)
    checkSenderIsDoormanContract(store);

    const recipientAddress: owner = doormanFarmClaimStageParams.0;
    var mintedTokens: tokenBalance := doormanFarmClaimStageParams.1;
    const forceTransfer: bool = doormanFarmClaimStageParams.2;
    const doormanAddress: address = Tezos.sender;

    const setTempMvkTotalSupplyEntrypoint: contract(nat*nat) = 
      case (Tezos.get_entrypoint_opt("%setTempMvkTotalSupply", doormanAddress) : option(contract(nat*nat))) of
        Some (contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat*nat))
      end;
    const setTempMvkTotalSupplyEntrypoint_operation: operation = Tezos.transaction((store.totalSupply, store.maximumTotalSupply), 0tez, setTempMvkTotalSupplyEntrypoint);

    const farmClaimCompleteEntrypoint: contract(doormanFarmClaimStageParams) =
      case (Tezos.get_entrypoint_opt("%farmClaimComplete", doormanAddress) : option(contract(doormanFarmClaimStageParams))) of
        Some(contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(doormanFarmClaimStageParams))
      end;
    const farmClaimCompleteOperation: operation = Tezos.transaction((recipientAddress,mintedTokens,forceTransfer), 0tez, farmClaimCompleteEntrypoint);

    const operations: list(operation) = list [setTempMvkTotalSupplyEntrypoint_operation; farmClaimCompleteOperation];

  } with (operations, store)

(* Main entrypoint *)
function main (const action : action; const store : storage) : return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of
        Transfer (params) -> transfer(params, store)
      | Balance_of (params) -> balanceOf(params, store)
      | Update_operators (params) -> updateOperators(params, store)
      | AssertMetadata (params) -> assertMetadata(params, store)
      | GetTotalSupply (params) -> getTotalSupply(params, store)
      | Mint (params) -> mint(params, store)
      | OnStakeChange (params) -> onStakeChange(params, store)
      | UpdateWhitelistContracts (params) -> updateWhitelistContracts(params, store)
      | UpdateGeneralContracts (params) -> updateGeneralContracts(params, store)
      | DoormanUnstakeStage (params) -> doormanUnstakeStage(params, store)
      | DoormanFarmClaimStage (params) -> doormanFarmClaimStage(params, store)
    end
  )