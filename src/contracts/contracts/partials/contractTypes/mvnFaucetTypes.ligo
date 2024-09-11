// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------
type requestVariantType is 
    Mvn         of unit
|   FakeUsdt    of unit
type requestersType is big_map((address * requestVariantType), unit);

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type mvnFaucetStorageType is record [
    mvnTokenAddress         : address;
    fakeUsdtTokenAddress    : address;
    metadata                : metadataType;
    mvnAmountPerUser        : nat;
    fakeUsdtAmountPerUser   : nat;
    requesters              : requestersType;
]
