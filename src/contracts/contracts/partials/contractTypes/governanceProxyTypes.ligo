
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------

type governanceProxyLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaMistakenTransfer                of transferActionType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type governanceProxyStorageType is record[
    admin                       : address;
    metadata                    : metadataType;

    mvnTokenAddress             : address;
    governanceAddress           : address;

    lambdaLedger                : lambdaLedgerType;
]
