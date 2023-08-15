// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type tokenMetadataInfoType is record [
    token_id          : tokenIdType;
    token_info        : map(string, bytes);
]
type ledgerType is big_map(address, tokenBalanceType);

type tokenMetadataType is big_map(tokenIdType, tokenMetadataInfoType);


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

(* Mint entrypoint inputs *)
type mintType is (ownerType * tokenBalanceType)

(* Burn entrypoint inputs *)
type burnType is nat

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
