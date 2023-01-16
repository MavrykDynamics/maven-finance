
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type lambdaPointerLedgerType is big_map(string, address)


// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------


type addLambdaPointerActionType is [@layout:comb] record [
    entrypointName      : string;
    proxyNodeAddress    : address;
]


type updateLambdaPointerActionType is [@layout:comb] record [
    entrypointName      : string;
    proxyNodeAddress    : address;
]


type removeLambdaPointerActionType is [@layout:comb] record [
    entrypointName      : string;
    empty               : unit;
]


type setLambdaPointerActionType is 
    |   AddLambdaPointer        of addLambdaPointerActionType
    |   UpdateLambdaPointer     of updateLambdaPointerActionType
    |   RemoveLambdaPointer     of removeLambdaPointerActionType


type processGovernanceActionType is [@layout:comb] record [
    entrypointName      : string;
    encodedCode         : bytes;
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

        // Governance Proxy Lambdas
    |   LambdaSetLambdaPointer                of setLambdaPointerActionType
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

    lambdaPointerLedger         : lambdaPointerLedgerType;

    lambdaLedger                : lambdaLedgerType;             
]

