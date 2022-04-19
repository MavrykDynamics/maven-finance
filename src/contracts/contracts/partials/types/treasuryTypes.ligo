type tokenAmountType   is nat
type metadata is big_map (string, bytes);

type fa2TransferType is list(transfer)
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type operator is address
type owner is address
type tokenId is nat;

type treasuryBreakGlassConfigType is [@layout:comb] record [
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
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

type mintMvkAndTransferType is [@layout:comb] record [
    to_             : address;
    amt             : nat;
]

type transferDestinationType is [@layout:comb] record[
  to_       : address;
  token     : tokenType;
  amount    : tokenAmountType;
]

type transferActionType is list(transferDestinationType);

type updateSatelliteBalanceParams is (address)

type setLambdaType is [@layout:comb] record [
      name                  : string;
      func_bytes            : bytes;
]
type lambdaLedgerType is big_map(string, bytes)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type treasuryStorage is [@layout:comb] record [
    admin                      : address;
    mvkTokenAddress            : address;
    metadata                   : metadata;
    
    breakGlassConfig           : treasuryBreakGlassConfigType;

    whitelistContracts         : whitelistContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;

    lambdaLedger               : lambdaLedgerType;
]