// ------------------------------------------------------------------------------
// Basic Types
// ------------------------------------------------------------------------------


type ownerAddressType   is address;

type tokenBalanceType   is nat;
type tokenAmountType    is nat;
type tokenIdType        is nat;


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type tokenPoolRewardConfigType is [@layout:comb] record [
    decimals                         : nat;
];

type tokenPoolRewardBreakGlassConfigType is [@layout:comb] record [
    testEntrypointIsPaused           : nat;
]




// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type tokenPoolRewardLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                  of (address)
    |   LambdaSetGovernance             of (address)
    |   LambdaUpdateMetadata            of updateMetadataType
    |   LambdaUpdateWhitelistContracts  of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts    of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens     of updateWhitelistTokenContractsType

        // Token Pool Entrypoints
    // |   LambdaAddLiquidity              of addLiquidityActionType
    // |   LambdaRemoveLiquidity           of removeLiquidityActionType

        // Lending Entrypoints
    // |   OnBorrow                        of onBorrowActionType
    // |   OnRepay                         of onRepayActionType
    
// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type tokenPoolRewardStorageType is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    config                      : tokenPoolRewardConfigType;
    breakGlassConfig            : tokenPoolRewardBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    lambdaLedger                : lambdaLedgerType;   
]