// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------
type tokenIdentifierType is (address * nat)
type tokensType is big_map(tokenIdentifierType, nat) // token address * token_id
type userRequestsType is big_map(address * tokenIdentifierType, unit)

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------
type setAdminType is address
type updateTokenType is record[
    tokenIdentifier     : tokenIdentifierType;
    maxAmountPerUser    : nat;
]
type removeTokenType is tokenIdentifierType;
type requestTokenType is record[
    tokenIdentifier     : tokenIdentifierType;
    userAddress         : address;
];

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------
type mvnFaucetStorageType is record [
    admin                   : address;
    metadata                : metadataType;
    tokens                  : tokensType; // Max amount per user
    userRequests            : userRequestsType;
]
