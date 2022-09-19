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

type tokenPoolRewardBreakGlassConfigType is [@layout:comb] record [
    updateRewardsIsPaused   : bool;
    claimRewardsIsPaused    : bool;
]

type rewardsRecordType is [@layout:comb] record[
    unpaid            : nat;
    paid              : nat;
    rewardsPerShare   : nat;    
]
type rewardsLedgerType is big_map((address * string), rewardsRecordType)        // key - user address and token name e.g. USDT, EURL

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type tokenPoolRewardPausableEntrypointType is
    |   UpdateRewards             of bool
    |   ClaimRewards              of bool
    
type tokenPoolRewardTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : tokenPoolRewardPausableEntrypointType;
    empty             : unit
];


type updateRewardsActionType is [@layout:comb] record [
    loanTokenName     : string;
    userAddress       : address; 
    depositorBalance  : nat; 
]

type claimRewardsActionType is [@layout:comb] record [
    userAddress : address; 
]

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
    |   LambdaMistakenTransfer          of transferActionType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                  of (unit)
    |   LambdaUnpauseAll                of (unit)
    |   LambdaTogglePauseEntrypoint     of tokenPoolRewardTogglePauseEntrypointType

        // Rewards Entrypoints
    |   LambdaUpdateRewards             of updateRewardsActionType
    |   LambdaClaimRewards              of claimRewardsActionType
    

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type tokenPoolRewardStorageType is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    breakGlassConfig            : tokenPoolRewardBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    rewardsLedger               : rewardsLedgerType;

    lambdaLedger                : lambdaLedgerType;   
]