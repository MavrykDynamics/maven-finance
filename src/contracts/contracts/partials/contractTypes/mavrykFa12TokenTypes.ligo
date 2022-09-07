// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type trusted is address;

// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type account is [@layout:comb] record [
    balance         : tokenBalanceType;
    allowances      : map (trusted, tokenBalanceType);
]

type tokenMetadataInfoType is [@layout:comb] record [
  token_id          : tokenIdType;
  token_info        : map(string, bytes);
]

type ledgerType is big_map (address, account);

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

(* Approve entrypoint inputs *)
type approveTypes is michelson_pair(trusted, "spender", tokenBalanceType, "value")

(* GetBalance entrypoint inputs *)
type balanceTypes is michelson_pair(address, "owner", contract(tokenBalanceType), "")

(* GetAllowances entrypoint inputs *)
type allowanceTypes is michelson_pair(michelson_pair(address, "owner", trusted, "spender"), "", contract(tokenBalanceType), "")

(* GetTotalSupply entrypoint inputs *)
type totalSupplyTypes is (unit * contract(tokenBalanceType))

(* MintOrBurn entrypoint inputs *)
type mintOrBurnTypes is [@layout:comb] record [
    target    : address;
    quantity  : int;
]

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type mavrykFa12TokenStorageType is [@layout:comb] record [
    admin                   : address;
    metadata                : big_map (string, bytes);

    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;   // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
    generalContracts        : generalContractsType;     // map of contract addresses

    token_metadata          : big_map(tokenIdType, tokenMetadataInfoType);
    totalSupply             : tokenBalanceType;
    ledger                  : ledgerType;
]