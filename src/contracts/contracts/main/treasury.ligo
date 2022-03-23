// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

type tokenBalance is nat
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: nat;
  amount: tokenBalance;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type fa2TransferType is list(transfer)
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

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

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  tokenContractAddress    : address;
  tokenId                 : nat;
]

type tokenType       is
| Tez                     of tezType         // unit
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

type mintTokenType is (address * nat)
type mintMvkAndTransferType is [@layout:comb] record [
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
    | Default of unit
    | SetAdmin of (address)
    | UpdateConfig of updateConfigParamsType    
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams

    | Transfer of transferTokenType
    | MintMvkAndTransfer of mintMvkAndTransferType

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

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintTokenType))
  end;

(* Helper function to mint mvk/smvk tokens *)
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
  | None -> (failwith("onStakeChange entrypoint in Delegation Contract not found") : contract(updateSatelliteBalanceParams))
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

////
// TRANSFER FUNCTIONS
///
function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: fa2TransferType = list[
            record[
                from_ = from_;
                txs = list[
                    record[
                        to_      = to_;
                        token_id = tokenId;
                        amount   = tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(fa2TransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of
            Some (c) -> c
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        end;
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

(* transfer entrypoint *)
// type transferTokenType is record [from_ : address; to_ : address; amt : nat; token : tokenType]
function transfer(const transferToken : transferTokenType ; var s : storage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send transfer operation from Treasury account to user account
    // 3. Update user's satellite details in Delegation contract

    var inWhitelistCheck : bool := checkInWhitelistContracts(Tezos.sender, s);

    if inWhitelistCheck = False then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    const from_  : address    = transferToken.from_;
    const to_    : address    = transferToken.to_;
    const amt    : nat        = transferToken.amt;
    const token  : tokenType  = transferToken.token;

    const transferTokenOperation : operation = case token of 
        | Tez         -> transferTez((get_contract(to_) : contract(unit)), amt)
        | Fa12(token) -> transferFa12Token(from_, to_, amt, token)
        | Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
    end;

    operations := transferTokenOperation # operations;

    // update user's satellite balance if MVK is transferred
    const mvkTokenAddress : address = s.mvkTokenAddress;

    const checkIfMvkToken : bool = case token of
         Tez -> False
        | Fa12(_token) -> False
        | Fa2(token) -> block {
                var mvkBool : bool := False;
                if token.tokenContractAddress = mvkTokenAddress then mvkBool := True else mvkBool := False;                
            } with mvkBool        
    end;

    if checkIfMvkToken = True then block {
        const delegationAddress : address = case s.generalContracts["delegation"] of
            Some(_address) -> _address
            | None -> failwith("Error. Delegation Contract is not found.")
        end;

        const updateSatelliteBalanceOperation : operation = Tezos.transaction(
            (to_, amt, 1n),
            0mutez,
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
    // 1. Check that sender is in whitelist (governance)
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
        0mutez,
        updateSatelliteBalance(delegationAddress)
    );

    operations := mintMvkTokensOperation # operations;
    operations := updateSatelliteBalanceOperation # operations;

} with (operations, s)


function main (const action : treasuryAction; const s : storage) : return is 
    case action of
        | Default(_params) -> ((nil : list(operation)), s)
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
  
        | Transfer(parameters) -> transfer(parameters, s)
        | MintMvkAndTransfer(parameters) -> mintMvkAndTransfer(parameters, s)
    end