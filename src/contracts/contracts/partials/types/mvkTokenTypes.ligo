
// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type tokenId is nat;
type tokenBalance is nat;
type operator is address
type owner is address


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type tokenMetadataInfo is record [
  token_id          : tokenId;
  token_info        : map(string, bytes);
]
type ledger is big_map(address, tokenBalance);
type operators is big_map((owner * operator * nat), unit)

type tokenMetadata is big_map(tokenId, tokenMetadataInfo);
type metadata is big_map (string, bytes);

////
// INPUTS
////
(* Transfer entrypoint inputs *)
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: tokenId;
  amount: tokenBalance;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type transferType is list(transfer)

(* Balance_of entrypoint inputs *)
type balanceOfRequest is [@layout:comb] record[
  owner: owner;
  token_id: tokenId;
]
type balanceOfResponse is [@layout:comb] record[
  request: balanceOfRequest;
  balance: tokenBalance;
]
type balanceOfParams is [@layout:comb] record[
  requests: list(balanceOfRequest);
  callback: contract(list(balanceOfResponse));
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
type updateOperatorsParams is list(updateOperator)

(* AssertMetadata entrypoint inputs *)
type assertMetadataParams is [@layout:comb] record[
  key: string;
  hash: bytes;
]

(* Mint entrypoint inputs *)
type mintParams is (owner * tokenBalance)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type mvkTokenStorage is record [
  admin                   : address;
  metadata                : metadata;

  governanceAddress       : address;

  whitelistContracts      : whitelistContractsType;   // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
  generalContracts        : generalContractsType;     // map of contract addresses
  
  token_metadata          : tokenMetadata;
  totalSupply             : tokenBalance;
  maximumSupply           : tokenBalance;
  inflationRate           : nat;                      // Percentage
  nextInflationTimestamp  : timestamp;
  ledger                  : ledger;
  operators               : operators
]
