// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type requestersType is big_map(address, unit);

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type mvkFaucetStorageType is record [
    mvkTokenAddress         : address;
    metadata                : metadataType;
    amountPerUser           : nat;
    requesters              : requestersType;
]
