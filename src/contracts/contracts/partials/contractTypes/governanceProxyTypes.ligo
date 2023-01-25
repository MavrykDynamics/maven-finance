
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type proxyLambdaLedgerType is big_map(nat, bytes)


// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------


type processGovernanceActionType is [@layout:comb] record [
    contractName    : string;
    encodedCode     : bytes;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------

type governanceProxyLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer                of transferActionType

        // Main Lambdas
    |   LambdaProcessGovernanceAction         of processGovernanceActionType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyStorageType is record [
    admin                       : address;
    metadata                    : metadataType;

    mvkTokenAddress             : address;
    governanceAddress           : address;    // separate admin from governance address in event of break glass
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    proxyLambdaLedger           : proxyLambdaLedgerType;

    lambdaLedger                : lambdaLedgerType;             
]

