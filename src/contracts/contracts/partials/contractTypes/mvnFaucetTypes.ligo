// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type requestersType is big_map(address, unit);

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type mvnFaucetStorageType is record [
    mvnTokenAddress         : address;
    metadata                : metadataType;
    amountPerUser           : nat;
    requesters              : requestersType;
]
