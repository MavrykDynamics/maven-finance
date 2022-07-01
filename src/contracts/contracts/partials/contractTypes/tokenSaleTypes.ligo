type userAddressType                is address 

type tokenSaleConfigType is [@layout:comb] record [
    maxWhitelistCount            : nat; 
    maxAmountPerWhitelistWallet  : nat;
    maxAmountPerWalletTotal      : nat; 
    
    whitelistStartTimestamp      : timestamp;
    whitelistEndTimestamp        : timestamp;
    
    whitelistMaxAmountCap        : nat;    
    overallMaxAmountCap          : nat;  
]

type tokenSaleUpdateConfigActionType is 
  ConfigMaxWhitelistCount               of nat
| ConfigMaxAmountPerWhitelist           of nat
| ConfigMaxAmountPerWalletTotal         of nat
| ConfigWhitelistStartTimestamp         of timestamp
| ConfigWhitelistEndTimestamp           of timestamp
| ConfigWhitelistMaxAmountCap           of nat
| ConfigOverallMaxAmountCap             of nat

type tokenSaleUpdateConfigParamsType is tokenSaleUpdateConfigActionType

type whitelistedAddressesType is big_map(userAddressType, bool)

type tokenSaleRecordType is [@layout:comb] record [
    amount      : nat;
    lastBought  : timestamp;
]
type tokenSaleLedgerType is big_map(userAddressType, tokenSaleRecordType)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type tokenSaleStorageType is record [

    admin                       : address;
    metadata                    : metadataType;
    config                      : tokenSaleConfigType;

    governanceAddress           : address;  
    treasuryAddress             : address;
    mvkTokenAddress             : address;

    whitelistedAddresses        : whitelistedAddressesType;
    tokenSaleLedger             : tokenSaleLedgerType;

    tokenSaleHasStarted         : bool;
    whitelistAmountTotal        : nat;
    overallAmountTotal          : nat; 
]