type userAddressType                is address 
type metadataType                   is big_map (string, bytes);

type tokenSaleOptionType is [@layout:comb] record [
    maxAmountPerWalletTotal     : nat;
    whitelistMaxAmountTotal     : nat;
    maxAmountCap                : nat;
    vestingPeriods             : nat;
    tokenXtzPrice               : tez;
    minMvkAmount                : nat;
    totalBought                 : nat;
]
type tokenSaleConfigType is [@layout:comb] record [
    vestingPeriodDurationSec    : nat;
    buyOptions                  : map(nat, tokenSaleOptionType);
]

type whitelistedAddressesType is big_map(userAddressType, bool)

type tokenSaleUserOptionType is [@layout:comb] record [
    tokenBought         : nat;
    tokenClaimed        : nat;
    claimCounter        : nat;
    lastClaimTimestamp  : timestamp;
    lastClaimLevel      : nat;
]
type tokenSaleRecordType is map(nat, tokenSaleUserOptionType)
type tokenSaleLedgerType is big_map(userAddressType, tokenSaleRecordType)

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type updateWhitelistAddressesType is list(address)

type buyTokensType is [@layout:comb] record [
    amount          : nat;
    buyOption       : nat;
]

type tokenSaleUpdateConfigNewValueType is nat
type tokenSaleUpdateConfigActionType is
        ConfigMaxAmountPerWalletTotal       of nat
    |   ConfigWhitelistMaxAmountTotal       of nat
    |   ConfigMaxAmountCap                  of nat
    |   ConfigVestingPeriods                of nat
    |   ConfigTokenXtzPrice                 of nat
    |   ConfigMinMvkAmount                  of nat
    |   ConfigVestingPeriodDurationSec      of unit

type tokenSaleUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : tokenSaleUpdateConfigNewValueType; 
    updateConfigAction    : tokenSaleUpdateConfigActionType;
]

type setWhitelistTimestampActionType is [@layout:comb] record [
    whitelistStartTimestamp  : timestamp; 
    whitelistEndTimestamp    : timestamp;
]

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

    whitelistStartTimestamp     : timestamp;
    whitelistEndTimestamp       : timestamp;

    tokenSaleHasStarted         : bool;
    tokenSaleHasEnded           : bool;
    tokenSalePaused             : bool;

    tokenSaleEndTimestamp       : timestamp;
    tokenSaleEndBlockLevel      : nat;

]