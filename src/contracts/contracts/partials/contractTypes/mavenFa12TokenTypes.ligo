// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type trusted is address;

// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type accountType is [@layout:comb] record [
    balance         : tokenBalanceType;
    allowances      : map (trusted, tokenBalanceType);
]

type tokenMetadataInfoType is [@layout:comb] record [
  token_id          : tokenIdType;
  token_info        : map(string, bytes);
]

type ledgerType is big_map (address, accountType);

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

(* Approve entrypoint inputs *)
type approveType is michelson_pair(trusted, "spender", tokenBalanceType, "value")

(* GetBalance entrypoint inputs *)
type balanceType is michelson_pair(address, "owner", contract(tokenBalanceType), "")

(* GetAllowances entrypoint inputs *)
type allowanceType is michelson_pair(michelson_pair(address, "owner", trusted, "spender"), "", contract(tokenBalanceType), "")

(* GetTotalSupply entrypoint inputs *)
type totalSupplyType is (unit * contract(tokenBalanceType))

(* MintOrBurn entrypoint inputs *)
type mintOrBurnType is [@layout:comb] record [
    target    : address;
    quantity  : int;
]

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type mavenFa12TokenStorageType is [@layout:comb] record [
    
    admin                   : address;
    metadata                : big_map (string, bytes);
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;   // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract

    token_metadata          : big_map(tokenIdType, tokenMetadataInfoType);
    totalSupply             : tokenBalanceType;
    ledger                  : ledgerType;
]