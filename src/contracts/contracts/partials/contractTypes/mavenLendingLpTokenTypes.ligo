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

(* MintOrBurn entrypoint inputs *)
type mintOrBurnType is [@layout:comb] record [
    target    : address;
    tokenId   : tokenIdType;
    quantity  : int;
]

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type mavenFa2TokenStorageType is [@layout:comb] record [
    admin                   : address;
    metadata                : metadataType;
    
    loanToken               : string;                   // reference to Lending Controller loan token

    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;   // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
    
    token_metadata          : tokenMetadataType;
    totalSupply             : tokenBalanceType;
    ledger                  : ledgerType;
    operators               : operatorsType;
]