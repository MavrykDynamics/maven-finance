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

type tokenPoolConfigType is [@layout:comb] record [
    
    default : nat;

]


type tokenPoolBreakGlassConfigType is record [
    
    // Token Pool Entrypoints
    addLiquidityIsPaused        : bool; 
    removeLiquidityIsPaused     : bool;

    // Lending Entrypoints
    onBorrowIsPaused            : bool;
    onRepayIsPaused             : bool;

]



type tokenRecordType is [@layout:comb] record [
    
    tokenName                   : nat;
    tokenContractAddress        : address;
    tokenId                     : nat;

    lpTokensTotal               : nat;
    lpTokenContractAddress      : address;
    lpTokenId                   : nat;

    reserveRatio                : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    tokenPoolTotal              : nat;  // sum of totalBorrowed and totalRemaining
    totalBorrowed               : nat; 
    totalRemaining              : nat; 
    
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type addLiquidityActionType is [@layout:comb] record [
    tokenName               : string;
    tokensDeposited         : nat;
    owner                   : address;
]


type removeLiquidityActionType is [@layout:comb] record [
    lpTokensBurned          : nat;
    tokenName               : string;
    tokensWithdrawn         : nat;
    [@annot:to] to_         : address;
]


type onBorrowActionType is [@layout:comb] record [
    tokenName               : string;
    borrower                : address;
    finalLoanAmount         : nat;
    totalFees               : nat; 
]


type onRepayActionType is [@layout:comb] record [
    tokenName               : string;
    repayAmount             : nat;
    repayer                 : address;
]


type tokenPoolPausableEntrypointType is

        // Token Pool Entrypoints
        AddLiquidty                 of bool
    |   RemoveLiquidity             of bool

        // Lending Entrypoints
    |   OnBorrow                   of bool
    |   OnRepay                    of bool

type tokenPoolTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : tokenPoolPausableEntrypointType;
    empty             : unit
];

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


type tokenPoolStorage is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    config                      : tokenPoolConfigType;
    breakGlassConfig            : tokenPoolBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      
    
    tokenLedger                 : big_map(string, tokenRecordType);

    lambdaLedger                : lambdaLedgerType;   
]