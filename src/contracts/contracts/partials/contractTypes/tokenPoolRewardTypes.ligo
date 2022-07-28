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





// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type tokenPoolLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                  of (address)
    |   LambdaSetGovernance             of (address)
    |   LambdaUpdateMetadata            of updateMetadataType
    |   LambdaUpdateConfig              of vaultControllerUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts  of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts    of updateGeneralContractsParams
    |   LambdaUpdateWhitelistTokens     of updateWhitelistTokenContractsParams

        // Token Pool Entrypoints
    |   LambdaAddLiquidity              of addLiquidityActionType
    |   LambdaRemoveLiquidity           of removeLiquidityActionType

        // Lending Entrypoints
    |   OnBorrow                        of onBorrowActionType
    |   OnRepay                         of onRepayActionType
    
// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type tokenPoolRewardStorage is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    config                      : tokenPoolConfigType;
    breakGlassConfig            : tokenPoolBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    lambdaLedger                : lambdaLedgerType;   
]