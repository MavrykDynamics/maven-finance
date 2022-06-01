// ------------------------------------------------------------------------------
// Treasury Factory Types
// ------------------------------------------------------------------------------

type metadata is big_map (string, bytes);

type treasuryFactoryBreakGlassConfigType is record [
    createTreasuryIsPaused     : bool;
    trackTreasuryIsPaused      : bool;
    untrackTreasuryIsPaused    : bool;
]


type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type createTreasuryType is [@layout:comb] record[
    name                    : string;
    addToGeneralContracts   : bool;
    metadata                : bytes;
]

type treasuryFactoryLambdaActionType is 

    // Housekeeping Entrypoints
    LambdaSetAdmin                            of (address)
|   LambdaSetGovernance                       of (address)
|   LambdaUpdateMetadata                      of updateMetadataType
|   LambdaUpdateWhitelistContracts            of updateWhitelistContractsParams
|   LambdaUpdateGeneralContracts              of updateGeneralContractsParams
|   LambdaUpdateWhitelistTokens               of updateWhitelistTokenContractsParams

    // Pause / Break Glass Entrypoints
|   LambdaPauseAll                            of (unit)
|   LambdaUnpauseAll                          of (unit)
|   LambdaTogglePauseCreateTreasury           of (unit)
|   LambdaToggleTrackTreasury                 of (unit)
|   LambdaToggleUntrackTreasury               of (unit)

    // Treasury Factory Entrypoints
|   LambdaCreateTreasury                      of createTreasuryType
|   LambdaTrackTreasury                       of address
|   LambdaUntrackTreasury                     of address

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type treasuryFactoryStorage is [@layout:comb] record[
    admin                      : address;
    mvkTokenAddress            : address;
    governanceAddress          : address;
    metadata                   : metadata;

    trackedTreasuries          : set(address);
    breakGlassConfig           : treasuryFactoryBreakGlassConfigType;

    whitelistContracts         : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;

    lambdaLedger               : lambdaLedgerType;
    treasuryLambdaLedger       : lambdaLedgerType;
]