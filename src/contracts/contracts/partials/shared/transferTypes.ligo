type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type tokenIdType        is nat
type tokenBalanceType   is nat

type transferDestination is [@layout:comb] record[
    to_       : address;
    token_id  : tokenIdType;
    amount    : tokenBalanceType;
]

type transfer is [@layout:comb] record[
    from_     : address;
    txs       : list(transferDestination);
]

type fa2TransferType is list(transfer)

type tokenAmountType     is nat

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenId                 : nat;
]

type tokenType is
    |   Tez    of tezType         // unit
    |   Fa12   of fa12TokenType   // address
    |   Fa2    of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferDestinationType is [@layout:comb] record[
    to_       : address;
    amount    : tokenAmountType;
    token     : tokenType;
]

type transferActionType is list(transferDestinationType);