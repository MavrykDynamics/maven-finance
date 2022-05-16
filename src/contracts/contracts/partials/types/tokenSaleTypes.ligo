
// Treasury Transfer Types
#include "../../partials/functionalTypes/treasuryTransferTypes.ligo"


type userAddressType                is address 
type metadataType                   is big_map (string, bytes);

type tokenSaleConfigType is [@layout:comb] record [
    
    whitelistStartTimestamp               : timestamp;
    whitelistEndTimestamp                 : timestamp;

    maxAmountOptionOnePerWalletTotal      : nat; 
    maxAmountOptionTwoPerWalletTotal      : nat; 
    maxAmountOptionThreePerWalletTotal    : nat; 

    whitelistMaxAmountOptionOneTotal      : nat; 
    whitelistMaxAmountOptionTwoTotal      : nat; 
    whitelistMaxAmountOptionThreeTotal    : nat; 

    optionOneMaxAmountCap                 : nat;    
    optionTwoMaxAmountCap                 : nat;    
    optionThreeMaxAmountCap               : nat;    

    vestingOptionOneInMonths              : nat;   
    vestingOptionTwoInMonths              : nat;   
    vestingOptionThreeInMonths            : nat;    

    optionOneTezPerToken                  : nat;
    optionTwoTezPerToken                  : nat;
    optionThreeTezPerToken                : nat;

    minOptionOneAmountInTez               : nat;
    minOptionTwoAmountInTez               : nat;
    minOptionThreeAmountInTez             : nat;

    blocksPerMinute                       : nat;
]

type optionType is 
  OptionOne     of unit
| OptionTwo     of unit
| OptionThree   of unit 

type buyTokenType is [@layout:comb] record [
  amount        : nat;
  tokenOption   : optionType;
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
  
    optionOneBought           : nat;
    optionTwoBought           : nat;
    optionThreeBought         : nat;

    optionOneClaimedAmount    : nat;
    optionTwoClaimedAmount    : nat;
    optionThreeClaimedAmount  : nat;

    optionOneMonthsClaimed    : nat;
    optionTwoMonthsClaimed    : nat;
    optionThreeMonthsClaimed  : nat;

    optionOneLastClaimed      : timestamp;
    optionTwoLastClaimed      : timestamp;
    optionThreeLastClaimed    : timestamp;

    optionOneLastClaimedBlockLevel    : nat;
    optionTwoLastClaimedBlockLevel    : nat;
    optionThreeLastClaimedBlockLevel  : nat;

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
    tokenSaleHasEnded           : bool;
    tokenSalePaused             : bool;

    tokenSaleEndTimestamp       : timestamp;
    tokenSaleEndBlockLevel      : nat;

    optionOneBoughtTotal        : nat;
    optionTwoBoughtTotal        : nat;
    optionThreeBoughtTotal      : nat;
]