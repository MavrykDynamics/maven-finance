// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

#include "../partials/fa12/fa12_types.ligo"
#include "../partials/fa2/fa2_types.ligo"

type operator is address
type owner is address
type tokenId is nat;

type configType is record [
    minXtzAmount      : nat;
    maxXtzAmount      : nat;
]

type breakGlassConfigType is record [
    transferIsPaused         : bool; 
    mintAndTransferIsPaused  : bool;
    updateOperatorsIsPaused  : bool;
]

type storage is record [
    admin                      : address;
    mvkTokenAddress            : address;

    config                     : configType;

    whitelistContracts         : whitelistContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;

    breakGlassConfig           : breakGlassConfigType;
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
type updateOperatorsParamsType is list(updateOperator)

type tezType             is unit

type fa12TokenType       is address

type fa2TokenType        is [@layout:comb] record [
  token                   : address;
  id                      : nat;
]

type tokenType       is
| Tez                     of tezType         // unit
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ token : address; id : nat; ]

type transferTokenType is record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]
// type transferType is list(transferTokenType)

type mintTokenType is (address * nat)
type mintMvkAndTransferType is record [
    to_             : address;
    amt             : nat;
]

type updateSatelliteBalanceParams is (address * nat * nat)

type updateConfigNewValueType is nat
type updateConfigActionType is 
| ConfigMinXtzAmount of unit
| ConfigMaxXtzAmount of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: updateConfigNewValueType; 
  updateConfigAction: updateConfigActionType;
]


type treasuryAction is 
    | SetAdmin of (address)
    | UpdateConfig of updateConfigParamsType    
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams

    | Transfer of transferTokenType
    | MintMvkAndTransfer of mintMvkAndTransferType
    | Update_operators of (address * updateOperatorsParamsType)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

function get_fa12_token_transfer_entrypoint(
  const token           : address)
                        : contract(fa12_transfer_type) is
  case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa12_transfer_type))) of
  | Some(contr) -> contr
  | None        -> (failwith("Error. FA12 Token transfer entrypoint is not found.") : contract(fa12_transfer_type))
  end

function get_fa2_token_transfer_entrypoint(const token : address) : contract(fa2_transfer_type) is
  case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa2_transfer_type))) of
  | Some(contr) -> contr
  | None        -> (failwith("Error. FA2 Token transfer entrypoint is not found.") : contract(fa2_transfer_type))
  end

[@inline] function wrap_fa12_transfer_trx(const from_ : address; const to_ : address; const amt : nat) : fa12_transfer_type is FA12_transfer(from_, (to_, amt))

[@inline] function wrap_fa2_transfer_trx(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const id              : fa2_token_id_type)
                        : fa2_transfer_type is
  FA2_transfer(
    list [
      record [
        from_ = from_;
        txs   = list [
          record [
            to_      = to_;
            token_id = id;
            amount   = amt;
          ]
        ];
      ]
    ]
  )

function transfer_tez(
  const to_             : contract(unit);
  const amt             : nat)
                        : operation is
  Tezos.transaction(unit, amt * 1mutez, to_)

function transfer_fa12(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : address)
                        : operation is
  Tezos.transaction(
    wrap_fa12_transfer_trx(from_, to_, amt),
    0mutez,
    get_fa12_token_transfer_entrypoint(token)
  )

function transfer_fa2(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : address;
  const id              : fa2_token_id_type)
                        : operation is
  Tezos.transaction(
    wrap_fa2_transfer_trx(from_, to_, amt, id),
    0mutez,
    get_fa2_token_transfer_entrypoint(token)
  )

function transfer_token(
  const from_           : address;
  const to_             : address;
  const amt             : nat;
  const token           : tokenType)
                        : operation is
  case token of
  | Tez         -> transfer_tez((get_contract(to_) : contract(unit)), amt)
  | Fa12(token) -> transfer_fa12(from_, to_, amt, token)
  | Fa2(token)  -> transfer_fa2(from_, to_, amt, token.token, token.id)
  end

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintTokenType))
  end;

(* Helper function to mint mvk/vmvk tokens *)
function mintTokens(
  const to_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );  

// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(updateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      delegationAddress) : option(contract(updateSatelliteBalanceParams))) of
    Some(contr) -> contr
  | None -> (failwith("onStakeChange entrypoint in Satellite Contract not found") : contract(updateSatelliteBalanceParams))
  end;


(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    s.admin := newAdminAddress;

} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  // checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
  | ConfigMinXtzAmount (_v)           -> s.config.minXtzAmount            := updateConfigNewValue
  | ConfigMaxXtzAmount (_v)           -> s.config.maxXtzAmount            := updateConfigNewValue
  end;

} with (noOperations, s)



(* update_operators entrypoint *)
// type updateOperatorsParamsType is list(updateOperator)
function update_operators(const tokenAddress : address; const updateOperatorsParams: updateOperatorsParamsType; var s : storage) : return is
block {

    // Steps Overview:
    // 1. Check that sender is in whitelist (governance, council)
    // 2. Update operators for Treasury account in specified token contract

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    const updateOperatorsEntrypoint = case (Tezos.get_entrypoint_opt(
        "%update_operators",
        tokenAddress) : option(contract(updateOperatorsParamsType))) of
        Some(contr) -> contr
        | None -> (failwith("update_operators entrypoint in Token Contract not found") : contract(updateOperatorsParamsType))
    end;

    // update operators operation
    const updateOperatorsOperation : operation = Tezos.transaction(
        updateOperatorsParams,
        0tez, 
        updateOperatorsEntrypoint
    );

    operations := updateOperatorsOperation # operations;

} with (operations, s)

(* transfer entrypoint *)
// type transferTokenType is record [from_ : address; to_ : address; amt : nat; token : tokenType]
function transfer(const transferToken : transferTokenType ; var s : storage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance, council)
    // 2. Send transfer operation from Treasury account to user account
    // 3. Update user's satellite details in Delegation contract

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    const from_  : address   = transferToken.from_;
    const to_    : address   = transferToken.to_;
    const amt    : nat       = transferToken.amt;
    const token  : tokenType = transferToken.token;

    const transferTokenOperation : operation = case token of 
        | Tez         -> transfer_tez((get_contract(to_) : contract(unit)), amt)
        | Fa12(token) -> block{
                if checkInWhitelistTokenContracts(token, s) then skip else failwith("Error. Token Contract is not whitelisted.");
                const transferOperation : operation = transfer_fa12(from_, to_, amt, token);
            } with transferOperation
        | Fa2(token)  -> block {
                if checkInWhitelistTokenContracts(token.token, s) then skip else failwith("Error. Token Contract is not whitelisted.");
                const transferOperation : operation = transfer_fa2(from_, to_, amt, token.token, token.id);
            } with transferOperation
    end;

    operations := transferTokenOperation # operations;

    // update user's satellite balance if MVK is transferred
    const mvkTokenAddress : address = s.mvkTokenAddress;

    const checkIfMvkToken : bool = case token of
         Tez -> False
        | Fa12(_token) -> False
        | Fa2(token) -> block {
                var mvkBool : bool := False;
                if token.token = mvkTokenAddress then mvkBool := True else mvkBool := False;                
            } with mvkBool        
    end;

    if checkIfMvkToken = True then block {
        const delegationAddress : address = case s.generalContracts["delegation"] of
            Some(_address) -> _address
            | None -> failwith("Error. Delegation Contract is not found.")
        end;

        const updateSatelliteBalanceOperation : operation = Tezos.transaction(
            (to_, amt, 1n),
            0tez,
            updateSatelliteBalance(delegationAddress)
        );

        operations := updateSatelliteBalanceOperation # operations;
    } else skip;    

} with (operations, s)

(* mint and transfer entrypoint *)
// type mintAndTransferType is record [to_ : address; amt : nat;]
function mintMvkAndTransfer(const mintMvkAndTransfer : mintMvkAndTransferType ; var s : storage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance, council)
    // 2. Send mint operation to MVK Token Contract
    // 3. Update user's satellite details in Delegation contract

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    const to_    : address   = mintMvkAndTransfer.to_;
    const amt    : nat       = mintMvkAndTransfer.amt;

    const mvkTokenAddress : address = s.mvkTokenAddress;

    const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
    end;

    const mintMvkTokensOperation : operation = mintTokens(
        to_,                // to address
        amt,                // amount of mvk Tokens to be minted
        mvkTokenAddress     // mvkTokenAddress
    ); 

    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
        (to_, amt, 1n),
        0tez,
        updateSatelliteBalance(delegationAddress)
    );

    operations := mintMvkTokensOperation # operations;
    operations := updateSatelliteBalanceOperation # operations;

} with (operations, s)


function main (const action : treasuryAction; const s : storage) : return is 
    case action of
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
  
        | Transfer(parameters) -> transfer(parameters, s)
        | MintMvkAndTransfer(parameters) -> mintMvkAndTransfer(parameters, s)
        | Update_operators(parameters) -> update_operators(parameters.0, parameters.1, s)
    end