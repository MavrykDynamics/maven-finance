// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type tokenIdType        is nat
type tokenBalanceType   is nat
type tokenAmountType    is nat

// ------------------------------------------------------------------------------
// FA12 Types
// ------------------------------------------------------------------------------

type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

// ------------------------------------------------------------------------------
// FA2 Types
// ------------------------------------------------------------------------------

type operatorType is address;
type ownerType is address;

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

type operatorsType is big_map((ownerType * operatorType * tokenIdType), unit)

(* Balance_of entrypoint inputs *)
type balanceOfRequestType is [@layout:comb] record[
    owner       : ownerType;
    token_id    : tokenIdType;
]
type balanceOfResponse is [@layout:comb] record[
    request     : balanceOfRequestType;
    balance     : tokenBalanceType;
]
type balanceOfType is [@layout:comb] record[
    requests    : list(balanceOfRequestType);
    callback    : contract(list(balanceOfResponse));
]

(* Update_operators entrypoint inputs *)
type operatorParameterType is [@layout:comb] record[
    owner       : ownerType;
    operator    : operatorType;
    token_id    : tokenIdType;
]
type updateOperatorVariantType is 
        Add_operator    of operatorParameterType
    |   Remove_operator of operatorParameterType
type updateOperatorsType is list(updateOperatorVariantType)

(* AssertMetadata entrypoint inputs *)
type assertMetadataType is [@layout:comb] record[
    key     : string;
    hash    : bytes;
]

// ------------------------------------------------------------------------------
// Transfer Types
// ------------------------------------------------------------------------------

type mavType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenId                 : nat;
]

type tokenType is
    |   Mav    of mavType         // unit
    |   Fa12   of fa12TokenType   // address
    |   Fa2    of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferDestinationType is [@layout:comb] record[
    to_       : address;
    amount    : tokenAmountType;
    token     : tokenType;
]

type transferActionType is list(transferDestinationType);