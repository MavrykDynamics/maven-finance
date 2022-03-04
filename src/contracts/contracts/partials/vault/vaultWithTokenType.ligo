type tokenBalanceType   is nat;
type tokenAmountType    is nat;

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

type tokenType       is
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

type vaultWithdrawTokenType is transferTokenType
type vaultDepositTokenType  is transferTokenType

type registerTokenDepositType is [@layout:comb] record [
    handle  : vaultHandleType; 
    amount  : nat;
]

type vaultTokenStorage is record [
    admin                   : address;                       // vault admin contract
    handle                  : vaultHandleType;      // owner of the vault
    depositors              : depositorsType;                // users who can deposit into the vault    
    collateralTokenAddress  : address;                       // token contract address of collateral 
    vaultCollateralType     : vaultCollateralType;           // vault collateral type
]

type vaultTokenReturn is list (operation) * vaultTokenStorage