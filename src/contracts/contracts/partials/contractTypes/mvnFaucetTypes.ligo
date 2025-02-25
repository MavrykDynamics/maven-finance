// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------
type requestVariantType is 
    Mvrk        of unit
|   Mvn         of unit
|   FakeUsdt    of unit
type requestersType is big_map((address * requestVariantType), unit);

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type mvnFaucetStorageType is record [
    mvnTokenAddress         : address;
    fakeUsdtTokenAddress    : address;
    metadata                : metadataType;
    mvrkAmountPerUser       : mav;
    mvnAmountPerUser        : nat;
    fakeUsdtAmountPerUser   : nat;
    requesters              : requestersType;
]
