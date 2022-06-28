
type userAddressType                is address 
type metadataType                   is big_map (string, bytes);


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type tokenSaleAuctionConfigType is [@layout:comb] record [

    maxWhitelistCount            : nat; 
    maxAmountPerWhitelistWallet  : nat;
    maxAmountPerWalletTotal      : nat; 
    
    whitelistMaxAmountCap        : nat;    
    overallMaxAmountCap          : nat; 

    // ----

    discountRate                 : nat;
    totalSupply                  : nat; 

    startPriceInXtz              : nat; 
    reservePriceInXtz            : nat; 

    startBlockLevel              : nat;             
    endBlockLevel                : nat;

]


type whitelistedAddressesType is big_map(userAddressType, bool)


type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]


type tokenSaleRecordType is [@layout:comb] record [
    amount      : nat;
    timeBought  : timestamp;
]
type tokenSaleLedgerType is big_map(userAddressType, tokenSaleRecordType)


// ------------------------------------------------------------------------------
// Action Parameter Types
// ------------------------------------------------------------------------------

type tokenSaleUpdateConfigActionType is 
  ConfigMaxWhitelistCount               of nat
| ConfigMaxAmountPerWhitelist           of nat
| ConfigMaxAmountPerWalletTotal         of nat
| ConfigWhitelistStartTimestamp         of timestamp
| ConfigWhitelistEndTimestamp           of timestamp
| ConfigWhitelistMaxAmountCap           of nat
| ConfigOverallMaxAmountCap             of nat

type tokenSaleUpdateConfigParamsType is tokenSaleUpdateConfigActionType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type tokenSaleAuctionStorage is record [

    admin                       : address;
    metadata                    : metadataType;
    config                      : tokenSaleAuctionConfigType;

    governanceAddress           : address;  
    treasuryAddress             : address;
    mvkTokenAddress             : address;

    whitelistedAddresses        : whitelistedAddressesType;
    tokenSaleLedger             : tokenSaleLedgerType;

    tokenSaleHasStarted         : bool;
    tokenSaleHasEnded           : bool;

    whitelistAmountTotal        : nat;
    overallAmountTotal          : nat;

    totalCommittedInXtz         : nat;
    clearingPriceInXtz          : nat; 
    currentPriceInXtz           : nat;
]