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

type tokenPoolBreakGlassConfigType is [@layout:comb] record [
    onClaimRewardsIsPaused  : bool;
    empty                   : unit
]

type tokenPoolPausableEntrypointType is
    |   OnClaimRewards              of bool
    |   Empty                       of unit
    
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
    |   LambdaUpdateWhitelistContracts  of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts    of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens     of updateWhitelistTokenContractsType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                  of (unit)
    |   LambdaUnpauseAll                of (unit)
    |   LambdaTogglePauseEntrypoint     of tokenPoolTogglePauseEntrypointType

        // Rewards Entrypoints
    |   LambdaOnClaimRewards            of transferActionType
    

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type tokenPoolStorage is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    breakGlassConfig            : tokenPoolBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      
    
    lambdaLedger                : lambdaLedgerType;   
]