
type userAddressType                is address 
type metadataType                   is big_map (string, bytes);

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

type updateWhitelistAddressesType is list(address)

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type tokenSaleRecordType is [@layout:comb] record [
    amount      : nat;
    lastBought  : timestamp;
]
type tokenSaleLedgerType is big_map(userAddressType, tokenSaleRecordType)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type tokenSaleStorage is record [

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