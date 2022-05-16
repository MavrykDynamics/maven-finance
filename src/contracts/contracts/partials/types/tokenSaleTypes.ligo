
// Treasury Transfer Types
#include "../../partials/functionalTypes/treasuryTransferTypes.ligo"


type userAddressType                is address 
type metadataType                   is big_map (string, bytes);

type tokenSaleConfigType is [@layout:comb] record [

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

type whitelistedAddressesType is big_map(userAddressType, bool)

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
// Action Types
// ------------------------------------------------------------------------------

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type updateWhitelistAddressesType is list(address)

type optionType is 
  OptionOne     of unit
| OptionTwo     of unit
| OptionThree   of unit 

type buyTokenType is [@layout:comb] record [
  amount        : nat;
  tokenOption   : optionType;
]

type tokenSaleUpdateConfigNewValueType is nat
type tokenSaleUpdateConfigActionType is 
  MaxAmountOptOnePerWalletTotal         of unit
| MaxAmountOptTwoPerWalletTotal         of unit
| MaxAmountOptThreePerWalletTotal       of unit

| WhitelistMaxAmountOptOneTotal         of unit
| WhitelistMaxAmountOptTwoTotal         of unit
| WhitelistMaxAmountOptThreeTotal       of unit

| OptionOneMaxAmountCap                 of unit
| OptionTwoMaxAmountCap                 of unit
| OptionThreeMaxAmountCap               of unit

| VestingOptionOneInMonths              of unit
| VestingOptionTwoInMonths              of unit
| VestingOptionThreeInMonths            of unit

| OptionOneTezPerToken                  of unit
| OptionTwoTezPerToken                  of unit
| OptionThreeTezPerToken                of unit

| MinOptionOneAmountInTez               of unit
| MinOptionTwoAmountInTez               of unit
| MinOptionThreeAmountInTez             of unit

| BlocksPerMinute                       of unit

type tokenSaleUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : tokenSaleUpdateConfigNewValueType; 
  updateConfigAction    : tokenSaleUpdateConfigActionType;
]

type setWhitelistDateTimeActionType is [@layout:comb] record [
  whitelistStartDateTime  : timestamp; 
  whitelistEndDateTime    : timestamp;
]

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

    whitelistStartDateTime      : timestamp;
    whitelistEndDateTime        : timestamp;

    tokenSaleHasStarted         : bool;
    tokenSaleHasEnded           : bool;
    tokenSalePaused             : bool;

    tokenSaleEndTimestamp       : timestamp;
    tokenSaleEndBlockLevel      : nat;

    optionOneBoughtTotal        : nat;
    optionTwoBoughtTotal        : nat;
    optionThreeBoughtTotal      : nat;
]