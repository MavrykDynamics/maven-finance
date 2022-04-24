type tokenAmountType     is nat

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

type transferDestinationType is [@layout:comb] record[
  to_       : address;
  token     : tokenType;
  amount    : tokenAmountType;
]

type transferActionType is list(transferDestinationType);