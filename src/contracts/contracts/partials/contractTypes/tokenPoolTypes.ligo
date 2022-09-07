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


type rewardsRecordType is [@layout:comb] record[
    unpaid            : nat;
    paid              : nat;
    rewardsPerShare   : nat;    
]
type rewardsLedgerType is big_map((address * string), rewardsRecordType)        // key - user address and token name e.g. USDT, EURL
type accumulatedRewardsLedgerType is big_map(string, nat)                   

// liquidity provider
type tokenPoolDepositorLedgerType is big_map((address * string), nat)                    // key - user address and token name e.g. USDT, EURL


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

    utilisationRate                         : nat;
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink

    currentInterestrate         : nat;

    lastUpdatedBlockLevel       : nat; 

    accumulatedRewardsPerShare  : nat;
    
    borrowIndex                 : nat;
]

type tokenLedgerType is big_map(string, tokenRecordType)

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


type claimRewardsActionType is [@layout:comb] record [
    userAddress     : address;
    tokenName       : string;
]


type updateRewardsActionType is [@layout:comb] record [
    tokenName       : string;
    amount          : nat;
]

type vaultCallbackActionType is [@layout:comb] record [ 
    vaultId             : nat;
    quantity            : nat;
    initiator           : address;
    tokenBorrowIndex    : nat;
]

type updateTokenPoolCallbackActionType is [@layout:comb] record [
    
    tokenName       : string;
    callback        : contract(vaultCallbackActionType);

    // pass on to callback
    vaultId         : nat;  
    quantity        : nat;
    initiator       : address;

]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type tokenPoolLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                  of (address)
    |   LambdaSetGovernance             of (address)
    |   LambdaUpdateMetadata            of updateMetadataType
    // |   LambdaUpdateConfig              of vaultControllerUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts  of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts    of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens     of updateWhitelistTokenContractsType

        // Token Pool Entrypoints
    |   LambdaUpdateTokenPoolCallback   of updateTokenPoolCallbackActionType
    |   LambdaAddLiquidity              of addLiquidityActionType
    |   LambdaRemoveLiquidity           of removeLiquidityActionType

        // Lending Entrypoints
    |   LambdaOnBorrow                  of onBorrowActionType
    |   LambdaOnRepay                   of onRepayActionType

        // Rewards Entrypoints
    |   LambdaClaimRewards              of claimRewardsActionType
    |   LambdaUpdateRewards             of updateRewardsActionType
    

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
    
    tokenLedger                 : tokenLedgerType;
    rewardsLedger               : rewardsLedgerType;
    tokenPoolDepositorLedger    : tokenPoolDepositorLedgerType;

    lambdaLedger                : lambdaLedgerType;   
]