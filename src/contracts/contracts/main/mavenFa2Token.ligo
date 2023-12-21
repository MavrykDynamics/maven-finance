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

// FA2 Token Types
#include "../partials/contractTypes/mavenFa2TokenTypes.ligo"

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

        // Additional Entrypoints (Token Supply Inflation)
    |   MintOrBurn                of mintOrBurnType


type return is list (operation) * mavenFa2TokenStorageType
const noOperations : list (operation) = nil;

// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mavenFa2TokenStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s : mavenFa2TokenStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : mavenFa2TokenStorageType) : unit is
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
[@view] function getAdmin(const _ : unit; var store : mavenFa2TokenStorageType) : address is
    store.admin



(* get: whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const store : mavenFa2TokenStorageType) : option(unit) is
    Big_map.find_opt(contractAddress, store.whitelistContracts)



(* get: operator *)
[@view] function getOperatorOpt(const operator : (ownerType * operatorType * nat); const store : mavenFa2TokenStorageType) : option(unit) is
    Big_map.find_opt(operator, store.operators)



(* get: balance View *)
[@view] function get_balance(const userAndId : ownerType * nat; const store : mavenFa2TokenStorageType) : tokenBalanceType is
    case Big_map.find_opt(userAndId.0, store.ledger) of [
            Some (_v) -> _v
        |   None      -> 0n
    ]



(* total_supply View *)
[@view] function total_supply(const _tokenId : nat; const _store : mavenFa2TokenStorageType) : tokenBalanceType is
    _store.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _store : mavenFa2TokenStorageType) : list(nat) is
    list[0n]



(* check if operator *)
[@view] function is_operator(const operator : (ownerType * operatorType * nat); const store : mavenFa2TokenStorageType) : bool is
    Big_map.mem(operator, store.operators)



(* get: metadata *)
[@view] function token_metadata(const tokenId : nat; const store : mavenFa2TokenStorageType) : option(tokenMetadataInfoType) is
    case Big_map.find_opt(tokenId, store.token_metadata) of [
            Some (_metadata)  -> Some(_metadata)
        |   None              -> (None : option(tokenMetadataInfoType))
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
function setAdmin(const newAdminAddress : address; var s : mavenFa2TokenStorageType) : return is
block {

    checkSenderIsAllowed(s);
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : mavenFa2TokenStorageType) : return is
block {
    
    checkSenderIsAllowed(s);
    s.governanceAddress := newGovernanceAddress;

} with (noOperations, s)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsTypes : updateWhitelistContractsType; var s : mavenFa2TokenStorageType) : return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsTypes, s.whitelistContracts);
  
} with (noOperations, s)



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationTypes : transferActionType; var s : mavenFa2TokenStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the parameters sent

    // Check if the sender is admin or the Governance Satellite Contract
    checkSenderIsAdminOrGovernanceSatelliteContract(s);

    // Operations list
    var operations : list(operation) := nil;

    // Create transfer operations (transferOperationFold in transferHelpers)
    operations := List.fold_right(transferOperationFold, destinationTypes, operations)

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// FA2 Entrypoints Begin
// ------------------------------------------------------------------------------

(* assertMetadata entrypoint *)
function assertMetadata(const assertMetadataParams : assertMetadataType; const s : mavenFa2TokenStorageType) : return is
block{

    const metadataKey  : string  = assertMetadataParams.key;
    const metadataHash : bytes   = assertMetadataParams.hash;
    case Big_map.find_opt(metadataKey, s.metadata) of [
            Some (v) -> if v =/= metadataHash then failwith("METADATA_HAS_A_WRONG_HASH") else skip
        |   None     -> failwith("METADATA_NOT_FOUND")
    ]

} with (noOperations, s)



(* transfer entrypoint *)
function transfer(const transferParams : fa2TransferType; const s : mavenFa2TokenStorageType) : return is
block{

    function makeTransfer(const account : return; const transferParam : transfer) : return is
        block {

            const owner : ownerType = transferParam.from_;
            const txs : list(transferDestination) = transferParam.txs;
             
            function transferTokens(const accumulator : mavenFa2TokenStorageType; const destination : transferDestination) : mavenFa2TokenStorageType is
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
            const updatedStorage : mavenFa2TokenStorageType = List.fold(transferTokens, txs, account.1);

        } with (mergeOperations(updatedOperations,account.0), updatedStorage)

} with List.fold(makeTransfer, transferParams, ((nil: list(operation)), s))




(* balance_of entrypoint *)
function balanceOf(const balanceOfParams : balanceOfType; const s : mavenFa2TokenStorageType) : return is
block{

    function retrieveBalance(const request : balanceOfRequestType) : balanceOfResponse is
        block{

            const requestOwner : ownerType = request.owner;
            const tokenBalance : tokenBalanceType = 
            case Big_map.find_opt(requestOwner, s.ledger) of [
                    Some (b) -> b
                |   None     -> 0n
            ];
            const response : balanceOfResponse = record[request=request;balance=tokenBalance];

        } with (response);

      const requests   : list(balanceOfRequestType) = balanceOfParams.requests;
      const callback   : contract(list(balanceOfResponse)) = balanceOfParams.callback;
      const responses  : list(balanceOfResponse) = List.map(retrieveBalance, requests);
      const operation  : operation = Tezos.transaction(responses, 0tez, callback);

} with (list[operation],s)



(* update_operators entrypoint *)
function updateOperators(const updateOperatorsParams : updateOperatorsType; const s : mavenFa2TokenStorageType) : return is
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
function mintOrBurn(const mintOrBurnParams : mintOrBurnType; var s : mavenFa2TokenStorageType) : return is
block {

    // check sender is whitelisted
    if checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    const quantity        : int             = mintOrBurnParams.quantity;
    const targetAddress   : address         = mintOrBurnParams.target;
    const tokenId         : tokenIdType     = mintOrBurnParams.tokenId;
    const tokenAmount     : nat             = abs(quantity);

    // check token id
    checkTokenId(tokenId);
    
    // get target balance    
    const userBalance : tokenBalanceType    = get_balance((targetAddress, 0n), s);

    if quantity < 0 then block {
        // burn Token

        (* Balance check *)
        if userBalance < tokenAmount then
        failwith("NotEnoughBalance")
        else skip;

        (* Update target balance *)
        const targetNewBalance = abs(userBalance - tokenAmount);
        const newTotalSupply : tokenBalanceType = abs(s.totalSupply - tokenAmount);

        (* Update storage *)
        const updatedLedger : ledgerType = Big_map.update(targetAddress, Some(targetNewBalance), s.ledger);

        s.ledger       := updatedLedger;
        s.totalSupply  := newTotalSupply;

    } else block {
        // mint Token

        // Update target's balance
        const targetNewBalance  : tokenBalanceType = userBalance + tokenAmount;
        const newTotalSupply    : tokenBalanceType = s.totalSupply + tokenAmount;
        
        // Update storage
        const updatedLedger     : ledgerType = Big_map.update(targetAddress, Some(targetNewBalance), s.ledger);
    
        s.ledger       := updatedLedger;
        s.totalSupply  := newTotalSupply;
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
function main (const action : action; const s : mavenFa2TokenStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any tez amount  

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

            // Additional Entrypoints (Token Supply Inflation)
        |   MintOrBurn (parameters)                 -> mintOrBurn(parameters, s)

    ]

)
