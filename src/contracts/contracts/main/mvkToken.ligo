////
// COMMON TYPES
////
type tokenId is nat;
type tokenBalance is nat;
type operator is address
type owner is address

////
// STORAGE
////
type tokenMetadataInfo is record [
  token_id          : tokenId;
  token_info        : map(string, bytes);
]
type ledger is big_map(address, tokenBalance);
type operators is big_map((owner * operator), unit)

type tokenMetadata is big_map(tokenId, tokenMetadataInfo);
type metadata is big_map (string, bytes);

type whitelistContractsType is map (string, address)
type contractAddressesType is map (string, address)

type storage is record [
    admin                 : address;
    contractAddresses     : contractAddressesType;   // map of contract addresses
    whitelistContracts   : whitelistContractsType;  // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
    metadata              : metadata;
    token_metadata        : tokenMetadata;
    totalSupply           : tokenBalance;
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
type transferDestination is michelson_pair(address, "to_", michelson_pair(tokenId, "token_id", tokenBalance, "amount"), "")
type transfer is michelson_pair(address, "from_", list(transferDestination), "txs")
type transferParams is list(transfer)
(* Balance_of entrypoint inputs *)
type balanceOfRequest is michelson_pair(owner, "owner", tokenId, "token_id")
type balanceOfResponse is michelson_pair(balanceOfRequest, "request", tokenBalance, "balance")
type callbackParams is michelson_pair(balanceOfRequest, "request", tokenBalance, "balance")
type balanceOfParams is michelson_pair(list(balanceOfRequest), "requests", contract(list(callbackParams)), "callback")
(* Update_operators entrypoint inputs *)
type operatorParameter is michelson_pair(owner, "owner", michelson_pair(operator, "operator", tokenId, "token_id"), "")
type updateOperator is 
  Add_operator of operatorParameter
| Remove_operator of operatorParameter
type updateOperatorsParams is list(updateOperator)
(* AssertMetadata entrypoint inputs *)
type assertMetadataParams is michelson_pair(string, "key", bytes, "hash")
(* TotalSupply entrypoint inputs *)
type getTotalSupplyParams is contract(tokenBalance)
(* Mint entrypoint inputs *)
type mintParams is (owner * tokenBalance)
(* Burn entrypoint inputs *)
type burnParams is (owner * tokenBalance)
(* OnStakeChange entrypoint inputs *)
type stakeType is 
  Stake of unit
| Unstake of unit
type onStakeChangeParams is (owner * tokenBalance * stakeType)
(* Update_whitelist_contract entrypoint inputs *)
type updateWhitelistContractsParams is (string * address)
(* UpdateContractAddresses entrypoint inputs *)
type updateContractAddressesParams is (string * address)
(* UpdateMvkDoormanTotalSupply entrypoint inputs *)
type updateMvkTotalSupplyForDoormanParams is tokenBalance

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
| Burn of burnParams
| OnStakeChange of onStakeChangeParams
| UpdateWhitelistContracts of updateWhitelistContractsParams
| UpdateContractAddresses of updateContractAddressesParams
| UpdateMvkTotalSupplyForDoorman of updateMvkTotalSupplyForDoormanParams

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

function checkSpenderBalance(const spenderBalance: tokenBalance; const tokenAmount: tokenBalance): unit is
  if spenderBalance < tokenAmount then failwith("FA2_INSUFFICIENT_BALANCE") // TODO: See if the balance is decrease correctly if the same user send tokens to multiple destinations at once 
  else unit

function checkOwnership(const owner: owner): unit is
  if Tezos.sender =/= owner then failwith("FA2_NOT_OWNER")
  else unit

function checkOperator(const operator: operator; const owner: owner; const store: storage): unit is
  if owner =/= operator and not Big_map.mem((owner, operator), store.operators) then failwith ("FA2_NOT_OPERATOR")
  else unit

function checkSenderIsDoormanContract(const store: storage): unit is
  case Map.find_opt("doorman", store.contractAddresses) of
    Some (v) -> if v =/= Tezos.sender then failwith("ONLY_DOORMAN_CONTRACT_ALLOWED") else unit
  | None -> failwith("DOORMAN_CONTRACT_NOT_FOUND")
  end

function checkSenderIsAdmin(const store: storage): unit is
  if Tezos.sender =/= store.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkInWhitelistContracts(const contractAddress: address; const store : storage): bool is
  block{
    var inWhitelistContractsMap: bool := False;
    for _key -> value in map store.whitelistContracts block {
      if value = contractAddress then inWhitelistContractsMap := True
      else skip;
    }
  } with inWhitelistContractsMap

function checkInContractAddresses(const contractAddress: address; var store: storage) : bool is 
block {
  var inContractAddressMap : bool := False;
  for _key -> value in map store.contractAddresses block {
    if contractAddress = value then inContractAddressMap := True
      else skip;
  }  
} with inContractAddressMap

function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

(* Transfer Entrypoint *)
function mergeOperations(const first: list (operation); const second: list (operation)) : list (operation) is 
  List.fold( 
    function(const operations: list(operation); const operation: operation): list(operation) is operation # operations,
    first,
    second
  )

function transfer(const transferParams: transferParams; const store: storage): return is
  block{
    const senderAddress: address = Tezos.sender;
    function makeTransfer(const account: return; const transferParam: transfer) : return is
      block {
        const owner: owner = transferParam.0;
        const txs: list(transferDestination) = transferParam.1;

        // Validate operator
        checkOperator(senderAddress, owner, account.1);
        
        function transferTokens(const accumulator: storage; const destination: transferDestination): storage is
          block {
            const tokenId: tokenId = destination.1.0;
            const tokenAmount: tokenBalance = destination.1.1;
            const receiver: owner = destination.0;
            const ownerBalance: tokenBalance = getBalance(owner, accumulator);
            const receiverBalance: tokenBalance = getBalance(receiver, accumulator);

            // Validate token type
            checkTokenId(tokenId);

            // Validate that sender has enough token
            checkSpenderBalance(ownerBalance,tokenAmount);

            // Update users' balances
            const ownerNewBalance: tokenBalance = abs(ownerBalance - tokenAmount);
            const receiverNewBalance: tokenBalance = receiverBalance + tokenAmount;

            var updatedLedger: ledger := Big_map.update(receiver, Some (receiverNewBalance), accumulator.ledger);
            updatedLedger := Big_map.update(owner, Some (ownerNewBalance), updatedLedger);
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
        const requestOwner: owner = request.0;
        const tokenBalance: tokenBalance = 
          case Big_map.find_opt(requestOwner, store.ledger) of
            Some (b) -> b
          | None -> 0n
          end;
        const response: balanceOfResponse = (request, tokenBalance);
      } with (response);
      const requests: list(balanceOfRequest) = balanceOfParams.0;
      const callback: contract(list(callbackParams)) = balanceOfParams.1;
      const responses: list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation: operation = Tezos.transaction(responses, 0tez, callback);
  } with (list[operation],store)

(* TotalSupply Entrypoint *)
function getTotalSupply(const getTotalSupplyParams: getTotalSupplyParams; const store: storage) : return is
  (list[Tezos.transaction(store.totalSupply, 0tez, getTotalSupplyParams)], store)

(* Update_operators Entrypoint *)
function addOperator(const operatorParameter: operatorParameter; const operators: operators): operators is
  block{
    const owner: owner = operatorParameter.0;
    const operator: operator = operatorParameter.1.0;
    const tokenId: tokenId = operatorParameter.1.1;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (owner * operator) = (owner, operator)
  } with(Big_map.update(operatorKey, Some (unit), operators))

function removeOperator(const operatorParameter: operatorParameter; const operators: operators): operators is
  block{
    const owner: owner = operatorParameter.0;
    const operator: operator = operatorParameter.1.0;
    const tokenId: tokenId = operatorParameter.1.1;

    checkTokenId(tokenId);
    checkOwnership(owner);

    const operatorKey: (owner * operator) = (owner, operator)
  } with(Big_map.remove(operatorKey, operators))

function updateOperators(const updateOperatorsParams: updateOperatorsParams; const store: storage) : return is
  block{
    var updatedOperators: operators := store.operators;
    for updateOperator in list updateOperatorsParams block {
      updatedOperators := 
      case updateOperator of
        Add_operator (param) -> addOperator(param, updatedOperators)
      | Remove_operator (param) -> removeOperator(param, updatedOperators)
      end;
    }
  } with(noOperations,store with record[operators=updatedOperators])

(* AssertMetadata Entrypoint *)
function assertMetadata(const assertMetadataParams: assertMetadataParams; const store: storage): return is
  block{
    const key: string = assertMetadataParams.0;
    const hash: bytes = assertMetadataParams.1;
    case Big_map.find_opt(key, store.metadata) of
      Some (v) -> if v =/= hash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
    | None -> failwith("METADATA_NOT_FOUND")
    end
  } with (noOperations, store)

(* Mint Entrypoint *)
function mint(const mintParams: mintParams; const store : storage) : return is
  block {
    const senderAddress: owner = mintParams.0;
    const mintedTokens: tokenBalance = mintParams.1;

    // Check sender is from doorman contract or vesting contract - may add treasury contract in future
    if checkInWhitelistContracts(Tezos.sender, store) then failwith("ACCESS_NOT_ALLOWED") else skip;

    // Update sender's balance
    const senderNewBalance: tokenBalance = getBalance(senderAddress, store) + mintedTokens;

    // Update storage
    const updatedLedger: ledger = Big_map.update(senderAddress, Some(senderNewBalance), store.ledger);
  } with (noOperations, store with record[ledger=updatedLedger])

(* Burn Entrypoint *)
function burn (const burnParams: burnParams; const store: storage) : return is
  block {
    const targetAddress: owner = burnParams.0;
    const burnedTokens: tokenBalance = burnParams.1;
    var targetBalance: tokenBalance := getBalance(targetAddress, store);

    (* Check this call is comming from the doorman contract *)
    checkSenderIsDoormanContract(store);

    (* Balance check *)
    checkSpenderBalance(targetBalance, burnedTokens);

    (* Update sender balance *)
    targetBalance := abs(targetBalance - burnedTokens);
    const newTotalSupply: tokenBalance = abs(store.totalSupply - burnedTokens);

    (* Update storage *)
    const updatedLedger: ledger = Big_map.update(targetAddress, Some(targetBalance), store.ledger);
  } with (noOperations, store with record[ledger=updatedLedger;totalSupply=newTotalSupply])

(* OnStakeChange Entrypoint *)
function onStakeChange(const onStakeChangeParams: onStakeChangeParams; const store: storage): return is
  block{
    // check sender is from doorman contract or vesting contract
    if checkInWhitelistContracts(Tezos.sender, store) then failwith("ACCESS_NOT_ALLOWED") else skip;
    
    const owner: owner = onStakeChangeParams.0;
    var ownerBalance: tokenBalance := getBalance(owner, store);
    const value: tokenBalance = onStakeChangeParams.1;
    const stakeType: stakeType = onStakeChangeParams.2;

    case stakeType of
      Stake (_v) -> block{
        // stake -> decrease user balance in mvk ledger 
        (* Balance check *)
        checkSpenderBalance(ownerBalance, value);
        (* Update sender balance *)
        ownerBalance := abs(ownerBalance - value);
      }
      // unstake -> increase user balance in mvk ledger
      // claim   -> increase user balance in mvk ledger (from vesting)
    | Unstake (_v) -> ownerBalance := ownerBalance + value
    end;

    (* Update ledger *)
    const updatedLedger = Big_map.update(owner, Some(ownerBalance), store.ledger);
  } with (noOperations, store with record[ledger=updatedLedger])

(* UpdateWhitelistContracts Entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; const store: storage) : return is 
  block{
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(store); // check that sender is admin

    const contractName: string = updateWhitelistContractsParams.0;
    const contractAddress: address = updateWhitelistContractsParams.1;
    
    const exitingAddress: option(address) = 
      if checkInWhitelistContracts(contractAddress, store) then Some (contractAddress) else (None : option(address));

    const updatedWhitelistedContracts: whitelistContractsType = 
      Map.update(
        contractName, 
        exitingAddress,
        store.whitelistContracts
      );
  } with (noOperations, store with record[whitelistContracts=updatedWhitelistedContracts]) 

(* UpdateContractAddresses Entrypoint *)
function updateContractAddresses(const updateContractAddressesParams: updateContractAddressesParams; const store: storage) : return is 
  block{
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAdmin(store); // check that sender is admin

    const contractName: string = updateContractAddressesParams.0;
    const contractAddress: address = updateContractAddressesParams.1;
    
    const exitingAddress: option(address) = 
      if checkInContractAddresses(contractAddress, store) then Some (contractAddress) else (None : option(address));

    const updatedContractAddresses: contractAddressesType = 
      Map.update(
        contractName, 
        exitingAddress,
        store.contractAddresses
      );
  } with (noOperations, store with record[contractAddresses=updatedContractAddresses])

function updateMvkTotalSupplyForDoorman(const updateMvkTotalSupplyForDoormanParams: updateMvkTotalSupplyForDoormanParams; const store: storage): return is
  block {
    (* Check this call is comming from the doorman contract *)
    checkSenderIsDoormanContract(store);

    const unstakeAmount: tokenBalance = updateMvkTotalSupplyForDoormanParams;
    const doormanAddress: address = Tezos.sender;

    const setTempMvkTotalSupplyEntrypoint: contract(nat) = 
      case (Tezos.get_entrypoint_opt("%setTempMvkTotalSupply", doormanAddress) : option(contract(nat))) of
        Some (contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat))
      end;
    const setTempMvkTotalSupplyEntrypoint_operation: operation = Tezos.transaction(store.totalSupply, 0tez, setTempMvkTotalSupplyEntrypoint);

    const unstakeCompleteEntrypoint: contract(nat) =
      case (Tezos.get_entrypoint_opt("%unstakeComplete", doormanAddress) : option(contract(nat))) of
        Some(contr) -> contr
      | None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(nat))
      end;
    const unstakeCompleteOperation: operation = Tezos.transaction(unstakeAmount, 0tez, unstakeCompleteEntrypoint);

    const operations: list(operation) = list [setTempMvkTotalSupplyEntrypoint_operation; unstakeCompleteOperation];

  } with (operations, store)

(* Main entrypoint *)
function main (const action : action; const store : storage) : return is
  case action of
      Transfer (params) -> transfer(params, store)
    | Balance_of (params) -> balanceOf(params, store)
    | Update_operators (params) -> updateOperators(params, store)
    | AssertMetadata (params) -> assertMetadata(params, store)
    | GetTotalSupply (params) -> getTotalSupply(params, store)
    | Mint (params) -> mint(params, store)
    | Burn (params) -> burn(params, store)
    | OnStakeChange (params) -> onStakeChange(params, store)
    | UpdateWhitelistContracts (params) -> updateWhitelistContracts(params, store)
    | UpdateContractAddresses (params) -> updateContractAddresses(params, store)
    | UpdateMvkTotalSupplyForDoorman (params) -> updateMvkTotalSupplyForDoorman(params, store)
  end;