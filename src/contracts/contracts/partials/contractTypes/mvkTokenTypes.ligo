
// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type operatorType is address;
type ownerType is address;

// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type tokenMetadataInfoType is record [
    token_id          : tokenIdType;
    token_info        : map(string, bytes);
]
type ledgerType is big_map(address, tokenBalanceType);
type operatorsType is big_map((ownerType * operatorType * nat), unit)

type tokenMetadataType is big_map(tokenIdType, tokenMetadataInfoType);

// ------------------------------------------------------------------------------
// Parameters Types
// ------------------------------------------------------------------------------

(* Balance_of entrypoint inputs *)
type balanceOfRequestType is [@layout:comb] record[
    owner: ownerType;
    token_id: tokenIdType;
]
type balanceOfResponse is [@layout:comb] record[
    request: balanceOfRequestType;
    balance: tokenBalanceType;
]
type balanceOfParams is [@layout:comb] record[
    requests: list(balanceOfRequestType);
    callback: contract(list(balanceOfResponse));
]

(* Update_operators entrypoint inputs *)
type operatorParameterType is [@layout:comb] record[
    owner     : ownerType;
    operator  : operatorType;
    token_id  : tokenIdType;
]
type updateOperatorVariantType is 
        Add_operator of operatorParameterType
    |   Remove_operator of operatorParameterType
type updateOperatorsType is list(updateOperatorVariantType)

(* AssertMetadata entrypoint inputs *)
type assertMetadataType is [@layout:comb] record[
    key: string;
    hash: bytes;
]

(* Mint entrypoint inputs *)
type mintType is (ownerType * tokenBalanceType)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type mvkTokenStorageType is record [
    admin                   : address;
    metadata                : metadataType;

    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;   // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
    generalContracts        : generalContractsType;     // map of contract addresses
    
    token_metadata          : tokenMetadataType;
    totalSupply             : tokenBalanceType;
    maximumSupply           : tokenBalanceType;
    inflationRate           : nat;                      // Percentage
    nextInflationTimestamp  : timestamp;
    ledger                  : ledgerType;
    operators               : operatorsType;
]
