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

// FA12 Token Types
#include "../partials/contractTypes/mavenFa12TokenTypes.ligo"

// ------------------------------------------------------------------------------

type action is

        // Housekeeping Entrypoints
        SetAdmin                  of address
    |   SetGovernance             of address
    |   UpdateWhitelistContracts  of updateWhitelistContractsType
    |   MistakenTransfer          of transferActionType

        // FA12 Entrypoints
    |   Transfer                  of fa12TransferType
    |   Approve                   of approveType
    |   GetBalance                of balanceType
    |   GetAllowance              of allowanceType
    |   GetTotalSupply            of totalSupplyType

        // Additional Entrypoints (Token Supply Inflation)
    |   MintOrBurn                of mintOrBurnType


type return is list (operation) * mavenFa12TokenStorageType
const noOperations : list (operation) = nil;

// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAllowed(var s : mavenFa12TokenStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s : mavenFa12TokenStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit


function checkSenderIsAdminOrGovernanceSatelliteContract(var s : mavenFa12TokenStorageType) : unit is
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
// FA12 Helper Functions Begin
// ------------------------------------------------------------------------------

(* Helper function to get account *)
function getAccount (const addr : address; const s : mavenFa12TokenStorageType) : accountType is
block {
    var acct : accountType :=
        record [
            balance    = 0n;
            allowances = (map [] : map (address, tokenBalanceType));
    ];
    case s.ledger[addr] of [
            None            -> skip
        |   Some(instance)  -> acct := instance
    ];
} with acct
  


(* Helper function to get allowance for an account *)
function getAllowance (const ownerAccount : accountType; const spender : address; const _s : mavenFa12TokenStorageType) : tokenBalanceType is
    case ownerAccount.allowances[spender] of [
            Some (tokenBalanceType)  -> tokenBalanceType
        |   None        -> 0n
    ];

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

(* get: admin View *)
[@view] function getAdmin(const _: unit; const s : mavenFa12TokenStorageType) : address is
    s.admin



(* get: whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const store : mavenFa12TokenStorageType) : option(unit) is
    Big_map.find_opt(contractAddress, store.whitelistContracts)



(* get: accountType view *)
[@view] function getLedgerRecordOpt(const userAddress : address; const s : mavenFa12TokenStorageType) : option(accountType) is
    s.ledger[userAddress]



(* get: balance View *)
[@view] function get_balance(const userAndId: address * nat; const s: mavenFa12TokenStorageType) : nat is
    case Big_map.find_opt(userAndId.0, s.ledger) of [
            Some (_v) -> _v.balance
        |   None      -> 0n
    ]



(* total_supply View *)
[@view] function total_supply(const _tokenId: nat; const _s: mavenFa12TokenStorageType) : nat is
    _s.totalSupply



(* all_tokens View *)
[@view] function all_tokens(const _ : unit; const _s: mavenFa12TokenStorageType) : list(nat) is
    list[0n]



(* get: metadata *)
[@view] function token_metadata(const tokenId: tokenIdType; const s: mavenFa12TokenStorageType) : option(tokenMetadataInfoType) is
    case Big_map.find_opt(tokenId, s.token_metadata) of [
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
function setAdmin(const newAdminAddress : address; var s : mavenFa12TokenStorageType) : return is
block {

    checkSenderIsAllowed(s);
    s.admin := newAdminAddress;

} with (noOperations, s)



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : mavenFa12TokenStorageType) : return is
block {
    
    checkSenderIsAllowed(s);
    s.governanceAddress := newGovernanceAddress;

} with (noOperations, s)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsTypes : updateWhitelistContractsType; var s : mavenFa12TokenStorageType) : return is
block {

    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsTypes, s.whitelistContracts);
  
} with (noOperations, s)



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationTypes : transferActionType; var s : mavenFa12TokenStorageType) : return is
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
// FA12 Entrypoints Begin
// ------------------------------------------------------------------------------

(* Transfer token to another account *)
function transfer (const from_ : address; const to_ : address; const value : tokenBalanceType; var s : mavenFa12TokenStorageType) : return is
block {

    (* Retrieve sender account from mavenFa12TokenStorageType *)
    var senderAccount : accountType := getAccount(from_, s);

    (* Balance check *)
    if senderAccount.balance < value then
        failwith("NotEnoughBalance")
    else skip;

    (* Check this address can spend the tokens *)
    if from_ =/= Tezos.get_sender() then block {
        const spenderAllowance : tokenBalanceType = getAllowance(senderAccount, Tezos.get_sender(), s);

        if spenderAllowance < value then
            failwith("NotEnoughAllowance")
        else skip;

        (* Decrease any allowances *)
        senderAccount.allowances[Tezos.get_sender()] := abs(spenderAllowance - value);
    } else skip;

    (* Update sender balance *)
    senderAccount.balance := abs(senderAccount.balance - value);

    (* Update mavenFa12TokenStorageType *)
    s.ledger[from_] := senderAccount;

    (* Create or get destination account *)
    var destAccount : accountType := getAccount(to_, s);

    (* Update destination balance *)
    destAccount.balance := destAccount.balance + value;

    (* Update mavenFa12TokenStorageType *)
    s.ledger[to_] := destAccount;

} with (noOperations, s)



(* Approve an tokenBalanceType to be spent by another address in the name of the sender *)
function approve (const spender : address; const value : tokenBalanceType; var s : mavenFa12TokenStorageType) : return is
block {

    (* Create or get sender account *)
    var senderAccount : accountType := getAccount(Tezos.get_sender(), s);

    (* Get current spender allowance *)
    const spenderAllowance : tokenBalanceType = getAllowance(senderAccount, spender, s);

    (* Prevent a corresponding attack vector *)
    if spenderAllowance > 0n and value > 0n then
      failwith("UnsafeAllowanceChange")
    else skip;

    (* Set spender allowance *)
    senderAccount.allowances[spender] := value;

    (* Update mavenFa12TokenStorageType *)
    s.ledger[Tezos.get_sender()] := senderAccount;

  } with (noOperations, s)



(* View function that forwards the balance of source to a contract *)
function getBalance (const owner : address; const contr : contract(tokenBalanceType); var s : mavenFa12TokenStorageType) : return is
block {
    const ownerAccount : accountType = getAccount(owner, s);
} with (list [Tezos.transaction(ownerAccount.balance, 0tz, contr)], s)



(* View function that forwards the allowance tokenBalanceType of spender in the name of tokenOwner to a contract *)
function getAllowance (const owner : address; const spender : address; const contr : contract(tokenBalanceType); var s : mavenFa12TokenStorageType) : return is
block {
    const ownerAccount : accountType = getAccount(owner, s);
    const spenderAllowance : tokenBalanceType = getAllowance(ownerAccount, spender, s);
} with (list [Tezos.transaction(spenderAllowance, 0tz, contr)], s)

(* View function that forwards the totalSupply to a contract *)
function getTotalSupply (const contr : contract(tokenBalanceType); var s : mavenFa12TokenStorageType) : return is
block {
    skip
} with (list [Tezos.transaction(s.totalSupply, 0tz, contr)], s)

// ------------------------------------------------------------------------------
// FA12 Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Additional Entrypoints Begin 
// ------------------------------------------------------------------------------

(* MintOrBurn Entrypoint *)
function mintOrBurn(const mintOrBurnParams: mintOrBurnType; var s : mavenFa12TokenStorageType) : return is
block {

    // check sender is whitelisted
    if checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then skip else failwith("ONLY_WHITELISTED_CONTRACTS_ALLOWED");

    const quantity        : int       = mintOrBurnParams.quantity;
    const targetAddress   : address   = mintOrBurnParams.target;
    const tokenAmount     : nat       = abs(quantity);

    // get target balance
    const userAccount : accountType       = getAccount(targetAddress, s);

    if quantity < 0 then block {
        // burn Token

        (* Balance check *)
        if userAccount.balance < tokenAmount then
        failwith("NotEnoughBalance")
        else skip;


        (* Update target balance *)
        
        const targetNewBalance = abs(userAccount.balance - tokenAmount);
        const emptyAllowanceMap : map(trusted, tokenBalanceType) = map[];
        const newAccount : accountType = record [
            balance    = targetNewBalance;
            allowances = emptyAllowanceMap;
        ];

        const newTotalSupply : tokenBalanceType = abs(s.totalSupply - tokenAmount);

        (* Update storage *)
        const updatedLedger : ledgerType = Big_map.update(targetAddress, Some(newAccount), s.ledger);

        s.ledger       := updatedLedger;
        s.totalSupply  := newTotalSupply;

    } else block {
        // mint Token

        // Update target's balance
        const targetNewBalance  : tokenBalanceType = userAccount.balance + tokenAmount;
        const emptyAllowanceMap : map(trusted, tokenBalanceType) = map[];
        const newAccount : accountType = record [
        balance    = targetNewBalance;
        allowances = emptyAllowanceMap;
        ];

        const newTotalSupply    : tokenBalanceType = s.totalSupply + tokenAmount;
        

        // Update storage
        const updatedLedger     : ledgerType = Big_map.update(targetAddress, Some(newAccount), s.ledger);
    
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
function main (const action : action; const s : mavenFa12TokenStorageType) : return is
block{

    verifyNoAmountSent(Unit); // // entrypoints should not receive any tez amount  

} with(
    
    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   MistakenTransfer (parameters)           -> mistakenTransfer(parameters, s)

            // FA12 Entrypoints
        |   Transfer(parameters)                    -> transfer(parameters.0, parameters.1.0, parameters.1.1, s)
        |   Approve(parameters)                     -> approve(parameters.0, parameters.1, s)
        |   GetBalance(parameters)                  -> getBalance(parameters.0, parameters.1, s)
        |   GetAllowance(parameters)                -> getAllowance(parameters.0.0, parameters.0.1, parameters.1, s)
        |   GetTotalSupply(parameters)              -> getTotalSupply(parameters.1, s)

            // Additional Entrypoints (Token Supply Inflation)
        |   MintOrBurn (parameters)                 -> mintOrBurn(parameters, s)

    ]

)
