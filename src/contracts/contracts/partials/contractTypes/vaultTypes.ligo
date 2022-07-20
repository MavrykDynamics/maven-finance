type tokenBalanceType   is nat;
type tokenAmountType    is nat;

type editDepositorType is
  | AllowAny of bool
  | AllowAccount of bool * address

type depositorsType is
  | Any
  | Whitelist of set(address)

type vaultHandleType is [@layout:comb] record [
    id      : nat ;
    owner   : address;
]

type transferDestination is [@layout:comb] record[
  to_       : address;
  token_id  : nat;
  amount    : tokenAmountType;
]
type transfer is [@layout:comb] record[
  from_     : address;
  txs       : list(transferDestination);
]
type fa2TransferType  is list(transfer)
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  tokenContractAddress    : address;
  tokenId                 : nat;
]

type tokenType is
| Tez          of unit
| Fa12         of fa12TokenType   // address
| Fa2          of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

// type vaultWithdrawTezType is tez * contract(unit)
type vaultDelegateTezToBakerType is option(key_hash)
type satelliteAddressType is address

type vaultWithdrawType is transferTokenType

// type vaultDepositType is transferTokenType
type vaultDepositType  is [@layout:comb] record [
//     from_           : address;
//     to_             : address;
    amt             : nat;
    token           : tokenType;
//     // tokenName       : string;
]

type vaultControllerDepositType is [@layout:comb] record [
    handle      : vaultHandleType; 
    amount      : nat;
    tokenName   : string;
]

type registerDepositType is [@layout:comb] record [
    handle          : vaultHandleType; 
    amount          : nat;
    tokenName       : string;   // name of collateral: tez, token name A, token name B
]

type vaultUpdateCollateralTokensActionType is [@layout:comb] record [
    tokenContractAddress  : address;
    tokenName             : string;
]

type vaultStorage is record [
    admin                            : address;            // vault admin contract - usdm token controller address
    handle                           : vaultHandleType;    // owner of the vault
    depositors                       : depositorsType;     // users who can deposit into the vault    
]

