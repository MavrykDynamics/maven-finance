type tokenId        is nat
type tokenBalance   is nat

type transferDestination is [@layout:comb] record[
  to_       : address;
  token_id  : tokenId;
  amount    : tokenBalance;
]

type transfer is [@layout:comb] record[
  from_     : address;
  txs       : list(transferDestination);
]

type fa2TransferType is list(transfer)