// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------
type tokenIdentifierType is (address * nat)
type requestersType is big_map((tokenIdentifierType * address), nat);
type tokensType is big_map(tokenIdentifierType, nat) // token address * token_id

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------
type updateTokenType is record[
    tokenIdentifier     : tokenIdentifierType;
    maxAmountPerUser    : nat;
]
type removeTokenType is tokenIdentifierType;
type requestTokenType is record[
    tokenIdentifier     : tokenIdentifierType;
    tokenAmount         : nat;
];

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------
type mvnFaucetStorageType is record [
    admin                   : address;
    metadata                : metadataType;
    tokens                  : tokensType; // Max amount per user
    requesters              : requestersType;
]
